/* === Petition, Donate, Thank You === */

const formatPetitionStat = (n, format) => {
  switch (format) {
    case '$X': return `$${(+n).toLocaleString()}`;
    case 'X%': return `${n}%`;
    case 'Xk': return `${n}k`;
    case '1-in-X': return `1 in ${n}`;
    default: return (+n).toLocaleString();
  }
};

const Petition = () => {
  const content = useContent();
  const petitionStats = (content && content.petitionStats) || [];
  const submit = (e) => { e.preventDefault(); window.location.hash = '#/thank-you-petition'; };
  return (
    <main data-screen-label="Petition">
      <section className="page-hero">
        <div className="container-wide page-hero-grid">
          <div>
            <span className="eyebrow" style={{ color: 'var(--amber)' }}>The Petition</span>
            <h1>Sign it. Send a message no politician can ignore.</h1>
            <p className="lede">Your name joins everyday Australians from every state, every electorate, and every walk of life, demanding leadership that puts affordability first.</p>
          </div>
          <HeroPlaceholder icon="petition" tag="Hero · Petition" />
        </div>
      </section>
      <div className="container-wide">
        <div className="petition-split">
          <div className="petition-left">
            <p className="petition-declaration">"We call on Australia's leaders to prioritise affordable & reliable energy."</p>
            <p style={{ fontSize: 18, lineHeight: 1.65, color: 'var(--ink)', opacity: 0.85, marginBottom: 20 }}>
              For too long, energy policy has been written for ideology and vested interests rather than for the families and businesses paying the bills. The cost is being borne by households who can least afford it.
            </p>
            <p style={{ fontSize: 18, lineHeight: 1.65, color: 'var(--ink)', opacity: 0.85 }}>
              Adding your name puts you on the record. It joins your voice with everyday Australians from every state, every electorate, and every walk of life, demanding leadership that puts affordability first.
            </p>
            <div className="petition-stats-mini">
              {petitionStats.slice(0, 4).map((s, i) => (
                <div className="mini-stat" key={i}>
                  <span className="num">{formatPetitionStat(s.num, s.format)}</span>
                  <span className="label">{s.label}</span>
                  {s.source && <span className="mini-source">Source: {s.source}</span>}
                </div>
              ))}
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
            <div className="field"><label>Postcode</label><input required maxLength="4" placeholder="2000" /></div>
            <div className="field"><label>Phone (optional)</label><input type="tel" placeholder="For SMS campaign updates" /></div>
            <div className="checkbox-row">
              <input type="checkbox" defaultChecked id="optin" />
              <label htmlFor="optin" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 13, fontWeight: 400, color: 'var(--grey)' }}>
                I want to receive campaign updates by email and SMS. I can unsubscribe at any time.
              </label>
            </div>
            <button type="submit" className="btn btn-teal">Sign the Petition →</button>
            <p style={{ fontSize: 12, color: 'var(--grey)', marginTop: 14, textAlign: 'center' }}>
              Authorised by Z. Hilton, Coalition for Conservation, Sydney NSW. Privacy Act compliant.
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
            {((useContent()?.voices) || []).map(v => (
              <div className="voice-card" key={v.name}>
                <p className="quote">{v.quote}</p>
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

// Posts to the checkout API and redirects to the Stripe-hosted donation page.
// Used by the donate page tiles AND the homepage donate strip.
const startCheckout = async (amount, recurring) => {
  try {
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, recurring }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) {
      const reason = data.error || `Could not start donation (${res.status}).`;
      window.alert(`${reason}\n\nIf you are the site administrator, set STRIPE_SECRET_KEY in Vercel environment variables.`);
      return;
    }
    window.location.assign(data.url);
  } catch (e) {
    window.alert('Network error starting donation. Please try again.');
  }
};
window.startCheckout = startCheckout;

const DonateAmountTile = ({ amount, recurring, busy, onClick }) => (
  <button type="button" disabled={busy} onClick={onClick} className="donate-tile">
    <span className="donate-tile-amount">${amount}</span>
    <span className="donate-tile-cta">Donate{recurring ? ' monthly' : ''} →</span>
  </button>
);

const Donate = () => {
  const [recurring, setRecurring] = React.useState(false);
  const [busy, setBusy] = React.useState(0);
  const [other, setOther] = React.useState('');
  const [showOther, setShowOther] = React.useState(false);

  const go = async (amount) => {
    if (busy) return;
    setBusy(amount);
    await startCheckout(amount, recurring);
    setBusy(0);
  };

  const submitOther = (e) => {
    e.preventDefault();
    const v = parseInt(other, 10);
    if (!Number.isFinite(v) || v < 1) { window.alert('Please enter a whole-dollar amount of $1 or more.'); return; }
    go(v);
  };

  return (
    <main data-screen-label="Donate">
      <section className="page-hero">
        <div className="container-wide page-hero-grid">
          <div>
            <span className="eyebrow" style={{ color: 'var(--amber)' }}>Donate</span>
            <h1>Power the campaign that puts families first.</h1>
            <p className="lede">Pick an amount. We'll send you straight to our secure Stripe donation page — no card details ever touch this site.</p>
          </div>
          <HeroPlaceholder icon="donate" tag="Hero · Donate" />
        </div>
      </section>
      <div className="container-wide">
        <section className="donate-tiles-card">
          <div className="toggle-row donate-tiles-toggle">
            <button type="button" className={!recurring ? 'active' : ''} onClick={() => setRecurring(false)}>One-time</button>
            <button type="button" className={recurring ? 'active' : ''} onClick={() => setRecurring(true)}>Monthly</button>
          </div>
          <div className="donate-tiles-grid">
            {[15, 25, 50, 100, 250, 500].map(v => (
              <DonateAmountTile key={v} amount={v} recurring={recurring} busy={busy === v} onClick={() => go(v)} />
            ))}
            {!showOther && (
              <button type="button" className="donate-tile donate-tile-other" onClick={() => setShowOther(true)}>
                <span className="donate-tile-amount">Other</span>
                <span className="donate-tile-cta">Choose amount</span>
              </button>
            )}
          </div>
          {showOther && (
            <form className="donate-other-row" onSubmit={submitOther}>
              <label>Amount in AUD</label>
              <div className="donate-other-input">
                <span>$</span>
                <input type="number" min="1" step="1" value={other} onChange={e => setOther(e.target.value)} autoFocus placeholder="100" />
                <button type="submit" className="btn btn-amber">Donate{recurring ? ' monthly' : ''} →</button>
              </div>
            </form>
          )}
          <div className="trust-row donate-tiles-trust">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2 L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6z"/></svg>
            <span>Secure payments via Stripe · ABN 93 676 364 855 · Receipt emailed</span>
          </div>
        </section>

        <section className="donate-supporting">
          <p style={{ fontSize: 22, lineHeight: 1.5, color: 'var(--ink)', marginBottom: 32, fontFamily: 'Barlow Condensed', fontWeight: 700, textTransform: 'uppercase' }}>
            Families and businesses are suffering. We are purpose-built to win this fight — but we cannot do it without you.
          </p>
          <div className="donate-supporting-grid">
            <div>
              <p style={{ fontSize: 18, color: 'var(--ink)', opacity: 0.85, lineHeight: 1.65, marginBottom: 18 }}>
                Affordable Energy Australia takes no money from political organisations. Every dollar we raise comes from Australians like you — and goes directly into reaching households, contacting representatives, and building the public mandate to put affordability first.
              </p>
              <p style={{ fontSize: 18, color: 'var(--ink)', opacity: 0.85, lineHeight: 1.65, marginBottom: 28 }}>
                A monthly donation, even $15, gives the campaign the predictable runway it needs to plan, hire, and scale through to the 2028 election.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                <div><div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: 36, color: 'var(--teal-deep)', lineHeight: 1 }}>47,832</div><div style={{ fontSize: 13, color: 'var(--grey)', marginTop: 4 }}>Signatures collected</div></div>
                <div><div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: 36, color: 'var(--teal-deep)', lineHeight: 1 }}>12,400</div><div style={{ fontSize: 13, color: 'var(--grey)', marginTop: 4 }}>Letters sent to MPs</div></div>
                <div><div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: 36, color: 'var(--teal-deep)', lineHeight: 1 }}>151</div><div style={{ fontSize: 13, color: 'var(--grey)', marginTop: 4 }}>Electorates with active supporters</div></div>
              </div>
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
        </section>
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
