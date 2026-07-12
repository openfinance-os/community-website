import { describe, it, expect } from 'vitest';
import {
  diffSnapshots,
  getRegistryChangelog,
  getRecentEvents,
  getTrackingSince,
  type SnapshotLike,
} from '../registry-changelog';

const D = '2026-01-15';

const base: SnapshotLike = {
  participants: [
    { id: 'a', name: 'Alpha Bank', roles: ['LFI'], apiFamilies: ['accounts'], isLive: true },
    { id: 'b', name: 'Beta Pay', roles: ['BDSP'], apiFamilies: ['accounts'], isLive: false },
  ],
};

describe('diffSnapshots', () => {
  it('returns no events for identical snapshots', () => {
    expect(diffSnapshots(base, base, D)).toEqual([]);
  });

  it('detects a new participant as joined, with roles as detail', () => {
    const next: SnapshotLike = {
      participants: [
        ...base.participants,
        { id: 'c', name: 'Gamma Insurance', roles: ['ISP', 'LFI'], apiFamilies: [], isLive: false },
      ],
    };
    const events = diffSnapshots(base, next, D);
    expect(events).toEqual([
      {
        date: D,
        type: 'joined',
        participantId: 'c',
        name: 'Gamma Insurance',
        detail: 'ISP · LFI',
      },
    ]);
  });

  it('detects go-live and go-offline transitions', () => {
    const next: SnapshotLike = {
      participants: [
        { ...base.participants[0], isLive: false },
        { ...base.participants[1], isLive: true },
      ],
    };
    const types = diffSnapshots(base, next, D).map((e) => `${e.type}:${e.participantId}`);
    expect(types).toContain('went_offline:a');
    expect(types).toContain('went_live:b');
  });

  it('detects added roles and API families but ignores removals of families', () => {
    const next: SnapshotLike = {
      participants: [
        {
          ...base.participants[0],
          roles: ['LFI', 'ISP'],
          apiFamilies: ['accounts', 'payments'],
        },
        base.participants[1],
      ],
    };
    const events = diffSnapshots(base, next, D);
    expect(events).toContainEqual({
      date: D,
      type: 'role_added',
      participantId: 'a',
      name: 'Alpha Bank',
      detail: 'ISP',
    });
    expect(events).toContainEqual({
      date: D,
      type: 'api_family_added',
      participantId: 'a',
      name: 'Alpha Bank',
      detail: 'payments',
    });
  });

  it('detects departures', () => {
    const next: SnapshotLike = { participants: [base.participants[0]] };
    expect(diffSnapshots(base, next, D)).toEqual([
      { date: D, type: 'left', participantId: 'b', name: 'Beta Pay' },
    ]);
  });
});

describe('getRegistryChangelog (real snapshot corpus)', () => {
  it('tracks since the first committed snapshot', () => {
    expect(getTrackingSince()).toBe('2025-12-26');
  });

  it('is sorted newest first', () => {
    const all = getRegistryChangelog();
    expect(all.length).toBeGreaterThan(0);
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].date >= all[i].date).toBe(true);
    }
  });

  it('contains known historical events', () => {
    const all = getRegistryChangelog();
    // Immutable past: Union Insurance joined production, observed 2026-06-12
    expect(all).toContainEqual(
      expect.objectContaining({ date: '2026-06-12', type: 'joined', name: 'Union Insurance' })
    );
    // LIVA went live, observed 2026-07-01
    expect(all).toContainEqual(
      expect.objectContaining({ date: '2026-07-01', type: 'went_live', name: 'LIVA' })
    );
  });

  it('getRecentEvents(3650) returns the full record', () => {
    expect(getRecentEvents(3650).length).toBe(getRegistryChangelog().length);
  });
});
