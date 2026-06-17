/* === Petition, Donate, Thank You === */

/* === Stripe Payment Link URLs ===
 * Live links on the Coalition for Conservation Stripe account (acct_1KSyH4B1lSf62lWQ).
 * All show "Affordable Energy Australia" as the merchant; all priced in AUD.
 * If any preset button on the donate page ever sends a donor anywhere NOT in this list,
 * something has been edited that shouldn't have been.
 */
const DONATION_OPTIONS = [
  { amount: 35,   oneTimeUrl: 'https://donate.stripe.com/eVqeVc72c3Y18Hy1PW0gw0B', monthlyUrl: 'https://donate.stripe.com/14A00i0DOeCF2jaams0gw0t' },
  { amount: 65,   oneTimeUrl: 'https://donate.stripe.com/eVqdR8gCMfGJ9LC1PW0gw0C', monthlyUrl: 'https://donate.stripe.com/9B6cN43Q08ehbTK3Y40gw0u' },
  { amount: 135,  oneTimeUrl: 'https://donate.stripe.com/eVqcN4euE3Y1ga00LS0gw0D', monthlyUrl: 'https://donate.stripe.com/bJe6oG5Y80LP1f6fGM0gw0v' },
  { amount: 265,  oneTimeUrl: 'https://donate.stripe.com/5kQ9ASaeogKN0b21PW0gw0E', monthlyUrl: 'https://donate.stripe.com/00w3cu4U4amp7Du9io0gw0w' },
  { amount: 550,  oneTimeUrl: 'https://donate.stripe.com/28E9AS1HS3Y15vm66c0gw0r', monthlyUrl: 'https://donate.stripe.com/00w9AS3Q0gKN6zq0LS0gw0x' },
  { amount: 1500, oneTimeUrl: 'https://donate.stripe.com/6oU7sKfyIcux4rigKQ0gw0s', monthlyUrl: 'https://donate.stripe.com/dRmeVc3Q0eCFe1S0LS0gw0y' },
];
const CUSTOM_DONATION = {
  oneTimeUrl: 'https://donate.stripe.com/14AbJ05Y89il0b2eCI0gw0O',
  monthlyUrl: 'https://donate.stripe.com/cNi00i86g7ad5vm66c0gw0A',
};
// Append ?client_reference_id=<site> to a donate URL so the Stripe webhook
// can tag the resulting supporter row with the originating domain.
const taggedDonate = (url) => {
  const host = (typeof window !== 'undefined' && window.location && window.location.hostname) || '';
  const site = host === 'coalition.affordableenergy.org.au'
    ? 'coalition.affordableenergy.org.au'
    : 'affordableenergy.org.au';
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}client_reference_id=${encodeURIComponent(site)}`;
};
const goDonate = (oneTimeUrl, monthlyUrl, recurring) => {
  window.location.href = taggedDonate(recurring ? monthlyUrl : oneTimeUrl);
};
window.DONATION_OPTIONS = DONATION_OPTIONS;
window.CUSTOM_DONATION = CUSTOM_DONATION;
window.taggedDonate = taggedDonate;
window.goDonate = goDonate;

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
  const fallbackCount = +(content?.hero?.petitionCount || 47832);
  const liveCount = usePetitionCount(fallbackCount);
  const petitionGoal = 100000;
  const progressPct = Math.min(100, Math.max(0, (liveCount / petitionGoal) * 100));
  const [form, setForm] = React.useState({ first_name: '', last_name: '', email: '', phone: '', postcode: '' });
  const [status, setStatus] = React.useState({ kind: 'idle' });
  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    if (status.kind === 'busy') return;
    setStatus({ kind: 'busy' });
    try {
      const res = await fetch('/api/submit-petition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({ kind: 'error', msg: data.error || 'Could not submit. Please try again.' });
        return;
      }
      // Optimistic counter bump — signer sees +1 the moment they submit,
      // before the backend webhook propagates. Other visitors see the real
      // +1 on their next 5s poll.
      window.dispatchEvent(new CustomEvent('petition-count:bump', { detail: { minimum: liveCount + 1 } }));
      window.location.hash = '#/donate';
    } catch (_) {
      setStatus({ kind: 'error', msg: 'Network error. Please try again.' });
    }
  };
  return (
    <main data-screen-label="Petition">
      <section className="page-hero">
        <div className="container-wide page-hero-grid">
          <div>
            <span className="eyebrow" style={{ color: 'var(--amber)' }}>{content?.pages?.petition?.eyebrow || 'The Petition'}</span>
            <h1>{content?.pages?.petition?.h1 || 'Sign it. Send a message no politician can ignore.'}</h1>
            <p className="lede">{content?.pages?.petition?.lede || 'Your name joins everyday Australians from every state, every electorate, and every walk of life, demanding leadership that puts affordability first.'}</p>
          </div>
          <img className="hero-photo" src={content?.pages?.petition?.heroImage || 'assets/hero_petition.png'} style={{ objectPosition: 'right center' }} alt="Three generations of an Australian farming family stand together in a paddock at sunset." />
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
                <div className="num">{liveCount.toLocaleString()}</div>
                <div className="lbl">Australians have signed</div>
              </div>
              <div style={{ width: 80, height: 6, background: 'rgba(255,255,255,.2)' }}>
                <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--amber)' }} />
              </div>
            </div>
            <h3>Add your name</h3>
            <p className="sub">Goal: 100,000 signatures. Less than a minute to sign.</p>
            <div className="field-row">
              <div className="field"><label>First name <span style={{ color: 'var(--red)' }}>*</span></label><input name="first_name" required value={form.first_name} onChange={update('first_name')} autoComplete="given-name" /></div>
              <div className="field"><label>Last name <span style={{ color: 'var(--red)' }}>*</span></label><input name="last_name" required value={form.last_name} onChange={update('last_name')} autoComplete="family-name" /></div>
            </div>
            <div className="field"><label>Email <span style={{ color: 'var(--red)' }}>*</span></label><input name="email" type="email" required placeholder="you@email.com" value={form.email} onChange={update('email')} autoComplete="email" /></div>
            <div className="field"><label>Postcode</label><input name="postcode" maxLength="4" placeholder="2000" value={form.postcode} onChange={update('postcode')} autoComplete="postal-code" /></div>
            <div className="field"><label>Phone</label><input name="phone" type="tel" placeholder="For SMS campaign updates" value={form.phone} onChange={update('phone')} autoComplete="tel" /></div>
            {status.kind === 'error' && (
              <div style={{ padding: 12, marginBottom: 12, background: 'rgba(217,64,64,.08)', borderLeft: '3px solid var(--red)', color: 'var(--red)', fontSize: 14 }}>{status.msg}</div>
            )}
            <button type="submit" className="btn btn-teal" disabled={status.kind === 'busy'}>{status.kind === 'busy' ? 'Signing…' : 'Sign the Petition →'}</button>
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

const DonateAmountTile = ({ amount, recurring, onClick }) => (
  <button type="button" onClick={onClick} className="donate-tile">
    <span className="donate-tile-amount">${amount}</span>
    <span className="donate-tile-cta">Donate{recurring ? ' monthly' : ''} →</span>
  </button>
);

const Donate = () => {
  const content = useContent();
  const [recurring, setRecurring] = React.useState(false);
  const tilesRef = React.useRef(null);

  // Auto-scroll past the hero to the donation tiles when the page loads.
  React.useEffect(() => {
    if (!tilesRef.current) return;
    requestAnimationFrame(() => {
      const headerOffset = 90;
      const top = tilesRef.current.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  }, []);

  return (
    <main data-screen-label="Donate">
      <section className="page-hero">
        <div className="container-wide page-hero-grid">
          <div>
            <span className="eyebrow" style={{ color: 'var(--amber)' }}>{content?.pages?.donate?.eyebrow || 'Donate'}</span>
            <h1>{content?.pages?.donate?.h1 || 'Power the campaign that puts families first.'}</h1>
            <p className="lede">{content?.pages?.donate?.lede || "Pick an amount. We'll send you straight to our secure Stripe donation page — no card details ever touch this site."}</p>
          </div>
          <img className="hero-photo" src={content?.pages?.donate?.heroImage || 'assets/hero_donate.png'} alt="Rolling green Australian farmland at sunset, with a fence line tracing the hills." />
        </div>
      </section>
      <div className="container-wide">
        <section className="donate-tiles-card" ref={tilesRef}>
          <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, textTransform: 'uppercase', fontSize: 'clamp(26px, 3vw, 38px)', lineHeight: 1.05, marginBottom: 24, color: 'var(--ink)' }}>Give a tax deductible gift to fight for Aussie families &amp; affordable energy</h2>
          <div className="toggle-row donate-tiles-toggle">
            <button type="button" className={!recurring ? 'active' : ''} onClick={() => setRecurring(false)}>One-time</button>
            <button type="button" className={recurring ? 'active' : ''} onClick={() => setRecurring(true)}>Monthly</button>
          </div>
          <div className="donate-tiles-grid">
            {DONATION_OPTIONS.map(({ amount, oneTimeUrl, monthlyUrl }) => (
              <DonateAmountTile key={amount} amount={amount} recurring={recurring} onClick={() => goDonate(oneTimeUrl, monthlyUrl, recurring)} />
            ))}
            {!recurring && (
              <button
                type="button"
                className="donate-tile donate-tile-other"
                onClick={() => goDonate(CUSTOM_DONATION.oneTimeUrl, CUSTOM_DONATION.oneTimeUrl, false)}
                aria-label="Other amount — choose any amount on the next page"
              >
                <span className="donate-tile-amount">Other</span>
                <span className="donate-tile-cta">Choose amount</span>
              </button>
            )}
          </div>
          <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(61,189,168,.08)', borderLeft: '3px solid var(--teal)', fontSize: 14, lineHeight: 1.55, color: 'var(--ink)' }}>
            ✅ All donations are fully tax-deductible. Claim it at tax time. Receipt emailed instantly.
          </div>

          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, textTransform: 'uppercase', fontSize: 'clamp(22px, 2.4vw, 30px)', lineHeight: 1.05, marginBottom: 16, color: 'var(--ink)' }}>
              Outspent. Not outnumbered. We need you.
            </h3>
            <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--ink)', opacity: 0.85, marginBottom: 14 }}>
              The activist groups and lobby firms behind net zero have had a decade and your tax dollars to build the system you're now paying for. They've spent billions in federal and state subsidies to get here. We're going to undo it with a few dollars from you, and a few from your mate.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--ink)', opacity: 0.85, marginBottom: 14 }}>
              You're already paying for the policy. The question is whether you also pay to fix it.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--ink)', opacity: 0.85, marginBottom: 0 }}>
              A small amount, given by enough Australians, runs an entire campaign. Here's the maths.
            </p>
          </div>

          <div style={{ marginTop: 28 }}>
            <h4 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, textTransform: 'uppercase', fontSize: 18, letterSpacing: '0.05em', marginBottom: 14, color: 'var(--ink)' }}>
              What you fund
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                ['$35', 'an SMS blast to 500 Aussies in key communities.'],
                ['$65', 'reaches 1,300 Australians on Facebook.'],
                ['$135', '100 personalised letters to the politicians most likely to listen.'],
                ['$265', 'a radio ad slot in regional Queensland, NSW or WA.'],
                ['$550', 'reach 10,000 supporters across channels.'],
                ['$1,500', 'a local newspaper advertisement reaching tens of thousands of Aussies.'],
              ].map(([amt, desc]) => (
                <li key={amt} style={{ display: 'flex', gap: 12, alignItems: 'baseline', padding: '10px 0', borderBottom: '1px solid rgba(13,31,28,.06)', fontSize: 15, lineHeight: 1.5 }}>
                  <strong style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 18, color: 'var(--amber-dark)', minWidth: 64, flexShrink: 0 }}>{amt}</strong>
                  <span style={{ color: 'var(--ink)', opacity: 0.85 }}>→ {desc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: 24, padding: '14px 18px', background: 'rgba(245,166,35,.08)', borderLeft: '3px solid var(--amber)' }}>
            <strong style={{ display: 'block', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, textTransform: 'uppercase', fontSize: 18, marginBottom: 6, color: 'var(--ink)' }}>Monthly is best.</strong>
            <span style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--ink)', opacity: 0.85 }}>
              A small recurring gift means we can plan, hire, and scale — instead of scrambling between news cycles.
            </span>
          </div>

          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--grey)', marginTop: 24, lineHeight: 1.6 }}>
            🔒 Secure via Stripe · 📩 Receipt emailed · 🇦🇺 ABN 82 201 923 025
          </div>
          <div style={{ textAlign: 'center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, textTransform: 'uppercase', fontSize: 14, letterSpacing: '0.1em', color: 'var(--teal-deep)', marginTop: 8 }}>
            We're not a think tank. We're a campaign.
          </div>
        </section>

        <section className="donate-supporting">
          <p style={{ fontSize: 22, lineHeight: 1.5, color: 'var(--ink)', marginBottom: 32, fontFamily: 'Barlow Condensed', fontWeight: 700, textTransform: 'uppercase' }}>
            Families and businesses are suffering. We are purpose-built to win this fight — but we cannot do it without you.
          </p>
          <p style={{ fontSize: 18, color: 'var(--ink)', opacity: 0.85, lineHeight: 1.65, marginBottom: 18 }}>
            Affordable Energy Australia takes no money from political organisations. Every dollar we raise comes from Australians like you — and goes directly into reaching households, contacting representatives, and building the public mandate to put affordability first.
          </p>
          <p style={{ fontSize: 18, color: 'var(--ink)', opacity: 0.85, lineHeight: 1.65, marginBottom: 28 }}>
            A monthly donation, even $15, gives the campaign the predictable runway it needs to plan, hire, and scale through to the 2028 election.
          </p>

          <div className="trust-grid">
            {[
              ['Stripe-secured', 'Bank-grade encryption', <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" key="s"><path d="M12 2 L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6z"/></svg>],
              ['Tax-receipted', 'Auto-emailed receipt', <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" key="r"><path d="M5 3v18l3-2 3 2 3-2 3 2 3-2V3z M9 8h6 M9 12h6 M9 16h4"/></svg>],
              ['No middlemen', '100% to campaign', <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" key="n"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg>],
              ['ABN registered', '82 201 923 025', <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" key="a"><path d="M3 21V8l9-5 9 5v13 M9 21v-8h6v8"/></svg>],
            ].map(([t, sub, ic]) => (
              <div className="trust-badge" key={t}>{ic}<strong>{t}</strong>{sub}</div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

const ThankYouPetition = () => {
  const content = useContent();
  const shareUrl = content?.pages?.takeAction?.shareUrl || 'https://affordableenergy.org.au';
  const shareText = "I just signed the petition for affordable, reliable energy for every Australian household. 1 in 5 of us can't afford the power bill. Add your name:";
  const emailSubject = "I just signed — Australia needs leaders who put affordable energy first";
  const emailBody = `Hi,\n\nI just signed the Affordable Energy Australia petition — a people-powered campaign calling on Australia's leaders to put affordable and reliable energy first for every household.\n\nThe scale of it is worth knowing:\n  • 1 in 5 Australian households can't afford the power bill\n  • Average household energy debt has reached $1,367\n  • Electricity prices have risen 220% since 2008\n\nThis isn't sustainable, and it isn't fair. If it matters to you too, could you add your name? It takes less than a minute:\n\n${shareUrl}\n\nThe more of us who sign, the harder we are to ignore.\n\nThanks,`;
  const [copied, setCopied] = React.useState(false);
  const [recurring, setRecurring] = React.useState(false);

  const shareTo = (platform) => {
    const u = encodeURIComponent(shareUrl);
    const t = encodeURIComponent(`${shareText} ${shareUrl}`);
    if (platform === 'Facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${u}`, '_blank', 'noopener,noreferrer');
    else if (platform === 'X') window.open(`https://twitter.com/intent/tweet?text=${t}`, '_blank', 'noopener,noreferrer');
    else if (platform === 'WhatsApp') window.open(`https://wa.me/?text=${t}`, '_blank', 'noopener,noreferrer');
    else if (platform === 'Email') window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    else if (platform === 'Copy link') {
      navigator.clipboard?.writeText(shareUrl);
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <main data-screen-label="Thank You — Petition" className="container">
      <div className="thanks-screen">
        <div className="thanks-illustration">{HERO_ICONS.check}</div>
        <span className="thanks-num">#47,833</span>
        <h1>You signed. Now make it count.</h1>
        <p>Your name is on the record. The single most powerful thing you can do right now is share this with other Australians who need to hear it.</p>
        <div className="share-mega">
          {['Facebook','X','WhatsApp','Email','Copy link'].map(s => (
            <button key={s} type="button" className="btn btn-outline-teal" onClick={() => shareTo(s)}>
              {s === 'Copy link' && copied ? 'Copied!' : s}
            </button>
          ))}
        </div>
        <div className="next-steps">
          <div className="next-step">
            <span className="num">Share the truth</span>
            <h4>Other Australians need to hear this.</h4>
            <p>1 in 5 Australian households can't afford the power bill, and electricity prices have climbed 220% since 2008. Most people don't know the scale of what families are facing — and the people in power are counting on that. Forward this petition to three Australians in your life. Trusted voices in trusted networks are how the truth travels — and how this campaign wins.</p>
          </div>
        </div>
        <div className="upsell-card">
          <span className="eyebrow" style={{ color: 'var(--amber)' }}>One more thing</span>
          <h3 style={{ marginTop: 12 }}>Chip in to put this petition in front of more Australians.</h3>
          <p>Petitions don't fund themselves. A donation today turns your signature into a campaign that reaches the people who need to see it.</p>
          <div className="toggle-row donate-tiles-toggle" style={{ marginTop: 24, maxWidth: 360 }}>
            <button type="button" className={!recurring ? 'active' : ''} onClick={() => setRecurring(false)}>One-time</button>
            <button type="button" className={recurring ? 'active' : ''} onClick={() => setRecurring(true)}>Monthly</button>
          </div>
          <div className="donate-tiles-grid" style={{ marginTop: 18 }}>
            {DONATION_OPTIONS.map(({ amount, oneTimeUrl, monthlyUrl }) => (
              <DonateAmountTile key={amount} amount={amount} recurring={recurring} onClick={() => goDonate(oneTimeUrl, monthlyUrl, recurring)} />
            ))}
            {!recurring && (
              <button
                type="button"
                className="donate-tile donate-tile-other"
                onClick={() => goDonate(CUSTOM_DONATION.oneTimeUrl, CUSTOM_DONATION.oneTimeUrl, false)}
                aria-label="Other amount — choose any amount on the next page"
              >
                <span className="donate-tile-amount">Other</span>
                <span className="donate-tile-cta">Choose amount</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

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
