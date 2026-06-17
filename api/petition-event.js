// Vercel serverless function: receives Nucleus "New Form Entry Webhook"
// deliveries. Validates the shared secret from the ?secret= query param,
// confirms (best-effort) that the entry is for our petition form, and
// invalidates the in-memory cache in /api/petition-count so the next
// poll hits Nucleus immediately rather than waiting out the TTL.
//
// Always returns 200 — even when the webhook is ignored — so Nucleus
// doesn't enter a retry loop.
//
// Required env vars:
//   NUCLEUS_WEBHOOK_SECRET   — shared secret (also embedded in the URL configured in Nucleus)
//   NUCLEUS_PETITION_FORM_ID — used to filter out events for other forms

import { invalidateCache } from './petition-count.js';

export default async function handler(req, res) {
  const expected = process.env.NUCLEUS_WEBHOOK_SECRET;
  const provided = (req.query && (req.query.secret || '')).toString().trim();

  if (!expected || provided !== expected) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method not allowed' });
  }

  // Vercel auto-parses application/json bodies, but Nucleus may send
  // form-encoded or stringified JSON — handle both.
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }

  // Filter — Nucleus may name the form ID field differently across versions,
  // so check the obvious candidates. If we can't tell which form it's for,
  // invalidate anyway (a cache flush is cheap).
  const incomingFormId =
    (body && (body.form_id || body.form_uuid || body.formId ||
              (body.form && body.form.id) || (body.data && body.data.form_id))) || null;
  const formId = process.env.NUCLEUS_PETITION_FORM_ID;
  const isPetition = !incomingFormId || incomingFormId === formId;

  if (isPetition) {
    invalidateCache();
    console.log('[petition-event] cache invalidated', { incomingFormId });
  } else {
    console.log('[petition-event] ignored (different form)', { incomingFormId });
  }

  return res.status(200).json({ ok: true, invalidated: isPetition });
}
