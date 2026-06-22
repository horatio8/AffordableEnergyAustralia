// POST /api/share-click
// Beacon fired on every page load with ?ref=... in the URL. Logs a Share Click
// event on the REFERRER's contact. Once-per-session dedup is the client's job
// (sessionStorage flag); server is best-effort.
//
// Body: { ref, source_url?, fbclid? }

import { findContactByReferralCode, logEvent } from '../lib/tracking.js';

function clientIp(req) {
  const xff = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return xff || req.headers['x-real-ip'] || req.socket?.remoteAddress || null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== 'object') return res.status(400).json({ error: 'Body must be JSON' });

  const code = String(body.ref || '').toUpperCase().trim();
  if (!code) return res.status(400).json({ error: 'ref required' });

  try {
    const referrer = await findContactByReferralCode(code);
    if (!referrer) {
      // Unknown code — log nothing, but return 200 so client beacons don't retry.
      return res.status(200).json({ success: true, matched: false });
    }
    await logEvent({
      event_type: 'Share Click',
      contactRecordId: referrer.id,
      payload: {
        ref: code,
        source_url: body.source_url || null,
        fbclid: body.fbclid || null,
        user_agent: req.headers['user-agent'] || null,
        ip: clientIp(req),
      },
      referral_code_used: code,
      fbclid: body.fbclid || undefined,
      source_channel: 'Referral',
    });
    return res.status(200).json({ success: true, matched: true });
  } catch (err) {
    console.error('[share-click] failed', err && err.message);
    return res.status(500).json({ error: 'share-click failed', detail: String((err && err.message) || err) });
  }
}
