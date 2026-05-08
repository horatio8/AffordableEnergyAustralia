// Creates a Stripe Checkout Session for a donation and returns its URL.
// The client posts { amount, recurring } and immediately redirects the user
// to session.url, where Stripe collects card / contact / billing details on
// its own hosted page.
//
// Required env vars:
//   STRIPE_SECRET_KEY     — sk_live_... or sk_test_...
// Optional env vars:
//   STRIPE_CURRENCY       — 3-letter ISO (default "aud")
//   PUBLIC_SITE_URL       — fallback origin for success / cancel URLs

import Stripe from 'stripe';

const MIN_AUD = 1;
const MAX_AUD = 50000;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: 'Server not configured: STRIPE_SECRET_KEY missing' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) { body = null; }
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Invalid body' });
  }

  const amount = Number(body.amount);
  const recurring = !!body.recurring;
  if (!Number.isFinite(amount) || amount < MIN_AUD || amount > MAX_AUD) {
    return res.status(400).json({ error: `Amount must be between $${MIN_AUD} and $${MAX_AUD}` });
  }

  const currency = (process.env.STRIPE_CURRENCY || 'aud').toLowerCase();
  const amountCents = Math.round(amount * 100);

  const proto = (req.headers['x-forwarded-proto'] || 'https').toString().split(',')[0];
  const host = req.headers.host;
  const origin = process.env.PUBLIC_SITE_URL || (host ? `${proto}://${host}` : '');
  if (!origin) {
    return res.status(500).json({ error: 'Could not determine site origin' });
  }
  const successUrl = `${origin}/#/thank-you-donation?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/#/donate`;

  const stripe = new Stripe(secretKey);

  try {
    let session;
    if (recurring) {
      const price = await stripe.prices.create({
        currency,
        unit_amount: amountCents,
        recurring: { interval: 'month' },
        product_data: { name: 'AEA monthly donation' },
      });
      session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: price.id, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: false,
        metadata: { type: 'monthly', amount_aud: String(amount) },
      });
    } else {
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        submit_type: 'donate',
        line_items: [{
          quantity: 1,
          price_data: {
            currency,
            unit_amount: amountCents,
            product_data: { name: 'AEA donation' },
          },
        }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { type: 'one-time', amount_aud: String(amount) },
      });
    }
    return res.status(200).json({ url: session.url, id: session.id });
  } catch (e) {
    return res.status(502).json({ error: e.message || 'Stripe error', code: e.code });
  }
}
