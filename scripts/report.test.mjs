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

check('invalid capacity and confidence cannot produce a misleading total', () => {
  for (const nameplate_mw of [-1, NaN, Infinity, '100']) {
    assert.throws(() => buildReport([{ ...projects[0], nameplate_mw }]), /nameplate_mw/);
  }
  for (const confidence_score of [-1, 101, 50.5, NaN, Infinity, '50']) {
    assert.throws(() => buildReport([{ ...projects[0], confidence_score }]), /confidence_score/);
  }
});

check('zero capacity and confidence endpoints remain valid', () => {
  const { rows } = buildReport([
    { ...projects[0], nameplate_mw: 0, confidence_score: 0 },
    { ...projects[0], nameplate_mw: 100, confidence_score: 100 },
  ]);
  assert.equal(rows.find((r) => r.nameplate === 0).likely, 0);
  assert.equal(rows.find((r) => r.nameplate === 100).likely, 100);
});

check('fractional MW rounds to whole MW in both directions', () => {
  for (const [nameplate_mw, nameplate] of [[0.7, 1], [1.3, 1], [2.4, 2], [0.4, 0]]) {
    const { rows } = buildReport([{ ...projects[0], nameplate_mw, confidence_score: 100 }]);
    assert.equal(rows[0].nameplate, nameplate);
    assert.equal(rows[0].likely, nameplate);
    assert.equal(rows[0].uncertain, 0);
  }
  const { rows } = buildReport([{ ...projects[0], nameplate_mw: 1.3, confidence_score: 50 }]);
  assert.ok(Number.isInteger(rows[0].likely) && Number.isInteger(rows[0].uncertain));
  assert.ok(rows[0].likely <= rows[0].nameplate);
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
