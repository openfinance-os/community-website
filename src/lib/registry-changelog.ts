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
  'joined' | 'left' | 'went_live' | 'went_offline' | 'role_added' | 'api_family_added';

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
}

export interface SnapshotLike {
  participants: SnapshotParticipant[];
}

const SNAPSHOT_DIR = join(process.cwd(), 'data', 'observatory', 'snapshots', 'production');

function listSnapshotDates(): string[] {
  return readdirSync(SNAPSHOT_DIR)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .map((f) => f.replace('.json', ''))
    .sort();
}

function readSnapshot(date: string): SnapshotLike {
  return JSON.parse(readFileSync(join(SNAPSHOT_DIR, `${date}.json`), 'utf8')) as SnapshotLike;
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

  for (const [id, p] of a) {
    if (!b.has(id)) {
      events.push({ date, type: 'left', participantId: id, name: p.name });
    }
  }

  return events;
}

let cache: ChangelogEvent[] | null = null;

/**
 * The full production-registry changelog, newest first.
 * Computed once per build and cached.
 */
export function getRegistryChangelog(): ChangelogEvent[] {
  if (cache) return cache;

  const dates = listSnapshotDates();
  const events: ChangelogEvent[] = [];
  let prev: SnapshotLike | null = null;

  for (const date of dates) {
    const snap = readSnapshot(date);
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
  };
  events.sort(
    (x, y) =>
      y.date.localeCompare(x.date) || order[x.type] - order[y.type] || x.name.localeCompare(y.name)
  );

  cache = events;
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
export function getTrackingSince(): string {
  const dates = listSnapshotDates();
  return dates[0] || '';
}

/** Number of daily snapshots in the record. */
export function getSnapshotCount(): number {
  return listSnapshotDates().length;
}
