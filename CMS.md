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
