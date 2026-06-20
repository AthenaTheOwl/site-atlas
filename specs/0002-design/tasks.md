# Tasks — 0002 Design (v0.1)

Ordered for the next 1–2 PRs. PR 1 lands the scaffold, fixture,
voice gate, and one placeholder page. PR 2 lands the real pages and
components.

## PR 1 — scaffold, fixture, voice gate

- [ ] Add `package.json` pinning `astro` and `cheerio`; scripts for
  `dev`, `build`, `check:voice`. Document Node 20+ in `engines`.
- [ ] Add `astro.config.mjs` exporting a `DATA_SOURCE` constant set
  to `./src/data/ercot.fixture.json`.
- [ ] Add `decisions/voice-charter.json` with the four lists
  (`banned_words`, `utility_tokens`, `action_verbs`,
  `emotional_intensifiers`) per design B6.
- [ ] Add `decisions/DEC-001-civic-voice-charter.md` with the three
  rules from README (method link; utility name + verb within 12
  tokens; no emotional intensifiers) and a first-paragraph pointer
  to `voice-charter.json` as the executable source of truth.
- [ ] Add `src/data/ercot.fixture.json` with 5 synthetic projects
  covering the three confidence bands (one 0–30, two 31–60, two
  61–100) and at least one project with zero evidence items.
- [ ] Add `src/lib/load-projects.ts` with the typed loader and
  schema validation from design B2.
- [ ] Add `scripts/voice_lint.mjs` implementing the eight steps from
  design B5; load all rule lists from
  `decisions/voice-charter.json` (no hard-coded lists in the script).
- [ ] Add `src/pages/placeholder.astro` rendering the first
  project's name (so `astro build` has a page to emit and the voice
  gate has HTML to scan). Pick a fixture project whose `name`
  contains no token from `utility_tokens` so the placeholder does
  not trip DEC-001 rule 2. Replaced in PR 2.
- [ ] Confirm `npm install && npm run build && npm run check:voice`
  exits zero on a clean clone.

## PR 2 — pages and components

- [ ] Add `src/components/ConfidenceBadge.astro` (color band + link
  to `/methodology/`).
- [ ] Add `src/components/EvidenceCard.astro` (title, source, URL,
  retrieved date, type tag).
- [ ] Add `src/pages/index.astro` rendering the project table,
  server-sorted by confidence score descending, no JS.
- [ ] Add `src/pages/projects/[slug].astro` with `getStaticPaths`
  driven by `loadProjects()`; render hero, evidence list (or empty
  state when zero), citations.
- [ ] Add `src/pages/methodology.astro` with the explainer copy.
- [ ] Delete `src/pages/placeholder.astro`.
- [ ] Confirm `npm run build && npm run check:voice` still exits
  zero after the new pages render.
