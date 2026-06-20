# DEC-001 — civic voice charter

The rule lists this document narrates live in
`decisions/voice-charter.json`. That JSON is the executable source of
truth for the voice gate (`scripts/voice_lint.mjs` step 1); editing
the JSON is the only way to change gate behavior. This markdown
explains the rules; the JSON enforces them.

## Why a charter

SiteAtlas sits between two failure modes. On one side: utility press
releases that treat every gigawatt of new load as a partnership
opportunity. On the other side: activist copy that treats every
gigawatt as a crisis. Either register loses civic readers. The
charter pins three rules so the prose stays inside the gap.

## The three rules

### Rule 1. Every confidence score has a method link.

Anywhere a confidence score appears on a page, the page must also
contain a link whose href ends in `/methodology/`. The
`ConfidenceBadge` component already wraps its score in such a link,
so any page that renders the component satisfies the rule by
construction. The voice gate verifies this at build time.

### Rule 2. No utility name without an action verb attached.

A utility name token (the list in `voice-charter.json`'s
`utility_tokens`) must be followed within 12 tokens by a verb from
`action_verbs`. The bad version: "Dominion-owned site." The good
version: "Dominion filed the interconnection request on 2025-04-12."
The verb anchors the claim to a specific, checkable action.

### Rule 3. No emotional intensifiers.

Words from `emotional_intensifiers` are banned outright. They invite
the reader to feel before they read. If a project is genuinely large,
the nameplate number says so without help.

## Banned-word list

The `banned_words` list catches generic business jargon
("leverage", "synergy", "best-in-class") that is neither civic nor
factual. The list grows as cases come up; entries should be obvious
on inspection.

## How edits work

1. Open `decisions/voice-charter.json`.
2. Add or remove a word from the relevant list.
3. Run `npm run check:voice` locally; fix violations or revert.
4. Update this markdown if the rule shape changes (not the word
   list — the JSON is the source of truth for word membership).
