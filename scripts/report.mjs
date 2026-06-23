#!/usr/bin/env node
// scripts/report.mjs
// No-arg, read-only, offline. Reads the committed ERCOT fixture and prints a
// ranked, human-readable summary to the terminal: announced nameplate MW vs the
// confidence-weighted "likely" MW, and the gap between them (uncertain MW).
//
// This is the terminal-shaped companion to `npm run build` (the visual atlas).
// It answers one question without opening a browser: how much announced
// data-center load in the queue is still low-confidence?

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, '..');
const fixturePath = resolve(projectRoot, 'src/data/ercot.fixture.json');

function band(score) {
  if (score <= 30) return 'red';
  if (score <= 60) return 'amber';
  return 'green';
}

export function buildReport(projects) {
  const rows = projects.map((p) => {
    const likely = Math.round((p.nameplate_mw * p.confidence_score) / 100);
    const uncertain = p.nameplate_mw - likely;
    return {
      name: p.name,
      county: p.county,
      state: p.state,
      nameplate: p.nameplate_mw,
      confidence: p.confidence_score,
      likely,
      uncertain,
      band: band(p.confidence_score),
      status: p.status,
      evidence: Array.isArray(p.evidence) ? p.evidence.length : 0,
    };
  });

  rows.sort((a, b) => b.uncertain - a.uncertain || a.name.localeCompare(b.name));

  const totals = rows.reduce(
    (acc, r) => {
      acc.nameplate += r.nameplate;
      acc.likely += r.likely;
      acc.uncertain += r.uncertain;
      return acc;
    },
    { nameplate: 0, likely: 0, uncertain: 0 }
  );

  return { rows, totals };
}

function pad(s, n) {
  s = String(s);
  return s.length >= n ? s : s + ' '.repeat(n - s.length);
}

function padStart(s, n) {
  s = String(s);
  return s.length >= n ? s : ' '.repeat(n - s.length) + s;
}

export function renderReport(projects) {
  const { rows, totals } = buildReport(projects);
  const lines = [];

  lines.push('site-atlas — ercot large-load queue, announced vs likely MW');
  lines.push(
    `${rows.length} project(s), ranked by uncertain MW (announced minus confidence-weighted likely)`
  );
  lines.push('');

  const header =
    pad('project', 28) +
    pad('county', 11) +
    padStart('announced', 11) +
    padStart('likely', 9) +
    padStart('uncertain', 11) +
    padStart('conf', 7) +
    '  ' +
    pad('band', 7) +
    'status';
  lines.push(header);
  lines.push('-'.repeat(header.length));

  for (const r of rows) {
    lines.push(
      pad(r.name, 28) +
        pad(r.county, 11) +
        padStart(`${r.nameplate}MW`, 11) +
        padStart(`${r.likely}MW`, 9) +
        padStart(`${r.uncertain}MW`, 11) +
        padStart(`${r.confidence}`, 7) +
        '  ' +
        pad(r.band, 7) +
        r.status.replace('_', ' ')
    );
  }

  lines.push('-'.repeat(header.length));
  lines.push(
    pad('TOTAL', 28) +
      pad('', 11) +
      padStart(`${totals.nameplate}MW`, 11) +
      padStart(`${totals.likely}MW`, 9) +
      padStart(`${totals.uncertain}MW`, 11)
  );
  lines.push('');

  const top = rows[0];
  const pct =
    totals.nameplate > 0
      ? Math.round((totals.uncertain / totals.nameplate) * 100)
      : 0;
  lines.push(
    `biggest gap: ${top.name} in ${top.county} county, ${top.state} — ` +
      `${top.nameplate}MW announced but only ${top.likely}MW likely at confidence ` +
      `${top.confidence}/100 (${top.evidence} evidence row(s), ${top.band} band).`
  );
  lines.push(
    `across the queue, ${totals.uncertain}MW of ${totals.nameplate}MW announced ` +
      `(${pct}%) is still low-confidence.`
  );

  return lines.join('\n');
}

function main() {
  let projects;
  try {
    projects = JSON.parse(readFileSync(fixturePath, 'utf8'));
  } catch (err) {
    console.error(`report: cannot read ${fixturePath}: ${err.message}`);
    process.exit(1);
  }
  if (!Array.isArray(projects) || projects.length === 0) {
    console.error('report: fixture must be a non-empty array of projects');
    process.exit(1);
  }
  console.log(renderReport(projects));
  process.exit(0);
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
const selfPath = fileURLToPath(import.meta.url);
if (invokedPath === selfPath) {
  main();
}
