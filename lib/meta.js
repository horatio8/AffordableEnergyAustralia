// lib/meta.js
// Minimal Meta Conversions API poster. SHA-256 hashes all PII, includes
// client IP + user-agent, builds fbc from fbclid when missing.
//
// Required env vars:
//   META_PIXEL_ID         — Pixel ID (the number from Events Manager)
//   META_CAPI_TOKEN       — Conversions API access token
// Optional:
//   META_TEST_EVENT_CODE  — Test Events code. Only set while testing.

import crypto from 'crypto';

function sha256(s) {
  return crypto.createHash('sha256').update(String(s)).digest('hex');
}

function clean(s) { return String(s || '').trim().toLowerCase(); }
function digits(s) { return String(s || '').replace(/[^\d]/g, ''); }

function hashPII(user) {
  const out = {};
  if (user.email) out.em = sha256(clean(user.email));
  if (user.first_name) out.fn = sha256(clean(user.first_name));
  if (user.last_name) out.ln = sha256(clean(user.last_name));
  if (user.phone) out.ph = sha256(digits(user.phone));
  if (user.postcode) out.zp = sha256(clean(user.postcode));
  if (user.city) out.ct = sha256(clean(user.city));
  if (user.state) out.st = sha256(clean(user.state));
  if (user.country) out.country = sha256(clean(user.country));
  if (user.external_id) out.external_id = sha256(clean(user.external_id));
  return out;
}

function clientIp(req) {
  const xff = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return xff || req.headers['x-real-ip'] || req.socket?.remoteAddress || undefined;
}

// Build fbc when only fbclid is known. Pattern: fb.1.<unix_ms>.<fbclid>
function makeFbc(fbclid) {
  if (!fbclid) return undefined;
  return `fb.1.${Date.now()}.${fbclid}`;
}

export async function sendMetaEvent({
  event_name,                  // 'Lead' | 'Purchase' | ...
  event_id,                    // shared with browser Pixel for dedup
  event_source_url,
  action_source = 'website',
  user,                        // { email, first_name, last_name, phone, postcode, ... }
  custom_data,                 // { value, currency, content_name, ... }
  req,                         // Vercel req — used for IP + UA
}) {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixelId || !token) {
    console.warn('[meta] CAPI not configured — skipping', { event_name, event_id });
    return { skipped: 'not_configured' };
  }

  const user_data = {
    ...hashPII(user || {}),
    client_ip_address: req ? clientIp(req) : undefined,
    client_user_agent: req ? req.headers['user-agent'] : undefined,
    fbp: user?.fbp || undefined,
    fbc: user?.fbc || makeFbc(user?.fbclid),
  };
  Object.keys(user_data).forEach(k => user_data[k] === undefined && delete user_data[k]);

  const eventObj = {
    event_name,
    event_time: Math.floor(Date.now() / 1000),
    event_id,
    event_source_url,
    action_source,
    user_data,
    custom_data: custom_data || undefined,
  };
  Object.keys(eventObj).forEach(k => eventObj[k] === undefined && delete eventObj[k]);

  const body = {
    data: [eventObj],
    access_token: token,
  };
  if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;

  try {
    const r = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const text = await r.text();
      console.error('[meta] CAPI non-2xx', r.status, text.slice(0, 300));
      return { ok: false, status: r.status, detail: text.slice(0, 300) };
    }
    return { ok: true };
  } catch (err) {
    console.error('[meta] CAPI fetch failed', err && err.message);
    return { ok: false, error: String(err && err.message) };
  }
}
