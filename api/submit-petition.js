// Vercel serverless function: receives the petition form from the AEA site
// and forwards it to the Nucleus form receiver as form-encoded data.
// Also writes the supporter into the Airtable Supporters table.
//
// DIAGNOSTIC MODE: Airtable write is awaited and any error is surfaced in
// the response body as `airtable_error`. Once the bug is fixed and verified,
// switch back to fire-and-forget.

import { upsertSupporter } from '../lib/airtable.js';

const DEFAULT_URL = 'https://c4c.campaignnucleus.com/forms/receiver/3e4ea7b9-1786-42dc-a2fb-53b5d1d54ed8';

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
  const phone = String(body.phone || '').trim();
  const postcode = String(body.postcode || '').trim();
  const whysigned = String(body.whysigned || '').trim();

  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: 'First name, last name and email are required.' });
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const params = new URLSearchParams();
  params.set('first_name', first_name);
  params.set('last_name', last_name);
  params.set('email', email);
  if (phone) params.set('phone', phone);
  if (postcode) params.set('postcode', postcode);
  if (whysigned) params.set('whysigned', whysigned);

  const url = process.env.NUCLEUS_PETITION_URL || DEFAULT_URL;

  // Step 1: Nucleus push (still required for the campaign).
  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json, text/html;q=0.9, */*;q=0.5',
        'User-Agent': 'AffordableEnergyAustralia-Site/1.0 (Vercel)',
      },
      body: params.toString(),
      redirect: 'follow',
    });
    const text = await upstream.text();
    if (!upstream.ok) {
      return res.status(502).json({ error: `Form receiver responded ${upstream.status}`, detail: text.slice(0, 500) });
    }
  } catch (e) {
    return res.status(502).json({ error: 'Could not reach the form receiver.', detail: String(e) });
  }

  // Step 2: Airtable upsert — AWAITED and surfaced for diagnostic purposes.
  const site = process.env.SITE_DOMAIN === 'coalition.affordableenergy.org.au'
    ? 'coalition.affordableenergy.org.au'
    : 'affordableenergy.org.au';

  // Snapshot env state for the response. Booleans only — no secret values.
  const envState = {
    AIRTABLE_API_KEY: !!process.env.AIRTABLE_API_KEY,
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID || null,
    AIRTABLE_TABLE_ID: process.env.AIRTABLE_TABLE_ID || null,
    AIRTABLE_API_KEY_length: process.env.AIRTABLE_API_KEY ? process.env.AIRTABLE_API_KEY.length : 0,
    AIRTABLE_API_KEY_first8: process.env.AIRTABLE_API_KEY ? process.env.AIRTABLE_API_KEY.slice(0, 8) : null,
  };

  try {
    const recordId = await upsertSupporter({
      email,
      firstName: first_name,
      lastName: last_name,
      phone,
      postcode,
      whySigned: whysigned,
      site,
      source: 'petition',
    });
    return res.status(200).json({ ok: true, airtable_record: recordId, env: envState });
  } catch (err) {
    const errMsg = String((err && err.message) || err);
    console.error('[airtable] petition upsert failed', { email, err: errMsg });
    // Nucleus already has the lead; surface the Airtable error for diagnosis.
    return res.status(200).json({
      ok: true,
      nucleus: 'sent',
      airtable_error: errMsg,
      env: envState,
    });
  }
}
