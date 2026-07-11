# Deployment Guide

Since this is a pure static frontend (no backend, no environment variables required), deployment
is simpler than a full-stack app: push to GitHub, connect Vercel, wire up one GitHub Actions
pipeline.

## 0. Prerequisites

- A GitHub account and a new empty repository
- A [Vercel](https://vercel.com) account (free tier is enough)
- Git installed locally, Node.js 20+ if you want to test locally first

## 1. Push the code to GitHub

From the root of this project (the folder containing `src/`, `package.json`, `.github/`, `docs/`):

```bash
git init
git add .
git commit -m "Initial commit: job board frontend"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

The GitHub Actions workflow runs automatically on push. The **lint/test/build** job should pass
immediately; the **deploy** job will fail until you add the Vercel secrets below — that's
expected.

## 2. Create the Vercel project

1. Vercel dashboard → **Add New** → **Project** → import your GitHub repo
2. Framework preset: **Vite** (should auto-detect)
3. Root directory: leave as the repo root (this project has no subfolder)
4. Click **Deploy** to finish project creation — this first deploy can come from Vercel's own
   Git integration. Note the resulting URL, e.g. `https://job-board.vercel.app`.

No environment variables are needed — the app has nothing to point at except itself.

## 3. Get Vercel credentials for GitHub Actions

Install the Vercel CLI locally and link the project:

```bash
npm install -g vercel
vercel login
vercel link          # select the project you created in step 2
cat .vercel/project.json   # shows "orgId" and "projectId"
```

Create a token: Vercel dashboard → **Account Settings** → **Tokens** → **Create Token**.

In GitHub: repo → **Settings** → **Secrets and variables** → **Actions** → **New repository
secret**, add three:

| Name | Value |
|---|---|
| `VERCEL_TOKEN` | the token you just created |
| `VERCEL_ORG_ID` | `orgId` from `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | `projectId` from `.vercel/project.json` |

From now on, every push to `main` runs lint + tests + build, then deploys the built output
straight to Vercel production via the CLI.

## 4. Verify the pipeline

Make a small change (e.g. tweak copy on the homepage), commit, push to `main`. Watch the
**Actions** tab: lint → test → build → deploy. Refresh your Vercel URL to see the change live.

## Alternative: deploy without GitHub Actions

If you just want the site live without wiring up CI/CD, Vercel's own Git integration (enabled by
default when you import the repo in step 2) will deploy every push to `main` on its own — the
GitHub Actions workflow in this repo is an *additional*, explicit deploy path for cases where you
want deploys visible and controllable from GitHub Actions specifically, as this assessment asked
for. If both are active, Vercel will simply deploy twice per push (harmless, just slightly
redundant) — you can disable Vercel's automatic Git deploys in the project's **Git** settings if
you'd rather only deploy through Actions.

## Troubleshooting

- **`vercel build` fails in CI**: confirm `VERCEL_TOKEN` hasn't expired and that `vercel link` was
  run against the same project referenced by `VERCEL_ORG_ID`/`VERCEL_PROJECT_ID`.
- **Blank page after deploy**: check the browser console — this is almost always a routing issue;
  confirm `vercel.json`'s SPA rewrite (`"/(.*)" → "/index.html"`) is present, since this is a
  client-side-routed app (React Router) and Vercel needs to serve `index.html` for every path.
- **Data doesn't show up for a reviewer testing it**: remind them that data is per-browser
  (`localStorage`), not shared — that's expected for this frontend-only build (see
  `docs/ARCHITECTURE.md`).
