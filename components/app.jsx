/* === App: router + tweaks + content === */

// Strip query/fragment markers from the hash route so /#/petition?form matches
// the same case as /#/petition. Components that want to react to the marker
// (e.g. Petition's auto-scroll to form) read window.location.hash directly.
const cleanRoute = () => {
  const raw = window.location.hash.replace('#', '') || '/';
  return raw.split('?')[0] || '/';
};
const useRoute = () => {
  const [route, setRoute] = React.useState(cleanRoute());
  React.useEffect(() => {
    const onHash = () => {
      setRoute(cleanRoute());
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
};

const ContentContext = React.createContext(null);
const useContent = () => React.useContext(ContentContext) || {};

const useContentLoader = () => {
  const [content, setContent] = React.useState(null);
  React.useEffect(() => {
    let cancelled = false;
    fetch('/content.json', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : {})
      .then(remote => {
        if (cancelled) return;
        let next = remote;
        try {
          const local = localStorage.getItem('aea_content_draft');
          if (local) next = JSON.parse(local);
        } catch (_) {}
        setContent(next);
      })
      .catch(() => setContent({}));
    return () => { cancelled = true; };
  }, []);
  return [content, setContent];
};

window.useContent = useContent;

// ─── Attribution capture: every page mount, persist URL + cookie params to sessionStorage,
//     and fire the Share Click beacon when ?ref= is present (once per ref per session).
const ATTRIBUTION_KEYS = [
  'utm_source','utm_medium','utm_campaign','utm_content','utm_term',
  'fbclid','gclid','ttclid','li_fat_id','msclkid','twclid','sccid',
  'ad_id','adset_id','campaign_id','placement','ref',
];
function readCookie(name) {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
  return m ? decodeURIComponent(m[2]) : null;
}
function useAttributionCapture() {
  React.useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);
      // Hash params also matter for SPAs that put query after the #/route
      const hashIdx = window.location.hash.indexOf('?');
      const hashParams = hashIdx >= 0 ? new URLSearchParams(window.location.hash.slice(hashIdx + 1)) : null;

      const current = {};
      try { Object.assign(current, JSON.parse(sessionStorage.getItem('aea_attribution') || '{}')); } catch (_) {}

      for (const k of ATTRIBUTION_KEYS) {
        const v = params.get(k) || (hashParams && hashParams.get(k)) || null;
        if (v && !current[k]) current[k] = v;
      }
      const fbp = readCookie('_fbp');
      if (fbp && !current._fbp) current._fbp = fbp;
      if (!current.landing_url) current.landing_url = window.location.href;
      if (!current.landing_referrer) current.landing_referrer = document.referrer || null;
      if (!current.landing_at) current.landing_at = new Date().toISOString();
      sessionStorage.setItem('aea_attribution', JSON.stringify(current));

      // Share Click beacon — once per ref per session.
      if (current.ref) {
        const flagKey = `aea_ref_click_fired_${current.ref}`;
        if (!sessionStorage.getItem(flagKey)) {
          sessionStorage.setItem(flagKey, '1');
          fetch('/api/share-click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ref: current.ref,
              source_url: window.location.href,
              fbclid: current.fbclid || null,
            }),
            keepalive: true,
          }).catch(() => {});
        }
      }
    } catch (_) { /* never break the page on attribution issues */ }
  }, []);
}
window.useAttributionCapture = useAttributionCapture;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primary": "#3DBDA8",
  "primaryDeep": "#1A6B5E",
  "accent": "#F5A623",
  "alert": "#D94040",
  "headlineMode": "hardship"
}/*EDITMODE-END*/;

const HEADLINES = {
  hardship: { main: "1 in 5 Australians can't afford", accent: "the power bill." },
  experiment: { main: "Australians are paying for an", accent: "energy experiment." },
  jobs: { main: "Power bills shouldn't cost you your", accent: "job, your home, your future." },
};

const App = () => {
  const route = useRoute();
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [content, setContent] = useContentLoader();
  useAttributionCapture();

  React.useEffect(() => {
    document.documentElement.style.setProperty('--teal', tweaks.primary);
    document.documentElement.style.setProperty('--teal-deep', tweaks.primaryDeep);
    document.documentElement.style.setProperty('--amber', tweaks.accent);
    document.documentElement.style.setProperty('--red', tweaks.alert);
  }, [tweaks]);

  React.useEffect(() => {
    const h = document.querySelector('.hero h1');
    if (!h) return;
    const choice = HEADLINES[tweaks.headlineMode] || HEADLINES.hardship;
    const main = (content && content.hero && content.hero.headlineMain) || choice.main;
    const accent = (content && content.hero && content.hero.headlineAccent) || choice.accent;
    h.innerHTML = `${main} <span class="accent">${accent}</span>`;
  }, [tweaks.headlineMode, route, content]);

  if (!content) return null;

  if (route === '/admin') {
    return (
      <ContentContext.Provider value={content}>
        <Admin content={content} setContent={setContent} />
      </ContentContext.Provider>
    );
  }

  let page;
  if (route.startsWith('/news/')) {
    const slug = decodeURIComponent(route.slice('/news/'.length));
    page = <NewsStory slug={slug} />;
  } else {
    switch (route) {
      case '/petition': page = <Petition />; break;
      case '/the-problem': page = <TheProblem />; break;
      case '/take-action': page = <TakeAction />; break;
      case '/news': page = <News />; break;
      case '/about-us': page = <About />; break;
      case '/privacy': page = <PrivacyPolicy />; break;
      case '/donate': page = <Donate />; break;
      case '/thank-you-petition': page = <ThankYouPetition />; break;
      case '/thank-you-donation': page = <ThankYouDonation />; break;
      case '/share': page = <SharePage />; break;
      default: page = <Home />;
    }
  }

  return (
    <ContentContext.Provider value={content}>
      <Header route={route} />
      {page}
      <Footer />
      <StickyMobileBar />
      <TweaksPanel title="Campaign Tweaks">
        <TweakSection title="Brand Colours">
          <TweakColor label="Primary teal" value={tweaks.primary} onChange={v => setTweak('primary', v)} options={['#3DBDA8','#2E86AB','#0F6E5F','#175C7C']} />
          <TweakColor label="Deep section bg" value={tweaks.primaryDeep} onChange={v => setTweak('primaryDeep', v)} options={['#1A6B5E','#0D1F1C','#1B3A52','#262626']} />
          <TweakColor label="Donate accent" value={tweaks.accent} onChange={v => setTweak('accent', v)} options={['#F5A623','#E85D2C','#C9A227','#F2C94C']} />
          <TweakColor label="Alert red" value={tweaks.alert} onChange={v => setTweak('alert', v)} options={['#D94040','#B22222','#E25822','#A22C29']} />
        </TweakSection>
        <TweakSection title="Hero Headline">
          <TweakRadio label="Message" value={tweaks.headlineMode} onChange={v => setTweak('headlineMode', v)} options={[
            {value: 'hardship', label: 'Hardship'},
            {value: 'experiment', label: 'Experiment'},
            {value: 'jobs', label: 'Jobs'},
          ]} />
        </TweakSection>
      </TweaksPanel>
    </ContentContext.Provider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
