# Content management

The site reads its editable copy from `content.json` at the repository root. To edit it through a browser-based admin UI, configure the four environment variables below in **Vercel → Project Settings → Environment Variables**, then redeploy once.

## Required environment variables

| Name | Example | Purpose |
| --- | --- | --- |
| `ADMIN_PASSWORD` | `pick-a-strong-passphrase` | Password the editor types at `/#/admin`. |
| `GITHUB_TOKEN` | `github_pat_...` | Fine-grained PAT with **Contents: Read and write** scope on this repo only. |
| `GITHUB_REPO` | `horatio8/AffordableEnergyAustralia` | Owner/name of the repo that holds `content.json`. |
| `GITHUB_BRANCH` | `claude/implement-affordable-energy-3Pgy1` | Branch the CMS commits to. Vercel auto-redeploys this branch. |

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
