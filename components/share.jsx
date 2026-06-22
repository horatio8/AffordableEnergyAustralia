/* === SharePage: post-donation / post-petition referral hub ===
 * Three states:
 *   - polling      → landed with ?session_id=cs_… from Stripe. Polls /api/share-context
 *                    every 2s for up to 30s waiting for the webhook to land.
 *   - ask_identity → no session_id, no localStorage. Form: first_name*, last_name*, email*
 *                    (+ optional mobile/postcode) → /api/share-signup.
 *   - ready        → render thank-you copy + the share buttons that drive referrals.
 *
 * Share URL construction priority:
 *   1. petition_slug from /api/share-context (server-trustable, came from Stripe
 *      client_reference_id) → https://<origin>/take-action/<slug>?ref=<code>
 *   2. localStorage.aea_last_petition_url (set by signPetition helper) — append ?ref=
 *   3. site origin as fallback — append ?ref=
 */

const SHARE_PLATFORMS = [
  { key: 'facebook',  label: 'Facebook',  bg: '#1877F2', fg: '#fff' },
  { key: 'x',         label: 'X',         bg: '#000',    fg: '#fff' },
  { key: 'linkedin',  label: 'LinkedIn',  bg: '#0A66C2', fg: '#fff' },
  { key: 'whatsapp',  label: 'WhatsApp',  bg: '#25D366', fg: '#fff' },
  { key: 'email',     label: 'Email',     bg: '#F5A623', fg: '#0D1F1C' },
  { key: 'copy',      label: 'Copy link', bg: '#5b6573', fg: '#fff' },
];

function getSessionIdFromHash() {
  const idx = window.location.hash.indexOf('?');
  if (idx < 0) return null;
  const params = new URLSearchParams(window.location.hash.slice(idx + 1));
  return params.get('session_id') || null;
}

function buildShareUrl({ referral_code, petition_slug }) {
  if (!referral_code) return null;
  const origin = window.location.origin;
  let target;
  if (petition_slug) {
    target = `${origin}/take-action/${encodeURIComponent(petition_slug)}`;
  } else {
    try {
      const stored = localStorage.getItem('aea_last_petition_url');
      target = stored && /^https?:/.test(stored) ? stored.split('?')[0].split('#')[0] : `${origin}/`;
    } catch (_) {
      target = `${origin}/`;
    }
  }
  const sep = target.includes('?') ? '&' : '?';
  return `${target}${sep}ref=${encodeURIComponent(referral_code)}`;
}

function buildShareText({ shareUrl, firstName }) {
  const intro = firstName ? `${firstName} signed the petition for affordable, reliable Aussie energy.` : 'I just signed the petition for affordable, reliable Aussie energy.';
  return `${intro} 1 in 5 Australians can't afford the power bill. Add your name: ${shareUrl}`;
}

function openShareUrl(platform, { shareUrl, subject, body }) {
  const u = encodeURIComponent(shareUrl);
  const t = encodeURIComponent(body);
  if (platform === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${u}`, '_blank', 'noopener,noreferrer');
  else if (platform === 'x') window.open(`https://twitter.com/intent/tweet?text=${t}`, '_blank', 'noopener,noreferrer');
  else if (platform === 'linkedin') window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${u}`, '_blank', 'noopener,noreferrer');
  else if (platform === 'whatsapp') window.open(`https://wa.me/?text=${t}`, '_blank', 'noopener,noreferrer');
  else if (platform === 'email') window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${t}`;
  else if (platform === 'copy') {
    if (navigator.clipboard) navigator.clipboard.writeText(shareUrl).catch(() => {});
  }
}

const SharePage = () => {
  const [phase, setPhase] = React.useState('init'); // init | polling | ask_identity | ready | error
  const [ctx, setCtx] = React.useState(null);        // { contact_id, referral_code, first_name, petition_slug, email }
  const [error, setError] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [sharedPlatforms, setSharedPlatforms] = React.useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('aea_shared_platforms') || '[]')); } catch { return new Set(); }
  });

  // Form state for ask_identity
  const [form, setForm] = React.useState({ first_name: '', last_name: '', email: '', mobile: '', postcode: '' });
  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  // Boot
  React.useEffect(() => {
    const sessionId = getSessionIdFromHash();
    if (sessionId) {
      setPhase('polling');
      pollForContext(sessionId);
      return;
    }
    // No session — try localStorage
    try {
      const storedCode = localStorage.getItem('aea_referral_code');
      const storedFn = localStorage.getItem('aea_first_name');
      if (storedCode) {
        setCtx({ referral_code: storedCode, first_name: storedFn || null, petition_slug: null });
        setPhase('ready');
        return;
      }
    } catch (_) {}
    setPhase('ask_identity');
  }, []);

  async function pollForContext(sessionId, attempt = 0) {
    if (attempt > 15) { // ~30s
      setPhase('ask_identity');
      return;
    }
    try {
      const r = await fetch(`/api/share-context?session_id=${encodeURIComponent(sessionId)}`);
      if (r.ok) {
        const j = await r.json();
        if (j && j.referral_code) {
          setCtx(j);
          try {
            if (j.referral_code) localStorage.setItem('aea_referral_code', j.referral_code);
            if (j.first_name) localStorage.setItem('aea_first_name', j.first_name);
          } catch (_) {}
          setPhase('ready');
          return;
        }
      }
    } catch (_) {}
    setTimeout(() => pollForContext(sessionId, attempt + 1), 2000);
  }

  async function submitIdentity(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch('/api/share-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.referral_code) {
        setError(j.error || 'Could not register. Try again.');
        return;
      }
      try {
        localStorage.setItem('aea_referral_code', j.referral_code);
        if (j.first_name) localStorage.setItem('aea_first_name', j.first_name);
      } catch (_) {}
      setCtx({ referral_code: j.referral_code, first_name: j.first_name || form.first_name, petition_slug: null });
      setPhase('ready');
    } catch (err) {
      setError('Network error. Try again.');
    } finally {
      setBusy(false);
    }
  }

  function handleShare(platform) {
    const shareUrl = buildShareUrl({ referral_code: ctx.referral_code, petition_slug: ctx.petition_slug });
    if (!shareUrl) return;
    const body = buildShareText({ shareUrl, firstName: ctx.first_name });
    const subject = 'I just signed — Australia needs leaders who put affordable energy first';

    // Fire-and-forget log to the server.
    fetch('/api/share-issued', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referral_code: ctx.referral_code,
        platform,
        share_url: shareUrl,
        petition_slug: ctx.petition_slug || null,
      }),
      keepalive: true,
    }).catch(() => {});

    // Persist visual state.
    try {
      const next = new Set(sharedPlatforms);
      next.add(platform);
      localStorage.setItem('aea_shared_platforms', JSON.stringify(Array.from(next)));
      setSharedPlatforms(next);
    } catch (_) {}

    openShareUrl(platform, { shareUrl, subject, body });
  }

  // ─── render ───
  return (
    <main data-screen-label="Share" className="container">
      <div className="thanks-screen">
        {phase === 'polling' && (
          <>
            <div className="thanks-illustration">{HERO_ICONS.check}</div>
            <h1>Thank you.</h1>
            <p>Finalising your details… this takes a few seconds.</p>
          </>
        )}

        {phase === 'ask_identity' && (
          <>
            <div className="thanks-illustration">{HERO_ICONS.check}</div>
            <h1>Thank you.</h1>
            <p>Tell us who you are and we'll give you a personal link to share — every signature through it is credited to you.</p>
            <form onSubmit={submitIdentity} style={{ maxWidth: 460, margin: '24px auto 0', textAlign: 'left' }}>
              <div className="field-row">
                <div className="field"><label>First name <span style={{ color: 'var(--red)' }}>*</span></label><input required value={form.first_name} onChange={update('first_name')} autoComplete="given-name" /></div>
                <div className="field"><label>Last name <span style={{ color: 'var(--red)' }}>*</span></label><input required value={form.last_name} onChange={update('last_name')} autoComplete="family-name" /></div>
              </div>
              <div className="field"><label>Email <span style={{ color: 'var(--red)' }}>*</span></label><input type="email" required value={form.email} onChange={update('email')} autoComplete="email" placeholder="you@email.com" /></div>
              <div className="field"><label>Mobile</label><input type="tel" value={form.mobile} onChange={update('mobile')} autoComplete="tel" /></div>
              <div className="field"><label>Postcode</label><input maxLength="4" value={form.postcode} onChange={update('postcode')} autoComplete="postal-code" placeholder="2000" /></div>
              {error && <div style={{ padding: 12, marginBottom: 12, background: 'rgba(217,64,64,.08)', borderLeft: '3px solid var(--red)', color: 'var(--red)', fontSize: 14 }}>{error}</div>}
              <button type="submit" className="btn btn-teal" disabled={busy}>{busy ? 'Working…' : 'Get my share link →'}</button>
            </form>
          </>
        )}

        {phase === 'ready' && ctx && (
          <>
            <div className="thanks-illustration">{HERO_ICONS.check}</div>
            <h1>{ctx.first_name ? `Thanks, ${ctx.first_name}.` : 'Thank you.'}</h1>
            <p>Every Australian you share this with strengthens the campaign. Each share through your link is credited to you in the data we hand to MPs.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 420, margin: '28px auto 0' }}>
              {SHARE_PLATFORMS.map(p => {
                const used = sharedPlatforms.has(p.key);
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => handleShare(p.key)}
                    style={{
                      background: p.bg, color: p.fg,
                      padding: '14px 18px',
                      fontFamily: 'Barlow Condensed, sans-serif',
                      fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 16,
                      border: used ? '2px solid var(--amber)' : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'transform .15s ease',
                    }}
                  >
                    {used ? '✓ ' : ''}{p.key === 'copy' && sharedPlatforms.has('copy') ? 'Link copied!' : p.label}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: 13, color: 'var(--grey)', marginTop: 24 }}>
              Your share link: <code style={{ background: 'var(--paper)', padding: '2px 6px' }}>{buildShareUrl({ referral_code: ctx.referral_code, petition_slug: ctx.petition_slug })}</code>
            </p>
          </>
        )}

        {phase === 'init' && null}
      </div>
    </main>
  );
};

Object.assign(window, { SharePage });
