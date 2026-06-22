// Vercel serverless function: receives signed Stripe webhook events.
//
// Now writes to BOTH:
//   1. Legacy `Supporters` table via lib/airtable.js (existing analytics dashboards)
//   2. New tracking schema (Contacts + Events + Donations) via lib/tracking.js
//      — captures full payload, petition_slug from client_reference_id, fan-out to
//        the Donations projection, and fires Meta CAPI Purchase with shared event_id.
//
// Handles two event types:
//   - checkout.session.completed   → both one-time and first subscription payment
//   - invoice.payment_succeeded    → subscription renewals (billing_reason=subscription_cycle)
//
// Required env vars:
//   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
//   AIRTABLE_* (used by both lib/airtable.js and lib/tracking.js)
//   META_PIXEL_ID, META_CAPI_TOKEN (optional — skipped if absent)

import Stripe from 'stripe';
import { upsertSupporter } from '../lib/airtable.js';
import { matchOrCreateContact, ensureStatus, logEvent } from '../lib/tracking.js';
import { sendMetaEvent } from '../lib/meta.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-12-18.acacia' });

export const config = { api: { bodyParser: false } };

async function readRaw(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

function resolveSite(clientRef) {
  return clientRef === 'coalition.affordableenergy.org.au'
    ? 'coalition.affordableenergy.org.au'
    : 'affordableenergy.org.au';
}

function splitName(full) {
  const parts = String(full || '').trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] || undefined, lastName: parts.length > 1 ? parts.slice(1).join(' ') : undefined };
}

function idOf(stripeRef) {
  if (!stripeRef) return undefined;
  return typeof stripeRef === 'string' ? stripeRef : stripeRef.id;
}

async function writeToTrackingSchema({ email, firstName, lastName, phone, postcode, country, amount, currency, frequency, stripeObjectType, stripeObjectId, stripePaymentIntent, stripeCustomerId, stripeSubscriptionId, petitionSlug, stripeEventId, sourceUrl, contentName, req }) {
  // 1. Match-or-create Contact
  const { record: contact } = await matchOrCreateContact({
    first_name: firstName, last_name: lastName,
    email, mobile: phone, postcode,
    source_channel: 'Stripe',
  });
  const contactRecordId = contact.id;
  const contact_id = contact.fields?.contact_id;

  // 2. Log Donation event — idempotent on stripeObjectId (same Stripe object replayed
  //    by Stripe's retries won't dup; but resends of the same EVENT will use stripeEventId
  //    as a backup idempotency token).
  const meta_event_id = `stripe_${stripeObjectId}`;
  const donationPayload = {
    amount_cents: Math.round((amount || 0) * 100),
    amount,
    currency,
    stripe_object_type: stripeObjectType,
    stripe_object_id: stripeObjectId,
    stripe_payment_intent: stripePaymentIntent,
    email, name: [firstName, lastName].filter(Boolean).join(' ') || undefined,
    phone, postcode, country,
    content_name: contentName,
    source_url: sourceUrl,
    petition_slug: petitionSlug || null,
    stripe_event_id: stripeEventId,
  };

  await logEvent({
    event_type: 'Donation',
    contactRecordId,
    payload: donationPayload,
    meta_event_id,
    source_channel: 'Stripe',
  });

  // 3. Update contact status
  await ensureStatus(contact, 'donor');

  // 4. Meta CAPI Purchase — fire and forget.
  sendMetaEvent({
    event_name: 'Purchase',
    event_id: meta_event_id,
    event_source_url: sourceUrl,
    user: { email, first_name: firstName, last_name: lastName, phone, postcode, external_id: contact_id },
    custom_data: { value: amount, currency, content_name: contentName || undefined },
    req,
  }).catch(() => {});
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method not allowed');
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({ error: 'Stripe env not configured' });
  }

  const sig = req.headers['stripe-signature'];
  if (!sig) return res.status(400).send('Missing signature');

  const raw = await readRaw(req);
  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[stripe] signature check failed', err && err.message);
    return res.status(400).send(`Webhook Error: ${err && err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const sessionObj = event.data.object;
      // Subscriptions: skip — invoice.payment_succeeded covers the first + every renewal.
      if (sessionObj.mode === 'subscription') {
        return res.status(200).send('subscription — handled by invoice.payment_succeeded');
      }

      const full = await stripe.checkout.sessions.retrieve(sessionObj.id, {
        expand: ['line_items', 'customer'],
      });

      const email = full.customer_details?.email || (typeof full.customer === 'object' ? full.customer?.email : null);
      if (!email) return res.status(200).send('no email');

      const amount = (full.amount_total || 0) / 100;
      const { firstName, lastName } = splitName(full.customer_details?.name);
      const petitionSlug = full.client_reference_id || null;

      // Legacy Supporters table (existing dashboards)
      await upsertSupporter({
        email, firstName, lastName,
        phone: full.customer_details?.phone,
        postcode: full.customer_details?.address?.postal_code,
        site: resolveSite(full.client_reference_id),
        source: 'donation',
        donationAmount: amount,
        donationFrequency: 'one-time',
        stripeCustomerId: idOf(full.customer),
        stripeEventId: event.id,
      }).catch(err => console.error('[stripe-webhook] Supporters upsert failed', err && err.message));

      // New tracking schema (Contacts + Events + Donations)
      await writeToTrackingSchema({
        email, firstName, lastName,
        phone: full.customer_details?.phone,
        postcode: full.customer_details?.address?.postal_code,
        country: full.customer_details?.address?.country,
        amount,
        currency: full.currency || 'aud',
        frequency: 'one-time',
        stripeObjectType: 'checkout.session',
        stripeObjectId: full.id,
        stripePaymentIntent: idOf(full.payment_intent),
        stripeCustomerId: idOf(full.customer),
        petitionSlug,
        stripeEventId: event.id,
        sourceUrl: full.success_url || null,
        contentName: petitionSlug ? `Donation: ${petitionSlug}` : 'Donation',
        req,
      });

      return res.status(200).json({ ok: true, mode: 'checkout.session.completed', petition_slug: petitionSlug });
    }

    if (event.type === 'invoice.payment_succeeded' || event.type === 'invoice.paid') {
      const invoice = event.data.object;
      const reason = invoice.billing_reason;
      // Process both the first subscription invoice and every renewal.
      // (Stripe sends `invoice.paid` after subscription creation in newer accounts;
      //  invoice.payment_succeeded fires for all paid invoices including renewals.)
      const isFirst = reason === 'subscription_create';
      const isCycle = reason === 'subscription_cycle';
      if (!isFirst && !isCycle) return res.status(200).send(`skip (billing_reason=${reason})`);

      const email = invoice.customer_email;
      if (!email) return res.status(200).send('no email');

      const amount = (invoice.amount_paid || 0) / 100;
      const subId = idOf(invoice.subscription);
      let petitionSlug = null;
      // Recover petition slug from the Checkout Session that created the subscription, if possible.
      try {
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          // metadata.client_reference_id is sometimes stashed there; if not, look up the
          // originating Checkout Session via the latest_invoice → payment_intent path.
          petitionSlug = sub?.metadata?.client_reference_id || null;
        }
      } catch (_) { /* best effort */ }

      // Legacy Supporters table
      await upsertSupporter({
        email,
        site: 'affordableenergy.org.au',
        source: 'donation',
        donationAmount: amount,
        donationFrequency: 'monthly',
        stripeCustomerId: idOf(invoice.customer),
        stripeSubscriptionId: subId,
        stripeEventId: event.id,
      }).catch(err => console.error('[stripe-webhook] Supporters upsert failed', err && err.message));

      // New tracking schema
      await writeToTrackingSchema({
        email,
        amount,
        currency: invoice.currency || 'aud',
        frequency: 'monthly',
        stripeObjectType: 'invoice',
        stripeObjectId: invoice.id,
        stripePaymentIntent: idOf(invoice.payment_intent),
        stripeCustomerId: idOf(invoice.customer),
        stripeSubscriptionId: subId,
        petitionSlug,
        stripeEventId: event.id,
        contentName: petitionSlug ? `Recurring donation: ${petitionSlug}` : 'Recurring donation',
        req,
      });

      return res.status(200).json({ ok: true, mode: 'invoice', billing_reason: reason });
    }

    return res.status(200).json({ ignored: event.type });
  } catch (err) {
    console.error('[stripe-webhook] handler error', err);
    return res.status(500).send(`Handler error: ${err && err.message}`);
  }
}
