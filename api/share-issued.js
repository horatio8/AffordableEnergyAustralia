// POST /api/share-issued
// Logs that a sharer pressed a share button on /share. Body:
//   { referral_code, platform, share_url, petition_slug? }

import { findContactByReferralCode, logEvent } from '../lib/tracking.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== 'object') return res.status(400).json({ error: 'Body must be JSON' });

  const code = String(body.referral_code || '').toUpperCase().trim();
  if (!code) return res.status(400).json({ error: 'referral_code required' });

  try {
    const referrer = await findContactByReferralCode(code);
    if (!referrer) return res.status(404).json({ error: 'unknown referral_code' });

    await logEvent({
      event_type: 'Share Issued',
      contactRecordId: referrer.id,
      payload: {
        platform: body.platform || null,
        share_url: body.share_url || null,
        petition_slug: body.petition_slug || null,
        ref: code,
      },
      referral_code_used: code,
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[share-issued] failed', err && err.message);
    return res.status(500).json({ error: 'share-issued failed', detail: String((err && err.message) || err) });
  }
}
