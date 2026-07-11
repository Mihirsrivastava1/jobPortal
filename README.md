# 📌 Pinboard — Job Board (Frontend-only)

A complete job board UI built with React, TypeScript, and Vite — **no backend required**. All
data (job listings, applications, saved jobs) lives in the browser's `localStorage`, seeded with
~10 sample listings on first load, so the app is fully functional the moment it's deployed.

## Why no backend?

This project was scoped as a frontend-only submission. Rather than fake a network layer that talks
to nothing, the "API client" (`src/api/client.ts`) wraps a small local data store
(`src/lib/store.ts`) with the same async, error-handling shape a real API client would have. That
means:
- Every page still `await`s a call and handles a loading/error state, like it would against a
  real backend.
- Swapping in a real API later is a matter of rewriting `client.ts`'s internals — no page or
  component needs to change.

## Features

- **Browse & search**: keyword search, plus filters for location, category, job type, and work
  style (remote/hybrid/on-site), combined and paginated.
- **Job detail & apply**: full description/requirements, and a built-in apply form (name, email,
  resume link, cover letter) or a link out to an external application URL if the listing specifies
  one.
- **Save jobs**: star any listing to bookmark it; see everything you've saved on the **Saved**
  page — persisted in `localStorage`, so it survives refreshes and revisits.
- **Post a job**: a full form to add a new listing (title, company, location, category, work
  style, job type, salary range, description, requirements, how to apply, optional closing date).
  Saved instantly to local storage — no login needed.
- **Manage listings**: a table of every job posted on this device, with applicant counts (expand
  to see applicant details), close/reopen toggles, and delete — plus a "reset demo data" action to
  restore the original seed listings.
- **Freshness cues**: a handwritten "new!" badge for jobs posted in the last 48 hours, and a
  "closing soon" tape marker for jobs whose closing date is within a week.
- **Design**: a "corkboard with pinned flyers" visual system — rotated paper job cards, a torn
  bottom edge, a circular pin, and washi-tape/handwritten accents. See
  `docs/ARCHITECTURE.md` for the full token/design rationale.

See [`docs/FEATURES.md`](./docs/FEATURES.md) for the full feature tour.

## Running locally

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`. That's it — no environment variables, no database, no second
process to run.

## Testing & linting

```bash
npm run lint   # ESLint
npm run test   # Vitest unit tests
npm run build  # Type-check + production build
```

## Deployment

This is a static Vite build, so it deploys anywhere that serves static files — Vercel, Netlify,
GitHub Pages, S3, etc. Full step-by-step for GitHub + Vercel + the included GitHub Actions
pipeline is in [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md).

## A note on data persistence

Because everything lives in the browser:
- Data is **per-device, per-browser** — it won't sync across devices or show the same state to
  two different visitors.
- Clearing site data/local storage resets the board back to empty (use **Manage → Reset demo
  data** to restore the original seed listings instead of clearing storage).
- This is a deliberate trade-off for a frontend-only submission — see
  [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for what a real backend would change.
