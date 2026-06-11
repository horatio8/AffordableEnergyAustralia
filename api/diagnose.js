// Vercel serverless function: read-only diagnostic.
// Reports which env vars are configured and whether Airtable is reachable.
// Gated by ADMIN_PASSWORD so it's safe to leave deployed.
//
// Usage:
//   curl -s -H "Authorization: Bearer $ADMIN_PASSWORD" \
//     https://<your-domain>/api/diagnose

export default async function handler(req, res) {
  const auth = (req.headers['authorization'] || req.headers['Authorization'] || '')
    .replace(/^Bearer\s+/i, '')
    .trim();

  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Server not configured: ADMIN_PASSWORD missing' });
  }
  if (!auth || auth !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // env reports use booleans for secrets, raw values for non-secret identifiers
  const env = {
    ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
    GITHUB_TOKEN: !!process.env.GITHUB_TOKEN,
    GITHUB_REPO: process.env.GITHUB_REPO || null,
    GITHUB_BRANCH: process.env.GITHUB_BRANCH || null,
    AIRTABLE_API_KEY: !!process.env.AIRTABLE_API_KEY,
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID || null,
    AIRTABLE_TABLE_ID: process.env.AIRTABLE_TABLE_ID || null,
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
    SITE_DOMAIN: process.env.SITE_DOMAIN || '(default: affordableenergy.org.au)',
    NUCLEUS_PETITION_URL: !!process.env.NUCLEUS_PETITION_URL,
  };

  const report = { env, airtable: { status: 'not_tested' } };

  if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_TABLE_ID) {
    report.airtable = { status: 'env_missing', missing: [
      !process.env.AIRTABLE_API_KEY && 'AIRTABLE_API_KEY',
      !process.env.AIRTABLE_BASE_ID && 'AIRTABLE_BASE_ID',
      !process.env.AIRTABLE_TABLE_ID && 'AIRTABLE_TABLE_ID',
    ].filter(Boolean) };
    return res.status(200).json(report);
  }

  // Probe: read 1 record from the table
  const probeUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_ID}?maxRecords=1`;
  try {
    const r = await fetch(probeUrl, { headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` } });
    const bodyText = await r.text();
    let bodyJson = null;
    try { bodyJson = JSON.parse(bodyText); } catch (_) {}
    report.airtable = {
      status: r.ok ? 'ok' : 'http_error',
      code: r.status,
      body: bodyJson || bodyText.slice(0, 500),
    };
  } catch (e) {
    report.airtable = { status: 'fetch_error', error: String((e && e.message) || e) };
  }

  // Also probe a tiny write (create + delete a dummy record) to catch write-scope-only issues
  if (report.airtable.status === 'ok') {
    try {
      const createUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_ID}`;
      const create = await fetch(createUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { 'fldhd5GRtqj0W5U4P': `diagnose-${Date.now()}@diagnose.local` }, typecast: true }),
      });
      const cBody = await create.text();
      if (!create.ok) {
        report.airtable.writeProbe = { status: 'http_error', code: create.status, body: cBody.slice(0, 500) };
      } else {
        const j = JSON.parse(cBody);
        // immediately delete
        try {
          await fetch(`${createUrl}/${j.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` } });
        } catch (_) {}
        report.airtable.writeProbe = { status: 'ok' };
      }
    } catch (e) {
      report.airtable.writeProbe = { status: 'fetch_error', error: String((e && e.message) || e) };
    }
  }

  return res.status(200).json(report);
}
