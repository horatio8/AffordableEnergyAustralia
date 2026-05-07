/* === Shared components === */

const LogoMark = () => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M32 6 L60 58 L40 58 L32 42 L24 58 L4 58 Z M32 22 L38 36 L26 36 Z" />
  </svg>
);

const Logo = ({ light = false }) => (
  <a href="#/" className={`logo ${light ? 'logo-light' : 'logo-dark'}`}>
    <span className="logo-mark"><LogoMark /></span>
    <span className="logo-text">
      Affordable
      <small>Energy</small>
      <small>Australia</small>
    </span>
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
          <a href="#/petition" className="btn btn-teal">Sign <span className="full-label">the Petition</span></a>
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

const Footer = () => (
  <footer className="site-footer" data-screen-label="Footer">
    <div className="container-wide">
      <div className="footer-grid">
        <div>
          <Logo light />
          <p style={{ marginTop: 20, opacity: 0.75, fontSize: 15, lineHeight: 1.6, maxWidth: '40ch' }}>
            A people-powered, single-issue campaign building a public mandate for affordable and reliable energy for every Australian household.
          </p>
          <div className="social-row">
            {['X','f','in','ig'].map(s => (
              <a key={s} href="#" aria-label={s}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="3"/></svg>
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
        <span>© 2026 Affordable Energy Australia · ABN 93 676 364 855</span>
        <span>Authorised by D. Mitchell, Affordable Energy Australia, Sydney NSW</span>
      </div>
    </div>
  </footer>
);

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

const StatBand = () => {
  const [ref, seen] = useInView(0.3);
  const s1 = useCountUp(20, 1400, seen);
  const s2 = useCountUp(1367, 1800, seen);
  const s3 = useCountUp(19, 1400, seen);
  const s4 = useCountUp(340, 1800, seen);
  return (
    <section className="stats-band" ref={ref}>
      <div className="container-wide stats-grid">
        <div className="stat">
          <span className="num">1<small> in </small>{s1}</span>
          <span className="label">Australian households in energy hardship today</span>
        </div>
        <div className="stat">
          <span className="num">${s2.toLocaleString()}</span>
          <span className="label">Average household energy debt across the country</span>
        </div>
        <div className="stat">
          <span className="num">{s3}<small>%</small></span>
          <span className="label">Electricity price rise in just three years</span>
        </div>
        <div className="stat">
          <span className="num">{s4}<small>k</small></span>
          <span className="label">Households now in long-term energy debt</span>
        </div>
      </div>
    </section>
  );
};

const PetitionCounter = ({ baseClass = "hero-counter" }) => {
  const [ref, seen] = useInView(0.5);
  const n = useCountUp(47832, 2200, seen);
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
        <div className="num">47,832</div>
        <div className="lbl">have signed</div>
      </div>
      <a href="#/petition" className="btn btn-teal">Sign the Petition</a>
    </div>
  );
};

Object.assign(window, { Logo, LogoMark, Header, Footer, StatBand, PetitionCounter, SocialTicker, StickyMobileBar, useCountUp, useInView, NAV });
