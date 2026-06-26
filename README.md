# site-atlas

Five ERCOT projects announce 2,610 megawatts. The confidence scores back 1,645. The
other 965 — 37% of the headline — sit on the public record as something closer to
rumor than load. site-atlas puts each one on a page anyone can read.

## What it does

[grid-silicon](https://github.com/AthenaTheOwl/grid-silicon) scores how real an
announced data center is and stops there, in a terminal. site-atlas is the front
door over the same dataset: a static Astro site that gives every announced project
its own page — the nameplate, the 0-to-100 confidence score, the five sourced
pieces of evidence behind it, the projected energization year, the citations. The
first slice is the ERCOT large-load queue.

It is built for the people who get the bill and the buildout: local journalists,
county supervisors, PUC commissioners, ratepayer advocates, organizers. So the
register is pinned. The DEC-001 voice charter holds three rules: every confidence
score carries a method link, no utility name appears without an action verb attached
(not "Dominion-owned" but "Dominion filed the interconnection request on
YYYY-MM-DD"), and no emotional intensifiers — "alarming," "staggering," "shocking"
all fail the gate. The site is allowed to be exact and not allowed to editorialize.

## try it

No-arg, read-only, offline. `npm run build` produces the visual atlas under
`dist/` (open `dist/index.html`): the project list, per-project evidence pages,
and the methodology page. For a terminal-only answer, `npm run report` reads the
committed ERCOT fixture and ranks projects by uncertain MW — announced nameplate
minus the confidence-weighted likely figure:

```
$ npm run report

site-atlas — ercot large-load queue, announced vs likely MW
5 project(s), ranked by uncertain MW (announced minus confidence-weighted likely)

project                     county       announced   likely  uncertain   conf  band
Caddo Fork Energy Park      Bowie            720MW    317MW      403MW     44  amber
Bluestem Bend Hyperscale    Hood             350MW     77MW      273MW     22  red
...
biggest gap: Caddo Fork Energy Park in Bowie county, TX — 720MW announced but only
317MW likely at confidence 44/100 (2 evidence row(s), amber band).
across the queue, 965MW of 2610MW announced (37%) is still low-confidence.
```

A lot of announced queue capacity is thinly sourced. The report ranks projects by
how much of their announced MW the confidence score does not yet support, so a
reader sees which announcements are on the public record and which are still closer
to rumor.

## live demo

`npm run build` emits the static site to `dist/`. Vercel auto-detects Astro
and serves that output directory, so deploy needs no extra config.

1. push this repo to GitHub (already at `AthenaTheOwl/site-atlas`).
2. go to vercel.com, sign in, click Add New -> Project.
3. import the `AthenaTheOwl/site-atlas` repo.
4. leave the framework preset on Astro and the output directory on `dist`.
5. click Deploy.

<!-- live-url: TODO replace after first deploy, e.g. https://site-atlas.vercel.app -->

## How it connects

site-atlas is the civic-data face of the energy line. Upstream and across:

- [grid-silicon](https://github.com/AthenaTheOwl/grid-silicon) — the scorer that
  decides how real a project is. This site renders its output.
- [interconnect-alpha](https://github.com/AthenaTheOwl/interconnect-alpha) — the
  survival model: probability a queued project ever reaches commercial operation.
- [ratepayer-exposure](https://github.com/AthenaTheOwl/ratepayer-exposure) — what
  the same buildout does to one household's power bill.

## How to run

Requires Node 20 or newer (pinned in `package.json` `engines`).

```bash
npm install
npm run dev
npm run build
npm run check:voice
```

`check:a11y` and `check:links` are deferred to spec 0003.

## Status

v0.1 ships: the index page, per-project page template, methodology page, voice gate,
and a synthetic ERCOT fixture at `src/data/ercot.fixture.json`. The real grid-silicon
symlink is deferred to v0.2 (the fixture file at the same path is replaced or
symlinked; the loader import path stays put). Spec 0003 lands the RSS generator,
broken-link gate, and accessibility audit.

## Layout

```
site-atlas/
  src/
    pages/
      index.astro                  # ERCOT project list
      projects/[slug].astro        # per-project page
      methodology.astro            # how the confidence score works
    components/
      EvidenceCard.astro
      ConfidenceBadge.astro
    data/
      ercot.fixture.json           # v0.1 synthetic fixture; v0.2 will symlink to the grid-silicon export
  public/
    rss.xml                        # generated, gitignored
  decisions/
    DEC-001-civic-voice-charter.md
  specs/0001-foundation/
  docs/first-pr.md
  AGENTS.md
  LICENSE
  README.md
```

## License

MIT for the site code. Data layer follows grid-silicon's data license (documented
when the symlink lands in spec 0002).
