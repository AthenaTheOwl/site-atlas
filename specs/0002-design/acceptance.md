# Acceptance — 0002 Design (v0.1)

## What v0.1 done means

- A fresh clone, with Node 20+ installed, can run the commands below
  and get a static site under `dist/`.
- The site renders an index page, one page per fixture project, and
  the methodology page.
- Every ConfidenceBadge links to `/methodology/`.
- The voice gate passes against the rendered HTML.

## Commands to run on a fresh clone

```bash
git clone <repo>
cd site-atlas-task-batch2-site-atlas-design
npm install
npm run build
npm run check:voice
```

Expected: zero exit codes from each command. `dist/` exists. Voice
gate prints `OK: <n> pages scanned` where `<n>` is the number of
HTML files emitted.

## Build artifacts that must exist

- `dist/index.html`
- `dist/projects/<slug>/index.html` for every slug in the fixture
  (5+ files)
- `dist/methodology/index.html`

## Gates the build must pass

- `npm run build` — Astro build exits zero in under 60 seconds on a
  2024-class laptop (R-ATL-V1-010).
- `npm run check:voice` — no banned terms; DEC-001 rules 1, 2, 3
  all satisfied across every emitted page (R-ATL-V1-009).

## Manual checks before the PR merges

- View `dist/index.html` in a browser with JS disabled; the table
  renders (R-ATL-V1-011) and the rows are ordered by confidence
  score descending with `slug` ascending as tie-breaker
  (R-ATL-V1-013).
- Open any `dist/projects/<slug>/index.html`; the ConfidenceBadge
  is a link to `/methodology/` (R-ATL-V1-003).
- Open the project page for the zero-evidence fixture row; the
  "no evidence on file" placeholder renders instead of an empty
  list.
- Edit `src/data/ercot.fixture.json` to remove a required field;
  `npm run build` fails with a message naming the slug and the
  missing field (R-ATL-V1-008).

## Out of scope for v0.1 acceptance

- RSS feed at `/rss.xml`.
- axe-core a11y gate (`npm run check:a11y`).
- Broken-link gate (`npm run check:links`).
- Pulling from a real GridSilicon symlink.
- Status history on project pages.
- Community comments.
