/* === Shared components === */

const Logo = ({ light = false }) => (
  <a href="#/" className={`logo ${light ? 'logo-light' : 'logo-dark'}`} aria-label="Affordable Energy Australia — home">
    <img src="assets/logo.png" alt="Affordable Energy Australia" className="logo-img" />
  </a>
);

const NAV = [
  { href: '#/', label: 'Home' },
  { href: '#/petition', label: 'Sign the Petition' },
  { href: '#/the-problem', label: 'The Problem' },
  { href: '#/take-action', label: 'Take Action' },
  { href: '#/news', label: 'In the News' },
  { href: '#/about-us', label: 'About' },
];

const Header = ({ route }) => {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  React.useEffect(() => { setOpen(false); }, [route]);
  const isActive = (href) => route === href.replace('#','') || (route === '/' && href === '#/');
  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container-wide site-header-inner">
        <Logo light />
        <nav className="site-nav">
          {NAV.map(n => (
            <a key={n.href} href={n.href} className={isActive(n.href) ? 'active' : ''}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="header-ctas">
          <a href="#/petition" className="btn btn-teal"><span className="full-label">Sign the Petition</span><span className="short-label">Sign</span></a>
          <a href="#/donate" className="btn btn-amber">Donate</a>
          <button className={`menu-toggle ${open ? 'open' : ''}`} onClick={() => setOpen(!open)} aria-label="Menu"><span /></button>
        </div>
      </div>
      <div className={`mobile-drawer ${open ? 'open' : ''}`}>
        {NAV.map(n => (
          <a key={n.href} href={n.href} className={isActive(n.href) ? 'active' : ''}>{n.label}</a>
        ))}
        <div className="mobile-drawer-ctas">
          <a href="#/petition" className="btn btn-amber">Sign the Petition →</a>
          <a href="#/donate" className="btn btn-outline-white">Donate</a>
        </div>
      </div>
    </header>
  );
};

const Footer = () => {
  const content = useContent();
  const site = content?.site || {};
  return (
  <footer className="site-footer" data-screen-label="Footer">
    <div className="container-wide">
      <div className="footer-grid">
        <div>
          <Logo light />
          <p style={{ marginTop: 20, opacity: 0.75, fontSize: 15, lineHeight: 1.6, maxWidth: '40ch' }}>
            {site.tagline || 'A people-powered, single-issue campaign building a public mandate for affordable and reliable energy for every Australian household.'}
          </p>
          <div className="social-row">
            {[
              ['linkedin', 'LinkedIn', 'M4.98 3.5a2 2 0 11-.02 4 2 2 0 01.02-4zM3 8.5h4V21H3zM10 8.5h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.75V21h-4v-5.3c0-1.27-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.8V21h-4z'],
              ['instagram', 'Instagram', 'M8 3h8a5 5 0 015 5v8a5 5 0 01-5 5H8a5 5 0 01-5-5V8a5 5 0 015-5zm0 2a3 3 0 00-3 3v8a3 3 0 003 3h8a3 3 0 003-3V8a3 3 0 00-3-3zm4 3.5a3.5 3.5 0 110 7 3.5 3.5 0 010-7zm0 2a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM17 6a1 1 0 110 2 1 1 0 010-2z'],
              ['youtube', 'YouTube', 'M22 8.3a3 3 0 00-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.6A3 3 0 002 8.3 31 31 0 002 12a31 31 0 00.1 3.7 3 3 0 002.1 2.1c1.9.6 7.8.6 7.8.6s6 0 7.9-.6a3 3 0 002.1-2.1A31 31 0 0022 12a31 31 0 00-.1-3.7zM10 15V9l5.2 3z'],
              ['facebook', 'Facebook', 'M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.8-.1-1.6-.15-2.4-.15-2.4 0-4.05 1.47-4.05 4.16V9.9H7.5V13h2.75v8z'],
              ['tiktok', 'TikTok', 'M16 3c.3 2.1 1.5 3.6 3.5 3.9v2.9c-1.3.1-2.5-.2-3.6-.9v5.6c0 3.1-2.3 5.5-5.3 5.5S5.3 17.6 5.3 14.6c0-2.8 2-5.1 4.8-5.4v3c-1.1.3-1.9 1.2-1.9 2.4 0 1.4 1.1 2.5 2.5 2.5s2.4-1.1 2.4-2.6V3z'],
              ['x', 'X', 'M17.5 3h3l-6.6 7.5L21.8 21h-6.1l-4.3-5.6L6.4 21H3.4l7-8L2.6 3h6.2l3.9 5.2zm-1.1 16h1.7L7.4 4.8H5.6z'],
            ].map(([key, label, d]) => (
              <a key={key} href={(site.social && site.social[key]) || '#'} aria-label={label} target="_blank" rel="noopener noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d={d} /></svg>
              </a>
            ))}
          </div>
        </div>
        <div>
          <h5>Campaign</h5>
          <ul>
            <li><a href="#/petition">Sign the Petition</a></li>
            <li><a href="#/take-action">Take Action</a></li>
            <li><a href="#/donate">Donate</a></li>
            <li><a href="#/the-problem">The Problem</a></li>
          </ul>
        </div>
        <div>
          <h5>About</h5>
          <ul>
            <li><a href="#/about-us">Our Mission</a></li>
            <li><a href="#/news">In the News</a></li>
            <li><a href="#/about-us">Contact</a></li>
            <li><a href="#/about-us">Governance</a></li>
          </ul>
        </div>
        <div>
          <h5>Legal</h5>
          <ul>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Use</a></li>
            <li><a href="#">Authorisation</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>{site.copyright || '© 2026 Affordable Energy Australia'} · ABN {site.abn || '82 201 923 025'}</span>
        <span>{site.authorisation || 'Authorised by Z. Hilton, Coalition for Conservation, Sydney NSW'}</span>
      </div>
    </div>
  </footer>
  );
};

const useCountUp = (end, duration = 1800, start = false) => {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (!start) return;
    let raf, t0;
    const tick = (t) => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(eased * end));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, start]);
  return val;
};

const useInView = (threshold = 0.2) => {
  const ref = React.useRef(null);
  const [seen, setSeen] = React.useState(false);
  React.useEffect(() => {
    if (!ref.current || seen) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [seen, threshold]);
  return [ref, seen];
};

const formatStat = (n, format) => {
  switch (format) {
    case '1-in-X': return <><span>1</span><small> in </small>{n}</>;
    case '$X': return <>${(+n).toLocaleString()}</>;
    case 'X%': return <>{n}<small>%</small></>;
    case 'Xk': return <>{n}<small>k</small></>;
    default: return <>{(+n).toLocaleString()}</>;
  }
};

const StatBand = () => {
  const content = useContent();
  const stats = (content && content.stats) || [];
  const [ref, seen] = useInView(0.3);
  const counts = [
    useCountUp(+(stats[0]?.num || 0), 1400, seen),
    useCountUp(+(stats[1]?.num || 0), 1800, seen),
    useCountUp(+(stats[2]?.num || 0), 1400, seen),
    useCountUp(+(stats[3]?.num || 0), 1800, seen),
  ];
  return (
    <section className="stats-band" ref={ref}>
      <div className="container-wide stats-grid">
        {stats.slice(0, 4).map((s, i) => (
          <div className="stat" key={i}>
            <span className="num">{formatStat(counts[i], s.format)}</span>
            <span className="label">{s.label}</span>
            {s.source && (
              <span className="source">Source: {s.source}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

const PetitionCounter = ({ baseClass = "hero-counter" }) => {
  const content = useContent();
  const target = +(content?.hero?.petitionCount || 47832);
  const [ref, seen] = useInView(0.5);
  const n = useCountUp(target, 2200, seen);
  return (
    <div className={baseClass} ref={ref}>
      <span className="num">{n.toLocaleString()}</span>
      <span className="label">Australians have signed</span>
    </div>
  );
};

const SocialTicker = () => {
  const items = [
    { name: 'Jane', state: 'NSW' }, { name: 'Michael', state: 'QLD' },
    { name: 'Sarah', state: 'VIC' }, { name: 'David', state: 'WA' },
    { name: 'Emma', state: 'SA' }, { name: 'Tom', state: 'TAS' },
    { name: 'Priya', state: 'NSW' }, { name: 'Liam', state: 'VIC' },
    { name: 'Hannah', state: 'NSW' }, { name: 'Marcus', state: 'QLD' },
  ];
  const all = [...items, ...items, ...items];
  return (
    <div className="social-ticker">
      <div className="ticker-inner">
        {all.map((it, i) => (
          <span className="ticker-item" key={i}>
            <span className="dot" />
            <strong>{it.name}</strong> from {it.state} just signed
          </span>
        ))}
      </div>
    </div>
  );
};

const StickyMobileBar = () => {
  const content = useContent();
  const target = +(content?.hero?.petitionCount || 47832);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600 && window.innerWidth < 1024);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);
  return (
    <div className={`sticky-bar ${visible ? 'visible' : ''}`}>
      <div>
        <div className="num">{target.toLocaleString()}</div>
        <div className="lbl">have signed</div>
      </div>
      <a href="#/petition" className="btn btn-teal">Sign the Petition</a>
    </div>
  );
};

/* Hero placeholder illustrations */
const HERO_ICONS = {
  petition: (
    <svg viewBox="0 0 200 160" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="40" y="20" width="100" height="130" rx="4" fill="rgba(255,255,255,.04)" />
      <path d="M55 50h70M55 70h70M55 90h50M55 110h60" />
      <path d="M150 95l16 16 30-32" stroke="#F5A623" strokeWidth="5" />
    </svg>
  ),
  megaphone: (
    <svg viewBox="0 0 200 160" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M30 70v20a10 10 0 0010 10h10v-40H40a10 10 0 00-10 10z" fill="rgba(255,255,255,.04)" />
      <path d="M50 60l90-30v100l-90-30z" fill="rgba(245,166,35,.18)" />
      <path d="M70 100c0 10 5 20 15 20s10-15 5-25" />
      <path d="M155 60l20-8M160 80h25M155 100l20 8" stroke="#F5A623" strokeWidth="4" />
    </svg>
  ),
  newspaper: (
    <svg viewBox="0 0 200 160" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="30" y="30" width="140" height="100" rx="3" fill="rgba(255,255,255,.04)" />
      <rect x="44" y="44" width="56" height="36" fill="rgba(245,166,35,.25)" />
      <path d="M110 44h50M110 56h50M110 68h36M44 92h120M44 104h120M44 116h80" />
    </svg>
  ),
  community: (
    <svg viewBox="0 0 200 160" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="60" cy="60" r="18" fill="rgba(245,166,35,.2)" />
      <circle cx="100" cy="50" r="20" fill="rgba(255,255,255,.06)" />
      <circle cx="140" cy="60" r="18" fill="rgba(245,166,35,.2)" />
      <path d="M30 130c0-18 14-30 30-30s30 12 30 30M70 130c0-22 14-36 30-36s30 14 30 36M110 130c0-18 14-30 30-30s30 12 30 30" />
    </svg>
  ),
  donate: (
    <svg viewBox="0 0 200 160" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M100 130l-32-30c-12-12-12-30 0-40 10-10 26-8 32 4 6-12 22-14 32-4 12 10 12 28 0 40z" fill="rgba(245,166,35,.22)" stroke="#F5A623" />
      <path d="M70 60h-26M156 60h-26M58 40l-16-12M142 40l16-12" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="50" cy="50" r="42" fill="rgba(61,189,168,.12)" />
      <path d="M30 52l14 14 28-32" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
      <path d="M50 86 L20 56c-8-8-8-22 0-30 8-8 21-6 24 4 3-10 16-12 24-4 8 8 8 22 0 30z" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="32" cy="22" r="10" />
      <path d="M14 54c0-10 8-16 18-16s18 6 18 16" />
    </svg>
  ),
};

const HeroPlaceholder = ({ icon = 'petition', tag = 'Image' }) => (
  <div className="hero-placeholder" role="img" aria-label={`${tag} placeholder`}>
    <span className="ph-tag">{tag}</span>
    {HERO_ICONS[icon]}
  </div>
);

Object.assign(window, { Logo, Header, Footer, StatBand, PetitionCounter, SocialTicker, StickyMobileBar, useCountUp, useInView, NAV, HeroPlaceholder, HERO_ICONS });
