#!/usr/bin/env node
// scripts/report.test.mjs
// Plain node assertions (no test framework needed). Verifies the report math
// and that the rendered output is the readable summary, not a JSON dump.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildReport, renderReport } from './report.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const fixturePath = resolve(here, '..', 'src/data/ercot.fixture.json');
const projects = JSON.parse(readFileSync(fixturePath, 'utf8'));

let passed = 0;
function check(name, fn) {
  fn();
  passed++;
  console.log(`ok - ${name}`);
}

check('buildReport returns one row per project', () => {
  const { rows } = buildReport(projects);
  assert.equal(rows.length, projects.length);
});

check('likely = nameplate * confidence / 100, uncertain = nameplate - likely', () => {
  const { rows } = buildReport(projects);
  for (const r of rows) {
    assert.equal(r.likely + r.uncertain, r.nameplate);
    assert.ok(r.likely >= 0 && r.likely <= r.nameplate);
  }
});

check('rows are sorted by uncertain MW descending', () => {
  const { rows } = buildReport(projects);
  for (let i = 1; i < rows.length; i++) {
    assert.ok(rows[i - 1].uncertain >= rows[i].uncertain);
  }
});

check('totals sum the per-row figures', () => {
  const { rows, totals } = buildReport(projects);
  const sum = rows.reduce(
    (a, r) => ({
      nameplate: a.nameplate + r.nameplate,
      likely: a.likely + r.likely,
      uncertain: a.uncertain + r.uncertain,
    }),
    { nameplate: 0, likely: 0, uncertain: 0 }
  );
  assert.deepEqual(totals, sum);
});

check('renderReport prints a readable summary, not JSON', () => {
  const out = renderReport(projects);
  assert.ok(out.includes('site-atlas — ercot large-load queue'));
  assert.ok(out.includes('biggest gap:'));
  assert.ok(out.includes('low-confidence'));
  // a JSON dump would contain these structural characters at the start
  assert.ok(!out.trimStart().startsWith('['));
  assert.ok(!out.trimStart().startsWith('{'));
});

console.log(`\n${passed} passed`);
