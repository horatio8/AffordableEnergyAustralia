/* === The Problem, Take Action, News, About === */

const TheProblem = () => {
  const [tab, setTab] = React.useState('households');
  const tabs = {
    households: { title: 'Households', body: 'One in five Australian households are now in energy hardship or on the brink. Average energy debt has climbed to $1,367, with 20% of families skipping meals or going days without eating due to financial strain. Renters, parents and pensioners are bearing the heaviest load.', stat: '1 in 5', statLabel: 'households in hardship or on the brink', source: 'Energy Consumers Australia', sourceUrl: 'https://energyconsumersaustralia.com.au/our-work/surveys/consumer-energy-report-card-understanding-measuring-energy-hardship-australia' },
    business: { title: 'Small Business', body: 'Rising energy costs are now the #1 factor impacting the finances of small businesses. Cafés, butchers, panel beaters, dry cleaners — small businesses across the country are being forced to choose between passing on price increases to customers or not being able to pay the bills. In 2024, 1 in 5 small businesses were unable to pay their energy bills on time or in full.', stat: '1 in 5', statLabel: 'small businesses reporting difficulty paying energy bills', source: 'Council of Small Business Organisations Australia', sourceUrl: 'https://cosboa.org.au/wp-content/uploads/2025/07/Small-Business-Perspectives-Report-2024.pdf' },
    industry: { title: 'Heavy Industry', body: 'Smelters, refineries, fertiliser plants and food processors operate on margins that cannot survive high energy prices. When industry leaves Australia, it does not come back easily. We have already lost manufacturing capacity that took decades to build, with 39,400 manufacturing jobs lost in the last two years alone.', stat: '39,400', statLabel: 'manufacturing jobs lost from Feb 2024 to Feb 2026', source: 'Jobs and Skills Australia', sourceUrl: 'https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/industries/manufacturing' },
    pensioners: { title: 'Pensioners', body: 'Australians on fixed incomes cannot continue absorbing energy bill increases. 41% of older Australians are rationing heating in winter and cooling in summer, with many more forced to make daily sacrifices to make ends meet.', stat: '41%', statLabel: 'Australian seniors rationing heating and cooling', source: 'Australian Seniors', sourceUrl: 'https://www.seniors.com.au/documents/media-release-cost-of-living-longer-report-2024.pdf' },
  };
  const t = tabs[tab];
  return (
    <main data-screen-label="The Problem">
      <section className="problem-hero">
        <div className="container problem-hero-inner">
          <span className="eyebrow" style={{ color: 'var(--amber)' }}>The Problem</span>
          <span className="big-num">220%</span>
          <h1>Electricity prices for households have risen 220 per cent since 2008.</h1>
          <p style={{ marginTop: 18, fontSize: 14, fontStyle: 'italic', opacity: 0.7 }}>Source: Australian Bureau of Statistics.</p>
        </div>
      </section>

      {/* Crisis in numbers */}
      <section className="section-pad section-paper">
        <div className="container-wide">
          <div className="section-head">
            <span className="eyebrow">The crisis in numbers</span>
            <h2>Eight figures every Australian should know.</h2>
            <p className="lede">Key statistics from regulators, peak bodies and charities.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              { n: '1 in 5', l: 'Households in hardship or on the brink', s: 'Energy Consumers Australia', u: 'https://energyconsumersaustralia.com.au/our-work/surveys/consumer-energy-report-card-understanding-measuring-energy-hardship-australia' },
              { n: '$1,367', l: 'Average household energy debt', s: 'Australian Energy Regulator', u: 'https://www.aer.gov.au/news/articles/news-releases/debt-and-hardship-persist-vulnerable-customers' },
              { n: '340k', l: 'Households in long-term debt', s: 'Australian Energy Regulator', u: 'https://au.finance.yahoo.com/news/centrelink-recipient-reveals-6000-battle-as-more-aussies-struggle-with-growing-energy-debt-042242942.html' },
              { n: '220%', l: 'Electricity price rise for households since 2008', s: 'Australian Bureau of Statistics', u: 'https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/consumer-price-index-australia/latest-release' },
              { n: '24%', l: 'Projected further price rise Nov 2025 to July 2026', s: 'Australian Bureau of Statistics, Westpac', u: 'https://www.afr.com/policy/economy/electricity-bills-could-jump-24pc-this-year-20260123-p5nwfn' },
              { n: '200+', l: 'NSW spot price spikes >$10k/MWh in 2024', s: 'Australian Energy Market Operator' },
              { n: '20%', l: 'Households skipping meals due to financial strain', s: 'Foodbank Hunger Report', u: 'https://reports.foodbank.org.au/foodbank-hunger-report-2025/' },
              { n: '84%', l: 'Households seriously concerned about power costs', s: 'Choice National Survey', u: 'https://www.choice.com.au/shopping/shopping-for-services/utilities/articles/energy-disconnections-and-hardship-obligations' },
            ].map(({ n, l, s }, i) => (
              <div key={i} style={{ padding: 28, background: 'var(--white)', borderTop: '4px solid var(--red)' }}>
                <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: 56, color: 'var(--red)', lineHeight: 0.95 }}>{n}</div>
                <div style={{ fontSize: 14, color: 'var(--grey)', marginTop: 8 }}>{l}</div>
                <div style={{ fontSize: 12, color: 'var(--grey-soft)', marginTop: 10, fontStyle: 'italic', lineHeight: 1.4 }}>Source: {s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Affected tabs */}
      <section className="section-pad section-teal-light">
        <div className="container-wide">
          <div className="section-head">
            <span className="eyebrow">Who's affected</span>
            <h2>This is not abstract. It is happening in every postcode.</h2>
          </div>
          <div className="affected-tabs">
            {Object.entries(tabs).map(([k, v]) => (
              <button key={k} className={tab===k?'active':''} onClick={() => setTab(k)}>{v.title}</button>
            ))}
          </div>
          <div className="affected-content">
            <div>
              <h3>{t.title}</h3>
              <p>{t.body}</p>
            </div>
            <div style={{ background: 'var(--white)', padding: 48, borderLeft: '6px solid var(--red)' }}>
              <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: 100, color: 'var(--red)', lineHeight: 0.9 }}>{t.stat}</div>
              <div style={{ fontSize: 17, color: 'var(--grey)', marginTop: 12, fontFamily: 'Barlow Condensed', fontWeight: 700, textTransform: 'uppercase' }}>{t.statLabel}</div>
              {t.source && <div style={{ fontSize: 13, color: 'var(--grey-soft)', marginTop: 14, fontStyle: 'italic' }}>Source: {t.source}</div>}
            </div>
          </div>
        </div>
      </section>

      {/* Price timeline chart */}
      <section className="section-pad section-paper">
        <div className="container-wide">
          <div className="section-head">
            <span className="eyebrow">The trajectory</span>
            <h2>Australian Energy Prices Keep on Climbing</h2>
            <p className="lede">Electricity and gas prices have risen to record highs in recent years and they show no signs of coming back down.</p>
          </div>
          <div className="timeline-chart" style={{ maxWidth: '80%', margin: '0 auto' }}>
            <p style={{ fontSize: 14, color: 'var(--grey)', marginBottom: 24, fontStyle: 'italic' }}>
              Australian household electricity and gas price indices, 1990–2026.
            </p>
            <div style={{ position: 'relative', paddingLeft: 64 }}>
              <div style={{ position: 'absolute', left: -2, top: '50%', transform: 'rotate(-90deg) translateX(50%)', transformOrigin: 'left center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--grey)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Price Index</div>
              <svg viewBox="0 0 820 360" width="100%" preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
                {(() => {
                  // ABS CPI sub-indices: household electricity and gas, March quarter,
                  // 1990–2026, indexed to 2011–12 = 100. ABS series 6401.0 table 18.
                  const data = [
                    [1990,24.14,17.41],[1991,25.37,18.64],[1992,26.55,19.24],[1993,27.88,20.57],[1994,28.26,20.62],
                    [1995,28.26,21.24],[1996,28.34,21.54],[1997,28.75,22.04],[1998,28.94,22.36],[1999,28.28,22.00],
                    [2000,28.49,21.71],[2001,31.58,24.13],[2002,33.00,25.50],[2003,35.10,27.09],[2004,35.53,28.99],
                    [2005,36.62,30.24],[2006,37.57,31.64],[2007,38.85,32.84],[2008,42.74,34.60],[2009,46.01,38.36],
                    [2010,54.41,41.64],[2011,60.78,43.74],[2012,66.79,46.65],[2013,78.21,54.45],[2014,82.29,58.22],
                    [2015,79.03,59.94],[2016,77.32,60.68],[2017,83.19,62.34],[2018,92.90,68.57],[2019,92.36,67.38],
                    [2020,90.79,67.95],[2021,80.62,67.03],[2022,83.45,71.96],[2023,96.40,90.83],[2024,98.26,88.73],
                    [2025,87.02,94.23],[2026,114.44,99.54],
                  ];
                  const electricity = data.map(([y, e]) => [y, e]);
                  const gas = data.map(([y, , g]) => [y, g]);
                  const yearMin = 1990, yearMax = 2026;
                  const vMin = 0, vMax = 120;
                  const W = 820, H = 360;
                  const toX = (y) => ((y - yearMin) / (yearMax - yearMin)) * W;
                  const toY = (v) => H - ((v - vMin) / (vMax - vMin)) * H;
                  const linePath = (series) => series.map((d, i) => (i === 0 ? 'M' : 'L') + [toX(d[0]), toY(d[1])].join(',')).join(' ');
                  const ylabels = [0, 30, 60, 90, 120];
                  const xlabels = [1990, 1995, 2000, 2005, 2010, 2015, 2020, 2025];
                  return (
                    <>
                      {ylabels.map(v => (
                        <g key={v}>
                          <line x1="0" y1={toY(v)} x2={W} y2={toY(v)} stroke="rgba(13,31,28,.08)" strokeWidth="1" />
                          <text x="-12" y={toY(v) + 4} textAnchor="end" fontSize="13" fill="rgba(13,31,28,.5)" fontFamily="Barlow Condensed, sans-serif" fontWeight="700">{v}</text>
                        </g>
                      ))}
                      {xlabels.map(yr => (
                        <text key={yr} x={toX(yr)} y={H + 26} textAnchor="middle" fontSize="13" fill="var(--grey)" fontFamily="Barlow Condensed, sans-serif" fontWeight="700">{yr}</text>
                      ))}
                      <path d={linePath(gas)} stroke="rgba(13,31,28,.5)" strokeWidth="3" fill="none" />
                      <path d={linePath(electricity)} stroke="#F5A623" strokeWidth="3.5" fill="none" />
                    </>
                  );
                })()}
              </svg>
            </div>
            <div style={{ display: 'flex', gap: 32, marginTop: 36, fontSize: 14, color: 'var(--grey)', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><span style={{ width: 14, height: 14, background: '#F5A623', borderRadius: '50%' }} /> Household electricity</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><span style={{ width: 14, height: 14, background: 'rgba(13,31,28,.5)', borderRadius: '50%' }} /> Household gas</span>
              <span style={{ marginLeft: 'auto', fontSize: 13, fontStyle: 'italic', opacity: 0.75 }}>Source: <a href="https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/consumer-price-index-australia/mar-2026/6401018.xlsx" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)', textDecoration: 'underline' }}>Australian Bureau of Statistics</a>, CPI (indexed to 2011–12 = 100).</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="cta-band">
        <div className="container cta-band-inner">
          <span className="eyebrow" style={{ color: 'var(--white)' }}>What you can do</span>
          <h2 style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, textTransform: 'uppercase', fontSize: 'clamp(40px, 5vw, 72px)', lineHeight: 0.95, marginTop: 14, marginBottom: 28 }}>
            Add your name. Send the message.
          </h2>
          <a href="#/petition" className="btn btn-amber" style={{ padding: '20px 36px', fontSize: 19 }}>Sign the Petition →</a>
        </div>
      </section>
    </main>
  );
};

const TakeAction = () => {
  const [postcode, setPostcode] = React.useState('');
  const [mp, setMp] = React.useState(null);
  const lookup = (e) => {
    e.preventDefault();
    if (postcode.length >= 4) setMp({ name: 'Hon. Sarah Tomlinson MP', electorate: 'Bennelong', email: 's.tomlinson.mp@aph.gov.au', phone: '(02) 9876 5432' });
  };
  const sample = "Dear MP,\n\nI am writing as a constituent in your electorate to ask you to publicly commit to prioritising affordable and reliable energy for Australian households.\n\nWith 1 in 5 Australians now in energy hardship and average household debt at $1,367, this is no longer a fringe issue — it is the defining cost-of-living crisis of our time.\n\nI ask you to put affordability before ideology, and to communicate publicly where you stand.\n\nSincerely,\n[Your name]";
  return (
    <main data-screen-label="Take Action">
      <section className="page-hero">
        <div className="container-wide page-hero-grid">
          <div>
            <span className="eyebrow" style={{ color: 'var(--amber)' }}>Take Action</span>
            <h1>Signing is the start. Here are four ways to amplify it.</h1>
            <p className="lede">Two minutes of your time, repeated by ten thousand Australians, becomes a movement no government can ignore. Pick one — or pick all four.</p>
          </div>
          <img className="hero-photo" src="assets/hero_take_action.png" alt="An older Australian woman writes a letter to her MP at her kitchen table." />
        </div>
      </section>

      <div className="container-wide" style={{ paddingTop: 56 }}>
        <div className="feed-strip">
          <div className="feed-pulse"><span className="dot" />Live activity</div>
          <ul>
            <li><strong>4,128 actions today</strong>across all four channels combined</li>
            <li><strong>312 letters sent</strong>to MPs in the last hour</li>
            <li><strong>87 community events</strong>scheduled this fortnight</li>
          </ul>
        </div>
      </div>

      <section className="section-pad section-paper">
        <div className="container-wide">
          <div className="action-grid">
            <div className="action-card">
              <span className="num">01 · Share</span>
              <h3>Spread the campaign</h3>
              <p>Use our pre-written posts — designed to convert. One click copies a tested message you can paste straight into your feed.</p>
              <div className="share-buttons">
                {['Facebook','X','WhatsApp','Instagram','LinkedIn','Copy text'].map(s => <button key={s}>{s}</button>)}
              </div>
              <div style={{ marginTop: 24, padding: 20, background: 'var(--paper)', fontSize: 14, fontFamily: 'Georgia', fontStyle: 'italic', color: 'var(--ink)' }}>
                "1 in 5 Australians can't afford their power bill. I just signed the petition demanding our leaders put affordability first. Add your name: affordableenergy.org.au"
              </div>
              <p style={{ fontSize: 13, color: 'var(--grey)', marginTop: 16 }}>↓ Or download a square or story-format graphic for your channels:</p>
              <div className="share-buttons" style={{ marginTop: 8 }}>
                <button>Square 1080×1080 ↓</button>
                <button>Story 1080×1920 ↓</button>
              </div>
            </div>

            <div className="action-card">
              <span className="num">02 · Pressure</span>
              <h3>Contact your MP</h3>
              <p>Enter your postcode. We'll find your federal MP and give you a pre-written, editable letter you can send in under a minute.</p>
              <form className="mp-form" onSubmit={lookup}>
                <input placeholder="Postcode (e.g. 2113)" value={postcode} onChange={e => setPostcode(e.target.value)} maxLength="4" />
                <button className="btn btn-teal" type="submit">Find MP</button>
              </form>
              {mp && (
                <div className="mp-result">
                  <h4>{mp.name}</h4>
                  <div className="meta">{mp.electorate} · {mp.phone}</div>
                  <div className="mp-letter">{sample}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-teal" style={{ padding: '12px 18px', fontSize: 14 }}>Send via email →</button>
                    <button className="btn btn-outline-teal" style={{ padding: '12px 18px', fontSize: 14 }}>Edit letter</button>
                  </div>
                </div>
              )}
            </div>

            <div className="action-card">
              <span className="num">03 · Recruit</span>
              <h3>Tell three friends</h3>
              <p>The petition grows fastest through trusted networks. Send a personal introduction to three people in one email.</p>
              {[1,2,3].map(i => (
                <div className="field" key={i} style={{ marginBottom: 8 }}>
                  <input type="email" placeholder={`Friend ${i} email`} style={{ width: '100%', padding: '13px 14px', border: '2px solid rgba(13,31,28,.1)', fontSize: 16 }} />
                </div>
              ))}
              <button className="btn btn-teal" style={{ marginTop: 12 }}>Send invites →</button>
            </div>

            <div className="action-card">
              <span className="num">04 · Show up</span>
              <h3>Find an event near you</h3>
              <p>Town halls, community meetings, and AEA appearances. Showing up in person is the strongest signal a politician can receive.</p>
              <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
                {[
                  ['Western Sydney Town Hall', 'Parramatta · 18 May 2026 · 7pm'],
                  ['Industry Roundtable', 'Geelong · 02 June 2026 · 6pm'],
                  ['Pensioner Forum', 'Brisbane · 14 June 2026 · 11am'],
                ].map(([t, d]) => (
                  <div key={t} style={{ padding: 16, background: 'var(--paper)', borderLeft: '3px solid var(--teal)' }}>
                    <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, textTransform: 'uppercase', fontSize: 16 }}>{t}</div>
                    <div style={{ fontSize: 13, color: 'var(--grey)' }}>{d}</div>
                  </div>
                ))}
              </div>
              <button className="btn btn-outline-teal" style={{ marginTop: 16 }}>See all events →</button>
            </div>
          </div>
        </div>
      </section>

      <TakeActionNewsStrip />
    </main>
  );
};

const TakeActionNewsStrip = () => {
  const content = useContent();
  const items = (content?.news || []).slice(0, 3);
  if (!items.length) return null;
  return (
    <section className="section-pad section-teal-light">
      <div className="container-wide">
        <div className="section-head">
          <span className="eyebrow">In the news</span>
          <h2>Read the latest coverage.</h2>
          <p className="lede">The campaign in Australia's leading mastheads and our own press releases.</p>
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
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <a href="#/news" className="btn btn-outline-teal">See all stories →</a>
        </div>
      </div>
    </section>
  );
};

const News = () => {
  const content = useContent();
  const allItems = content?.news || [];
  const categories = ['Interview', 'Comment', 'Press Release', 'Media'];
  const [cat, setCat] = React.useState('All');
  const items = cat === 'All' ? allItems : allItems.filter(it => it.tag === cat);
  return (
    <main data-screen-label="News">
      <section className="page-hero">
        <div className="container-wide page-hero-grid">
          <div>
            <span className="eyebrow" style={{ color: 'var(--amber)' }}>Newsroom</span>
            <h1>In the News.</h1>
            <p className="lede">Coverage from Australia's leading mastheads and our own press releases. Working journalists, please use the contact details below for same-day comment.</p>
          </div>
          <img className="hero-photo" src="assets/hero_news.png" alt="A newspaper, notebook and voice recorder on a journalist's desk." />
        </div>
      </section>

      <section className="section-pad section-paper">
        <div className="container-wide">
          <div className="topic-pills">
            <button className={`topic-pill ${cat === 'All' ? 'active' : ''}`} onClick={() => setCat('All')}>All stories</button>
            {categories.map(t => (
              <button key={t} className={`topic-pill ${cat === t ? 'active' : ''}`} onClick={() => setCat(t)}>{t}</button>
            ))}
          </div>

          {items.length === 0 && (
            <p style={{ fontStyle: 'italic', color: 'var(--grey)', padding: '24px 0' }}>No stories in this category yet.</p>
          )}
          <div className="news-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {items.map((it, i) => (
              <a href={`#/news/${it.slug || i}`} key={i} className="news-card" style={{ padding: 36 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="news-source">{it.src}</span>
                  <span style={{ fontSize: 11, padding: '3px 8px', background: it.tag === 'Press Release' ? 'var(--amber)' : 'var(--teal-light)', color: it.tag === 'Press Release' ? 'var(--ink)' : 'var(--teal-deep)', fontFamily: 'Barlow Condensed', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{it.tag}</span>
                </div>
                <div className="news-date">{it.date}</div>
                <h4 style={{ fontSize: 26, marginBottom: 12 }}>{it.head}</h4>
                <p style={{ fontSize: 15, color: 'var(--grey)', lineHeight: 1.55, marginBottom: 18 }}>{it.summary}</p>
                <span className="more">Read full story →</span>
              </a>
            ))}
          </div>

          <div className="media-contact">
            <div>
              <span className="eyebrow" style={{ color: 'var(--amber)' }}>Media</span>
              <h3 style={{ marginTop: 12 }}>For interviews, comment, and press enquiries.</h3>
              <p style={{ opacity: 0.85, marginTop: 8, fontSize: 16 }}>Spokespeople available across digital, print and broadcast. Same-day response.</p>
            </div>
            <div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, textTransform: 'uppercase', fontSize: 22 }}>Media Team</div>
                <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 8 }}>Coalition for Conservation</div>
                <div style={{ fontSize: 15 }}><a href={`mailto:${(content?.site?.mediaEmail) || 'Media@coalitionforconservation.com.au'}`} style={{ color: 'inherit', textDecoration: 'underline' }}>{(content?.site?.mediaEmail) || 'Media@coalitionforconservation.com.au'}</a></div>
                <div style={{ fontSize: 15 }}><a href="tel:+61291888838" style={{ color: 'inherit', textDecoration: 'none' }}>{(content?.site?.mediaPhone) || '+61 2 9188 8838'}</a></div>
              </div>
              <button className="btn btn-amber" style={{ padding: '14px 22px', fontSize: 14 }}>Download brand & stat pack ↓</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

const NewsStory = ({ slug }) => {
  const content = useContent();
  const items = content?.news || [];
  const idx = items.findIndex((it, i) => (it.slug || String(i)) === slug);
  const item = idx >= 0 ? items[idx] : null;
  const related = items.filter((_, i) => i !== idx).slice(0, 2);

  if (!item) {
    return (
      <main data-screen-label="News story (not found)">
        <section className="page-hero">
          <div className="container-wide page-hero-grid">
            <div>
              <span className="eyebrow" style={{ color: 'var(--amber)' }}>Newsroom</span>
              <h1>We couldn't find that story.</h1>
              <p className="lede">The link may be out of date. Browse the full newsroom or sign the petition below.</p>
            </div>
            <HeroPlaceholder icon="newspaper" tag="Hero · 404" />
          </div>
        </section>
        <section className="section-pad section-paper">
          <div className="container-narrow" style={{ textAlign: 'center' }}>
            <a href="#/news" className="btn btn-outline-teal" style={{ marginRight: 12 }}>Back to newsroom</a>
            <a href="#/petition" className="btn btn-teal">Sign the petition →</a>
          </div>
        </section>
      </main>
    );
  }

  const isPress = item.tag === 'Press Release';
  const bodyParas = (item.body || item.summary || '').split(/\n+/).filter(Boolean);

  return (
    <main data-screen-label={`News · ${item.head}`}>
      <section className="news-story-hero">
        <div className="container-narrow">
          <div className="news-story-meta">
            <span className="news-story-tag" style={{ background: isPress ? 'var(--amber)' : 'var(--teal-light)', color: isPress ? 'var(--ink)' : 'var(--teal-deep)' }}>{item.tag}</span>
            <span className="news-story-source">{item.src}</span>
            <span className="news-story-dot">·</span>
            <span className="news-story-date">{item.date}</span>
          </div>
          <h1 className="news-story-headline">{item.head}</h1>
          <p className="news-story-lede">{item.summary}</p>
        </div>
      </section>

      <section className="section-pad-sm section-paper">
        <div className="container-narrow news-story-body">
          {bodyParas.map((p, i) => <p key={i}>{p}</p>)}
          {item.url && (
            <p style={{ marginTop: 8 }}>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-teal">Read the original at {item.src} →</a>
            </p>
          )}
          <p className="news-story-byline">First published by <strong>{item.src}</strong>, {item.date}.</p>
        </div>
      </section>

      <section className="news-story-cta">
        <div className="container-narrow">
          <span className="eyebrow" style={{ color: 'var(--amber)', display: 'block', marginBottom: 14 }}>Now do something about it</span>
          <h2>Stories like this are why we exist. Sign the petition.</h2>
          <p>The cost of inaction is on every Australian power bill. Adding your name puts you on the record alongside tens of thousands of Australians demanding leaders who put affordability first.</p>
          <div className="news-story-cta-actions">
            <a href="#/petition" className="btn btn-amber">Sign the petition →</a>
            <a href="#/donate" className="btn btn-outline-amber">Chip in</a>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section-pad-sm section-paper">
          <div className="container-wide">
            <div className="section-head" style={{ marginBottom: 32 }}>
              <span className="eyebrow">Keep reading</span>
              <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)' }}>More from the newsroom</h2>
            </div>
            <div className="news-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {related.map((it, i) => (
                <a key={i} href={`#/news/${it.slug || items.indexOf(it)}`} className="news-card" style={{ padding: 32 }}>
                  <div className="news-source">{it.src}</div>
                  <div className="news-date">{it.date}</div>
                  <h4 style={{ fontSize: 22, marginBottom: 12 }}>{it.head}</h4>
                  <span className="more">Read full story →</span>
                </a>
              ))}
            </div>
            <div style={{ marginTop: 32 }}>
              <a href="#/news" className="btn btn-outline-teal">All news →</a>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

Object.assign(window, { NewsStory });

const About = () => (
  <main data-screen-label="About">
    <section className="about-hero">
      <div className="container-wide" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 56, alignItems: 'center' }}>
        <div>
          <span className="eyebrow" style={{ color: 'var(--teal-dark)' }}>About AEA</span>
          <h1>A people-powered campaign with one job: <span style={{ color: 'var(--teal-dark)' }}>win.</span></h1>
          <p className="lede">Affordable Energy Australia is not a think tank or a passive research group. We are a strategic campaign engine purpose-built to bridge the execution gap and give a voice to the 80% of Australians who are concerned about increased energy prices arising from Australia's current plans for the energy transition.</p>
        </div>
        <div className="hero-placeholder hero-placeholder-light">
          <span className="ph-tag" style={{ background: 'var(--teal-deep)', color: 'var(--white)' }}>Hero · About</span>
          {HERO_ICONS.community}
        </div>
      </div>
    </section>

    <section className="section-pad section-paper">
      <div className="container-narrow">
        <div className="section-head">
          <span className="eyebrow">Why we exist</span>
          <h2>Energy is an essential service, not a luxury.</h2>
        </div>
        <div className="problem-prose" style={{ fontSize: 18 }}>
          <p>Australia's energy system is broken. For too long, a small alliance of activist groups, ideologues, lobbyists and well-meaning policymakers has dominated the conversation. The result has been billions of dollars spent embedding expensive and unreliable energy in our system — driving up prices while threatening grid stability.</p>
          <p>Families, small businesses, and critical industries have been brought to their knees by a transition that ignores the simple test of affordable power.</p>
          <p>We exist to change that — by building a public mandate so large that no government can ignore it, and so durable it outlasts the news cycle.</p>
        </div>
      </div>
    </section>

    <section className="section-pad section-teal-light">
      <div className="container-wide">
        <div className="section-head">
          <span className="eyebrow">How we campaign</span>
          <h2>Three steps. Repeated relentlessly through 2028.</h2>
        </div>
        <div className="process-grid">
          <div className="process-step">
            <h3>Mobilise</h3>
            <p>Build the petition. Grow the supporter list to half a million Australians across every electorate. Make the cost of inaction visible.</p>
          </div>
          <div className="process-step">
            <h3>Pressure</h3>
            <p>Take the supporter base and convert it into direct, sustained constituent pressure on every elected representative. Letters, calls, town halls, community meetings.</p>
          </div>
          <div className="process-step">
            <h3>Hold to Account</h3>
            <p>Track every MP's stated position. Publish it. Make it impossible to be ambiguous about whether you stand with affordable power, or against it.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="section-pad section-paper">
      <div className="container-wide">
        <div className="section-head">
          <span className="eyebrow">The team</span>
          <h2>Our Affordable Energy Advocates</h2>
          <p className="lede">We are passionate about ensuring every Australian has access to affordable, reliable energy.</p>
        </div>
        <div className={`team-grid${(((useContent()?.team) || []).length < 3) ? ' team-grid-few' : ''}`}>
          {((useContent()?.team) || []).map(m => (
            <div className="team-member" key={m.name}>
              <div className="team-portrait">{m.photo ? <img src={m.photo} alt={m.name} /> : HERO_ICONS.user}</div>
              <h4>{m.name}</h4>
              <div className="role">{m.role}</div>
              <p>{m.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="section-pad section-paper">
      <div className="container-wide">
        <div className="section-head">
          <span className="eyebrow">Governance</span>
          <h2>Built to be trusted.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32 }}>
          {[
            ['Independent', 'Not aligned with any political organisation. We endorse policy positions, not candidates.'],
            ['Australian-funded', 'No money accepted from foreign donors or the renewable industrial complex.'],
          ].map(([h, p]) => (
            <div key={h} style={{ padding: 32, background: 'var(--white)', borderLeft: '4px solid var(--teal)' }}>
              <h4 style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, textTransform: 'uppercase', fontSize: 26, marginBottom: 12 }}>{h}</h4>
              <p style={{ fontSize: 15, color: 'var(--grey)', lineHeight: 1.55 }}>{p}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 48, padding: 32, background: 'var(--ink)', color: 'var(--white)' }}>
          <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, textTransform: 'uppercase', fontSize: 22, color: 'var(--amber)' }}>ABN 82 201 923 025</div>
          <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>Coalition for Conservation · Sydney NSW · Authorised by Z. Hilton</div>
        </div>
      </div>
    </section>
  </main>
);

Object.assign(window, { TheProblem, TakeAction, News, About });
