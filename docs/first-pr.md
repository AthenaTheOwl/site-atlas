# First PR after the scaffold

Narrow scope: project skeleton, voice charter, voice lint script, one
sample project. No real pages yet.

## Title

`feat: astro scaffold, DEC-001 voice charter, voice lint script`

## Files changed

- `package.json` (new) — Astro plus cheerio plus a small CLI dependency
  for the lint script. No test framework yet; that lands when pages do.
- `astro.config.mjs` (new) — site URL placeholder, output static.
- `decisions/DEC-001-civic-voice-charter.md` (new) — the three rules:
  every confidence score has a method link; utility names require an
  action verb within 12 tokens; no emotional intensifiers from a named
  list.
- `scripts/voice_lint.mjs` (new) — node script that builds the site
  with `astro build`, walks `dist/`, parses HTML, applies the three
  DEC-001 rules plus the portfolio banned-word list.
- `src/data/ercot.json` (new) — placeholder with one sample project so
  the build has data to render.
- `src/pages/placeholder.astro` (new) — a single page that imports the
  sample project and renders its name, just to confirm the build chain
  works.

## Why a placeholder page

Astro will not build with zero pages. The placeholder is replaced in PR
2 by the index and per-project templates. Keeping the placeholder small
keeps PR 1 reviewable.

## Verification

```bash
npm install
npm run build
npm run check:voice
```

Expected: build succeeds; voice_lint exits zero with `OK: 1 page
scanned`.

A reviewer should read DEC-001 and ask whether the three rules cover
the failure modes seen in real local-press coverage of data-center
siting. If a known failure mode is uncovered, add a fourth rule before
merging.

## What this PR does NOT do

- No index page; PR 2.
- No per-project page; PR 2.
- No RSS feed; PR 3.
- No GitHub Action.
- No symlink to the real GridSilicon export; the placeholder JSON
  stands in until the GridSilicon export schema is fixed.
