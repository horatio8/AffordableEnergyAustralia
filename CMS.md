# Content management & integrations

The site reads its editable copy from `content.json` at the repository root, accepts donations through Stripe Checkout, and lets a logged-in admin edit content at `/#/admin`. All of it is wired together by Vercel environment variables.

## Required environment variables

Configure these in **Vercel → Project Settings → Environment Variables** (Production, and Preview if you want them to work in preview deploys), then redeploy once.

### CMS (admin editor at `/#/admin`)

| Name | Example | Purpose |
| --- | --- | --- |
| `ADMIN_PASSWORD` | `pick-a-strong-passphrase` | Password the editor types at `/#/admin`. |
| `GITHUB_TOKEN` | `github_pat_...` | Fine-grained PAT with **Contents: Read and write** scope on this repo only. |
| `GITHUB_REPO` | `horatio8/AffordableEnergyAustralia` | Owner/name of the repo that holds `content.json`. |
| `GITHUB_BRANCH` | `claude/implement-affordable-energy-3Pgy1` | Branch the CMS commits to. Vercel auto-redeploys this branch. |

### Stripe donations

Donate buttons (homepage strip + `/#/donate` tiles) post to `/api/create-checkout-session`, which creates a Stripe Checkout Session and redirects the donor to Stripe's hosted donation page. Card details never touch this site.

| Name | Example | Purpose |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | `sk_live_...` or `sk_test_...` | Server-side key used to create Checkout Sessions, Prices, and Customers. **Required.** |
| `STRIPE_CURRENCY` | `aud` | 3-letter ISO currency. Optional, defaults to `aud`. |
| `PUBLIC_SITE_URL` | `https://affordable-energy-australia-tellerconsulting.vercel.app` | Optional. Used as the origin for Stripe `success_url` / `cancel_url`. The function falls back to the request host if this is unset. |

After the donor pays, Stripe redirects to `<origin>/#/thank-you-donation` with a `session_id` query param.

### Supporters sync (Airtable + Stripe webhook)

Every petition signature and every successful Stripe charge upserts into the **Supporters** Airtable table, deduplicated by lowercased email. Petition writes are fire-and-forget (Nucleus is still the source of truth for petition signatures); donation writes go through a verified Stripe webhook so retries are safe (idempotency check on `Last Stripe event ID`).

| Name | Example | Purpose |
| --- | --- | --- |
| `AIRTABLE_API_KEY` | `pat...` | Personal access token, scoped to **data.records:read** + **data.records:write** on the AEA Supporters base only. |
| `AIRTABLE_BASE_ID` | `appSGua6tEPXWuGoT` | The Supporters base. |
| `AIRTABLE_TABLE_ID` | `tblNqD7z6jHrU4A0C` | The Supporters table. |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Signing secret from **Stripe Dashboard → Developers → Webhooks → your endpoint**. Verifies every webhook call. |
| `SITE_DOMAIN` | `affordableenergy.org.au` or `coalition.affordableenergy.org.au` | Optional. Tags the **Site** column on rows created by `/api/submit-petition`. Defaults to `affordableenergy.org.au` if unset. |

**Register the Stripe webhook once** in the Stripe Dashboard:

1. **Developers → Webhooks → Add endpoint**.
2. URL: `https://<your-domain>/api/stripe-webhook`.
3. Events: `checkout.session.completed` and `invoice.payment_succeeded`.
4. Copy the signing secret into `STRIPE_WEBHOOK_SECRET` in Vercel and redeploy.

Donate buttons on the site append `?client_reference_id=<hostname>` to every Stripe Payment Link, so the webhook can tag the resulting supporter row with the originating domain.

### Live petition counter (`/api/petition-count`)

The hero counter (`PetitionCounter`) and the form-side counter both refresh from `/api/petition-count` every 60 seconds. That endpoint authenticates against Campaign Nucleus (OAuth client-credentials), pulls the entry count for the petition form, adds an offline boost, and serves the total. In-memory cache holds the value for 60s; Vercel's edge cache (`s-maxage=30`) protects the Nucleus quota when traffic spikes.

| Name | Example | Purpose |
| --- | --- | --- |
| `NUCLEUS_CLIENT_ID` | `nuc_client_…` | OAuth client ID. Generated in Nucleus → Settings → Services → API Clients → Add API Client. |
| `NUCLEUS_CLIENT_SECRET` | `nuc_secret_…` | OAuth client secret (one-time display when you create the client). |
| `NUCLEUS_PETITION_FORM_ID` | `3e4ea7b9-1786-42dc-a2fb-53b5d1d54ed8` | UUID of the petition form receiver — same value as the `DEFAULT_URL` tail in `api/submit-petition.js`. |
| `OFFLINE_SIGNATURE_BOOST` | `500` | Whole-number added to the Nucleus count. Use for offline-collected signatures. Default `0`. |
| `PETITION_COUNT_FLOOR` | `0` | Emergency value returned on a cold start when Nucleus is unreachable. Default `0`. |

If Nucleus is down, the endpoint serves the last good cached value + boost; if it never had one, it returns `floor + boost` so the site never shows zero.

Add the variables to **Production** (and Preview if you want the admin to work there too) and trigger a redeploy.

## Usage

1. Navigate to `https://<your-domain>/#/admin`.
2. Sign in with `ADMIN_PASSWORD`.
3. Edit any tab. Available sections:
   - **Site** — tagline, ABN, authorisation, copyright, media email/phone, social URLs.
   - **Home hero** — eyebrow, headline, sub-headline, animated signature count.
   - **Pillars** — the three "what we're calling for" cards on the homepage.
   - **Ticker** — the scrolling "X from STATE just signed" strip.
   - **Stats** — the four-stat strip under the hero.
   - **Page headers** — eyebrow / headline / lede / hero image for Petition, Take Action, News, About, Donate and The Problem.
   - **Voices** — petition testimonials.
   - **News** — articles. The first three appear on the homepage and Take Action news strip; all appear at `/#/news`.
   - **Team** — About-page team cards.
   - **Milestones** — campaign milestones.
4. Use **Preview locally** to see changes only in your browser (localStorage).
5. Click **Publish to site** to commit `content.json` back to GitHub. Vercel rebuilds in ~30 seconds and the changes go live for everyone.

## Image uploads (no GitHub knowledge needed)

Photo fields (team headshots, page hero images) show an **Upload…** button next to the path field. Pick a file from your computer and it is committed straight into `assets/` via `/api/upload-asset` using the same admin password. JPG/PNG only, ~3.5MB max. The path field auto-fills to point at the new file.

## Adding new editable content

1. Add the field to `content.json`.
2. Read it from the relevant component via `useContent()` (with a hardcoded fallback so the site still renders if the key is missing).
3. Add a form field for it in `components/admin.jsx`.

That's it — no migrations, no DB.
