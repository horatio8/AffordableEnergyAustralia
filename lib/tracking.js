// lib/tracking.js
// Petition / donation / referral tracking helpers for the AEA site.
//
// Implements the Airtable schema in CLAUDE_CODE_BRIEF_petition_tracking.md:
//   Contacts            — source-of-truth person rows
//   Events              — append-only log of every interaction (full raw payloads)
//   Petition Signatures — typed projection of "Petition Signed" events
//   Donations           — typed projection of "Donation" events
//
// Required env vars:
//   AIRTABLE_API_KEY                       — PAT with data.records:read + write on the base
//   AIRTABLE_BASE_ID                       — base id (appXXXX...)
//   AIRTABLE_CONTACTS_TABLE                — optional, default "Contacts"
//   AIRTABLE_EVENTS_TABLE                  — optional, default "Events"
//   AIRTABLE_PETITION_SIGNATURES_TABLE     — optional, default "Petition Signatures"
//   AIRTABLE_DONATIONS_TABLE               — optional, default "Donations"

import crypto from 'crypto';

function cfg() {
  return {
    BASE_ID: process.env.AIRTABLE_BASE_ID,
    API_KEY: process.env.AIRTABLE_API_KEY,
    CONTACTS: process.env.AIRTABLE_CONTACTS_TABLE || 'Contacts',
    EVENTS: process.env.AIRTABLE_EVENTS_TABLE || 'Events',
    SIGNATURES: process.env.AIRTABLE_PETITION_SIGNATURES_TABLE || 'Petition Signatures',
    DONATIONS: process.env.AIRTABLE_DONATIONS_TABLE || 'Donations',
  };
}

function assertCfg() {
  const c = cfg();
  if (!c.BASE_ID || !c.API_KEY) {
    throw new Error('Airtable tracking env not configured: AIRTABLE_API_KEY / AIRTABLE_BASE_ID');
  }
  return c;
}

function at(table) {
  const { BASE_ID } = cfg();
  return `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`;
}

function headers() {
  return {
    Authorization: `Bearer ${cfg().API_KEY}`,
    'Content-Type': 'application/json',
  };
}

function esc(s) { return String(s).replace(/"/g, '\\"'); }

// ───────────────────────── normalisation ─────────────────────────

export function normaliseEmail(email) {
  return String(email || '').trim().toLowerCase();
}

// Australian-default phone normalisation to rough E.164. Adapt per locale.
export function normalisePhone(phone) {
  if (!phone) return '';
  let digits = String(phone).replace(/[^\d]/g, '');
  if (!digits) return '';
  if (digits.startsWith('61')) return `+${digits}`;
  if (digits.startsWith('0')) return `+61${digits.slice(1)}`;
  if (digits.length >= 9 && !digits.startsWith('+')) return `+${digits}`;
  return digits.startsWith('+') ? digits : `+${digits}`;
}

export function uuid() {
  // Node 16+ + Vercel runtime: crypto.randomUUID is available.
  return crypto.randomUUID();
}

// Crockford alphabet minus 0, 1, I, L, O, U — 30 unambiguous chars.
const REF_ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ';
export function generateReferralCode(len = 6) {
  const bytes = crypto.randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) out += REF_ALPHABET[bytes[i] % REF_ALPHABET.length];
  return out;
}

// ───────────────────────── Airtable primitives ─────────────────────────

async function airtableGet(table, query) {
  assertCfg();
  const r = await fetch(`${at(table)}?${query}`, { headers: headers() });
  if (!r.ok) throw new Error(`Airtable GET ${table} ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return r.json();
}

async function airtableCreate(table, fields) {
  assertCfg();
  const r = await fetch(at(table), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ fields, typecast: true }),
  });
  if (!r.ok) throw new Error(`Airtable CREATE ${table} ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return r.json();
}

async function airtablePatch(table, recordId, fields) {
  assertCfg();
  const r = await fetch(`${at(table)}/${recordId}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ fields, typecast: true }),
  });
  if (!r.ok) throw new Error(`Airtable PATCH ${table} ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return r.json();
}

async function airtableFindOne(table, formula) {
  const q = `filterByFormula=${encodeURIComponent(formula)}&maxRecords=1`;
  const j = await airtableGet(table, q);
  return (j.records && j.records[0]) || null;
}

// ───────────────────────── Contacts ─────────────────────────

// Identity ladder: email → mobile → name+postcode → CREATE.
// On match: backfill empty fields, refresh last_updated; preserve first-touch
// (date_first_seen, fbclid, fbp, referral_code, referred_by).
export async function matchOrCreateContact(input = {}) {
  const c = assertCfg();
  const email = normaliseEmail(input.email);
  const mobile = normalisePhone(input.mobile);
  const fn = String(input.first_name || '').trim();
  const ln = String(input.last_name || '').trim();
  const postcode = String(input.postcode || '').trim();
  const now = new Date().toISOString();

  let record = null;

  if (email) {
    record = await airtableFindOne(c.CONTACTS, `LOWER({email}) = "${esc(email)}"`);
  }
  if (!record && mobile) {
    record = await airtableFindOne(c.CONTACTS, `{mobile} = "${esc(mobile)}"`);
  }
  if (!record && fn && ln && postcode) {
    record = await airtableFindOne(
      c.CONTACTS,
      `AND(LOWER({first_name}) = "${esc(fn.toLowerCase())}", LOWER({last_name}) = "${esc(ln.toLowerCase())}", {postcode} = "${esc(postcode)}")`
    );
  }

  if (!record) {
    // Create
    const id = uuid();
    const code = await uniqueReferralCode();
    const fields = {
      contact_id: id,
      first_name: fn || undefined,
      last_name: ln || undefined,
      email: email || undefined,
      mobile: mobile || undefined,
      postcode: postcode || undefined,
      fbclid: input.fbclid || undefined,
      fbp: input.fbp || undefined,
      referral_code: code,
      first_source_channel: input.source_channel || 'Direct',
      status: input.initial_status || 'Signatory Only',
      date_first_seen: now,
      last_updated: now,
    };
    // Strip undefined
    Object.keys(fields).forEach(k => fields[k] === undefined && delete fields[k]);
    const created = await airtableCreate(c.CONTACTS, fields);
    return { record: created, isNew: true };
  }

  // Match: backfill empty fields only, preserve first-touch.
  const f = record.fields || {};
  const patch = { last_updated: now };
  if (fn && !f.first_name) patch.first_name = fn;
  if (ln && !f.last_name) patch.last_name = ln;
  if (mobile && !f.mobile) patch.mobile = mobile;
  if (postcode && !f.postcode) patch.postcode = postcode;
  if (email && !f.email) patch.email = email;
  if (input.fbp && !f.fbp) patch.fbp = input.fbp;
  // fbclid + date_first_seen + referral_code intentionally preserved.

  if (Object.keys(patch).length > 1) {
    await airtablePatch(c.CONTACTS, record.id, patch);
  }
  return { record, isNew: false };
}

async function uniqueReferralCode(maxTries = 10) {
  const c = cfg();
  for (let i = 0; i < maxTries; i++) {
    const code = generateReferralCode(6);
    const found = await airtableFindOne(c.CONTACTS, `{referral_code} = "${esc(code)}"`);
    if (!found) return code;
  }
  // Fallback: very long random code, collision improbable.
  return generateReferralCode(10);
}

export async function findContactByReferralCode(code) {
  if (!code) return null;
  const c = cfg();
  return airtableFindOne(c.CONTACTS, `{referral_code} = "${esc(String(code).toUpperCase())}"`);
}

export async function findContactByEmail(email) {
  if (!email) return null;
  const c = cfg();
  return airtableFindOne(c.CONTACTS, `LOWER({email}) = "${esc(normaliseEmail(email))}"`);
}

// ───────────────────────── Events + Fan-out ─────────────────────────

const PROJECTION_TABLES = {
  'Petition Signed': 'SIGNATURES',
  'Donation': 'DONATIONS',
};

export async function logEvent({
  event_type,
  contactRecordId,
  payload,
  meta_event_id,
  fbclid,
  referral_code_used,
  source_channel,
  timestamp,
}) {
  const c = assertCfg();
  const event_id = uuid();
  const now = timestamp || new Date().toISOString();

  const fields = {
    event_id,
    event_type,
    timestamp: now,
    payload: typeof payload === 'string' ? payload : JSON.stringify(payload || {}),
    meta_event_id: meta_event_id || undefined,
    fbclid: fbclid || undefined,
    referral_code_used: referral_code_used || undefined,
    source_channel: source_channel || undefined,
  };
  if (contactRecordId) fields.contact = [contactRecordId];
  Object.keys(fields).forEach(k => fields[k] === undefined && delete fields[k]);

  // Idempotency: if meta_event_id provided, skip if a row already exists.
  if (meta_event_id) {
    const existing = await airtableFindOne(c.EVENTS, `{meta_event_id} = "${esc(meta_event_id)}"`);
    if (existing) {
      return { record: existing, alreadyExists: true, projection: null };
    }
  }

  const created = await airtableCreate(c.EVENTS, fields);
  const projectionKey = PROJECTION_TABLES[event_type];
  let projection = null;
  let fanoutStatus = 'No Typed Table';
  let fanoutError = null;

  if (projectionKey) {
    try {
      projection = await projectEvent(event_type, {
        contactRecordId,
        eventRecordId: created.id,
        payload,
      });
      fanoutStatus = 'Fanned Out';
    } catch (err) {
      fanoutStatus = 'Failed';
      fanoutError = String((err && err.message) || err);
      console.error('[tracking] projection failed', { event_type, err: fanoutError });
    }
  }

  // Patch fan-out status on the event row.
  try {
    await airtablePatch(c.EVENTS, created.id, {
      fanout_status: fanoutStatus,
      fanout_error: fanoutError || undefined,
    });
  } catch (err) {
    console.error('[tracking] could not patch fan-out status', err && err.message);
  }

  return { record: created, alreadyExists: false, projection, fanoutStatus };
}

async function projectEvent(event_type, ctx) {
  const c = cfg();
  if (event_type === 'Petition Signed') return projectPetitionSignature(c, ctx);
  if (event_type === 'Donation') return projectDonation(c, ctx);
  return null;
}

async function projectPetitionSignature(c, { contactRecordId, eventRecordId, payload }) {
  const p = (payload && typeof payload === 'object') ? payload : {};
  const fields = {
    signature_id: uuid(),
    first_name: p.first_name || undefined,
    last_name: p.last_name || undefined,
    email: normaliseEmail(p.email) || undefined,
    mobile: normalisePhone(p.mobile) || undefined,
    postcode: p.postcode || undefined,
    country: p.country || undefined,
    campaign: p.campaign || p.petition_slug || undefined,
    consent: p.consent === undefined ? undefined : !!p.consent,
    fbclid: p.fbclid || undefined,
    fbp: p.fbp || undefined,
    ref_used: p.ref || undefined,
    utm_source: p.utm_source || undefined,
    utm_medium: p.utm_medium || undefined,
    utm_campaign: p.utm_campaign || undefined,
    utm_term: p.utm_term || undefined,
    utm_content: p.utm_content || undefined,
    timestamp: new Date().toISOString(),
    payload: JSON.stringify(p),
  };
  if (contactRecordId) fields.contact = [contactRecordId];
  if (eventRecordId) fields.event = [eventRecordId];
  Object.keys(fields).forEach(k => fields[k] === undefined && delete fields[k]);
  return airtableCreate(c.SIGNATURES, fields);
}

async function projectDonation(c, { contactRecordId, eventRecordId, payload }) {
  const p = (payload && typeof payload === 'object') ? payload : {};
  const amountCents = Number(p.amount_cents != null ? p.amount_cents : (p.amount != null ? Math.round(p.amount * 100) : 0)) || 0;
  const fields = {
    donation_id: uuid(),
    amount_cents: amountCents,
    amount: amountCents / 100,
    currency: p.currency || 'aud',
    stripe_object_type: p.stripe_object_type || undefined,
    stripe_object_id: p.stripe_object_id || undefined,
    stripe_payment_intent: p.stripe_payment_intent || undefined,
    email: normaliseEmail(p.email) || undefined,
    name: p.name || undefined,
    phone: normalisePhone(p.phone) || undefined,
    postcode: p.postcode || undefined,
    country: p.country || undefined,
    content_name: p.content_name || undefined,
    source_url: p.source_url || undefined,
    fbclid: p.fbclid || undefined,
    fbp: p.fbp || undefined,
    petition_slug: p.petition_slug || undefined,
    timestamp: new Date().toISOString(),
    payload: JSON.stringify(p),
  };
  if (contactRecordId) fields.contact = [contactRecordId];
  if (eventRecordId) fields.event = [eventRecordId];
  Object.keys(fields).forEach(k => fields[k] === undefined && delete fields[k]);
  return airtableCreate(c.DONATIONS, fields);
}

// ───────────────────────── Helpers exposed to handlers ─────────────────────────

export async function setReferredBy(contactRecordId, referrerRecordId) {
  if (!contactRecordId || !referrerRecordId) return;
  const c = cfg();
  try {
    await airtablePatch(c.CONTACTS, contactRecordId, { referred_by: [referrerRecordId] });
  } catch (err) {
    console.error('[tracking] setReferredBy failed', err && err.message);
  }
}

export async function ensureStatus(contactRecord, addState) {
  // addState ∈ "signatory" | "donor"
  if (!contactRecord) return;
  const c = cfg();
  const current = contactRecord.fields?.status || 'Signatory Only';
  let next = current;
  if (addState === 'signatory' && current === 'Donor Only') next = 'Signatory + Donor';
  if (addState === 'signatory' && !current) next = 'Signatory Only';
  if (addState === 'donor' && current === 'Signatory Only') next = 'Signatory + Donor';
  if (addState === 'donor' && !current) next = 'Donor Only';
  if (next === current) return;
  try {
    await airtablePatch(c.CONTACTS, contactRecord.id, { status: next });
  } catch (err) {
    console.error('[tracking] ensureStatus failed', err && err.message);
  }
}

export { cfg as _cfg };
