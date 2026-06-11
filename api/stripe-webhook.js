// Vercel serverless function: receives signed Stripe webhook events and upserts
// the donor into the Airtable Supporters table.
//
// Handles two event types:
//   - checkout.session.completed   → both one-time and first subscription payment
//   - invoice.payment_succeeded    → subscription renewals (billing_reason=subscription_cycle)
//
// Required env vars:
//   STRIPE_SECRET_KEY        — sk_live_... (or sk_test_... in test mode)
//   STRIPE_WEBHOOK_SECRET    — whsec_... (per registered endpoint)
//   AIRTABLE_API_KEY / AIRTABLE_BASE_ID / AIRTABLE_TABLE_ID — read by lib/airtable

import Stripe from 'stripe';
import { upsertSupporter } from '../lib/airtable.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

// Stripe needs the raw body to verify the signature — disable Vercel's auto JSON parse.
export const config = { api: { bodyParser: false } };

async function readRaw(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

function resolveSite(clientReferenceId) {
  return clientReferenceId === 'coalition.affordableenergy.org.au'
    ? 'coalition.affordableenergy.org.au'
    : 'affordableenergy.org.au';
}

function splitName(full) {
  const parts = String(full || '').trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || undefined,
    lastName: parts.length > 1 ? parts.slice(1).join(' ') : undefined,
  };
}

function getCustomerId(customer) {
  if (!customer) return undefined;
  return typeof customer === 'string' ? customer : customer.id;
}

function getCustomerEmail(customer) {
  if (!customer || typeof customer === 'string') return null;
  return customer.email || null;
}

function getSubscriptionId(subscription) {
  if (!subscription) return undefined;
  return typeof subscription === 'string' ? subscription : subscription.id;
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
      const full = await stripe.checkout.sessions.retrieve(sessionObj.id, {
        expand: ['line_items', 'customer'],
      });

      const email =
        (full.customer_details && full.customer_details.email) ||
        getCustomerEmail(full.customer);
      if (!email) return res.status(200).send('no email');

      const amount = (full.amount_total || 0) / 100;
      const isSubscription = full.mode === 'subscription';
      const { firstName, lastName } = splitName(full.customer_details && full.customer_details.name);

      await upsertSupporter({
        email,
        firstName,
        lastName,
        phone: (full.customer_details && full.customer_details.phone) || undefined,
        postcode: (full.customer_details && full.customer_details.address && full.customer_details.address.postal_code) || undefined,
        site: resolveSite(full.client_reference_id),
        source: 'donation',
        donationAmount: amount,
        donationFrequency: isSubscription ? 'monthly' : 'one-time',
        stripeCustomerId: getCustomerId(full.customer),
        stripeSubscriptionId: getSubscriptionId(full.subscription),
        stripeEventId: event.id,
      });

      return res.status(200).json({ ok: true });
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;

      // Only act on subscription renewals — the first-time subscription payment is already
      // handled by checkout.session.completed (which carries client_reference_id + name).
      if (invoice.billing_reason !== 'subscription_cycle') {
        return res.status(200).send('skip');
      }

      const email = invoice.customer_email;
      if (!email) return res.status(200).send('no email');

      await upsertSupporter({
        email,
        // Site is preserved by the upsert when the row already exists. The default here
        // only applies if a renewal arrives for an email we somehow don't yet have.
        site: 'affordableenergy.org.au',
        source: 'donation',
        donationAmount: (invoice.amount_paid || 0) / 100,
        donationFrequency: 'monthly',
        stripeCustomerId: getCustomerId(invoice.customer),
        stripeSubscriptionId: getSubscriptionId(invoice.subscription),
        stripeEventId: event.id,
      });

      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ ignored: event.type });
  } catch (err) {
    console.error('[stripe-webhook] handler error', err);
    return res.status(500).send(`Handler error: ${err && err.message}`);
  }
}
