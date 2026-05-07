/* === Petition, Donate, Thank You === */

const Petition = () => {
  const [submitted, setSubmitted] = React.useState(false);
  const submit = (e) => { e.preventDefault(); window.location.hash = '#/thank-you-petition'; };
  return (
    <main data-screen-label="Petition">
      <section className="page-hero">
        <div className="container-wide page-hero-grid">
          <div>
            <span className="eyebrow" style={{ color: 'var(--amber)' }}>The Petition</span>
            <h1>Sign it. Send a message no politician can ignore.</h1>
            <p className="lede">Your name joins tens of thousands of Australians from every state, every electorate, and every walk of life — demanding leadership that puts affordability first.</p>
          </div>
          <HeroPlaceholder icon="petition" tag="Hero · Petition" />
        </div>
      </section>
      <div className="container-wide">
        <div className="petition-split">
          <div className="petition-left">
            <p className="petition-declaration">"We call on Australia's leaders to prioritise affordable & reliable energy."</p>
            <p style={{ fontSize: 18, lineHeight: 1.65, color: 'var(--ink)', opacity: 0.85, marginBottom: 20 }}>
              For too long, energy policy has been written for ideology rather than for the families and businesses paying the bills. The cost is being borne by households who can least afford it.
            </p>
            <p style={{ fontSize: 18, lineHeight: 1.65, color: 'var(--ink)', opacity: 0.85 }}>
              Adding your name puts you on the record. It joins your voice with tens of thousands of Australians from every state, every electorate, and every walk of life — demanding leadership that puts affordability first.
            </p>
            <div className="petition-stats-mini">
              <div className="mini-stat"><span className="num">$1,367</span><span className="label">Average household energy debt</span></div>
              <div className="mini-stat"><span className="num">19%</span><span className="label">Price rise in 3 years</span></div>
              <div className="mini-stat"><span className="num">340k</span><span className="label">Households in energy debt</span></div>
              <div className="mini-stat"><span className="num">15%</span><span className="label">Sacrificing food or housing</span></div>
            </div>
          </div>
          <form className="petition-form" onSubmit={submit}>
            <div className="petition-form-counter">
              <div>
                <div className="num">47,832</div>
                <div className="lbl">Australians have signed</div>
              </div>
              <div style={{ width: 80, height: 6, background: 'rgba(255,255,255,.2)' }}>
                <div style={{ width: '47%', height: '100%', background: 'var(--amber)' }} />
              </div>
            </div>
            <h3>Add your name</h3>
            <p className="sub">Goal: 100,000 signatures. Less than a minute to sign.</p>
            <div className="field-row">
              <div className="field"><label>First name</label><input required defaultValue="" /></div>
              <div className="field"><label>Last name</label><input required defaultValue="" /></div>
            </div>
            <div className="field"><label>Email</label><input type="email" required placeholder="you@email.com" /></div>
            <div className="field-row">
              <div className="field"><label>Postcode</label><input required maxLength="4" placeholder="2000" /></div>
              <div className="field"><label>State</label>
                <select><option>NSW</option><option>VIC</option><option>QLD</option><option>SA</option><option>WA</option><option>TAS</option><option>ACT</option><option>NT</option></select>
              </div>
            </div>
            <div className="field"><label>Phone (optional)</label><input type="tel" placeholder="For SMS campaign updates" /></div>
            <div className="checkbox-row">
              <input type="checkbox" defaultChecked id="optin" />
              <label htmlFor="optin" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 13, fontWeight: 400, color: 'var(--grey)' }}>
                I want to receive campaign updates by email and SMS. I can unsubscribe at any time.
              </label>
            </div>
            <button type="submit" className="btn btn-teal">Sign the Petition →</button>
            <p style={{ fontSize: 12, color: 'var(--grey)', marginTop: 14, textAlign: 'center' }}>
              Authorised by D. Mitchell, AEA, Sydney NSW. Privacy Act compliant.
            </p>
          </form>
        </div>
      </div>

      <section className="section-pad section-paper">
        <div className="container-wide">
          <div className="section-head">
            <span className="eyebrow">Voices from Australia</span>
            <h2>Why they signed.</h2>
            <p className="lede">A small sample of the thousands of stories left when supporters add their name. Names changed where requested.</p>
          </div>
          <div className="voices-grid">
            {[
              { initials: 'JM', name: 'Janelle, 62', loc: 'Pensioner · Wagga Wagga NSW', q: "I had to choose between heating and my heart medication this winter. I never thought I'd see that day in Australia." },
              { initials: 'TR', name: 'Tom, 47', loc: 'Café owner · Geelong VIC', q: "Our power bill tripled. We cut staff hours, then we cut staff. Nobody in Canberra seems to notice the small shops closing." },
              { initials: 'PD', name: 'Priya, 34', loc: 'Mother of two · Western Sydney', q: "Two kids, two jobs, and we still get the disconnection notices. I signed because someone has to say enough." },
            ].map(v => (
              <div className="voice-card" key={v.name}>
                <p className="quote">{v.q}</p>
                <div className="who">
                  <span className="voice-avatar">{v.initials}</span>
                  <div>
                    <strong>{v.name}</strong>
                    <span>{v.loc}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

const Donate = () => {
  const [recurring, setRecurring] = React.useState(true);
  const [amt, setAmt] = React.useState(50);
  const impact = {
    15: 'reaches 300 more Australians on social media',
    25: 'reaches 500 more Australians on social media',
    50: 'funds one full day of digital campaigning',
    100: 'sponsors a targeted campaign in one electorate',
    250: 'powers a full week of constituent outreach',
    500: 'funds a campaign in one marginal seat',
  };
  return (
    <main data-screen-label="Donate">
      <section className="page-hero">
        <div className="container-wide page-hero-grid">
          <div>
            <span className="eyebrow" style={{ color: 'var(--amber)' }}>Donate</span>
            <h1>Power the campaign that puts families first.</h1>
            <p className="lede">Every dollar comes from Australians like you — and goes directly into reaching households, contacting representatives, and building public pressure ahead of 2028.</p>
          </div>
          <HeroPlaceholder icon="donate" tag="Hero · Donate" />
        </div>
      </section>
      <div className="container-wide">
        <div className="donate-page-grid">
          <div>
            <p style={{ fontSize: 22, lineHeight: 1.5, color: 'var(--ink)', marginBottom: 32, fontFamily: 'Barlow Condensed', fontWeight: 700, textTransform: 'uppercase' }}>
              Families and businesses are suffering. We are purpose-built to win this fight — but we cannot do it without you.
            </p>
            <p style={{ fontSize: 18, color: 'var(--ink)', opacity: 0.85, lineHeight: 1.65, marginBottom: 18 }}>
              Affordable Energy Australia takes no money from political parties, fossil fuel lobbyists, or the renewable industrial complex. Every dollar we raise comes from Australians like you — and goes directly into reaching households, contacting representatives, and building the public mandate to put affordability first.
            </p>
            <p style={{ fontSize: 18, color: 'var(--ink)', opacity: 0.85, lineHeight: 1.65, marginBottom: 36 }}>
              A monthly donation, even $15, gives the campaign the predictable runway it needs to plan, hire, and scale through to the 2028 election.
            </p>

            <div style={{ background: 'var(--teal-light)', padding: 32, borderLeft: '4px solid var(--teal)', marginBottom: 24 }}>
              <h4 style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, textTransform: 'uppercase', fontSize: 22, marginBottom: 16, color: 'var(--teal-deep)' }}>Where your money goes</h4>
              <div style={{ display: 'grid', gap: 14 }}>
                {[
                  ['Digital campaigning & ads', '52%'],
                  ['Field organising & MP outreach', '24%'],
                  ['Research & policy analysis', '14%'],
                  ['Operations & compliance', '10%'],
                ].map(([k,v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, paddingBottom: 8, borderBottom: '1px solid rgba(13,31,28,.08)' }}>
                    <span>{k}</span>
                    <strong style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, color: 'var(--teal-deep)' }}>{v}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 32, marginBottom: 32 }}>
              <div><div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: 40, color: 'var(--teal-deep)', lineHeight: 1 }}>47,832</div><div style={{ fontSize: 13, color: 'var(--grey)', marginTop: 4 }}>Signatures collected</div></div>
              <div><div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: 40, color: 'var(--teal-deep)', lineHeight: 1 }}>12,400</div><div style={{ fontSize: 13, color: 'var(--grey)', marginTop: 4 }}>Letters sent to MPs</div></div>
              <div><div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: 40, color: 'var(--teal-deep)', lineHeight: 1 }}>151</div><div style={{ fontSize: 13, color: 'var(--grey)', marginTop: 4 }}>Electorates with active supporters</div></div>
            </div>

            <div className="supporter-list">
              <h4>Recent supporters</h4>
              {[
                ['Margaret K.', 'NSW · 2113', '$50/mo', '2 min ago'],
                ['Aaron P.', 'VIC · 3220', '$250', '8 min ago'],
                ['Sun-Mi L.', 'QLD · 4101', '$15/mo', '14 min ago'],
                ['Daniel R.', 'WA · 6018', '$100', '22 min ago'],
                ['Emma B.', 'SA · 5067', '$25/mo', '31 min ago'],
              ].map(([name, loc, amt, when]) => (
                <div className="row" key={name + when}>
                  <div><strong>{name}</strong><div style={{ fontSize: 12, color: 'var(--grey)' }}>{loc}</div></div>
                  <span className="amount">{amt}</span>
                  <span className="when">{when}</span>
                </div>
              ))}
            </div>

            <div className="trust-grid">
              {[
                ['Stripe-secured', 'Bank-grade encryption', <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" key="s"><path d="M12 2 L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6z"/></svg>],
                ['Tax-receipted', 'Auto-emailed receipt', <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" key="r"><path d="M5 3v18l3-2 3 2 3-2 3 2 3-2V3z M9 8h6 M9 12h6 M9 16h4"/></svg>],
                ['No middlemen', '100% to campaign', <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" key="n"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg>],
                ['ABN registered', '93 676 364 855', <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" key="a"><path d="M3 21V8l9-5 9 5v13 M9 21v-8h6v8"/></svg>],
              ].map(([t, sub, ic]) => (
                <div className="trust-badge" key={t}>{ic}<strong>{t}</strong>{sub}</div>
              ))}
            </div>
          </div>

          <form className="donate-form-card" onSubmit={(e) => { e.preventDefault(); window.location.hash = '#/thank-you-donation'; }}>
            <div className="toggle-row">
              <button type="button" className={!recurring ? 'active' : ''} onClick={() => setRecurring(false)}>One-time</button>
              <button type="button" className={recurring ? 'active' : ''} onClick={() => setRecurring(true)}>Monthly</button>
            </div>
            <label style={{ display: 'block', fontFamily: 'Barlow Condensed', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 13, color: 'var(--grey)', marginBottom: 10 }}>
              Choose your {recurring ? 'monthly ' : ''}contribution
            </label>
            <div className="amount-grid">
              {[15, 25, 50, 100, 250, 500].map(v => (
                <button key={v} type="button" className={amt===v?'active':''} onClick={() => setAmt(v)}>${v}</button>
              ))}
            </div>
            <div className="impact-line"><strong>${amt}{recurring ? '/mo' : ''}</strong> {impact[amt] || 'powers our work'}.</div>
            <div className="field"><label>Full name</label><input required /></div>
            <div className="field"><label>Email</label><input type="email" required /></div>
            <div className="field"><label>Card number</label><input placeholder="4242 4242 4242 4242" /></div>
            <div className="field-row">
              <div className="field"><label>Expiry</label><input placeholder="MM/YY" /></div>
              <div className="field"><label>CVC</label><input placeholder="123" /></div>
            </div>
            <button type="submit" className="btn btn-amber" style={{ width: '100%', padding: 18, fontSize: 18 }}>Donate ${amt}{recurring ? ' /month' : ''} →</button>
            <div className="trust-row">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2 L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6z"/></svg>
              <span>Secure payments via Stripe · ABN 93 676 364 855 · Receipt emailed</span>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

const ThankYouPetition = () => (
  <main data-screen-label="Thank You — Petition" className="container">
    <div className="thanks-screen">
      <div className="thanks-illustration">{HERO_ICONS.check}</div>
      <span className="thanks-num">#47,833</span>
      <h1>You signed. Now make it count.</h1>
      <p>Your name is on the record. We'll be in touch with what's next — but the single most powerful thing you can do right now is share this with three Australians who feel the same.</p>
      <div className="share-mega">
        {['Facebook','X','WhatsApp','Email','Copy link'].map(s => (
          <button key={s} className="btn btn-outline-teal">{s}</button>
        ))}
      </div>
      <div className="next-steps">
        <div className="next-step">
          <span className="num">01 · Refer</span>
          <h4>Tell five friends</h4>
          <p>Trusted networks grow petitions fastest. Personal intros convert at 3× the rate of cold shares.</p>
        </div>
        <div className="next-step">
          <span className="num">02 · Pressure</span>
          <h4>Write to your MP</h4>
          <p>Pre-written letter, personalised in 30 seconds, sent direct to your federal representative.</p>
        </div>
        <div className="next-step">
          <span className="num">03 · Show up</span>
          <h4>Find an event</h4>
          <p>Town halls, doorknocks, community meetings. In-person presence is the strongest signal.</p>
        </div>
      </div>
      <div className="upsell-card">
        <span className="eyebrow" style={{ color: 'var(--amber)' }}>One more thing</span>
        <h3 style={{ marginTop: 12 }}>Can you chip in $10 to put this petition in front of 1,000 more Australians?</h3>
        <p>Petitions don't fund themselves. A small donation today turns your signature into a campaign that reaches the people who need to see it.</p>
        <a href="#/donate" className="btn btn-amber">Chip in $10 →</a>
      </div>
    </div>
  </main>
);

const ThankYouDonation = () => (
  <main data-screen-label="Thank You — Donation" className="container">
    <div className="thanks-screen">
      <div className="thanks-illustration" style={{ background: 'rgba(245,166,35,.18)' }}>
        <span style={{ color: 'var(--amber-dark)', display: 'flex' }}>{HERO_ICONS.heart}</span>
      </div>
      <h1>Thank you. You just powered the campaign.</h1>
      <p>Your contribution funds the petition drive, the MP outreach, and the public pressure that puts affordability back at the centre of energy policy. A receipt is on its way to your inbox.</p>
      <div className="share-mega">
        {['Share on Facebook','Share on X','Tell a friend'].map(s => (
          <button key={s} className="btn btn-outline-teal">{s}</button>
        ))}
      </div>
      <div className="next-steps">
        <div className="next-step">
          <span className="num">01 · Sign</span>
          <h4>Add your name</h4>
          <p>If you haven't already, your signature is the public record we use to demonstrate scale.</p>
        </div>
        <div className="next-step">
          <span className="num">02 · Multiply</span>
          <h4>Match your donation</h4>
          <p>Ask your employer about workplace giving — many double charitable contributions automatically.</p>
        </div>
        <div className="next-step">
          <span className="num">03 · Track</span>
          <h4>Watch the impact</h4>
          <p>You'll receive a quarterly report showing exactly where your contribution went.</p>
        </div>
      </div>
      <div className="upsell-card">
        <span className="eyebrow" style={{ color: 'var(--amber)' }}>Make it monthly</span>
        <h3 style={{ marginTop: 12 }}>The campaign needs runway, not just sprints.</h3>
        <p>A monthly contribution — even $15 — gives us the predictable resources to plan ahead through the 2028 election cycle.</p>
        <a href="#/donate" className="btn btn-amber">Convert to monthly →</a>
      </div>
    </div>
  </main>
);

Object.assign(window, { Petition, Donate, ThankYouPetition, ThankYouDonation });
