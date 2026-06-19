# Requirements — 0001 Foundation

## Functional requirements

- **R-ATL-001** The site SHALL render an index page at `/` listing
  every ERCOT large-load queue project from the linked GridSilicon
  data export.
- **R-ATL-002** Each project SHALL have a page at `/projects/<slug>/`
  showing: nameplate MW, confidence score, projected energization year,
  evidence items, and source citations.
- **R-ATL-003** The confidence score on every page SHALL link to the
  methodology page at `/methodology/`.
- **R-ATL-004** The site SHALL ship a status-change RSS feed at
  `/rss.xml`; an entry is added whenever a project's confidence score
  changes by 5 points or more or when its status changes.
- **R-ATL-005** Each evidence item SHALL render with a source URL, a
  human-readable source name, and a retrieval date.
- **R-ATL-006** The site SHALL commit a voice charter at
  `decisions/DEC-001-civic-voice-charter.md` with three rules per
  README.
- **R-ATL-007** The data layer SHALL be `src/data/ercot.json`, populated
  as a symlink to a GridSilicon export.

## Non-functional requirements

- **R-ATL-008** Every page SHALL pass `npm run check:voice` against
  banned terms and DEC-001 rules.
- **R-ATL-009** Every page SHALL pass `npm run check:a11y` with zero
  axe-core violations at severity "serious" or higher.
- **R-ATL-010** Every link rendered SHALL pass `npm run check:links`
  (no 404s in internal navigation).
- **R-ATL-011** A production build SHALL complete in under 60 seconds
  on a 2024-class laptop.
- **R-ATL-012** The site SHALL not require JavaScript to render the
  primary content (project pages and methodology).
