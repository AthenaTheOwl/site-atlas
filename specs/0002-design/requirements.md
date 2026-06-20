# Requirements — 0002 Design (v0.1)

v0.1 scope: an Astro static site rendering ERCOT large-load queue
projects from a synthetic data fixture, with per-project pages, a
methodology page, and the DEC-001 voice charter enforced by a single
voice gate. The real GridSilicon export is pluggable later; v0.1 does
not depend on it.

Each requirement below is something the next 1–2 PRs ship. Anything
larger is deferred to spec 0003 and noted at the bottom.

## Functional requirements

- **R-ATL-V1-001** The site SHALL render an index page at `/` listing
  every project found in the data fixture (carried from R-ATL-001;
  the source is the fixture, not the GridSilicon symlink).
- **R-ATL-V1-002** Each project SHALL have a page at
  `/projects/<slug>/` showing nameplate MW, confidence score, projected
  energization year, evidence items, and source citations (carried
  from R-ATL-002).
- **R-ATL-V1-003** The confidence score on every page SHALL link to
  `/methodology/` (carried from R-ATL-003).
- **R-ATL-V1-004** Each evidence item SHALL render with source URL,
  human-readable source name, and retrieval date (carried from
  R-ATL-005).
- **R-ATL-V1-005** The site SHALL commit a voice charter as a pair:
  `decisions/DEC-001-civic-voice-charter.md` (human narrative of the
  three rules from README) and `decisions/voice-charter.json` (the
  machine-readable banned-word, utility-token, action-verb, and
  emotional-intensifier lists). The markdown narrates; the JSON is
  the single source of truth read by the voice gate (carried from
  R-ATL-006; refined to remove drift between the doc and the gate).
- **R-ATL-V1-006** The data layer SHALL be a checked-in synthetic
  fixture at `src/data/ercot.fixture.json` matching the planned
  GridSilicon export schema. v0.1 ships the fixture; v0.2 swaps in a
  symlink to a real export by changing one constant in
  `astro.config.mjs`. (Refines R-ATL-007.)
- **R-ATL-V1-007** The fixture SHALL contain at least 5 projects
  covering all three confidence bands (0–30, 31–60, 61–100) so the
  ConfidenceBadge color logic is exercised end-to-end on every build.
- **R-ATL-V1-008** A typed data adapter at `src/lib/load-projects.ts`
  SHALL parse the fixture and reject any project missing a required
  field (slug, name, county, state, nameplate_mw, confidence_score,
  projected_year, status, evidence[]) by throwing at build time. The
  loader SHALL also reject: duplicate `slug`, `confidence_score`
  outside 0..100, unknown `status` value, and unknown evidence
  `type` value. Each error message SHALL name the offending slug
  and field.

## Non-functional requirements

- **R-ATL-V1-009** Every page SHALL pass `npm run check:voice` against
  banned terms and DEC-001 rules (carried from R-ATL-008).
- **R-ATL-V1-010** A production build SHALL complete in under 60
  seconds on a 2024-class laptop (carried from R-ATL-011).
- **R-ATL-V1-011** The site SHALL render primary content (project
  pages and methodology) without JavaScript (carried from R-ATL-012).
- **R-ATL-V1-012** The fixture SHALL be the single source of project
  data for v0.1; no page SHALL fetch at build or runtime from any
  network endpoint.
- **R-ATL-V1-013** The index page SHALL render projects ordered by
  `confidence_score` descending, with the ordering computed at build
  time (no client-side sort). Ties break by `slug` ascending so the
  order is deterministic across builds. (Functional behavior listed
  here so the V1-001..V1-012 numbering stays stable for downstream
  files; classification is descriptive only.)
- **R-ATL-V1-014** The repo SHALL document a minimum Node version of
  20 in both `package.json` `engines` and README. `npm install` on
  an older Node SHALL produce a warning that names the required
  version.

## Deferred to spec 0003+ (not in v0.1)

- RSS status-change feed (was R-ATL-004).
- axe-core a11y gate (was R-ATL-009) — voice and build gates ship
  first; a11y is the third PR after pages exist to scan.
- Broken-link gate (was R-ATL-010) — same reason.
- Real GridSilicon symlink and the export schema lock.
- Status history rendering on project pages.
- Community comment layer.
