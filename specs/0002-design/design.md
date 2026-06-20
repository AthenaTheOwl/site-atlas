# Design — 0002 Design (v0.1)

## Architecture sketch

Astro static site. No server, no database, no network at build time.
Build pulls from a checked-in JSON fixture through a typed loader.

```
src/data/ercot.fixture.json   (synthetic, committed)
        |
        v (import via load-projects.ts)
+--------------------+
| src/lib/           |
|   load-projects.ts |  (parse + validate; throws on bad rows)
+--------------------+
        |
        +------------------+----------------------+
        v                  v                      v
+----------------+  +-------------------+  +-----------------+
| index.astro    |  | projects/[slug]   |  | methodology     |
| project table  |  | per-project page  |  | static explainer|
+----------------+  +-------------------+  +-----------------+
        |                  |
        v                  v
   ConfidenceBadge    EvidenceCard
        |
        v
  scripts/voice_lint.mjs  (post-build, walks dist/)
```

## Block decomposition

### B1. data fixture — `src/data/ercot.fixture.json`

A static JSON file committed to the repo. Synthetic but
schema-realistic; field names match the planned GridSilicon export.

Schema (one entry per project):

```jsonc
{
  "slug": "string, url-safe, unique",
  "name": "string",
  "county": "string",
  "state": "TX",
  "nameplate_mw": "number",
  "confidence_score": "integer 0..100",
  "projected_year": "integer YYYY",
  "status": "queued | under_construction | energized | withdrawn",
  "evidence": [
    {
      "type": "permit | queue | equipment_order | satellite | news",
      "title": "string",
      "source_name": "string",
      "source_url": "string (https)",
      "retrieved_on": "string YYYY-MM-DD"
    }
  ],
  "citations": [{ "source_name": "string", "source_url": "string" }]
}
```

**Failure modes.** File missing, file unparseable JSON, schema drift
once the real GridSilicon export lands. v0.1 handles the first two in
B2; schema drift is out of scope until the export is real.

### B2. data adapter — `src/lib/load-projects.ts`

A small typed loader. Reads the fixture path from
`astro.config.mjs`'s `DATA_SOURCE` constant (default
`./src/data/ercot.fixture.json`). Validates each row against the
schema in B1. Throws a build-time error naming the offending slug and
field on any failure.

Interface:

```ts
export type Project = { /* fields from B1 */ };
export function loadProjects(): Project[];
```

**Failure modes.** The loader rejects each of the following by
throwing with a message of the form `<slug>: <field>: <reason>`:

- missing required field from { `slug`, `name`, `county`, `state`,
  `nameplate_mw`, `confidence_score`, `projected_year`, `status`,
  `evidence` };
- duplicate `slug` across rows;
- `confidence_score` outside 0..100 or non-integer;
- `status` not in { queued, under_construction, energized, withdrawn };
- evidence `type` not in { permit, queue, equipment_order, satellite,
  news };
- evidence missing required sub-field from { `type`, `title`,
  `source_name`, `source_url`, `retrieved_on` }.

All failures fail the build; no silent fallback. `evidence` may be an
empty array; B4 handles the empty-state render.

### B3. page templates

- `src/pages/index.astro`: table of every project (name, county,
  nameplate, confidence badge, projected year). Server-rendered,
  sorted by `confidence_score` descending with `slug` ascending as
  tie-breaker per R-ATL-V1-013. No JS required.
- `src/pages/projects/[slug].astro`: dynamic route emitting one HTML
  page per project. Loops `loadProjects()` and calls
  `getStaticPaths`.
- `src/pages/methodology.astro`: long-form explainer. Hand-authored
  copy; cites the GridSilicon repo and DEC-001.

**Failure modes.** A project without a `slug` is rejected by B2
before it reaches the route. An evidence array of length zero
renders an explicit "no evidence on file" note rather than an empty
list (handled in B4 EvidenceCard's empty-state branch).

### B4. components

- `src/components/ConfidenceBadge.astro`: 0–100 score, color band
  (0–30 red, 31–60 amber, 61–100 green), wraps an `<a href="/methodology/">`
  per R-ATL-V1-003. No JS.
- `src/components/EvidenceCard.astro`: title, source name (text),
  source URL (link), retrieval date, evidence-type tag. When the
  enclosing project has zero evidence items, the project page renders
  a single "no evidence on file" placeholder instead of a card.

**Failure modes.** Missing `source_url` is impossible (B2 rejects);
missing `retrieved_on` likewise. Out-of-range score is impossible
(B2 rejects). The badge component does not need to defend against
bad input from B2.

### B5. voice gate — `scripts/voice_lint.mjs`

Node script. All rule lists are loaded from
`decisions/voice-charter.json` at startup; nothing is hard-coded in
the script. Steps:

1. Read `decisions/voice-charter.json` into memory; abort with a
   pointer to B6 if the file is missing or malformed.
2. Run `astro build` to populate `dist/`.
3. Walk every `.html` under `dist/`.
4. Parse each file with cheerio; extract visible text.
5. Apply the `banned_words` list from the JSON.
6. Apply DEC-001 rule 2: every token in `utility_tokens` is followed
   within 12 tokens by a verb from `action_verbs`.
7. Apply DEC-001 rule 3: no token from `emotional_intensifiers`
   appears.
8. Apply DEC-001 rule 1: assert every page that renders a
   ConfidenceBadge contains a link whose `href` ends in
   `/methodology/`.

Exit zero on clean; exit non-zero with file:line on the first
violation. Output `OK: <n> pages scanned` on success.

**Failure modes.** `dist/` missing → script runs `astro build` first,
so this is a build failure, not a lint failure. A page with no visible
text (e.g. a stray empty layout) is logged but not failed.

### B6. voice charter — `decisions/DEC-001-civic-voice-charter.md` + `decisions/voice-charter.json`

Two files, one source of truth:

- `decisions/voice-charter.json` — machine-readable lists:
  ```jsonc
  {
    "banned_words": ["leverage", "synergy", "best-in-class", ...],
    "utility_tokens": ["Dominion", "Oncor", "AEP", ...],
    "action_verbs": ["filed", "requested", "withdrew", ...],
    "emotional_intensifiers": ["alarming", "staggering", ...]
  }
  ```
  This is the file the voice gate reads at runtime (B5 step 1) and
  the only place the lists live.
- `decisions/DEC-001-civic-voice-charter.md` — human narrative of
  the three rules from README, with a one-line pointer to the JSON
  ("rule lists live in `decisions/voice-charter.json`; edits to the
  JSON are the only way to change gate behavior").

**Failure mode.** Drift between the markdown narrative and the JSON.
Reduced because the JSON is the executable source of truth; the
markdown is descriptive prose. The markdown SHOULD reference the
JSON in its first paragraph so a reader who edits one is reminded of
the other; this is a documentation convention, not a build-time
check.

### B7. build orchestration — `package.json`, `astro.config.mjs`

`package.json` scripts:

- `dev` → `astro dev`
- `build` → `astro build`
- `check:voice` → `node scripts/voice_lint.mjs`

`astro.config.mjs` exports a `DATA_SOURCE` constant. v0.1 sets it to
`./src/data/ercot.fixture.json`. v0.2 changes it to the symlink path
without touching any other file.

**Failure modes.** Node version mismatch → documented minimum in
README (Node 20+). Astro version drift → pinned in `package.json`.

## External dependencies

| dep | use | license | failure if compromised |
|---|---|---|---|
| `astro` | static site builder | MIT | rebuild from prior tag |
| `cheerio` | HTML parsing in voice gate | MIT | voice gate fails closed |

Both dependencies are pinned to an exact version in `package.json`
(implementation choice; tracked in PR 1). Node minimum is 20 per
R-ATL-V1-014. No network calls at build time. No keys, no secrets.
Fixture is synthetic and committed.

## Out of scope for v0.1

- RSS status-change feed (`/rss.xml`).
- axe-core a11y gate.
- Broken-link gate.
- Real GridSilicon symlink.
- Status history rendering.
- Sortable index with client-side JS.
- Community comment layer.
- States beyond ERCOT.
- Map visualization.
- GitHub Action / CI wiring.
