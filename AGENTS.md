# AGENTS.md — site-atlas

Operating contract for AI agents working in this repo.

## What this repo is

A civic-data static site. The data layer is GridSilicon. The site's job
is to make the data legible to non-experts without losing the
provenance or the uncertainty. Voice register matters as much as
accuracy.

## Roles you may see in tasks

| Role | What they do |
|---|---|
| `data-binder` | Maintains the symlink and the per-page data adapter |
| `page-author` | Owns the index page and per-project template |
| `voice-reviewer` | Enforces DEC-001 charter on every render |
| `accessibility-checker` | Runs axe-core on every page in CI |
| `feed-publisher` | Generates and validates the status-change RSS feed |

Not all roles are implemented in v0.

## Voice constraints

- No marketing words. No "leverage", "synergy", "best-in-class",
  "seamless", "cutting-edge".
- No antithetical reversals as a structural device.
- No emotional intensifiers per DEC-001.
- No utility names without an action verb (DEC-001 rule 2).
- Every confidence score links to the methodology page.

## Gates (will land in spec 0002)

```bash
npm run check:voice       # voice_lint over rendered HTML
npm run check:links       # broken-link scan
npm run check:a11y        # axe-core over every page
npm run build             # production build succeeds
```

A page that fails any gate is not deployed.

## Out of scope

- States beyond ERCOT for v0. Expansion is demand-pulled.
- Real-time updates. Daily build at most.
- A native app. Browser only.
- A user-account system. Comment moderation happens out-of-band.
