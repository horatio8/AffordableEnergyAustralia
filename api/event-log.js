// POST /api/event-log
// Generic event logger (§3.2). Match-or-create on email/mobile, log event with
// payload = body.payload || the whole body. No Meta CAPI fire.

import { matchOrCreateContact, logEvent } from '../lib/tracking.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== 'object') return res.status(400).json({ error: 'Body must be JSON' });

  const event_type = String(body.event_type || '').trim();
  if (!event_type) return res.status(400).json({ error: 'event_type required' });
  if (!body.email && !body.mobile) {
    return res.status(400).json({ error: 'email or mobile required' });
  }

  try {
    const { record: contact } = await matchOrCreateContact({
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      mobile: body.mobile,
      postcode: body.postcode,
      fbclid: body.fbclid,
      fbp: body.fbp,
      source_channel: body.source_channel || 'Other',
    });
    await logEvent({
      event_type,
      contactRecordId: contact.id,
      payload: body.payload || body,
      fbclid: body.fbclid,
      referral_code_used: body.ref ? String(body.ref).toUpperCase() : undefined,
      source_channel: body.source_channel,
    });
    return res.status(200).json({ success: true, contact_id: contact.fields?.contact_id });
  } catch (err) {
    console.error('[event-log] failed', err && err.message);
    return res.status(500).json({ error: 'event-log failed', detail: String((err && err.message) || err) });
  }
}
