// The fixture is imported statically so Vite/Astro bundles it deterministically
// at build time. v0.2 swaps the real GridSilicon export in by replacing the
// file at this path (or symlinking it); the import path stays put.
import fixtureData from '../data/ercot.fixture.json';

export type EvidenceType =
  | 'permit'
  | 'queue'
  | 'equipment_order'
  | 'satellite'
  | 'news';

export type Status =
  | 'queued'
  | 'under_construction'
  | 'energized'
  | 'withdrawn';

export interface Evidence {
  type: EvidenceType;
  title: string;
  source_name: string;
  source_url: string;
  retrieved_on: string;
}

export interface Citation {
  source_name: string;
  source_url: string;
}

export interface Project {
  slug: string;
  name: string;
  county: string;
  state: string;
  nameplate_mw: number;
  confidence_score: number;
  projected_year: number;
  status: Status;
  evidence: Evidence[];
  citations: Citation[];
}

const REQUIRED_PROJECT_FIELDS = [
  'slug',
  'name',
  'county',
  'state',
  'nameplate_mw',
  'confidence_score',
  'projected_year',
  'status',
  'evidence',
] as const;

const REQUIRED_EVIDENCE_FIELDS = [
  'type',
  'title',
  'source_name',
  'source_url',
  'retrieved_on',
] as const;

const VALID_STATUSES: Status[] = [
  'queued',
  'under_construction',
  'energized',
  'withdrawn',
];

const VALID_EVIDENCE_TYPES: EvidenceType[] = [
  'permit',
  'queue',
  'equipment_order',
  'satellite',
  'news',
];

function fail(slug: string, field: string, reason: string): never {
  throw new Error(`${slug}: ${field}: ${reason}`);
}

let cache: Project[] | null = null;

export function loadProjects(): Project[] {
  if (cache) return cache;

  const parsed: unknown = fixtureData;

  if (!Array.isArray(parsed)) {
    throw new Error(
      `<loader>: src/data/ercot.fixture.json: top-level value must be an array of projects`
    );
  }

  const seenSlugs = new Set<string>();
  const projects: Project[] = [];

  for (const row of parsed) {
    if (typeof row !== 'object' || row === null) {
      throw new Error(`<loader>: row: each project must be an object`);
    }
    const p = row as Record<string, unknown>;
    const slug =
      typeof p.slug === 'string' && p.slug.length > 0 ? p.slug : '<unknown>';

    for (const field of REQUIRED_PROJECT_FIELDS) {
      if (!(field in p)) fail(slug, field, 'missing required field');
    }

    if (typeof p.slug !== 'string' || p.slug.length === 0) {
      fail(slug, 'slug', 'must be a non-empty string');
    }
    if (seenSlugs.has(p.slug as string)) {
      fail(slug, 'slug', 'duplicate slug');
    }
    seenSlugs.add(p.slug as string);

    if (typeof p.name !== 'string') fail(slug, 'name', 'must be a string');
    if (typeof p.county !== 'string') fail(slug, 'county', 'must be a string');
    if (typeof p.state !== 'string') fail(slug, 'state', 'must be a string');
    if (typeof p.nameplate_mw !== 'number') {
      fail(slug, 'nameplate_mw', 'must be a number');
    }
    if (
      typeof p.confidence_score !== 'number' ||
      !Number.isInteger(p.confidence_score)
    ) {
      fail(slug, 'confidence_score', 'must be an integer');
    }
    const score = p.confidence_score as number;
    if (score < 0 || score > 100) {
      fail(slug, 'confidence_score', 'must be in range 0..100');
    }
    if (
      typeof p.projected_year !== 'number' ||
      !Number.isInteger(p.projected_year)
    ) {
      fail(slug, 'projected_year', 'must be an integer');
    }
    if (!VALID_STATUSES.includes(p.status as Status)) {
      fail(
        slug,
        'status',
        `unknown status (expected one of ${VALID_STATUSES.join(', ')})`
      );
    }
    if (!Array.isArray(p.evidence)) {
      fail(slug, 'evidence', 'must be an array');
    }

    for (const ev of p.evidence as unknown[]) {
      if (typeof ev !== 'object' || ev === null) {
        fail(slug, 'evidence', 'each item must be an object');
      }
      const e = ev as Record<string, unknown>;
      for (const f of REQUIRED_EVIDENCE_FIELDS) {
        if (!(f in e)) fail(slug, `evidence.${f}`, 'missing required field');
      }
      if (!VALID_EVIDENCE_TYPES.includes(e.type as EvidenceType)) {
        fail(
          slug,
          'evidence.type',
          `unknown type (expected one of ${VALID_EVIDENCE_TYPES.join(', ')})`
        );
      }
      for (const f of ['title', 'source_name', 'source_url', 'retrieved_on'] as const) {
        if (typeof e[f] !== 'string' || (e[f] as string).length === 0) {
          fail(slug, `evidence.${f}`, 'must be a non-empty string');
        }
      }
    }

    const citations: Citation[] = Array.isArray(p.citations)
      ? (p.citations as Citation[])
      : [];

    projects.push({
      slug: p.slug as string,
      name: p.name as string,
      county: p.county as string,
      state: p.state as string,
      nameplate_mw: p.nameplate_mw as number,
      confidence_score: score,
      projected_year: p.projected_year as number,
      status: p.status as Status,
      evidence: p.evidence as Evidence[],
      citations,
    });
  }

  cache = projects;
  return projects;
}
