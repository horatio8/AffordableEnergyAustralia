// GET /api/share-context?session_id=cs_... | ?email=...
// Resolves a donor for the /share page (§3.5).
//
// If session_id → call Stripe → get customer_details.email + client_reference_id.
// Else use email directly.
// Lookup Contacts → return { contact_id, referral_code, first_name, petition_slug }.
// 404 if contact not yet found (client polls).

import Stripe from 'stripe';
import { findContactByEmail } from '../lib/tracking.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-12-18.acacia' });

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session_id = (req.query && req.query.session_id) || null;
  const emailQ = (req.query && req.query.email) || null;

  let email = null;
  let petition_slug = null;

  try {
    if (session_id) {
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ error: 'Stripe not configured' });
      }
      const session = await stripe.checkout.sessions.retrieve(String(session_id));
      email = session?.customer_details?.email || session?.customer_email || null;
      petition_slug = session?.client_reference_id || null;
    } else if (emailQ) {
      email = String(emailQ);
    } else {
      return res.status(400).json({ error: 'session_id or email required' });
    }

    if (!email) {
      return res.status(404).json({ error: 'no email yet (poll again)' });
    }

    const contact = await findContactByEmail(email);
    if (!contact) {
      return res.status(404).json({ error: 'contact not yet provisioned' });
    }

    return res.status(200).json({
      contact_id: contact.fields?.contact_id || null,
      referral_code: contact.fields?.referral_code || null,
      first_name: contact.fields?.first_name || null,
      email,
      petition_slug,
    });
  } catch (err) {
    console.error('[share-context] failed', err && err.message);
    return res.status(500).json({ error: 'share-context failed', detail: String((err && err.message) || err) });
  }
}
