# Tasks — 0001 Foundation

## PR 1 — Scaffold + voice charter

- [ ] Add `package.json` with Astro + axe-core + cheerio dependencies
- [ ] Add `astro.config.mjs` with sensible defaults
- [ ] Add `decisions/DEC-001-civic-voice-charter.md` pinning the three
  rules from README
- [ ] Add `scripts/voice_lint.mjs` reading the banned-word list and the
  DEC-001 rules
- [ ] Add an empty `src/data/ercot.json` placeholder with one sample
  project for build to work
- [ ] Confirm `npm install && npm run build` succeeds

## PR 2 — Index + project pages

- [ ] Add `src/pages/index.astro` rendering the project table
- [ ] Add `src/pages/projects/[slug].astro` as the per-project template
- [ ] Add `src/components/ConfidenceBadge.astro`
- [ ] Add `src/components/EvidenceCard.astro`
- [ ] Add `src/pages/methodology.astro` with a placeholder explainer
- [ ] Confirm `npm run check:voice` passes

## PR 3 — RSS + a11y + link gates

- [ ] Implement the `/rss.xml` generator
- [ ] Add `scripts/check_links.mjs`
- [ ] Add `scripts/check_a11y.mjs` driving axe-core through
  playwright-core
- [ ] Wire all three gates into an `npm run check:all` umbrella script
- [ ] Document the gate suite in README

## Out of scope for foundation

- [ ] Community comment layer (spec 0003)
- [ ] States beyond ERCOT (demand-pulled)
- [ ] Map-based visualization (spec 0004 if ever)
