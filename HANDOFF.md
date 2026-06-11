# Handoff — Affordable Energy Australia website

Quick onboarding for anyone new to this project. Read whichever section applies — **Editor** for changing content/images without code, **Developer** for changing the code or integrations.

---

## At a glance

| | Value |
|---|---|
| Live URL | https://www.affordableenergy.org.au (and `coalition.affordableenergy.org.au` if pointed at the same deploy) |
| Hosting | **Vercel** — auto-rebuilds on every commit to the production branch |
| Source repo | `horatio8/AffordableEnergyAustralia` on GitHub |
| Production branch | `claude/implement-affordable-energy-3Pgy1` (set this in Vercel → Settings → Git → Production Branch) |
| Stack | Single-page static HTML + React via UMD + Babel-in-browser (no build step). Serverless API functions in `api/`. Content stored in `content.json`. |
| Admin CMS | `https://<your-domain>/#/admin` |

Project layout:

```
index.html                  ← entry point loads React/Babel + the JSX files below
content.json                ← every editable string and list (read live by the site)
styles.css                  ← all CSS
components/                 ← UI (loaded by index.html in order)
  shared.jsx                  Header, Footer, SocialTicker, StatBand, …
  home.jsx                    homepage sections
  petition-donate.jsx         /#/petition, /#/donate, /#/thank-you-*
  pages.jsx                   /#/the-problem, /#/take-action, /#/news, /#/about-us, /#/privacy
  admin.jsx                   /#/admin
  app.jsx                     router + content loader
api/                        ← Vercel serverless functions
  submit-petition.js          POST handler: forwards to Nucleus + upserts Airtable
  stripe-webhook.js           Verifies Stripe signature, upserts donor into Airtable
  save-content.js             Admin CMS publish (commits content.json to GitHub)
  upload-asset.js             Admin CMS image upload (commits images to assets/)
  create-checkout-session.js  Legacy, no longer called (donate uses Stripe Payment Links)
lib/
  airtable.js                 Supporters-table helper (upsertSupporter, eventAlreadyProcessed)
assets/                     ← all images
CMS.md                      ← env-var reference + CMS usage docs
HANDOFF.md                  ← this file
```

---

## For editors (no code needed)

Everything below is doable from `/#/admin` once the env vars are set in Vercel (see CMS.md).

### Sign in

1. Go to `https://www.affordableenergy.org.au/#/admin`.
2. Enter the admin password (the `ADMIN_PASSWORD` env var on Vercel — the developer who deployed it has the value).

### What you can edit

The admin has tabs for each editable area of the site:

- **Site** — tagline, ABN, authorisation line, copyright, media email/phone, the 6 social URLs (LinkedIn, Instagram, YouTube, Facebook, TikTok, X).
- **Home hero** — eyebrow, headline (main + accent fragment), sub-headline, animated signature count.
- **Pillars** — the three "what we're calling for" cards on the homepage.
- **Ticker** — the scrolling "Kevin from NSW just signed" strip on the homepage.
- **Stats** — the four-stat strip under the hero.
- **Page headers** — eyebrow, headline, lede paragraph, and hero image for Petition / Take Action / News / About / Donate / The Problem.
- **Voices** — petition testimonials (name, location, quote).
- **News** — articles. The first three appear on the homepage and Take Action news strip; all appear at `/#/news`. The article's category (Households / Industry / Policy) controls which tab it shows under.
- **Team** — About-page team cards (name, role, photo, bio).
- **Milestones** — campaign milestones (used elsewhere; see About / Governance section).

### Editing flow

1. Make changes in the admin form.
2. **Preview locally** → see your changes only in your browser (stored in `localStorage`, no one else affected).
3. **Publish to site** → commits `content.json` to GitHub. Vercel auto-rebuilds in ~30 seconds and the changes go live.
4. **Reset to live** → throws away your local preview and reloads the live content.
5. **Export JSON** → downloads a backup copy of the content.

### Uploading images

Every photo field (Team headshots, page hero images) has an **Upload…** button next to the path. Pick a file from your computer (JPG/PNG, ~3.5MB max) and it commits straight into the repo's `assets/` folder. The path field auto-fills. You never touch GitHub.

### Common asks → which tab

| You want to… | Open this tab in admin |
|---|---|
| Change the homepage hero headline | Home hero |
| Add a new petition testimonial | Voices |
| Add a news article that will appear on the homepage | News (first 3 show on home, in order) |
| Add a new team member to About | Team |
| Update the petition page intro copy or its hero photo | Page headers → Petition |
| Add another scrolling-signer name | Ticker |
| Change the social-share message on Take Action | Page headers → Take Action → Share message |

### Things still hardcoded (need a developer)

These are not in the admin yet — if you need to change them, ask the developer:

- The 14 Stripe donate amounts (`$35 … $1,500` + custom) — see `components/petition-donate.jsx`.
- The Nucleus petition receiver URL — `api/submit-petition.js` (or set `NUCLEUS_PETITION_URL` env var on Vercel).
- Page copy outside the page hero (e.g. The Problem stats grid, About page process section, Privacy Policy text).
- Footer link structure.

---

## For developers

### Branch model

- **Production branch:** `claude/implement-affordable-energy-3Pgy1`. Every commit here triggers a Vercel rebuild and goes live.
- No `main` branch exists. If you'd rather work off `main`, create one from the tip of the prod branch and reset Vercel's production-branch setting.

### Local development

The site is static + serverless. Three options:

**(a) Quick edit of static parts — no API testing:**
```bash
# Just open index.html via a static file server
npx serve .
# or python -m http.server 8000
```
The `/api/*` endpoints won't work in this mode (you'll see CORS errors on the petition submit), but the rest of the site renders.

**(b) Full local dev with working API routes:**
```bash
npm install -g vercel
vercel dev   # serves at http://localhost:3000, API routes work
```
You'll need the same env vars as production (copy from the Vercel dashboard into a local `.env.local`).

**(c) Edit-in-browser + admin preview** — for content-only changes, use `/#/admin` → Preview locally, no local dev needed.

### Environment variables

All listed in `CMS.md`. Short list:

| Variable | Purpose |
|---|---|
| `ADMIN_PASSWORD` | Admin CMS login |
| `GITHUB_TOKEN` / `GITHUB_REPO` / `GITHUB_BRANCH` | CMS publish target |
| `STRIPE_SECRET_KEY` | Used by legacy `create-checkout-session.js` (inert) and `stripe-webhook.js` |
| `STRIPE_WEBHOOK_SECRET` | Verifies inbound webhook signatures |
| `AIRTABLE_API_KEY` / `AIRTABLE_BASE_ID` / `AIRTABLE_TABLE_ID` | Supporters table |
| `SITE_DOMAIN` | Tags Airtable rows when the petition handler creates them |
| `NUCLEUS_PETITION_URL` | (optional) override the hardcoded Nucleus receiver |

### Integrations and where they live

| Integration | Code | Notes |
|---|---|---|
| **Campaign Nucleus** | `api/submit-petition.js` | Petition POSTs land here, forwarded to Nucleus's form receiver. Field handles: `first_name`, `last_name`, `email`, `phone`, `postcode`, `whysigned`. |
| **Airtable Supporters** | `lib/airtable.js`, called from `submit-petition.js` and `stripe-webhook.js` | One row per supporter, deduplicated by lowercased email. `Sources` is a multi-select that grows as a supporter signs / donates. |
| **Stripe (donations)** | `components/petition-donate.jsx` (`DONATION_OPTIONS` + `CUSTOM_DONATION`), `api/stripe-webhook.js` | Donations use Stripe Payment Links — clicks redirect straight to `donate.stripe.com`. The webhook fires after a charge succeeds and writes to Airtable. |
| **GitHub Contents API** | `api/save-content.js`, `api/upload-asset.js` | Admin CMS commits `content.json` and uploaded images via a fine-grained PAT. |

### Adding new editable content

Pattern:

1. Add a new field to `content.json`.
2. In the relevant component, read it via `useContent()` with a hardcoded fallback so the site keeps rendering if the key goes missing:
   ```jsx
   const eyebrow = content?.pages?.donate?.eyebrow || 'Donate';
   ```
3. Add a form field for it in `components/admin.jsx`.

That's it — no migrations.

### Releasing changes

1. Make the change on `claude/implement-affordable-energy-3Pgy1`.
2. Commit + push.
3. Vercel auto-deploys in ~30 seconds. Check Vercel → Deployments for the commit hash.
4. Hard-refresh the affected page (the in-browser Babel cache can be sticky).

### Where common code lives

| If you want to change… | Open |
|---|---|
| Petition form fields, validation, redirect target | `components/petition-donate.jsx` (`Petition` component) |
| Petition → Nucleus mapping | `api/submit-petition.js` |
| Stripe amounts or URLs | `components/petition-donate.jsx` top — `DONATION_OPTIONS` + `CUSTOM_DONATION` |
| Stripe webhook → Airtable logic | `api/stripe-webhook.js` |
| Airtable field IDs / upsert logic | `lib/airtable.js` |
| Header nav, footer columns, mobile drawer | `components/shared.jsx` |
| Admin CMS UI | `components/admin.jsx` |
| Site colours / typography / breakpoints | `styles.css` |

### Testing the receivers

```bash
# Petition (expect HTTP 200 + {"ok":true})
curl -i -X POST https://www.affordableenergy.org.au/api/submit-petition \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Test","last_name":"User","email":"test@example.com","postcode":"2000"}'

# Stripe webhook (use Stripe CLI)
stripe trigger checkout.session.completed \
  --add checkout_session:client_reference_id=affordableenergy.org.au
```

Then check Airtable: https://airtable.com/appSGua6tEPXWuGoT/tblNqD7z6jHrU4A0C

### Known good state / debugging

- Vercel function logs live at **Vercel → Project → Logs → Functions**. Filter by route to see what each endpoint did.
- Airtable write failures log to `console.error('[airtable] ...')`. If a petition row doesn't appear, check the log line for the upstream Airtable error.
- Stripe webhook delivery attempts and failures live at **Stripe Dashboard → Developers → Webhooks → your endpoint → Attempts**.

---

## Credentials checklist for a new collaborator

What to ask for / set up:

- [ ] GitHub access to `horatio8/AffordableEnergyAustralia` (read or write, your call).
- [ ] Vercel project access (Member role minimum; Admin if they'll change env vars).
- [ ] Airtable base access to the `Supporters` base.
- [ ] Stripe Dashboard access (read-only is enough for tax/webhook checks).
- [ ] Campaign Nucleus C4C tenant access if they'll edit the petition form fields.
- [ ] The `ADMIN_PASSWORD` value (shared securely — never in chat/Slack).
