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
3. Edit any tab (Site, Hero, Stats, Voices, News, Team, Milestones).
4. Use **Preview locally** to see changes in the live site (stored in your browser's localStorage; only you see them).
5. Click **Publish to site** to commit `content.json` back to GitHub. Vercel rebuilds in ~30 seconds and the changes go live for everyone.

## Adding new editable content

1. Add the field to `content.json`.
2. Read it from the relevant component via `useContent()`.
3. Add a form field for it in `components/admin.jsx`.

That's it — no migrations, no DB.
