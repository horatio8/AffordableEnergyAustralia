/* === Homepage === */

const PILLARS = [
  { num: '01', title: 'Affordable Bills', desc: 'Every household should pay a price they can actually afford. Energy is essential infrastructure — not a luxury, and not a market experiment.', icon: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 26V10l12-6 12 6v16M9 26V14M23 26V14M14 26v-8h4v8"/></svg>
  )},
  { num: '02', title: 'Reliable Power', desc: 'Lights on. Factories running. Hospitals operating. A grid Australians can depend on, every hour of every day, in every season.', icon: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 4 L8 18 H16 L14 28 L24 14 H16 Z"/></svg>
  )},
  { num: '03', title: 'Common Sense Policy', desc: 'Decisions made on engineering and economics, not ideology. A grid planned for outcomes: affordability, reliability, jobs.', icon: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="16" cy="16" r="12"/><path d="M16 8v8l5 3"/></svg>
  )},
];

const BillCalculator = () => {
  const [state, setState] = React.useState('NSW');
  const [bill, setBill] = React.useState(2400);
  const [people, setPeople] = React.useState(2);
  const benchmarks = { NSW: 1640, VIC: 1520, QLD: 1480, SA: 1780, WA: 1560, TAS: 1620, ACT: 1590, NT: 1700 };
  // Reference customer in the AER DMO is a ~2-person household. Scale the
  // benchmark by household size using mid-range factors from the AER
  // residential reference consumption matrix.
  const sizeFactor = { 1: 0.75, 2: 1.0, 3: 1.3, 4: 1.6, 5: 1.9 };
  const adjBenchmark = Math.round(benchmarks[state] * (sizeFactor[people] || 1));
  const overpay = Math.max(0, bill - adjBenchmark);
  return (
    <section className="calc-wrap" data-screen-label="Bill Calculator">
      <div className="container-wide calc-grid">
        <div>
          <span className="eyebrow" style={{ color: 'var(--amber)' }}>The Bill Calculator</span>
          <h2 style={{ marginTop: 14 }}>How much are <span className="accent">you overpaying</span> for power?</h2>
          <p className="lede">Enter your state, household size, and your annual electricity bill. We'll show you what you're paying above pre-transition benchmarks — and email you a personalised result you can share.</p>
          <p style={{ fontSize: 14, opacity: 0.6, fontStyle: 'italic' }}>Benchmarks reference 2015 inflation-adjusted average residential bills, scaled to household size using AER reference-consumption factors.</p>
        </div>
        <div className="calc-card">
          <div className="field-row">
            <div>
              <label>Your state</label>
              <select value={state} onChange={e => setState(e.target.value)}>
                {Object.keys(benchmarks).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label>People in household</label>
              <select value={people} onChange={e => setPeople(+e.target.value)}>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5+</option>
              </select>
            </div>
          </div>

          <label>Annual electricity bill</label>
          <input type="range" min="800" max="6000" step="50" value={bill} onChange={e => setBill(+e.target.value)} className="calc-slider" />
          <div className="slider-value">
            <span>$800</span>
            <strong>${bill.toLocaleString()}</strong>
            <span>$6,000</span>
          </div>

          <div className="calc-result">
            <span className="out-label">Estimated annual overpayment</span>
            <span className="out">${overpay.toLocaleString()}</span>
            <p className="note">Above the {state} pre-2015 benchmark of ${adjBenchmark.toLocaleString()}/year for a {people === 5 ? '5+' : people}-person household.</p>
          </div>

        </div>
      </div>
    </section>
  );
};

const HomeNews = () => {
  const content = useContent();
  const items = (content?.news || []).slice(0, 3);
  return (
    <section className="section-pad section-paper">
      <div className="container-wide">
        <div className="section-head">
          <span className="eyebrow">In the News</span>
          <h2>The crisis is making headlines.</h2>
          <p className="lede">Coverage of Australia's energy affordability crisis from the country's leading mastheads.</p>
        </div>
        <div className="news-grid">
          {items.map((it, i) => (
            <a href={`#/news/${it.slug || i}`} key={i} className="news-card">
              <div className="news-source">{it.src}</div>
              <div className="news-date">{it.date}</div>
              <h4>{it.head}</h4>
              <span className="more">Read more →</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

const HomeDonate = () => {
  const go = (v) => {
    const opt = (window.DONATION_OPTIONS || []).find(o => o.amount === v);
    if (!opt) return;
    const url = typeof window.taggedDonate === 'function' ? window.taggedDonate(opt.oneTimeUrl) : opt.oneTimeUrl;
    window.location.href = url;
  };
  return (
    <section className="donate-strip" data-screen-label="Home / Donate">
      <div className="donate-strip-bg">
        <img src="assets/empty-factory.png" alt="" />
      </div>
      <div className="container-wide">
        <div className="donate-strip-inner">
          <span className="eyebrow" style={{ color: 'var(--amber)' }}>Power the Campaign</span>
          <h2 style={{ marginTop: 14 }}>This fight is funded <span className="accent">by Australians</span> — not corporations.</h2>
          <p>Every dollar reaches more Australians, contacts more MPs, and builds the public mandate to put affordability first. Click an amount to donate via Stripe.</p>
          <div className="donate-amounts">
            {[35, 65, 135, 265].map(v => (
              <button key={v} className="amount-btn" type="button" onClick={() => go(v)}>${v}</button>
            ))}
            <a className="amount-btn" href="#/donate">Other</a>
          </div>
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  const content = useContent();
  const hero = content?.hero || {};
  return (
  <main data-screen-label="Home">
    {/* Hero */}
    <section className="hero">
      <div className="hero-bg">
        <img src="assets/hero-image.jpg" alt="A worried couple read a power bill at their kitchen table." />
        <div className="hero-overlay" />
      </div>
      <div className="container-wide hero-content">
        {hero.eyebrow && <span className="hero-eyebrow"><span className="pulse" />{hero.eyebrow}</span>}
        <h1>{hero.headlineMain || "1 in 5 Australians can't afford"} <span className="accent">{hero.headlineAccent || 'the power bill.'}</span></h1>
        <p className="hero-sub">{hero.sub || "Sign the petition. Tell Australia's leaders to put families first — before ideology, before politics, before experiments."}</p>
        <div className="hero-ctas">
          <a href="#/petition" className="btn btn-teal">Sign the Petition →</a>
          <a href="#/donate" className="btn btn-outline-amber">Chip in</a>
        </div>
        <PetitionCounter />
      </div>
    </section>

    <SocialTicker />
    <StatBand />

    {/* The Problem two-col */}
    <section className="section-pad section-paper">
      <div className="container-wide two-col">
        <div className="problem-prose">
          <span className="eyebrow" style={{ color: 'var(--teal-dark)', marginBottom: 16, display: 'block' }}>The Problem</span>
          <p className="lead">Australia is at a breaking point.</p>
          <p>Right now, <strong>1 in 5 Australian households are struggling to pay their power bills.</strong> Families are being forced to choose between keeping the lights on and putting food on the table.</p>
          <p>Electricity prices keep rising. Small businesses are under pressure. Manufacturers are shutting their doors. And everyday Australians are left carrying the cost.</p>
          <p>Energy policy should protect households, secure jobs, and keep our country strong — not push families into hardship or gamble with grid reliability.</p>
          <p style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, textTransform: 'uppercase', fontSize: 26, color: 'var(--ink)', lineHeight: 1.05, marginTop: 28 }}>This isn't sustainable. And it isn't fair.</p>
          <a href="#/the-problem" className="btn btn-outline-teal" style={{ marginTop: 32 }}>Read the full story →</a>
        </div>
        <div className="problem-img">
          <img src="assets/family-candlelight.jpg" alt="Three children play by lantern light after their power was disconnected." />
          <figcaption className="problem-img-caption">
            <strong>7,669 Victorian families</strong> were disconnected from power in 2023–24 because the money simply wasn't there.
            <span className="problem-img-source">Source: Essential Services Commission</span>
          </figcaption>
        </div>
      </div>
    </section>

    {/* Pillars */}
    <section className="section-pad section-teal-light">
      <div className="container-wide">
        <div className="section-head">
          <span className="eyebrow">What we're calling for</span>
          <h2>One simple principle. Three urgent demands.</h2>
        </div>
        <div className="pillars">
          {(content?.pillars?.length ? content.pillars : PILLARS).map((p, i) => (
            <div className="pillar" key={p.num || i}>
              <span className="pillar-num">{p.num || PILLARS[i]?.num} ·</span>
              <div className="pillar-icon">{PILLARS[i]?.icon || PILLARS[0].icon}</div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <BillCalculator />

    {/* Petition CTA band */}
    <section className="cta-band" data-screen-label="Petition CTA">
      <div className="container cta-band-inner">
        <span className="eyebrow" style={{ color: 'var(--white)', opacity: 0.9 }}>Our Petition</span>
        <p className="declaration" style={{ marginTop: 20 }}>We call on Australia's leaders to prioritise affordable & reliable energy.</p>
        <PetitionCounter baseClass="hero-counter" />
        <div style={{ marginTop: 36 }}>
          <a href="#/petition" className="btn btn-amber" style={{ padding: '20px 36px', fontSize: 19 }}>Add your name →</a>
        </div>
      </div>
    </section>

    <HomeNews />
    <HomeDonate />
  </main>
  );
};

Object.assign(window, { Home });
