# Acceptance — 0001 Foundation

## What v0 done means

- `npm install` succeeds on a clean clone.
- `npm run build` produces a static site in `dist/`.
- The site renders an index page and at least one project page from a
  sample `ercot.json`.
- The methodology page exists and is linked from every ConfidenceBadge.
- DEC-001 is committed and `npm run check:voice` enforces its three
  rules.

## Commands to run

```bash
git clone <repo>
cd site-atlas
npm install
npm run build
npm run check:voice
npm run check:links
npm run check:a11y
```

Expected: zero exit codes; build artifacts under `dist/`.

## Gates to pass

- `npm run check:voice` — no banned terms, DEC-001 rules satisfied.
- `npm run check:links` — no broken internal links.
- `npm run check:a11y` — zero axe-core serious-or-higher violations.
- Build under 60 seconds (R-ATL-011).

## Out of scope for acceptance

- States beyond ERCOT.
- Community comments.
- Live data refresh; the symlink updates on the GridSilicon side.
