// POST /api/petition-signup
// Primary petition signup endpoint. Implements the spec at §3.1.
//
// 1. match-or-create Contact (identity ladder)
// 2. ensure referral_code exists
// 3. if ?ref= referrer exists: link new contact's referred_by + log Share Conversion on referrer
// 4. log "Petition Signed" event (full payload), idempotent on meta_event_id
// 5. fan-out → Petition Signatures row
// 6. fire Meta CAPI Lead with the same meta_event_id (browser pixel dedup)
// 7. also push to Campaign Nucleus form receiver (legacy + signature-count source-of-truth)
// 8. return { success, contact_id, referral_code, meta_event_id, is_new_contact }

import {
  matchOrCreateContact,
  findContactByReferralCode,
  setReferredBy,
  ensureStatus,
  logEvent,
} from '../lib/tracking.js';
import { sendMetaEvent } from '../lib/meta.js';

const NUCLEUS_DEFAULT_URL = 'https://c4c.campaignnucleus.com/forms/receiver/3e4ea7b9-1786-42dc-a2fb-53b5d1d54ed8';

async function pushToNucleus(body) {
  const url = process.env.NUCLEUS_PETITION_URL || NUCLEUS_DEFAULT_URL;
  const params = new URLSearchParams();
  params.set('first_name', body.first_name || '');
  params.set('last_name', body.last_name || '');
  params.set('email', body.email || '');
  if (body.mobile) params.set('phone', body.mobile);
  if (body.postcode) params.set('postcode', body.postcode);
  if (body.whysigned) params.set('whysigned', body.whysigned);
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json, text/html;q=0.9, */*;q=0.5',
        'User-Agent': 'AffordableEnergyAustralia-Site/1.0 (Vercel)',
      },
      body: params.toString(),
      redirect: 'follow',
    });
    if (!r.ok) console.error('[petition-signup] Nucleus push non-2xx', r.status);
  } catch (err) {
    console.error('[petition-signup] Nucleus push failed', err && err.message);
  }
}

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

  // Always push to Nucleus in the background — that's the live petition counter.
  pushToNucleus(body).catch(() => {});

  try {
    // 1. Identity
    const { record: contact, isNew } = await matchOrCreateContact({
      first_name, last_name, email,
      mobile: body.mobile,
      postcode: body.postcode,
      fbclid: body.fbclid,
      fbp: body.fbp,
      source_channel: body.source_channel || (body.ref ? 'Referral' : (body.fbclid ? 'Facebook' : 'Direct')),
      initial_status: 'Signatory Only',
    });
    const contactRecordId = contact.id;
    const contact_id = contact.fields?.contact_id;
    const referral_code = contact.fields?.referral_code;

    // 2. Referral linkage
    if (body.ref) {
      const referrer = await findContactByReferralCode(body.ref);
      if (referrer && referrer.id !== contactRecordId) {
        if (isNew) await setReferredBy(contactRecordId, referrer.id);
        await logEvent({
          event_type: 'Share Conversion',
          contactRecordId: referrer.id,
          payload: {
            referred_contact_id: contact_id,
            email,
            ref: body.ref,
            source_url: body.source_url,
            timestamp: new Date().toISOString(),
          },
          referral_code_used: String(body.ref).toUpperCase(),
        }).catch(err => console.error('[petition-signup] Share Conversion log failed', err && err.message));
      }
    }

    // 3. Log Petition Signed (also fans out to Petition Signatures)
    const meta_event_id = `petition_${contact_id}_${Date.now()}`;
    await logEvent({
      event_type: 'Petition Signed',
      contactRecordId,
      payload: { ...body, petition_slug: body.petition_slug || body.campaign || null },
      meta_event_id,
      fbclid: body.fbclid,
      referral_code_used: body.ref ? String(body.ref).toUpperCase() : undefined,
      source_channel: body.source_channel,
    });

    // 4. Update contact status
    await ensureStatus(contact, 'signatory');

    // 5. Meta CAPI Lead — fire and forget, never block response.
    sendMetaEvent({
      event_name: 'Lead',
      event_id: meta_event_id,
      event_source_url: body.source_url,
      user: {
        email,
        first_name, last_name,
        phone: body.mobile,
        postcode: body.postcode,
        external_id: contact_id,
        fbclid: body.fbclid,
        fbp: body.fbp,
      },
      req,
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      contact_id,
      referral_code,
      meta_event_id,
      is_new_contact: isNew,
    });
  } catch (err) {
    console.error('[petition-signup] failed', err && err.message);
    return res.status(500).json({ error: 'petition-signup failed', detail: String((err && err.message) || err) });
  }
}
