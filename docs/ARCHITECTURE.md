# Architecture

## Overview

```
                 ┌───────────────────────────────────────────┐
   Browser  ───▶ │  React SPA (Vite + TypeScript)             │
                 │                                             │
                 │  pages/ ──▶ api/client.ts ──▶ lib/store.ts │
                 │                                   │         │
                 │                                   ▼         │
                 │                            window.localStorage │
                 └───────────────────────────────────────────┘
```

Everything runs client-side. There is no server, no database, and no network call — the entire
"backend" is `src/lib/store.ts`, a thin wrapper around `localStorage`.

## Why structure it like a real API client?

`src/api/client.ts` exposes the same shape a real REST client would: async functions, an
`ApiError` class with HTTP-style status codes (`404`, `400`) and field-level `details`, and
consistent return types (`PagedResponse<Job>`, etc.). Pages call `api.listJobs(...)`,
`api.getJob(id)`, `api.createJob(values)` exactly as they would against a real backend.

The payoff: if this project later gains a real backend (e.g. the Spring Boot API this was
originally scoped with), only `client.ts`'s internals need to change — swap the `store.*` calls
for `fetch(...)` calls — and every page, component, and loading/error-handling code path keeps
working unmodified.

## Layers

- **`lib/seedJobs.ts`** — static seed data (10 jobs) used to initialize storage on first load.
- **`lib/store.ts`** — the "database": reads/writes two `localStorage` keys (`pinboard.jobs`,
  `pinboard.applications`), and implements filtering, sorting, and pagination in-memory over the
  jobs array. This is the only file that touches `localStorage` directly for job/application data.
- **`api/client.ts`** — the public interface every page uses. Adds a small artificial delay so
  loading skeletons are visible (a UX touch — instant local reads would otherwise never show a
  loading state at all) and translates store results into the `ApiError`/`PagedResponse` shapes
  described above.
- **`hooks/useSavedJobs.ts`** — a separate, simpler `localStorage` concern (just an array of saved
  job IDs, under its own key `pinboard.saved-jobs`) exposed as a hook, since "saved jobs" is a
  seeker-side concept distinct from the job data itself.
- **`components/` / `pages/`** — standard React composition; `App.tsx` wires routes with
  `react-router-dom`.

## Design system

A "corkboard with pinned flyers" visual language (tokens in `src/styles/global.css`): cork/paper/
ink/pin-red/pin-teal/tape colors, `Space Grotesk` for display type, `Inter` for body copy,
`Caveat` (handwriting) for the "new!" badge, and `JetBrains Mono` for salary figures and
timestamps. Job cards are literally rendered as pinned, slightly rotated paper flyers with a torn
bottom edge (CSS `clip-path`), a circular pin, a washi-tape "closing soon" marker, and a
handwritten badge for fresh listings — a concrete metaphor rather than a generic card grid.

## Trade-offs of the frontend-only scope

- **No persistence across devices/browsers.** Data is local to whichever browser posted or saved
  it. Two people visiting the deployed site do not see each other's newly-posted jobs.
- **No real access control.** The "Manage" page (close/reopen/delete, view applicants) has no
  gate, because there's no server-side secret to check against — anyone using this browser can
  manage any listing stored in it. In a backend-backed version, this would move behind employer
  accounts (see the previous Spring Boot version of this project, where write endpoints required
  a shared `X-Admin-Key`, as a stepping stone toward full per-employer auth).
- **Clearing site data wipes everything.** The "Reset demo data" button on the Manage page exists
  specifically so a demo/review session can be restored to a known state without needing devtools.

## CI/CD

A single GitHub Actions workflow (`.github/workflows/ci-cd.yml`):
1. **On every push/PR**: `npm ci` → `npm run lint` → `npm run test` (Vitest) → `npm run build`
   (TypeScript type-check + Vite production build).
2. **On push to `main` only**: deploys the built output to Vercel production via the Vercel CLI
   (`vercel pull` → `vercel build` → `vercel deploy --prebuilt --prod`), using `VERCEL_TOKEN`,
   `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` repository secrets.

Full setup steps are in `docs/DEPLOYMENT.md`.
