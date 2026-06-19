# Design — 0001 Foundation

## Architecture sketch

Astro static site. No server, no database, no API. Build pulls from a
single JSON file that is itself a symlink to a GridSilicon export.

```
grid-silicon/exports/ercot.json
        |
        v (symlink)
src/data/ercot.json
        |
        v (import at build time)
+------------------+      +-------------------+
| index.astro      |      | projects/[slug]   |
| project list     |      | per-project page  |
+------------------+      +-------------------+
        |                          |
        +-----------+--------------+
                    v
              /rss.xml generator
```

## Page templates

### index.astro

A table listing every project: name, county, nameplate MW, confidence
badge, projected year. Sortable client-side via a small no-build
JavaScript snippet; falls back to a server-rendered sort by confidence
score when JS is off.

### projects/[slug].astro

A static template that loops over `ercot.json`. For each project:

- Hero: name, county, nameplate, ConfidenceBadge component.
- Evidence: five EvidenceCard components, one per item.
- Sources: a bulleted list of citation URLs with retrieval dates.
- Status history: prior confidence scores with timestamps.

### methodology.astro

A long-form explainer of how the confidence score is computed. Cited
to the GridSilicon repo and the DEC files referenced therein.

## Components

`ConfidenceBadge.astro`: renders a 0-100 score with a color band:
0-30 red, 31-60 amber, 61-100 green. Always renders a link to
`/methodology/` per R-ATL-003.

`EvidenceCard.astro`: title, source name, source URL, retrieval date,
evidence-type tag (one of {permit, queue, equipment-order,
satellite, news}).

## RSS feed

`/rss.xml` is generated at build time by walking `ercot.json` and
diffing against the previous build's exported `data/.last_build.json`.
Entries describe the change: "Confidence raised from 42 to 51 for
Project X."

## Voice gate

`npm run check:voice` shells out to a script that:

1. Builds the site.
2. Parses every emitted HTML file with cheerio.
3. Extracts the visible text.
4. Runs the same banned-word list as the portfolio voice_lint.
5. Asserts every utility name token in the text is followed within 12
   tokens by an action verb (DEC-001 rule 2).
6. Asserts no emotional intensifiers from the DEC-001 list appear.

## Accessibility

`npm run check:a11y` builds the site then runs `axe-core` over each
emitted page through a headless browser. Violations at "serious" or
higher fail the build.
