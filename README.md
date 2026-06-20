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
