/* === The Problem, Take Action, News, About === */

const TheProblem = () => {
  const [tab, setTab] = React.useState('households');
  const tabs = {
    households: { title: 'Households', body: 'One in five Australian households is now in energy hardship. Average debt has climbed past $1,367 — and 15% of families report sacrificing food, healthcare or housing payments to keep the power on. Pensioners and renters on fixed incomes are bearing the heaviest load.', stat: '1 in 5', statLabel: 'households in hardship' },
    business: { title: 'Small Business', body: 'Cafés, butchers, panel beaters, dry cleaners — small businesses are absorbing wholesale price spikes they cannot pass on to customers. Hundreds are quietly closing every quarter. Energy is now in the top three operating costs for 78% of small employers.', stat: '78%', statLabel: 'of SMEs naming energy a top-3 cost' },
    industry: { title: 'Heavy Industry', body: 'Smelters, refineries, fertiliser plants and food processors operate on margins that cannot survive volatile wholesale markets. When industry leaves Australia, it does not come back. We have already lost capacity that took fifty years to build.', stat: '4,200', statLabel: 'manufacturing jobs lost in 2025' },
    pensioners: { title: 'Pensioners', body: 'Fixed-income Australians have no ability to absorb 19% bill increases. Many are rationing heating in winter and cooling in summer — a documented and accelerating public health risk in a country where heat exposure already kills more Australians than bushfires.', stat: '$200+', statLabel: 'avg debt rise in a single year' },
  };
  const t = tabs[tab];
  return (
    <main data-screen-label="The Problem">
      <section className="problem-hero">
        <div className="container problem-hero-inner">
          <span className="eyebrow" style={{ color: 'var(--amber)' }}>The Problem</span>
          <span className="big-num">19%</span>
          <h1>Electricity prices have risen nineteen per cent in just three years — with another 24% projected by July 2026.</h1>
        </div>
      </section>

      {/* Crisis in numbers */}
      <section className="section-pad section-paper">
        <div className="container-wide">
          <div className="section-head">
            <span className="eyebrow">The crisis in numbers</span>
            <h2>Eight figures every Australian should know.</h2>
            <p className="lede">Cleared statistics from regulators, peak bodies, and the AEA campaign team. Sources available on request to working journalists.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              ['1 in 5', 'Households in hardship'],
              ['$1,367', 'Average household energy debt'],
              ['340k', 'Households in long-term debt'],
              ['19%', 'Price rise in 3 years'],
              ['24%', 'Further rise by July 2026'],
              ['15%', 'Families sacrificing food or housing'],
              ['200+', 'NSW spot price spikes >$10k/MWh in 2024'],
              ['$200+', 'Average debt increase in 12 months'],
            ].map(([n,l], i) => (
              <div key={i} style={{ padding: 28, background: 'var(--white)', borderTop: '4px solid var(--red)' }}>
                <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: 56, color: 'var(--red)', lineHeight: 0.95 }}>{n}</div>
                <div style={{ fontSize: 14, color: 'var(--grey)', marginTop: 8 }}>{l}</div>
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
            </div>
          </div>
        </div>
      </section>

      {/* Price timeline chart */}
      <section className="section-pad section-paper">
        <div className="container-wide">
          <div className="section-head">
            <span className="eyebrow">The trajectory</span>
            <h2>Average residential electricity bill, 2010–2026.</h2>
            <p className="lede">Indexed to a representative 5,500 kWh/year household. Projection from current AEMC tariff trends.</p>
          </div>
          <div className="timeline-chart">
            <div style={{ position: 'relative', height: 320, padding: '0 0 40px 50px' }}>
              <svg viewBox="0 0 800 280" width="100%" height="280" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                {[0, 1, 2, 3, 4].map(i => (
                  <line key={i} x1="0" y1={i*70} x2="800" y2={i*70} stroke="rgba(13,31,28,.06)" strokeWidth="1" />
                ))}
                {[
                  [2010, 1180], [2012, 1340], [2014, 1420], [2016, 1480], [2018, 1560], [2020, 1620], [2022, 1880], [2024, 2080], [2026, 2240],
                ].map(([y, v], i, arr) => {
                  const x = (i / (arr.length - 1)) * 800;
                  const yy = 280 - ((v - 1000) / 1500) * 260;
                  return null;
                })}
                {(() => {
                  const data = [[2010, 1180], [2012, 1340], [2014, 1420], [2016, 1480], [2018, 1560], [2020, 1620], [2022, 1880], [2024, 2080], [2026, 2240]];
                  const proj = [[2026, 2240], [2027, 2520], [2028, 2780]];
                  const toXY = ([y, v], all) => {
                    const yearMin = 2010, yearMax = 2028;
                    const x = ((y - yearMin) / (yearMax - yearMin)) * 800;
                    const yy = 280 - ((v - 1000) / 1900) * 260;
                    return [x, yy];
                  };
                  const path = data.map((d, i) => (i === 0 ? 'M' : 'L') + toXY(d).join(',')).join(' ');
                  const areaPath = path + ` L ${toXY(data[data.length-1])[0]} 280 L ${toXY(data[0])[0]} 280 Z`;
                  const projPath = proj.map((d, i) => (i === 0 ? 'M' : 'L') + toXY(d).join(',')).join(' ');
                  return (
                    <>
                      <path d={areaPath} fill="rgba(217,64,64,.08)" />
                      <path d={path} stroke="#D94040" strokeWidth="3" fill="none" />
                      <path d={projPath} stroke="#D94040" strokeWidth="3" fill="none" strokeDasharray="6 6" />
                      {data.map((d, i) => {
                        const [x, y] = toXY(d);
                        return <circle key={i} cx={x} cy={y} r="5" fill="#D94040" />;
                      })}
                      {proj.slice(1).map((d, i) => {
                        const [x, y] = toXY(d);
                        return <circle key={i} cx={x} cy={y} r="5" fill="#fff" stroke="#D94040" strokeWidth="2" />;
                      })}
                    </>
                  );
                })()}
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 13, color: 'var(--grey)', fontFamily: 'Barlow Condensed', fontWeight: 700 }}>
                {['2010','2012','2014','2016','2018','2020','2022','2024','2026','2028 (proj)'].map(y => <span key={y}>{y}</span>)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 32, fontSize: 13, color: 'var(--grey)' }}>
              <span>● Actual annual bill</span>
              <span>○ Projected (AEMC trend)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="section-pad section-deep">
        <div className="container-narrow" style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 'clamp(28px, 3.5vw, 44px)', lineHeight: 1.3, marginBottom: 32 }}>
            "We are running an experiment on the Australian grid in real time. The bill is being paid by households who never agreed to be the test subjects."
          </p>
          <p style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 14, color: 'var(--teal)' }}>
            Dr. R. Chen · former NEM market analyst · 2025
          </p>
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
    if (postcode.length >= 4) setMp({ name: 'Hon. Sarah Tomlinson MP', electorate: 'Bennelong', party: 'Independent', email: 's.tomlinson.mp@aph.gov.au', phone: '(02) 9876 5432' });
  };
  const sample = "Dear MP,\n\nI am writing as a constituent in your electorate to ask you to publicly commit to prioritising affordable and reliable energy for Australian households.\n\nWith 1 in 5 Australians now in energy hardship and average household debt at $1,367, this is no longer a fringe issue — it is the defining cost-of-living crisis of our time.\n\nI ask you to put affordability before ideology, and to communicate publicly where you stand.\n\nSincerely,\n[Your name]";
  return (
    <main data-screen-label="Take Action">
      <section className="petition-hero">
        <div className="container-wide">
          <span className="eyebrow" style={{ color: 'var(--amber)' }}>Take Action</span>
          <h1 style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, textTransform: 'uppercase', fontSize: 'clamp(40px, 5.5vw, 84px)', lineHeight: 0.9, marginTop: 14, maxWidth: '20ch' }}>
            Signing is the start. Here are four ways to amplify it.
          </h1>
        </div>
      </section>

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
                  <div className="meta">{mp.electorate} · {mp.party} · {mp.phone}</div>
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
              <h3>Tell five friends</h3>
              <p>The petition grows fastest through trusted networks. Send a personal introduction to up to five people in one email.</p>
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
    </main>
  );
};

const News = () => {
  const items = [
    { src: 'The Australian', date: '12 April 2026', head: 'Grid stability fears mount as wholesale prices spike across NEM', summary: 'AEMO data reveals wholesale spot prices in NSW and Victoria reached new peaks during the Easter cold snap.', tag: 'Coverage' },
    { src: 'AFR', date: '03 April 2026', head: '340,000 households now in energy debt — peak body sounds alarm', summary: 'Energy and Water Ombudsman figures show debt levels at a decade high, with average debt up $200 in twelve months.', tag: 'Coverage' },
    { src: 'Sky News', date: '28 March 2026', head: 'Manufacturers warn of further closures without affordability reset', summary: 'AI Group survey of 600 manufacturers identifies energy as the leading risk to operations through 2027.', tag: 'Coverage' },
    { src: 'AEA Press Release', date: '20 March 2026', head: 'AEA petition surpasses 40,000 signatures in cross-electorate movement', summary: 'Affordable Energy Australia confirms supporter base has grown 240% quarter-on-quarter.', tag: 'Press Release' },
    { src: 'The Daily Telegraph', date: '15 March 2026', head: 'Pensioners rationing heating as winter bills bite early', summary: 'COTA reports a sharp rise in members reducing heating use, with health concerns mounting.', tag: 'Coverage' },
    { src: 'AEA Press Release', date: '01 March 2026', head: 'AEA names cross-bench advisory panel ahead of 2028 election cycle', summary: 'Five former MPs from across the political spectrum join the campaign in advisory roles.', tag: 'Press Release' },
  ];
  return (
    <main data-screen-label="News">
      <section className="news-hero">
        <div className="container-wide">
          <span className="eyebrow" style={{ color: 'var(--amber)' }}>Newsroom</span>
          <h1>In the News.</h1>
          <p className="lede">Coverage from Australia's leading mastheads and our own press releases. Working journalists — please use the contact details below.</p>
        </div>
      </section>

      <section className="section-pad section-paper">
        <div className="container-wide">
          <div className="news-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {items.map((it, i) => (
              <a href="#" key={i} className="news-card" style={{ padding: 36 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="news-source">{it.src}</span>
                  <span style={{ fontSize: 11, padding: '3px 8px', background: it.tag === 'Press Release' ? 'var(--amber)' : 'var(--teal-light)', color: it.tag === 'Press Release' ? 'var(--ink)' : 'var(--teal-deep)', fontFamily: 'Barlow Condensed', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{it.tag}</span>
                </div>
                <div className="news-date">{it.date}</div>
                <h4 style={{ fontSize: 26, marginBottom: 12 }}>{it.head}</h4>
                <p style={{ fontSize: 15, color: 'var(--grey)', lineHeight: 1.55, marginBottom: 18 }}>{it.summary}</p>
                <span className="more">Read more →</span>
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
                <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, textTransform: 'uppercase', fontSize: 22 }}>Hannah Reid</div>
                <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 8 }}>Director of Communications</div>
                <div style={{ fontSize: 15 }}>media@affordableenergy.org.au</div>
                <div style={{ fontSize: 15 }}>+61 2 8123 4567</div>
              </div>
              <button className="btn btn-amber" style={{ padding: '14px 22px', fontSize: 14 }}>Download brand & stat pack ↓</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

const About = () => (
  <main data-screen-label="About">
    <section className="about-hero">
      <div className="container-wide">
        <span className="eyebrow" style={{ color: 'var(--teal-dark)' }}>About AEA</span>
        <h1>A people-powered campaign with one job: <span style={{ color: 'var(--teal-dark)' }}>win.</span></h1>
        <p className="lede">Affordable Energy Australia is not a think tank or a passive research group. We are a strategic campaign engine purpose-built to bridge the execution gap and give a voice to the 80% of Australians who feel the country lacks a well-planned approach to managing the energy transition.</p>
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
          <p>We exist to change that — by building a public mandate so large that no major party can ignore it, and so durable it outlasts the news cycle.</p>
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
            <p>Take the supporter base and convert it into direct, sustained constituent pressure on every elected representative. Letters, calls, town halls, surgeries.</p>
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
          <span className="eyebrow">Governance</span>
          <h2>Built to be trusted.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
          {[
            ['Independent', 'Not affiliated with any political party. We endorse policy positions, not candidates.'],
            ['Transparent', 'Audited annual financials published in full. Donor list aggregated by amount band.'],
            ['Australian-funded', 'No money accepted from foreign donors, fossil fuel companies, or renewable industrial complex.'],
          ].map(([h, p]) => (
            <div key={h} style={{ padding: 32, background: 'var(--white)', borderLeft: '4px solid var(--teal)' }}>
              <h4 style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, textTransform: 'uppercase', fontSize: 26, marginBottom: 12 }}>{h}</h4>
              <p style={{ fontSize: 15, color: 'var(--grey)', lineHeight: 1.55 }}>{p}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 48, padding: 32, background: 'var(--ink)', color: 'var(--white)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, textTransform: 'uppercase', fontSize: 22, color: 'var(--amber)' }}>ABN 93 676 364 855</div>
            <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>Affordable Energy Australia · Sydney NSW · Authorised by D. Mitchell</div>
          </div>
          <a href="#" className="btn btn-outline-amber">Download 2025 financial report ↓</a>
        </div>
      </div>
    </section>
  </main>
);

Object.assign(window, { TheProblem, TakeAction, News, About });
