# SiteAtlas

Free public atlas showing the GridSilicon dataset in human-readable
form: every announced US data center, the five evidence items behind
its energization confidence, the projected energization date, and a
community comment layer.

## What this is

A static Astro site downstream of the `grid-silicon` repo. The atlas is
a civic-data artifact for local journalists, county supervisors, PUC
commissioners, ratepayer advocates, and community organizers in NoVA,
Memphis, central Texas, and Phoenix.

The first slice covers ERCOT large-load queue projects only. Each
project gets a page: the announced nameplate, the GridSilicon
confidence score (0-100), the five evidence items behind the score, the
projected energization year, and the source citations.

There is an RSS feed of status changes. There is a community comment
layer (moderated, opt-in identity, no anonymous submissions). The voice
charter sits between utility-PR register and activist register; the
DEC-001 decision file pins the voice rules.

## live demo

`npm run build` emits the static site to `dist/`. Vercel auto-detects Astro
and serves that output directory, so deploy needs no extra config.

1. push this repo to GitHub (already at `AthenaTheOwl/site-atlas`).
2. go to vercel.com, sign in, click Add New -> Project.
3. import the `AthenaTheOwl/site-atlas` repo.
4. leave the framework preset on Astro and the output directory on `dist`.
5. click Deploy.

<!-- live-url: TODO replace after first deploy, e.g. https://site-atlas.vercel.app -->

## Status

v0.1 ships: the index page, per-project page template, methodology
page, voice gate, and a synthetic ERCOT fixture at
`src/data/ercot.fixture.json`. The real GridSilicon symlink is deferred
to v0.2 (the fixture file at the same path is replaced or symlinked;
the loader import path stays put). Spec 0003 lands the RSS generator,
broken-link gate, and accessibility audit.

## How to run

Requires Node 20 or newer (pinned in `package.json` `engines`).

```bash
npm install
npm run dev
npm run build
npm run check:voice
```

`check:a11y` and `check:links` are deferred to spec 0003.

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

The point: a lot of announced queue capacity is thinly sourced. The report ranks
projects by how much of their announced MW the confidence score does not yet
support, so a reader sees which announcements are on the public record and which
are still closer to rumor.

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

## Voice charter

The voice charter (DEC-001, lands in PR 1) pins three rules:

1. Every confidence score has a method link.
2. No utility names appear without an action verb attached (no
   "Dominion-owned"; instead "Dominion filed the interconnection request
   on YYYY-MM-DD").
3. No emotional intensifiers ("alarming", "staggering", "shocking").

## License

MIT for the site code. Data layer follows GridSilicon's data license
(documented when the symlink lands in spec 0002).
