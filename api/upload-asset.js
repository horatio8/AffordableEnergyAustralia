// Vercel serverless function: upload an image into assets/ via the GitHub Contents API.
// Body: { filename: "team-someone.jpg", contentBase64: "...", contentType?: "image/jpeg" }
// Returns: { ok, path: "assets/...", commit }
// Required env vars (same as save-content.js):
//   ADMIN_PASSWORD, GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH

export const config = { api: { bodyParser: { sizeLimit: '6mb' } } };

export default async function handler(req, res) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!process.env.ADMIN_PASSWORD) return res.status(500).json({ error: 'Server not configured: ADMIN_PASSWORD missing' });
  if (!token || token !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }

  const { GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH } = process.env;
  if (!GITHUB_TOKEN || !GITHUB_REPO || !GITHUB_BRANCH) {
    return res.status(500).json({ error: 'Server not configured: GITHUB_TOKEN / GITHUB_REPO / GITHUB_BRANCH missing' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== 'object') return res.status(400).json({ error: 'Body must be JSON' });

  const { filename, contentBase64, contentType } = body;
  if (!filename || !contentBase64) return res.status(400).json({ error: 'filename and contentBase64 required' });
  if (!/^[A-Za-z0-9_.\-]+$/.test(filename) || filename.startsWith('.')) {
    return res.status(400).json({ error: 'Invalid filename. Use letters, digits, dot, dash, underscore only.' });
  }
  if (contentType && !/^image\//.test(contentType)) {
    return res.status(400).json({ error: 'Only image uploads are allowed.' });
  }
  if (contentBase64.length > 5_000_000) {
    return res.status(413).json({ error: 'File too large (max ~3.5MB after encoding).' });
  }

  const path = `assets/${filename}`;
  const ghBase = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path.split('/').map(encodeURIComponent).join('/')}`;
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
      return res.status(502).json({ error: `GitHub read failed (${cur.status})`, detail: t.slice(0, 300) });
    }
  } catch (e) {
    return res.status(502).json({ error: 'GitHub read error', detail: String(e) });
  }

  try {
    const put = await fetch(ghBase, {
      method: 'PUT',
      headers: { ...ghHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `CMS: upload ${path}`,
        content: contentBase64,
        branch: GITHUB_BRANCH,
        ...(sha ? { sha } : {}),
      }),
    });
    if (!put.ok) {
      const t = await put.text();
      return res.status(502).json({ error: `GitHub write failed (${put.status})`, detail: t.slice(0, 300) });
    }
    const result = await put.json();
    return res.status(200).json({ ok: true, path, commit: result.commit?.sha });
  } catch (e) {
    return res.status(502).json({ error: 'GitHub write error', detail: String(e) });
  }
}
