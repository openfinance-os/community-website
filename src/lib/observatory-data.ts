import production from '../../data/observatory/snapshots/production/latest.json';
import sandbox from '../../data/observatory/snapshots/sandbox/latest.json';
import type { ObservatorySnapshot } from '../../scripts/types/participant';
import { participantUrl } from './participant-identity';
import { normalizeApiFamily } from './taxonomy';
import type { DirectoryEnvironment, DirectoryRecord, PublishedResource } from './coverage';

const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
const strings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

/** Current snapshots must have real source dates and valid identities; never invent a fresh fallback. */
export function validateObservatorySnapshot(
  value: unknown,
  environment: DirectoryEnvironment
): ObservatorySnapshot {
  const fail = (detail: string): never => {
    throw new Error(`Invalid ${environment} directory snapshot: ${detail}`);
  };
  if (!isObject(value)) return fail('expected an object');
  if (
    typeof value.timestamp !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T/.test(value.timestamp) ||
    !Number.isFinite(Date.parse(value.timestamp))
  )
    return fail('missing/invalid observation timestamp');
  if (
    value.environment !== environment ||
    typeof value.source !== 'string' ||
    !value.source.startsWith('https://')
  )
    return fail('environment/source mismatch');
  const expectedHost =
    environment === 'production'
      ? 'data.directory.openfinance.ae'
      : 'data.sandbox.directory.openfinance.ae';
  let sourceHost = '';
  try {
    sourceHost = new URL(value.source).hostname;
  } catch {
    /* invalid URL is rejected below */
  }
  if (sourceHost !== expectedHost) return fail('source does not match the selected environment');
  if (!isObject(value.summary) || !Array.isArray(value.participants))
    return fail('missing summary/participants');
  const summary = value.summary;
  for (const field of [
    'totalParticipants',
    'liveInProduction',
    'shariahCompliantCount',
    'multiRoleCount',
    'tppCount',
  ]) {
    if (
      typeof summary[field] !== 'number' ||
      !Number.isFinite(summary[field]) ||
      (summary[field] as number) < 0
    )
      return fail(`invalid summary ${field}`);
  }
  for (const field of [
    'byStatus',
    'byRole',
    'byCity',
    'byCertificationStatus',
    'byApiVersion',
    'byAuthCapabilities',
  ]) {
    const counts = summary[field];
    if (
      !isObject(counts) ||
      Object.values(counts).some(
        (count) => typeof count !== 'number' || !Number.isFinite(count) || count < 0
      )
    )
      return fail(`invalid summary ${field}`);
  }
  if (!strings(summary.apiFamilies)) return fail('invalid summary families');
  if (summary.totalParticipants !== value.participants.length)
    return fail('registration count does not match records');
  const ids = new Set<string>();
  let issuerCount = 0;
  for (const item of value.participants) {
    if (!isObject(item) || typeof item.id !== 'string' || !item.id || ids.has(item.id))
      return fail('missing/duplicate registration ID');
    ids.add(item.id);
    if (item.isLive === true) issuerCount++;
    if (
      typeof item.name !== 'string' ||
      !item.name ||
      typeof item.legalName !== 'string' ||
      !strings(item.roles) ||
      !strings(item.apiFamilies) ||
      typeof item.isLive !== 'boolean'
    )
      return fail(`invalid identity/metadata for ${item.id}`);
    for (const field of ['shortName', 'status', 'city', 'registrationNumber'])
      if (typeof item[field] !== 'string') return fail(`invalid ${field} for ${item.id}`);
    if (
      typeof item.hasAuthServer !== 'boolean' ||
      item.hasAuthServer !== item.isLive ||
      typeof item.isShariahCompliant !== 'boolean'
    )
      return fail(`invalid publication/source flags for ${item.id}`);
    if (!Array.isArray(item.apiResources)) return fail(`missing resource list for ${item.id}`);
    for (const resource of item.apiResources) {
      if (!isObject(resource) || typeof resource.family !== 'string' || !resource.family)
        return fail(`invalid resource family for ${item.id}`);
      for (const field of ['rawFamily', 'version', 'certificationStatus']) {
        if (resource[field] !== undefined && typeof resource[field] !== 'string')
          return fail(`invalid ${field} for ${item.id}`);
      }
      if (resource.familyComplete !== undefined && typeof resource.familyComplete !== 'boolean')
        return fail(`invalid completeness for ${item.id}`);
    }
  }
  if (summary.liveInProduction !== issuerCount)
    return fail('issuer count does not match publication flags');
  return value as unknown as ObservatorySnapshot;
}

const snapshots = {
  production: validateObservatorySnapshot(production, 'production'),
  sandbox: validateObservatorySnapshot(sandbox, 'sandbox'),
};
export function getObservatorySnapshot(environment: DirectoryEnvironment) {
  return snapshots[environment];
}

export function directoryRecords(
  snapshot: ObservatorySnapshot,
  environment: DirectoryEnvironment
): DirectoryRecord[] {
  return snapshot.participants.map((participant) => {
    const resources: PublishedResource[] = participant.apiResources.map((resource) => ({
      family: normalizeApiFamily(resource.family),
      rawFamily: resource.rawFamily || resource.family,
      version: resource.version || null,
      certification: resource.certificationStatus || null,
      complete: typeof resource.familyComplete === 'boolean' ? resource.familyComplete : null,
    }));
    return {
      key: `${environment}:${participant.id}`,
      id: participant.id,
      name: participant.name,
      legalName: participant.legalName,
      environment,
      observedAt: snapshot.timestamp,
      source: snapshot.source,
      profileUrl: participantUrl(participant, environment),
      issuerPublished: participant.isLive,
      roles: participant.roles,
      families: [
        ...new Set([
          ...participant.apiFamilies.map(normalizeApiFamily),
          ...resources.map((r) => r.family),
        ]),
      ].sort(),
      resources,
    };
  });
}
export function getDirectoryRecords() {
  return [
    ...directoryRecords(snapshots.production, 'production'),
    ...directoryRecords(snapshots.sandbox, 'sandbox'),
  ];
}
