#!/usr/bin/env node
// scripts/voice_lint.mjs
// Implements the 8 steps from specs/0002-design/design.md B5.
// All rule lists come from decisions/voice-charter.json (B6).

import {
  readFileSync,
  existsSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { resolve, join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import * as cheerio from 'cheerio';

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, '..');
const charterPath = resolve(projectRoot, 'decisions/voice-charter.json');
const distDir = resolve(projectRoot, 'dist');

function bail(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}

// Step 1. Read the voice charter into memory.
if (!existsSync(charterPath)) {
  bail(
    'voice gate: decisions/voice-charter.json missing; see specs/0002-design/design.md B6',
    2
  );
}
let charter;
try {
  charter = JSON.parse(readFileSync(charterPath, 'utf8'));
} catch (err) {
  bail(
    `voice gate: decisions/voice-charter.json malformed (${err.message}); see specs/0002-design/design.md B6`,
    2
  );
}
for (const key of [
  'banned_words',
  'utility_tokens',
  'action_verbs',
  'emotional_intensifiers',
]) {
  if (!Array.isArray(charter[key])) {
    bail(
      `voice gate: charter missing list '${key}'; see specs/0002-design/design.md B6`,
      2
    );
  }
}

const lower = (s) => String(s).toLowerCase();
const bannedSet = new Set(charter.banned_words.map(lower));
const intensifiersSet = new Set(charter.emotional_intensifiers.map(lower));
const utilitySet = new Set(charter.utility_tokens.map(lower));
const verbSet = new Set(charter.action_verbs.map(lower));

// Step 2. Run astro build to populate dist/.
const isWindows = process.platform === 'win32';
const buildCmd = isWindows ? 'npx.cmd' : 'npx';
const build = spawnSync(buildCmd, ['astro', 'build'], {
  stdio: 'inherit',
  cwd: projectRoot,
});
if (build.status !== 0) {
  bail('voice gate: astro build failed', build.status ?? 1);
}

if (!existsSync(distDir)) {
  bail('voice gate: dist/ missing after build', 1);
}

// Step 3. Walk every .html under dist/.
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) out.push(...walk(full));
    else if (entry.endsWith('.html')) out.push(full);
  }
  return out;
}

const htmlFiles = walk(distDir);

function tokenize(text) {
  return text
    .split(/\s+/)
    .map((t) => t.replace(/[.,;:!?()"'`\[\]{}]+$/g, '').replace(/^[.,;:!?()"'`\[\]{}]+/, ''))
    .filter(Boolean);
}

// Hyphens and slashes join a head noun to a modifier ("Dominion-owned",
// "co-located"). Returning the segments lets the rule sets match each
// piece so a utility name cannot hide inside a compound (DEC-001 rule 2).
function segments(token) {
  return token.split(/[-/]+/).filter(Boolean);
}

function locate(raw, needle) {
  if (!needle) return { line: 1, col: 1 };
  const lc = raw.toLowerCase();
  const idx = lc.indexOf(lower(needle));
  if (idx < 0) return { line: 1, col: 1 };
  let line = 1;
  let col = 1;
  for (let i = 0; i < idx; i++) {
    if (raw[i] === '\n') {
      line++;
      col = 1;
    } else {
      col++;
    }
  }
  return { line, col };
}

function violate(file, raw, needle, message) {
  const { line, col } = locate(raw, needle);
  bail(`${relative(projectRoot, file)}:${line}:${col}: ${message}`, 1);
}

let scanned = 0;

for (const file of htmlFiles) {
  const raw = readFileSync(file, 'utf8');
  // Step 4. Parse with cheerio; extract visible text.
  const $ = cheerio.load(raw);
  $('script,style,noscript').remove();
  const text = ($('body').text() || '').trim();
  if (!text) {
    console.warn(`note: ${relative(projectRoot, file)}: no visible text`);
    scanned++;
    continue;
  }

  const tokens = tokenize(text);
  const lowerTokens = tokens.map(lower);
  const tokenSegments = lowerTokens.map(segments);

  // Step 5. Apply banned_words against whole whitespace-bounded tokens so
  // multi-segment entries like "best-in-class" still match intact.
  for (let i = 0; i < lowerTokens.length; i++) {
    if (bannedSet.has(lowerTokens[i])) {
      violate(file, raw, tokens[i], `banned term '${tokens[i]}'`);
    }
  }

  // Step 6. utility_tokens must be followed within 12 tokens by an action_verb.
  // Segment-aware match so "Dominion-owned" surfaces "Dominion".
  for (let i = 0; i < lowerTokens.length; i++) {
    const utilityHit = tokenSegments[i].find((s) => utilitySet.has(s));
    if (!utilityHit) continue;
    const end = Math.min(lowerTokens.length, i + 13);
    let found = false;
    for (let j = i + 1; j < end; j++) {
      if (tokenSegments[j].some((s) => verbSet.has(s))) {
        found = true;
        break;
      }
    }
    if (!found) {
      violate(
        file,
        raw,
        utilityHit,
        `utility token '${utilityHit}' not followed within 12 tokens by an action verb (DEC-001 rule 2)`
      );
    }
  }

  // Step 7. No emotional_intensifiers anywhere. Segment-aware so an
  // intensifier hidden in a compound modifier still trips the rule.
  for (let i = 0; i < lowerTokens.length; i++) {
    const intensifierHit = tokenSegments[i].find((s) => intensifiersSet.has(s));
    if (intensifierHit) {
      violate(
        file,
        raw,
        intensifierHit,
        `emotional intensifier '${intensifierHit}' (DEC-001 rule 3)`
      );
    }
  }

  // Step 8. Every page that renders a ConfidenceBadge must contain a
  // link whose href ends in /methodology/.
  if ($('.confidence-badge').length > 0) {
    const hasMethodLink = $('a')
      .toArray()
      .some((a) => {
        const href = $(a).attr('href') || '';
        return href.endsWith('/methodology/') || href.endsWith('/methodology');
      });
    if (!hasMethodLink) {
      violate(
        file,
        raw,
        'confidence-badge',
        'page renders ConfidenceBadge but contains no link ending in /methodology/ (DEC-001 rule 1)'
      );
    }
  }

  scanned++;
}

console.log(`OK: ${scanned} pages scanned`);
process.exit(0);
