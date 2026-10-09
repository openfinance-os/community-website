import { apiFamilyLabel, normalizeApiFamily } from './taxonomy';

export type DirectoryEnvironment = 'production' | 'sandbox';
export interface PublishedResource {
  family: string;
  rawFamily: string;
  version: string | null;
  certification: string | null;
  complete: boolean | null;
}
export interface DirectoryRecord {
  key: string;
  id: string;
  name: string;
  legalName: string;
  environment: DirectoryEnvironment;
  observedAt: string;
  source: string;
  profileUrl: string;
  issuerPublished: boolean;
  roles: string[];
  families: string[];
  resources: PublishedResource[];
}
export interface CoverageFilters {
  environment: DirectoryEnvironment | 'both';
  family: string;
  version: string;
  query: string;
  issuer: 'all' | 'published' | 'not-published';
  sort: 'name' | 'resources' | 'date';
}
export const defaultCoverageFilters: CoverageFilters = {
  environment: 'production',
  family: '',
  version: '',
  query: '',
  issuer: 'all',
  sort: 'name',
};

export function matchingResources(
  record: DirectoryRecord,
  filters: Pick<CoverageFilters, 'family' | 'version'>
) {
  return record.resources.filter(
    (resource) =>
      (!filters.family || resource.family === filters.family) &&
      (!filters.version || resource.version === filters.version)
  );
}

export function filterCoverage(
  records: DirectoryRecord[],
  filters: CoverageFilters
): DirectoryRecord[] {
  const query = filters.query.trim().toLowerCase();
  return records
    .filter((record) => {
      if (filters.environment !== 'both' && record.environment !== filters.environment)
        return false;
      if (filters.issuer !== 'all' && record.issuerPublished !== (filters.issuer === 'published'))
        return false;
      if (
        query &&
        ![record.name, record.legalName, record.id].some((value) =>
          value.toLowerCase().includes(query)
        )
      )
        return false;
      if (filters.version) return matchingResources(record, filters).length > 0;
      if (filters.family) return record.families.includes(filters.family);
      return true;
    })
    .sort((a, b) => {
      const difference =
        filters.sort === 'resources'
          ? matchingResources(b, filters).length - matchingResources(a, filters).length
          : filters.sort === 'date'
            ? b.observedAt.localeCompare(a.observedAt)
            : 0;
      return difference || a.name.localeCompare(b.name) || a.key.localeCompare(b.key);
    });
}

export function coverageFamilies(
  records: DirectoryRecord[],
  environment: CoverageFilters['environment']
) {
  return [
    ...new Set(
      records
        .filter((r) => environment === 'both' || r.environment === environment)
        .flatMap((r) => r.families)
    ),
  ].sort();
}
export function coverageVersions(
  records: DirectoryRecord[],
  filters: Pick<CoverageFilters, 'environment' | 'family'>
) {
  return [
    ...new Set(
      records
        .filter((r) => filters.environment === 'both' || r.environment === filters.environment)
        .flatMap((r) => r.resources)
        .filter((r) => !filters.family || r.family === filters.family)
        .flatMap((r) => (r.version ? [r.version] : []))
    ),
  ].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

export function readCoverageState(params: URLSearchParams, records: DirectoryRecord[]) {
  const environment = params.get('environment');
  const issuer = params.get('issuer');
  const sort = params.get('sort');
  const filters: CoverageFilters = {
    environment: environment === 'sandbox' || environment === 'both' ? environment : 'production',
    family: normalizeApiFamily(params.get('family') || ''),
    version: params.get('version') || '',
    query: (params.get('q') || '').slice(0, 200),
    issuer: issuer === 'published' || issuer === 'not-published' ? issuer : 'all',
    sort: sort === 'resources' || sort === 'date' ? sort : 'name',
  };
  if (!coverageFamilies(records, filters.environment).includes(filters.family)) filters.family = '';
  if (!coverageVersions(records, filters).includes(filters.version)) filters.version = '';
  const validKeys = new Set(records.map((record) => record.key));
  const selected = [...new Set(params.getAll('compare'))]
    .filter((key) => validKeys.has(key))
    .slice(0, 3);
  return { filters, selected };
}

export function coverageParams(filters: CoverageFilters, selected: string[]) {
  const params = new URLSearchParams();
  for (const key of ['environment', 'family', 'version', 'issuer', 'sort'] as const) {
    if (filters[key] !== defaultCoverageFilters[key]) params.set(key, filters[key]);
  }
  if (filters.query) params.set('q', filters.query);
  selected.forEach((key) => params.append('compare', key));
  return params;
}

export function resourceDescription(resource: PublishedResource) {
  return `${apiFamilyLabel(resource.family)} · version ${resource.version || 'not published'} · certification: ${resource.certification || 'not published'} · completeness: ${resource.complete === null ? 'not published' : resource.complete ? 'declared complete' : 'not declared complete'}`;
}

function csvCell(value: string) {
  // Source-controlled and upstream text must not become a spreadsheet formula.
  const safe = /^[=+\-@\t\r\n]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}
export function coverageCsv(records: DirectoryRecord[], filters: CoverageFilters) {
  const columns = [
    'registration_id',
    'name',
    'environment',
    'observed_at',
    'source',
    'profile_url',
    'issuer_published',
    'roles',
    'family',
    'raw_family',
    'version',
    'certification_declaration',
    'completeness_declaration',
    'operational_activity',
    'go_live_approval',
    'definition_version',
  ];
  const rows: string[][] = [columns];
  for (const record of filterCoverage(records, filters)) {
    const resources = matchingResources(record, filters);
    const entries: Array<PublishedResource | null> = resources.length ? resources : [null];
    for (const resource of entries)
      rows.push([
        record.id,
        record.name,
        record.environment,
        record.observedAt,
        record.source,
        `https://openfinance-os.org${record.profileUrl}`,
        String(record.issuerPublished),
        record.roles.join(' | '),
        resource?.family || filters.family || '',
        resource?.rawFamily || '',
        resource?.version || '',
        resource?.certification || '',
        resource?.complete === null || !resource ? '' : String(resource.complete),
        'Unknown in directory dataset',
        'Unknown in directory dataset',
        '2026-10-08',
      ]);
  }
  return rows.map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
