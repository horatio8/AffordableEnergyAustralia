/* === Admin / CMS === */

const SECTIONS = [
  { key: 'site', label: 'Site' },
  { key: 'hero', label: 'Home hero' },
  { key: 'pillars', label: 'Pillars' },
  { key: 'ticker', label: 'Ticker' },
  { key: 'stats', label: 'Stats' },
  { key: 'pages', label: 'Page headers' },
  { key: 'voices', label: 'Voices' },
  { key: 'news', label: 'News' },
  { key: 'team', label: 'Team' },
  { key: 'milestones', label: 'Milestones' },
];

const PAGE_KEYS = [
  { key: 'petition', label: 'Sign the Petition' },
  { key: 'takeAction', label: 'Take Action' },
  { key: 'news', label: 'In the News' },
  { key: 'about', label: 'About' },
  { key: 'donate', label: 'Donate' },
  { key: 'theProblem', label: 'The Problem' },
];

const ImageField = ({ label, value, onChange, auth, hint }) => {
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState('');
  const inputRef = React.useRef();
  const onFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\//.test(file.type)) { setErr('Not an image.'); return; }
    if (file.size > 3_500_000) { setErr('File too large (max ~3.5MB). Resize first.'); return; }
    setErr(''); setBusy(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const contentBase64 = String(reader.result).split(',', 2)[1];
      try {
        const res = await fetch('/api/upload-asset', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${auth}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentBase64, contentType: file.type }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) { setErr(data.error || `Upload failed (${res.status})`); setBusy(false); return; }
        onChange(data.path);
      } catch (_) { setErr('Network error.'); }
      finally { setBusy(false); }
    };
    reader.onerror = () => { setErr('Could not read file.'); setBusy(false); };
    reader.readAsDataURL(file);
  };
  return (
    <div className="adm-field">
      <label>{label}</label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
        <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="assets/your-image.jpg" style={{ flex: 1 }} />
        <button type="button" className="btn btn-outline-teal" style={{ padding: '0 14px', fontSize: 12, whiteSpace: 'nowrap' }} onClick={() => inputRef.current?.click()} disabled={busy || !auth}>
          {busy ? 'Uploading…' : 'Upload…'}
        </button>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFile} />
      </div>
      {value && /^assets\//.test(value) && (
        <img src={value} alt="" style={{ marginTop: 8, maxHeight: 96, border: '1px solid rgba(13,31,28,.1)', display: 'block' }} />
      )}
      {err && <small style={{ color: 'var(--red)' }}>{err}</small>}
      {hint && <small>{hint}</small>}
    </div>
  );
};

const Field = ({ label, value, onChange, type = 'text', placeholder, hint }) => (
  <div className="adm-field">
    <label>{label}</label>
    {type === 'textarea' ? (
      <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} />
    ) : (
      <input type={type} value={value ?? ''} onChange={e => onChange(type === 'number' ? +e.target.value : e.target.value)} placeholder={placeholder} />
    )}
    {hint && <small>{hint}</small>}
  </div>
);

const ListEditor = ({ items = [], blank, render, onChange, label = 'item' }) => {
  const update = (i, next) => onChange(items.map((it, idx) => idx === i ? next : it));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { ...blank }]);
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const copy = items.slice();
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };
  return (
    <div>
      {items.map((it, i) => (
        <div className="adm-card" key={i}>
          <div className="adm-card-head">
            <strong>{label} #{i + 1}</strong>
            <div className="adm-card-actions">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
              <button type="button" onClick={() => move(i, +1)} disabled={i === items.length - 1}>↓</button>
              <button type="button" className="adm-danger" onClick={() => remove(i)}>Remove</button>
            </div>
          </div>
          {render(it, (next) => update(i, next))}
        </div>
      ))}
      <button type="button" className="adm-add" onClick={add}>+ Add {label}</button>
    </div>
  );
};

const AdminLogin = ({ onLogin, error }) => {
  const [pwd, setPwd] = React.useState('');
  return (
    <div className="adm-login">
      <div className="adm-login-card">
        <span className="eyebrow" style={{ color: 'var(--teal-dark)', display: 'block', marginBottom: 12 }}>AEA Admin</span>
        <h2>Sign in to edit content.</h2>
        <p>Enter the admin password configured in Vercel environment variables.</p>
        <form onSubmit={(e) => { e.preventDefault(); onLogin(pwd); }}>
          <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="Password" autoFocus />
          <button type="submit" className="btn btn-teal">Sign in</button>
        </form>
        {error && <div className="adm-error">{error}</div>}
        <a href="#/" className="adm-back">← Back to site</a>
      </div>
    </div>
  );
};

const Admin = ({ content, setContent }) => {
  const [auth, setAuth] = React.useState(() => sessionStorage.getItem('aea_admin_token') || '');
  const [authError, setAuthError] = React.useState('');
  const [tab, setTab] = React.useState('site');
  const [draft, setDraft] = React.useState(() => JSON.parse(JSON.stringify(content)));
  const [status, setStatus] = React.useState({ kind: 'idle' });

  React.useEffect(() => {
    if (!auth) return;
    fetch('/api/save-content', { method: 'GET', headers: { 'Authorization': `Bearer ${auth}` } })
      .then(r => { if (r.status === 401) { setAuth(''); sessionStorage.removeItem('aea_admin_token'); setAuthError('Session expired. Sign in again.'); } });
  }, [auth]);

  const login = async (pwd) => {
    setAuthError('');
    try {
      const res = await fetch('/api/save-content', { method: 'GET', headers: { 'Authorization': `Bearer ${pwd}` } });
      if (res.status === 401) { setAuthError('Wrong password.'); return; }
      if (!res.ok) { setAuthError('Auth check failed. Is the API deployed?'); return; }
      sessionStorage.setItem('aea_admin_token', pwd);
      setAuth(pwd);
    } catch (e) {
      setAuthError('Network error. Try again.');
    }
  };

  const logout = () => {
    sessionStorage.removeItem('aea_admin_token');
    setAuth('');
  };

  const setSection = (key, value) => setDraft(d => ({ ...d, [key]: value }));

  const previewLocal = () => {
    localStorage.setItem('aea_content_draft', JSON.stringify(draft));
    setContent(draft);
    setStatus({ kind: 'preview' });
  };

  const discardPreview = () => {
    localStorage.removeItem('aea_content_draft');
    fetch('/content.json', { cache: 'no-store' }).then(r => r.json()).then(c => {
      setContent(c);
      setDraft(JSON.parse(JSON.stringify(c)));
      setStatus({ kind: 'idle' });
    });
  };

  const publish = async () => {
    setStatus({ kind: 'saving' });
    try {
      const res = await fetch('/api/save-content', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${auth}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: draft }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setStatus({ kind: 'error', msg: data.error || 'Save failed' }); return; }
      localStorage.removeItem('aea_content_draft');
      setStatus({ kind: 'published', commit: data.commit });
    } catch (e) {
      setStatus({ kind: 'error', msg: 'Network error' });
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'content.json'; a.click();
    URL.revokeObjectURL(url);
  };

  if (!auth) return <AdminLogin onLogin={login} error={authError} />;

  return (
    <div className="adm-shell">
      <header className="adm-header">
        <div>
          <span className="eyebrow" style={{ color: 'var(--amber)' }}>AEA · Admin</span>
          <h2>Content editor</h2>
        </div>
        <div className="adm-header-actions">
          <a href="#/" className="btn btn-outline-teal" style={{ padding: '10px 16px', fontSize: 13 }}>View site</a>
          <button className="btn btn-outline-teal" style={{ padding: '10px 16px', fontSize: 13 }} onClick={logout}>Sign out</button>
        </div>
      </header>

      <div className="adm-toolbar">
        <button className="btn btn-outline-teal" onClick={previewLocal}>Preview locally</button>
        <button className="btn btn-outline-teal" onClick={exportJson}>Export JSON</button>
        <button className="btn btn-outline-teal" onClick={discardPreview}>Reset to live</button>
        <button className="btn btn-amber" onClick={publish} disabled={status.kind === 'saving'}>
          {status.kind === 'saving' ? 'Publishing…' : 'Publish to site'}
        </button>
        {status.kind === 'preview' && <span className="adm-status">Preview saved locally. Open the site in a new tab to see it.</span>}
        {status.kind === 'published' && <span className="adm-status adm-ok">Published. Vercel is rebuilding ({status.commit?.slice(0,7)}).</span>}
        {status.kind === 'error' && <span className="adm-status adm-err">{status.msg}</span>}
      </div>

      <div className="adm-tabs">
        {SECTIONS.map(s => (
          <button key={s.key} className={tab === s.key ? 'active' : ''} onClick={() => setTab(s.key)}>{s.label}</button>
        ))}
      </div>

      <div className="adm-body">
        {tab === 'site' && (
          <div className="adm-section">
            <Field label="Tagline (footer)" type="textarea" value={draft.site?.tagline} onChange={v => setSection('site', { ...draft.site, tagline: v })} />
            <Field label="ABN" value={draft.site?.abn} onChange={v => setSection('site', { ...draft.site, abn: v })} />
            <Field label="Authorisation line" value={draft.site?.authorisation} onChange={v => setSection('site', { ...draft.site, authorisation: v })} />
            <Field label="Copyright" value={draft.site?.copyright} onChange={v => setSection('site', { ...draft.site, copyright: v })} />
            <div className="adm-row">
              <Field label="Media email" value={draft.site?.mediaEmail} onChange={v => setSection('site', { ...draft.site, mediaEmail: v })} />
              <Field label="Media phone" value={draft.site?.mediaPhone} onChange={v => setSection('site', { ...draft.site, mediaPhone: v })} />
            </div>
            <p className="adm-help" style={{ marginTop: 8 }}>Social links (leave as <code>#</code> to hide-in-place until you have the URL).</p>
            {['linkedin','instagram','youtube','facebook','tiktok','x'].map(k => (
              <Field key={k} label={k} value={(draft.site?.social || {})[k]} onChange={v => setSection('site', { ...draft.site, social: { ...(draft.site?.social || {}), [k]: v } })} placeholder="https://…" />
            ))}
          </div>
        )}

        {tab === 'hero' && (
          <div className="adm-section">
            <Field label="Eyebrow" value={draft.hero?.eyebrow} onChange={v => setSection('hero', { ...draft.hero, eyebrow: v })} />
            <Field label="Headline (main)" value={draft.hero?.headlineMain} onChange={v => setSection('hero', { ...draft.hero, headlineMain: v })} />
            <Field label="Headline (accent — amber portion)" value={draft.hero?.headlineAccent} onChange={v => setSection('hero', { ...draft.hero, headlineAccent: v })} />
            <Field label="Sub headline" type="textarea" value={draft.hero?.sub} onChange={v => setSection('hero', { ...draft.hero, sub: v })} />
            <Field label="Petition signature count" type="number" value={draft.hero?.petitionCount} onChange={v => setSection('hero', { ...draft.hero, petitionCount: v })} hint="Animated count-up target" />
          </div>
        )}

        {tab === 'stats' && (
          <div className="adm-section">
            <p className="adm-help">Four stats shown in the homepage stats band. Format options: <code>1-in-X</code>, <code>$X</code>, <code>X%</code>, <code>Xk</code>.</p>
            <ListEditor
              items={draft.stats || []}
              blank={{ num: 0, format: 'X%', label: '' }}
              label="stat"
              onChange={v => setSection('stats', v)}
              render={(it, set) => (
                <div className="adm-row">
                  <Field label="Number" type="number" value={it.num} onChange={v => set({ ...it, num: v })} />
                  <Field label="Format" value={it.format} onChange={v => set({ ...it, format: v })} hint="1-in-X · $X · X% · Xk" />
                  <Field label="Label" value={it.label} onChange={v => set({ ...it, label: v })} />
                </div>
              )}
            />
          </div>
        )}

        {tab === 'pillars' && (
          <div className="adm-section">
            <p className="adm-help">The three pillars under <em>"What we're calling for"</em> on the homepage. The icon glyphs are styled in code; the editor controls the number, title and description.</p>
            <ListEditor
              items={draft.pillars || []}
              blank={{ num: '04', title: '', desc: '' }}
              label="pillar"
              onChange={v => setSection('pillars', v)}
              render={(it, set) => (
                <>
                  <div className="adm-row">
                    <Field label="Number" value={it.num} onChange={v => set({ ...it, num: v })} placeholder="01" />
                    <Field label="Title" value={it.title} onChange={v => set({ ...it, title: v })} />
                  </div>
                  <Field label="Description" type="textarea" value={it.desc} onChange={v => set({ ...it, desc: v })} />
                </>
              )}
            />
          </div>
        )}

        {tab === 'ticker' && (
          <div className="adm-section">
            <p className="adm-help">The scrolling "Kevin from NSW just signed" strip on the homepage. Add as many as you like — they loop automatically.</p>
            <ListEditor
              items={draft.ticker || []}
              blank={{ name: '', state: '' }}
              label="signer"
              onChange={v => setSection('ticker', v)}
              render={(it, set) => (
                <div className="adm-row">
                  <Field label="First name" value={it.name} onChange={v => set({ ...it, name: v })} />
                  <Field label="State" value={it.state} onChange={v => set({ ...it, state: v })} placeholder="NSW · VIC · QLD…" />
                </div>
              )}
            />
          </div>
        )}

        {tab === 'pages' && (
          <div className="adm-section">
            <p className="adm-help">Top-of-page copy and hero image for each subpage. Each page has an eyebrow, headline, lede paragraph and a photo.</p>
            {PAGE_KEYS.map(pk => {
              const p = (draft.pages && draft.pages[pk.key]) || {};
              const setPage = (next) => setSection('pages', { ...(draft.pages || {}), [pk.key]: next });
              return (
                <div className="adm-card" key={pk.key}>
                  <div className="adm-card-head"><strong>{pk.label}</strong></div>
                  <Field label="Eyebrow" value={p.eyebrow} onChange={v => setPage({ ...p, eyebrow: v })} />
                  {pk.key === 'about' ? (
                    <div className="adm-row">
                      <Field label="Headline (main)" value={p.h1Main} onChange={v => setPage({ ...p, h1Main: v })} />
                      <Field label="Headline (accent)" value={p.h1Accent} onChange={v => setPage({ ...p, h1Accent: v })} hint="The teal-coloured fragment" />
                    </div>
                  ) : pk.key === 'theProblem' ? (
                    <>
                      <Field label="Big number" value={p.bigNumber} onChange={v => setPage({ ...p, bigNumber: v })} placeholder="220%" />
                      <Field label="Headline" type="textarea" value={p.headline} onChange={v => setPage({ ...p, headline: v })} />
                      <Field label="Source footnote" value={p.sourceFootnote} onChange={v => setPage({ ...p, sourceFootnote: v })} />
                    </>
                  ) : (
                    <Field label="Headline (h1)" type="textarea" value={p.h1} onChange={v => setPage({ ...p, h1: v })} />
                  )}
                  {pk.key !== 'theProblem' && (
                    <Field label="Lede paragraph" type="textarea" value={p.lede} onChange={v => setPage({ ...p, lede: v })} />
                  )}
                  {pk.key !== 'theProblem' && (
                    <ImageField label="Hero image" value={p.heroImage} onChange={v => setPage({ ...p, heroImage: v })} auth={auth} hint="Landscape photo. Click Upload to add a new image." />
                  )}
                  {pk.key === 'takeAction' && (
                    <>
                      <Field label="Share message" type="textarea" value={p.shareText} onChange={v => setPage({ ...p, shareText: v })} hint="The pre-written social post the share buttons paste." />
                      <Field label="Share URL" value={p.shareUrl} onChange={v => setPage({ ...p, shareUrl: v })} placeholder="https://affordableenergy.org.au" />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === 'voices' && (
          <div className="adm-section">
            <ListEditor
              items={draft.voices || []}
              blank={{ name: '', loc: '', quote: '' }}
              label="voice"
              onChange={v => setSection('voices', v)}
              render={(it, set) => (
                <>
                  <div className="adm-row">
                    <Field label="Name" value={it.name} onChange={v => set({ ...it, name: v })} />
                    <Field label="Location" value={it.loc} onChange={v => set({ ...it, loc: v })} />
                  </div>
                  <Field label="Quote" type="textarea" value={it.quote} onChange={v => set({ ...it, quote: v })} />
                </>
              )}
            />
          </div>
        )}

        {tab === 'news' && (
          <div className="adm-section">
            <p className="adm-help">First three items appear on the homepage and Take Action news strip. All items appear on the /news page. Each article also gets its own page at <code>/#/news/&lt;slug&gt;</code> with a petition CTA.</p>
            <ListEditor
              items={draft.news || []}
              blank={{ slug: '', src: '', topic: 'Households', date: '', head: '', summary: '', body: '', url: '' }}
              label="article"
              onChange={v => setSection('news', v)}
              render={(it, set) => (
                <>
                  <div className="adm-row">
                    <Field label="Source" value={it.src} onChange={v => set({ ...it, src: v })} />
                    <Field label="Date" value={it.date} onChange={v => set({ ...it, date: v })} placeholder="12 April 2026" />
                    <Field label="Category" value={it.topic} onChange={v => set({ ...it, topic: v })} hint="Households · Industry · Policy" />
                  </div>
                  <Field label="Slug (URL)" value={it.slug} onChange={v => set({ ...it, slug: v })} placeholder="grid-stability-fears" hint="Used in the URL, e.g. /#/news/grid-stability-fears. Lowercase, hyphenated." />
                  <Field label="Headline" value={it.head} onChange={v => set({ ...it, head: v })} />
                  <Field label="Summary (used on cards & page lede)" type="textarea" value={it.summary} onChange={v => set({ ...it, summary: v })} />
                  <Field label="Body (full story page)" type="textarea" value={it.body} onChange={v => set({ ...it, body: v })} hint="Two newlines start a new paragraph." />
                  <Field label="Original article URL (external)" value={it.url} onChange={v => set({ ...it, url: v })} placeholder="https://…" hint="Shows a 'Read the original at {source}' button on the story page." />
                </>
              )}
            />
          </div>
        )}

        {tab === 'team' && (
          <div className="adm-section">
            <ListEditor
              items={draft.team || []}
              blank={{ name: '', role: '', bio: '', photo: '' }}
              label="team member"
              onChange={v => setSection('team', v)}
              render={(it, set) => (
                <>
                  <div className="adm-row">
                    <Field label="Name" value={it.name} onChange={v => set({ ...it, name: v })} />
                    <Field label="Role" value={it.role} onChange={v => set({ ...it, role: v })} />
                  </div>
                  <ImageField label="Photo" value={it.photo} onChange={v => set({ ...it, photo: v })} auth={auth} hint="Square headshot works best. Leave blank for a placeholder icon." />
                  <Field label="Bio" type="textarea" value={it.bio} onChange={v => set({ ...it, bio: v })} />
                </>
              )}
            />
          </div>
        )}

        {tab === 'milestones' && (
          <div className="adm-section">
            <ListEditor
              items={draft.milestones || []}
              blank={{ when: '', status: '', title: '', desc: '' }}
              label="milestone"
              onChange={v => setSection('milestones', v)}
              render={(it, set) => (
                <>
                  <div className="adm-row">
                    <Field label="When" value={it.when} onChange={v => set({ ...it, when: v })} placeholder="Q4 2025" />
                    <Field label="Status" value={it.status} onChange={v => set({ ...it, status: v })} placeholder="Planned · Live · Target" />
                    <Field label="Title" value={it.title} onChange={v => set({ ...it, title: v })} />
                  </div>
                  <Field label="Description" type="textarea" value={it.desc} onChange={v => set({ ...it, desc: v })} />
                </>
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { Admin });
