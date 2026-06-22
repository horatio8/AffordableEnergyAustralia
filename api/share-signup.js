// POST /api/share-signup
// Fallback identity capture on the /share page when there's no session_id and
// no localStorage. Match-or-create, ensure referral_code, return it. No event
// logged — the contact creation itself is the signal.

import { matchOrCreateContact } from '../lib/tracking.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== 'object') return res.status(400).json({ error: 'Body must be JSON' });

  const first_name = String(body.first_name || '').trim();
  const last_name = String(body.last_name || '').trim();
  const email = String(body.email || '').trim();
  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: 'first_name, last_name and email are required' });
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ error: 'invalid email' });
  }

  try {
    const { record: contact, isNew } = await matchOrCreateContact({
      first_name, last_name, email,
      mobile: body.mobile,
      postcode: body.postcode,
      source_channel: 'Share',
    });
    return res.status(200).json({
      success: true,
      contact_id: contact.fields?.contact_id,
      referral_code: contact.fields?.referral_code,
      first_name: contact.fields?.first_name,
      is_new_contact: isNew,
    });
  } catch (err) {
    console.error('[share-signup] failed', err && err.message);
    return res.status(500).json({ error: 'share-signup failed', detail: String((err && err.message) || err) });
  }
}
