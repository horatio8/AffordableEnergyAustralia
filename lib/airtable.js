// lib/airtable.js
// All writes to the Supporters Airtable table go through here. Uses native fetch.
//
// Required env vars (set in Vercel → Settings → Environment Variables):
//   AIRTABLE_API_KEY  — personal access token, scoped to data.records:read + data.records:write
//                       on the AEA Supporters base only.
//   AIRTABLE_BASE_ID  — appSGua6tEPXWuGoT
//   AIRTABLE_TABLE_ID — tblNqD7z6jHrU4A0C
//
// Writes use field IDs (not names) so that renames in Airtable don't break us.
// Reads via filterByFormula still reference field names (Airtable requires names in formulas).

const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_ID = process.env.AIRTABLE_TABLE_ID;
const API_KEY = process.env.AIRTABLE_API_KEY;

const AT_BASE = () => `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;
const headers = () => ({
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
});

// Field IDs from the provisioned schema.
export const F = {
  Email: 'fldhd5GRtqj0W5U4P',
  FirstName: 'fld0mReCZeu6bpR08',
  LastName: 'flddyy8a5ya7MqGHo',
  Phone: 'fld54QRdFlqecasVu',
  Postcode: 'fldGRBMVljNM3E0Od',
  Site: 'fldp92U2SEelvdeUv',
  Sources: 'fldpsNG04KgwspNgH',
  WhySigned: 'fldWwK2u7I8t3boZS',
  LastDonationAmount: 'fld0gNkLmxhvP7VJ2',
  DonationFrequency: 'fldKj13F9wQPlTbHE',
  TotalDonated: 'fldTevjORmu0L3fIm',
  DonationCount: 'fldwIyCZuSI3KIEGW',
  LastDonationAt: 'fldEMKRsuaJpSMOCB',
  StripeCustomerId: 'fld2b2SvoJGVNwIwu',
  StripeSubscriptionId: 'fldwTD3YJRghBXFX5',
  LastStripeEventId: 'fldp7H8Hh85aiyiW9',
  FirstSeenAt: 'fld2NHGDgof7GgIE9',
  LastUpdatedAt: 'flddrmYKKoaG6zrB0',
};

function assertConfig() {
  if (!BASE_ID || !TABLE_ID || !API_KEY) {
    throw new Error('Airtable env not configured: AIRTABLE_API_KEY / AIRTABLE_BASE_ID / AIRTABLE_TABLE_ID');
  }
}

async function findByEmail(email) {
  const safe = email.toLowerCase().replace(/"/g, '\\"');
  const filter = encodeURIComponent(`LOWER({Email}) = "${safe}"`);
  const r = await fetch(`${AT_BASE()}?filterByFormula=${filter}&maxRecords=1`, {
    headers: headers(),
  });
  if (!r.ok) throw new Error(`Airtable find failed: ${r.status} ${await r.text()}`);
  const { records } = await r.json();
  return (records && records[0]) || null;
}

export async function eventAlreadyProcessed(eventId) {
  assertConfig();
  const safe = String(eventId).replace(/"/g, '\\"');
  const filter = encodeURIComponent(`{Last Stripe event ID} = "${safe}"`);
  const r = await fetch(`${AT_BASE()}?filterByFormula=${filter}&maxRecords=1`, {
    headers: headers(),
  });
  if (!r.ok) return false;
  const { records } = await r.json();
  return (records && records.length > 0);
}

// Upsert a supporter row, deduplicated by lowercased email.
// input shape:
//   { email, site, source, firstName?, lastName?, phone?, postcode?, whySigned?,
//     donationAmount?, donationFrequency?, stripeCustomerId?, stripeSubscriptionId?,
//     stripeEventId? }
export async function upsertSupporter(input) {
  assertConfig();
  const email = String(input.email || '').trim().toLowerCase();
  if (!email) throw new Error('upsertSupporter: email is required');
  if (!input.site) throw new Error('upsertSupporter: site is required');
  if (!input.source) throw new Error('upsertSupporter: source is required');

  // Idempotency check for Stripe events — skip if we've already written this event.
  if (input.stripeEventId && (await eventAlreadyProcessed(input.stripeEventId))) {
    return 'skipped-idempotent';
  }

  const now = new Date().toISOString();
  const existing = await findByEmail(email);

  if (!existing) {
    const fields = {
      [F.Email]: email,
      [F.Site]: input.site,
      [F.Sources]: [input.source],
      [F.FirstSeenAt]: now,
      [F.LastUpdatedAt]: now,
    };
    if (input.firstName) fields[F.FirstName] = input.firstName;
    if (input.lastName) fields[F.LastName] = input.lastName;
    if (input.phone) fields[F.Phone] = input.phone;
    if (input.postcode) fields[F.Postcode] = input.postcode;
    if (input.whySigned) fields[F.WhySigned] = input.whySigned;

    if (input.source === 'donation' && Number.isFinite(input.donationAmount) && input.donationAmount > 0) {
      fields[F.LastDonationAmount] = input.donationAmount;
      fields[F.DonationFrequency] = input.donationFrequency || 'one-time';
      fields[F.TotalDonated] = input.donationAmount;
      fields[F.DonationCount] = 1;
      fields[F.LastDonationAt] = now;
      if (input.stripeCustomerId) fields[F.StripeCustomerId] = input.stripeCustomerId;
      if (input.stripeSubscriptionId) fields[F.StripeSubscriptionId] = input.stripeSubscriptionId;
      if (input.stripeEventId) fields[F.LastStripeEventId] = input.stripeEventId;
    }

    const r = await fetch(AT_BASE(), {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ fields, typecast: true }),
    });
    if (!r.ok) throw new Error(`Airtable create failed: ${r.status} ${await r.text()}`);
    return (await r.json()).id;
  }

  // Existing row — update, preserving Site and First seen at, appending Sources.
  const prev = existing.fields || {};
  const prevSources = Array.isArray(prev[F.Sources])
    ? prev[F.Sources]
        .map(s => (typeof s === 'string' ? s : (s && s.name) || ''))
        .filter(Boolean)
    : [];
  const nextSources = Array.from(new Set([...prevSources, input.source]));

  const fields = {
    [F.LastUpdatedAt]: now,
    [F.Sources]: nextSources,
  };
  // Identity fields: only overwrite if a new non-empty value is provided.
  if (input.firstName) fields[F.FirstName] = input.firstName;
  if (input.lastName) fields[F.LastName] = input.lastName;
  if (input.phone) fields[F.Phone] = input.phone;
  if (input.postcode) fields[F.Postcode] = input.postcode;
  if (input.whySigned) fields[F.WhySigned] = input.whySigned;

  if (input.source === 'donation' && Number.isFinite(input.donationAmount) && input.donationAmount > 0) {
    const prevTotal = Number(prev[F.TotalDonated] || 0);
    const prevCount = Number(prev[F.DonationCount] || 0);
    fields[F.LastDonationAmount] = input.donationAmount;
    fields[F.DonationFrequency] = input.donationFrequency || 'one-time';
    fields[F.TotalDonated] = prevTotal + input.donationAmount;
    fields[F.DonationCount] = prevCount + 1;
    fields[F.LastDonationAt] = now;
    if (input.stripeCustomerId) fields[F.StripeCustomerId] = input.stripeCustomerId;
    if (input.stripeSubscriptionId) fields[F.StripeSubscriptionId] = input.stripeSubscriptionId;
    if (input.stripeEventId) fields[F.LastStripeEventId] = input.stripeEventId;
  }

  const r = await fetch(`${AT_BASE()}/${existing.id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ fields, typecast: true }),
  });
  if (!r.ok) throw new Error(`Airtable update failed: ${r.status} ${await r.text()}`);
  return existing.id;
}
