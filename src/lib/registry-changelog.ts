/**
 * Registry changelog — the independent record of what changed in the
 * UAE Open Finance trust-framework directory, derived entirely from the
 * daily snapshots committed under data/observatory/snapshots/.
 *
 * Events are computed at build time by diffing consecutive snapshots, so
 * the changelog is always consistent with the data in the repo and needs
 * no extra pipeline. Because snapshots are daily observations, an event's
 * date is the date we OBSERVED the change (the later snapshot of the
 * diffed pair), which may lag the real-world change by up to a collection
 * gap.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export type ChangelogEventType =
  | 'joined'
  | 'left'
  | 'went_live'
  | 'went_offline'
  | 'role_added'
  | 'api_family_added'
  | 'role_removed'
  | 'api_family_removed'
  | 'resource_changed';

export interface ChangelogEvent {
  /** ISO date (YYYY-MM-DD) the change was observed */
  date: string;
  type: ChangelogEventType;
  participantId: string;
  name: string;
  /** Event-specific detail: roles for joins/role changes, families for API additions */
  detail?: string;
}

export interface SnapshotParticipant {
  id: string;
  name: string;
  roles?: string[];
  apiFamilies?: string[];
  isLive?: boolean;
  apiResources?: Array<{
    family: string;
    version?: string;
    certificationStatus?: string;
    familyComplete?: boolean;
  }>;
}

export interface SnapshotLike {
  participants: SnapshotParticipant[];
}

type Environment = 'production' | 'sandbox';
const snapshotDirectory = (environment: Environment) =>
  join(process.cwd(), 'data', 'observatory', 'snapshots', environment);

function listSnapshotDates(environment: Environment = 'production'): string[] {
  return readdirSync(snapshotDirectory(environment))
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .map((f) => f.replace('.json', ''))
    .sort();
}

function readSnapshot(date: string, environment: Environment): SnapshotLike {
  return JSON.parse(
    readFileSync(join(snapshotDirectory(environment), `${date}.json`), 'utf8')
  ) as SnapshotLike;
}

function byId(s: SnapshotLike): Map<string, SnapshotParticipant> {
  return new Map(s.participants.map((p) => [p.id, p]));
}

/** Diff two snapshots into changelog events observed on `date`. Exported for tests. */
export function diffSnapshots(
  prev: SnapshotLike,
  next: SnapshotLike,
  date: string
): ChangelogEvent[] {
  const events: ChangelogEvent[] = [];
  const a = byId(prev);
  const b = byId(next);

  for (const [id, p] of b) {
    const was = a.get(id);
    if (!was) {
      events.push({
        date,
        type: 'joined',
        participantId: id,
        name: p.name,
        detail: (p.roles || []).join(' · '),
      });
      continue;
    }
    if (!was.isLive && p.isLive) {
      events.push({ date, type: 'went_live', participantId: id, name: p.name });
    }
    if (was.isLive && !p.isLive) {
      events.push({ date, type: 'went_offline', participantId: id, name: p.name });
    }
    const newRoles = (p.roles || []).filter((r) => !(was.roles || []).includes(r));
    if (newRoles.length > 0) {
      events.push({
        date,
        type: 'role_added',
        participantId: id,
        name: p.name,
        detail: newRoles.join(' · '),
      });
    }
    const newFamilies = (p.apiFamilies || []).filter((f) => !(was.apiFamilies || []).includes(f));
    if (newFamilies.length > 0) {
      events.push({
        date,
        type: 'api_family_added',
        participantId: id,
        name: p.name,
        detail: newFamilies.join(' · '),
      });
    }
  }

  for (const [id, p] of b) {
    const was = a.get(id);
    if (!was) continue;
    const removedRoles =
      Array.isArray(was.roles) && Array.isArray(p.roles)
        ? was.roles.filter((role) => !p.roles!.includes(role))
        : [];
    if (removedRoles.length)
      events.push({
        date,
        type: 'role_removed',
        participantId: id,
        name: p.name,
        detail: removedRoles.join(' · '),
      });
    const removedFamilies =
      Array.isArray(was.apiFamilies) && Array.isArray(p.apiFamilies)
        ? was.apiFamilies.filter((family) => !p.apiFamilies!.includes(family))
        : [];
    if (removedFamilies.length)
      events.push({
        date,
        type: 'api_family_removed',
        participantId: id,
        name: p.name,
        detail: removedFamilies.join(' · '),
      });
    // Compare only where both observations recorded details. A missing field is not a removal.
    if (Array.isArray(was.apiResources) && Array.isArray(p.apiResources)) {
      const describe = (resources: NonNullable<SnapshotParticipant['apiResources']>) =>
        resources
          .map(
            (r) =>
              `${r.family} v${r.version || 'unknown'}; certification=${r.certificationStatus || 'unknown'}; complete=${r.familyComplete ?? 'unknown'}`
          )
          .sort();
      const before = describe(was.apiResources);
      const after = describe(p.apiResources);
      if (JSON.stringify(before) !== JSON.stringify(after))
        events.push({
          date,
          type: 'resource_changed',
          participantId: id,
          name: p.name,
          detail: `Before: ${before.join(' | ') || 'none recorded'}. After: ${after.join(' | ') || 'none recorded'}.`,
        });
    }
  }

  for (const [id, p] of a) {
    if (!b.has(id)) {
      events.push({ date, type: 'left', participantId: id, name: p.name });
    }
  }

  return events;
}

const cache = new Map<Environment, ChangelogEvent[]>();

/**
 * The full production-registry changelog, newest first.
 * Computed once per build and cached.
 */
export function getRegistryChangelog(environment: Environment = 'production'): ChangelogEvent[] {
  const cached = cache.get(environment);
  if (cached) return cached;

  const dates = listSnapshotDates(environment);
  const events: ChangelogEvent[] = [];
  let prev: SnapshotLike | null = null;

  for (const date of dates) {
    const snap = readSnapshot(date, environment);
    if (prev) {
      events.push(...diffSnapshots(prev, snap, date));
    }
    prev = snap;
  }

  // Newest first; stable within a date by event significance then name
  const order: Record<ChangelogEventType, number> = {
    went_live: 0,
    joined: 1,
    went_offline: 2,
    left: 3,
    role_added: 4,
    api_family_added: 5,
    role_removed: 6,
    api_family_removed: 7,
    resource_changed: 8,
  };
  events.sort(
    (x, y) =>
      y.date.localeCompare(x.date) || order[x.type] - order[y.type] || x.name.localeCompare(y.name)
  );

  cache.set(environment, events);
  return events;
}

/** Events observed within the last `days` days of the newest snapshot. */
export function getRecentEvents(days: number): ChangelogEvent[] {
  const all = getRegistryChangelog();
  if (all.length === 0) return [];
  const dates = listSnapshotDates();
  const newest = new Date(dates[dates.length - 1]);
  const cutoff = new Date(newest.getTime() - days * 24 * 60 * 60 * 1000);
  return all.filter((e) => new Date(e.date) >= cutoff);
}

/** First (oldest) snapshot date — "tracking since". */
export function getTrackingSince(environment: Environment = 'production'): string {
  const dates = listSnapshotDates(environment);
  return dates[0] || '';
}

/** Number of daily snapshots in the record. */
export function getSnapshotCount(environment: Environment = 'production'): number {
  return listSnapshotDates(environment).length;
}
