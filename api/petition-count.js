// Vercel serverless function: returns the live petition signature count.
// Polls Campaign Nucleus's form-entries API every 60s (cached in-memory + Vercel
// edge cache via s-maxage), then adds an offline-collected boost from env.
//
// Required env vars:
//   NUCLEUS_CLIENT_ID         — OAuth client ID from Nucleus → Settings → Services → API Clients
//   NUCLEUS_CLIENT_SECRET     — OAuth client secret (one-time display)
//   NUCLEUS_PETITION_FORM_ID  — UUID of the petition form receiver (3e4ea7b9-...)
// Optional env vars:
//   OFFLINE_SIGNATURE_BOOST   — integer added to nucleus count (paper signatures etc). Default 0.
//   PETITION_COUNT_FLOOR      — emergency floor returned when cold start + Nucleus down. Default 0.
//
// Failure modes:
//   - Nucleus down + warm cache → serves stale cache + boost. Site keeps working.
//   - Nucleus down + cold cache → returns PETITION_COUNT_FLOOR + boost.
//   - Client secret rotated      → token request 401s, cached value still served.
//   - Form ID wrong              → surfaced in `error` field for fast diagnosis.
//
// Future enhancement: Nucleus exposes a "New Form Entry Webhook" in
// Settings → Services. Wiring it would give sub-second updates and remove the
// poll, but the 60s poll is sufficient for the campaign's UX needs.

// In-memory cache. Shared across warm invocations on the same Vercel function instance.
let cache = { value: null, fetchedAt: 0, sourceUrl: null, sourcePath: null };
let tokenCache = { accessToken: null, expiresAt: 0 };

const TTL_MS = 10_000;
const NUCLEUS_OAUTH_URL = process.env.NUCLEUS_OAUTH_URL || 'https://oauth.campaignnucleus.com/token';
const NUCLEUS_API_BASE = process.env.NUCLEUS_API_BASE || 'https://api.campaignnucleus.com';

// Exported so /api/petition-event can invalidate after a new signature.
// Across instances this only invalidates the instance the webhook hits, but the
// 10s TTL means other instances catch up within 10s without help.
export function invalidateCache() {
  cache.fetchedAt = 0;
}

async function getToken() {
  const now = Date.now();
  if (tokenCache.accessToken && tokenCache.expiresAt > now + 30_000) return tokenCache.accessToken;

  if (!process.env.NUCLEUS_CLIENT_ID || !process.env.NUCLEUS_CLIENT_SECRET) {
    throw new Error('Nucleus env missing: NUCLEUS_CLIENT_ID / NUCLEUS_CLIENT_SECRET');
  }

  const r = await fetch(NUCLEUS_OAUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: process.env.NUCLEUS_CLIENT_ID,
      client_secret: process.env.NUCLEUS_CLIENT_SECRET,
    }),
  });
  if (!r.ok) throw new Error(`Nucleus token failed: ${r.status} ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  if (!j.access_token) throw new Error('Nucleus token response missing access_token');
  tokenCache.accessToken = j.access_token;
  tokenCache.expiresAt = now + ((j.expires_in || 3600) * 1000);
  return tokenCache.accessToken;
}

// Try a few documented endpoint shapes — Nucleus's docs aren't precise about which
// returns a total count, so we try in order and pick the first that gives us a number.
function candidateEndpoints(formId) {
  return [
    // Laravel API Resource pagination commonly puts the total at meta.total or meta.last_page
    // when per_page=1. Try per_page=1 first (Laravel default), then limit=1 (some forks).
    { url: `${NUCLEUS_API_BASE}/v1/forms/${formId}/entries?per_page=1`, paths: ['meta.total', 'meta.last_page', 'meta.total_count', 'pagination.total', 'total_count', 'total', 'count', 'data.meta.total'] },
    { url: `${NUCLEUS_API_BASE}/v1/forms/${formId}/entries?limit=1`,    paths: ['meta.total', 'meta.last_page', 'meta.total_count', 'pagination.total', 'total_count', 'total', 'count'] },
    { url: `${NUCLEUS_API_BASE}/v1/forms/${formId}`,                    paths: ['data.entry_count', 'data.entries_count', 'data.submissions_count', 'data.responses_count', 'data.meta.entries', 'entry_count', 'entries_count', 'total_entries'] },
    { url: `${NUCLEUS_API_BASE}/v1/forms/${formId}/entries/count`,      paths: ['count', 'total', 'value'] },
    { url: `${NUCLEUS_API_BASE}/v1/form-entries?form_id=${formId}&per_page=1`, paths: ['meta.total', 'meta.last_page', 'pagination.total', 'total'] },
  ];
}

function pluck(obj, path) {
  return path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}

// Deep-walk fallback: find any number-valued field whose key suggests a total-entries count.
// Returns the FIRST match in priority order (total_count > total > last_page > entry_count …).
function deepFindCount(obj) {
  if (!obj || typeof obj !== 'object') return null;
  const priority = ['total_count', 'total_entries', 'entries_count', 'submissions_count', 'responses_count', 'entry_count', 'total', 'last_page', 'count'];
  for (const key of priority) {
    const stack = [obj];
    while (stack.length) {
      const node = stack.shift();
      if (!node || typeof node !== 'object') continue;
      if (key in node && typeof node[key] === 'number' && Number.isFinite(node[key]) && node[key] >= 0) {
        return { value: node[key], path: `walk:${key}` };
      }
      for (const k of Object.keys(node)) {
        if (node[k] && typeof node[k] === 'object') stack.push(node[k]);
      }
    }
  }
  return null;
}

async function fetchEntryCount(token, formId) {
  const tried = [];
  for (const { url, paths } of candidateEndpoints(formId)) {
    try {
      const r = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
      const status = r.status;
      // Try X-Total-Count header first (some pagination styles surface it there)
      const headerTotal = parseInt(r.headers.get('x-total-count') || '', 10);
      let bodyText = null, body = null;
      if (r.ok) {
        bodyText = await r.text();
        try { body = JSON.parse(bodyText); } catch (_) { body = null; }
      }
      if (Number.isFinite(headerTotal) && headerTotal >= 0 && r.ok) {
        return { count: headerTotal, sourceUrl: url, sourcePath: 'header:x-total-count', tried };
      }
      if (r.ok && body) {
        // Exact path lookup
        for (const path of paths) {
          const v = pluck(body, path);
          if (typeof v === 'number' && Number.isFinite(v) && v >= 0) {
            return { count: v, sourceUrl: url, sourcePath: path, tried };
          }
        }
        // Deep-walk fallback: search for any priority-ordered key (total_count > total > last_page …)
        const found = deepFindCount(body);
        if (found) {
          return { count: found.value, sourceUrl: url, sourcePath: found.path, tried };
        }
      }
      tried.push({ url, status, sample: bodyText ? bodyText.slice(0, 800) : null });
    } catch (e) {
      tried.push({ url, error: String((e && e.message) || e) });
    }
  }
  const err = new Error('Could not discover entry count from any candidate Nucleus endpoint');
  err.tried = tried;
  throw err;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const now = Date.now();
  const boost = Number(process.env.OFFLINE_SIGNATURE_BOOST || 0);
  const floor = Number(process.env.PETITION_COUNT_FLOOR || 0);
  const formId = process.env.NUCLEUS_PETITION_FORM_ID;

  // Cache hit (fresh)
  if (cache.value != null && now - cache.fetchedAt < TTL_MS) {
    res.setHeader('Cache-Control', 'public, s-maxage=5, stale-while-revalidate=30');
    return res.status(200).json({
      count: cache.value + boost,
      raw_nucleus: cache.value,
      offline_boost: boost,
      cached: true,
      source: { url: cache.sourceUrl, path: cache.sourcePath },
      last_updated_at: new Date(cache.fetchedAt).toISOString(),
    });
  }

  if (!formId) {
    return res.status(500).json({ error: 'Nucleus env missing: NUCLEUS_PETITION_FORM_ID' });
  }

  try {
    const token = await getToken();
    const { count, sourceUrl, sourcePath, tried } = await fetchEntryCount(token, formId);
    cache.value = count;
    cache.fetchedAt = now;
    cache.sourceUrl = sourceUrl;
    cache.sourcePath = sourcePath;
    res.setHeader('Cache-Control', 'public, s-maxage=5, stale-while-revalidate=30');
    return res.status(200).json({
      count: count + boost,
      raw_nucleus: count,
      offline_boost: boost,
      cached: false,
      source: { url: sourceUrl, path: sourcePath },
      tried_count: tried.length,
      last_updated_at: new Date(now).toISOString(),
    });
  } catch (err) {
    console.error('[petition-count] fetch failed', err && err.message, err && err.tried);
    // Stale cache fallback
    if (cache.value != null) {
      return res.status(200).json({
        count: cache.value + boost,
        raw_nucleus: cache.value,
        offline_boost: boost,
        cached: true,
        stale: true,
        last_updated_at: new Date(cache.fetchedAt).toISOString(),
      });
    }
    // Cold-start, no cache, Nucleus unreachable — return floor + boost so site never shows 0.
    return res.status(200).json({
      count: floor + boost,
      raw_nucleus: null,
      offline_boost: boost,
      floor,
      error: String((err && err.message) || err),
      tried: (err && err.tried) || undefined,
    });
  }
}
