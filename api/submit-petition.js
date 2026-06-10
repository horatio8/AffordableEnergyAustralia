// Vercel serverless function: receives the petition form from the AEA site
// and forwards it to the Nucleus form receiver as form-encoded data.
// Avoids the browser CORS limitation of POSTing cross-origin to Nucleus.
//
// Optional env var:
//   NUCLEUS_PETITION_URL — overrides the hardcoded receiver URL.

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
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ error: 'Could not reach the form receiver.', detail: String(e) });
  }
}
