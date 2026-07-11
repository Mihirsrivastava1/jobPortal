# Features

A tour of everything Pinboard does. Since there's no backend, every feature below runs entirely
in the browser, backed by `localStorage`.

## Browsing jobs

The home page shows every open listing as a "pinned flyer" card — role, company, location, work
style, job type, category, and salary at a glance, newest first.

**Search** matches title, company, and description text. Independent **filters** narrow by
location, category, job type (full-time / part-time / contract / internship / freelance), and
work style (remote / hybrid / on-site). Filters combine, and the result count updates live.
Results are **paginated** (9 per page) so it's easy to reference "page 2" rather than scrolling
forever.

**Freshness and urgency cues:**
- Jobs posted in the last 48 hours get a handwritten "new!" badge.
- Jobs with a closing date within 7 days get a "closing soon" tape marker.
- Closed/filled jobs are visually dimmed and stamped "Filled."

## Job detail & applying

Clicking a card opens the full listing — description, requirements, salary, and posting date. The
apply panel adapts to how the listing was set up:
- **External URL** → a button linking out to the company's own application page.
- **Built-in form** → collects name, email, a resume link, and an optional cover letter, and
  stores the application locally against that job. On success, the seeker sees a confirmation
  message instead of the form.
- **Closed job** → a clear "applications closed" message instead of a form.

## Saving jobs

Every card and detail page has a star/save toggle. Saved job IDs live in `localStorage`
(`pinboard.saved-jobs`), collected on a dedicated **Saved jobs** page — a personal shortlist with
no account required.

## Posting a job

The **Post a job** page is a single form: title, company, location, category, work style, job
type, salary range (optional), description, requirements, and how candidates should apply
(external URL, contact email, or the built-in form). An optional closing date, if within a week,
automatically triggers the "closing soon" badge. Submissions are saved instantly — no login, no
approval step — since there's no server to gate access.

## Managing listings

The **Manage** page lists everything posted on this device (open and closed), with:
- **Applicant counts** — click to expand and see each applicant's name, email, resume link,
  submission time, and cover letter.
- **Close / Reopen** — toggle whether a listing accepts new applications.
- **Delete** — remove a listing (and its applications) permanently.
- **Reset demo data** — restore the original ~10 seed listings and clear everything else, useful
  after testing.

This page has no access gate. In a real deployment with a backend, this is exactly the
functionality that would move behind employer accounts — see `docs/ARCHITECTURE.md`.

## Under the hood

- **`src/lib/seedJobs.ts`** — ~10 realistic sample jobs across categories, work styles, and
  currencies, loaded into `localStorage` the first time the app runs.
- **`src/lib/store.ts`** — a small local "database": filtering, sorting, and pagination over the
  jobs array, plus CRUD for jobs and applications, all backed by `localStorage`.
- **`src/api/client.ts`** — wraps the store with the same async/error shape a real REST client
  would have (`ApiError` with status codes, validation error details), so components don't know
  or care that there's no network involved.
- **Validation**: required fields and a salary-range check (min can't exceed max) run client-side
  before anything is saved, with field-level error messages shown next to the relevant input.
