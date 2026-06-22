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

### Live petition counter (`/api/petition-count` + `/api/petition-event`)

The hero counter (`PetitionCounter`) and the form-side counter both refresh from `/api/petition-count` every 5 seconds while the tab is visible (paused when hidden). That endpoint authenticates against Campaign Nucleus (OAuth client-credentials), pulls the entry count for the petition form, adds an offline boost, and serves the total. In-memory cache holds the value for 10 seconds; Vercel's edge cache (`s-maxage=5, stale-while-revalidate=30`) protects the Nucleus quota when traffic spikes.

A second endpoint, `/api/petition-event`, receives Nucleus's **New Form Entry Webhook**. Each webhook delivery invalidates the in-memory cache so the next poll hits Nucleus immediately, dropping per-signature lag from ~10s to ~1–2s for visitors hitting the same warm function instance. Across cold instances the 10s TTL still applies — that's the worst-case lag regardless of webhook delivery.

Signers also see an *optimistic* `+1` the moment their submit succeeds, via a `petition-count:bump` window event the petition form dispatches.

| Name | Example | Purpose |
| --- | --- | --- |
| `NUCLEUS_CLIENT_ID` | `nuc_client_…` | OAuth client ID. Generated in Nucleus → Settings → Services → API Clients → Add API Client. |
| `NUCLEUS_CLIENT_SECRET` | `nuc_secret_…` | OAuth client secret (one-time display when you create the client). |
| `NUCLEUS_PETITION_FORM_ID` | `3e4ea7b9-1786-42dc-a2fb-53b5d1d54ed8` | UUID of the petition form receiver — same value as the `DEFAULT_URL` tail in `api/submit-petition.js`. |
| `NUCLEUS_WEBHOOK_SECRET` | `a3f9...` (32+ random chars: `openssl rand -hex 32`) | Shared secret the webhook receiver checks via `?secret=` query param. |
| `OFFLINE_SIGNATURE_BOOST` | `500` | Whole-number added to the Nucleus count. Use for offline-collected signatures. Default `0`. |
| `PETITION_COUNT_FLOOR` | `0` | Emergency value returned on a cold start when Nucleus is unreachable. Default `0`. |

**Configure the Nucleus webhook once:**

1. Nucleus → Settings (top-right gear) → **Services** tab.
2. Scroll to **Webhook Endpoints** → **New Form Entry Webhook** field.
3. Paste: `https://<your-domain>/api/petition-event?secret=<NUCLEUS_WEBHOOK_SECRET>`
4. **Save** (top right of the Services page).

If Nucleus is down, the count endpoint serves the last good cached value + boost; if it never had one, it returns `floor + boost` so the site never shows zero.

### Petition / donation / referral tracking (new Airtable schema)

This is the first-party tracking system per `CLAUDE_CODE_BRIEF_petition_tracking.md`. It runs **in parallel** with the existing Supporters table (which keeps feeding old dashboards) and the Nucleus petition counter (which keeps reporting live signature counts).

**Airtable schema** — four tables in the same base. Create them manually before first deploy. Names default to the column "Default name" below; override via env vars if you renamed them.

| Default name | Required fields | Notes |
| --- | --- | --- |
| `Contacts` | `contact_id` (primary text), `first_name`, `last_name`, `email`, `mobile`, `postcode`, `fbclid`, `fbp`, `referral_code`, `referred_by` (self-link to Contacts), `first_source_channel` (singleSelect: Facebook, Organic, Referral, Direct, Other, Share, Stripe), `status` (singleSelect: Signatory Only, Donor Only, Signatory + Donor, Inactive), `date_first_seen`, `last_updated` | Source of truth. One row per person. |
| `Events` | `event_id` (primary text), `contact` (link → Contacts), `event_type` (singleSelect — auto-grows with typecast), `timestamp`, `payload` (long text), `fbclid`, `referral_code_used`, `source_channel`, `meta_event_id`, `fanout_status` (singleSelect: Fanned Out, No Typed Table, Failed), `fanout_error` | Append-only log. Holds raw payloads. |
| `Petition Signatures` | `signature_id` (primary text), `contact` (link → Contacts), `event` (link → Events), `first_name`, `last_name`, `email`, `mobile`, `postcode`, `country`, `campaign`, `consent` (checkbox), `fbclid`, `fbp`, `ref_used`, `utm_*`, `timestamp`, `payload` | Typed projection of Petition Signed events. |
| `Donations` | `donation_id` (primary text), `contact` (link → Contacts), `event` (link → Events), `amount_cents` (number), `amount` (currency AUD), `currency`, `stripe_object_type` (singleSelect: checkout.session, invoice, payment_intent, charge), `stripe_object_id`, `stripe_payment_intent`, `email`, `name`, `phone`, `postcode`, `country`, `content_name`, `source_url`, `fbclid`, `fbp`, `petition_slug`, `timestamp`, `payload` | Typed projection of Donation events. |

> Create the link-target tables (Contacts, Events) **before** the link fields point at them, otherwise Airtable rejects the link config.

**Env vars** (Production + Preview, redeploy after saving):

| Name | Example | Purpose |
| --- | --- | --- |
| `AIRTABLE_API_KEY` | `pat...` | Same PAT used by the legacy Supporters table will do — just make sure it has access to the new tables too. Scopes: `data.records:read`, `data.records:write`. |
| `AIRTABLE_BASE_ID` | `appXXXX...` | Base containing the four tables. Can be the same base that holds Supporters, or a fresh one. |
| `AIRTABLE_CONTACTS_TABLE` | `Contacts` | Optional override. |
| `AIRTABLE_EVENTS_TABLE` | `Events` | Optional override. |
| `AIRTABLE_PETITION_SIGNATURES_TABLE` | `Petition Signatures` | Optional override. |
| `AIRTABLE_DONATIONS_TABLE` | `Donations` | Optional override. |
| `META_PIXEL_ID` | `1234567890` | Pixel ID from Events Manager. Required for both browser pixel and server CAPI. |
| `META_CAPI_TOKEN` | `EAAB…` | Conversions API access token. Required for server-side events. |
| `META_TEST_EVENT_CODE` | `TEST12345` | Optional. Set while testing in Events Manager → Test events. Remove before launch. |

Stripe vars (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) are already set for the Supporters webhook — the same endpoint now writes to both schemas.

**API endpoints**

| Endpoint | Purpose |
| --- | --- |
| `POST /api/petition-signup` | Primary petition handler. Matches/creates Contact, logs Petition Signed event, fans out to Petition Signatures, fires Meta CAPI Lead. Also posts to Nucleus for the live counter. |
| `POST /api/event-log` | Generic event logger for surveys, registrations, etc. |
| `POST /api/share-signup` | Identity capture on the /share page when no session_id and no localStorage. |
| `POST /api/share-issued` | Logged when a sharer clicks a share button on /share. |
| `POST /api/share-click` | Beacon fired by every page load with `?ref=` in the URL. Logs Share Click on the referrer's contact. |
| `GET /api/share-context` | Resolves a donor from `?session_id=cs_…` or `?email=…` so the /share page can render with the right referral_code and petition_slug. |
| `POST /api/stripe-webhook` | Now also writes Donation events + fan-out to Donations, plus Meta CAPI Purchase. Legacy Supporters write still happens for backwards compat. |

**Stripe Payment Link success_url**

For each of the 14 Payment Links, set the success URL to:
```
https://www.affordableenergy.org.au/#/share?session_id={CHECKOUT_SESSION_ID}
```
The literal `{CHECKOUT_SESSION_ID}` is Stripe's placeholder; substituted at redirect.

**Per-petition tagging**

The `taggedDonate(url)` helper now appends `?client_reference_id=<petition_slug>` (was: `<hostname>`). Default slug is `aea-main`. When you add multi-petition support, pass an explicit slug per donate button.

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
