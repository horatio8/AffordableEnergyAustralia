// Vercel serverless function: GET checks auth, POST commits content.json to GitHub.
// Required env vars (set in Vercel project settings):
//   ADMIN_PASSWORD  — shared secret used by the /admin login
//   GITHUB_TOKEN    — fine-grained PAT with "Contents: Read & Write" on this repo
//   GITHUB_REPO     — e.g. "horatio8/AffordableEnergyAustralia"
//   GITHUB_BRANCH   — e.g. "claude/implement-affordable-energy-3Pgy1" (or "main")

export default async function handler(req, res) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Server not configured: ADMIN_PASSWORD missing' });
  }
  if (!token || token !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH } = process.env;
  if (!GITHUB_TOKEN || !GITHUB_REPO || !GITHUB_BRANCH) {
    return res.status(500).json({ error: 'Server not configured: GITHUB_TOKEN / GITHUB_REPO / GITHUB_BRANCH missing' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) { body = null; }
  }
  if (!body || typeof body.content !== 'object' || body.content === null) {
    return res.status(400).json({ error: 'Body must be { content: { ... } }' });
  }

  const path = 'content.json';
  const contentJson = JSON.stringify(body.content, null, 2) + '\n';
  const contentB64 = Buffer.from(contentJson, 'utf8').toString('base64');

  const ghBase = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`;
  const ghHeaders = {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'aea-cms',
  };

  let sha;
  try {
    const cur = await fetch(`${ghBase}?ref=${encodeURIComponent(GITHUB_BRANCH)}`, { headers: ghHeaders });
    if (cur.status === 200) {
      const j = await cur.json();
      sha = j.sha;
    } else if (cur.status !== 404) {
      const t = await cur.text();
      return res.status(502).json({ error: `GitHub read failed (${cur.status})`, detail: t.slice(0, 500) });
    }
  } catch (e) {
    return res.status(502).json({ error: 'GitHub read error', detail: String(e) });
  }

  const commit = {
    message: 'CMS: update content.json',
    content: contentB64,
    branch: GITHUB_BRANCH,
    ...(sha ? { sha } : {}),
  };

  try {
    const put = await fetch(ghBase, {
      method: 'PUT',
      headers: { ...ghHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(commit),
    });
    if (!put.ok) {
      const t = await put.text();
      return res.status(502).json({ error: `GitHub write failed (${put.status})`, detail: t.slice(0, 500) });
    }
    const result = await put.json();
    return res.status(200).json({ ok: true, commit: result.commit?.sha, url: result.commit?.html_url });
  } catch (e) {
    return res.status(502).json({ error: 'GitHub write error', detail: String(e) });
  }
}
