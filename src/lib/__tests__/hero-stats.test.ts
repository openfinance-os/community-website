import { describe, expect, it } from 'vitest';
import history from '../../../data/observatory/history.json';
import snapshot from '../../../data/observatory/snapshots/latest.json';
import { heroDirectoryStats, signed, sparklinePoints } from '../hero-stats';

const h = (date: string, totalParticipants: number, liveInProduction = 0) => ({
  date,
  totalParticipants,
  liveInProduction,
});

describe('heroDirectoryStats', () => {
  const current = {
    registered: 31,
    withIssuer: 14,
    observedAt: '2026-11-26T16:00:00.000Z',
    apiFamilies: ['accounts', 'insurance'],
    participants: [{ apiFamilies: ['accounts'] }, { apiFamilies: ['accounts', 'insurance'] }, {}],
  };

  it('measures growth from the first observation and over the window', () => {
    const s = heroDirectoryStats(
      [h('2025-12-26', 17), h('2026-08-27', 26), h('2026-09-01', 27), h('2026-11-26', 31)],
      current
    );
    expect(s.firstCount).toBe(17);
    expect(s.firstDate).toBe('2025-12-26');
    expect(s.sinceFirst).toBe(14);
    // 90 days before 2026-11-26 is 2026-08-28; last point on/before it is 26.
    expect(s.recentChange).toBe(5);
    expect(s.withIssuer).toBe(14);
  });

  it('counts registrations per published family', () => {
    const s = heroDirectoryStats([h('2025-12-26', 17)], current);
    expect(s.familyCoverage).toEqual([
      { family: 'accounts', count: 2 },
      { family: 'insurance', count: 1 },
    ]);
  });

  it('uses the snapshot as the latest point and reports no window change without a baseline', () => {
    const s = heroDirectoryStats([h('2026-11-01', 30), h('2026-11-26', 99)], current);
    expect(s.series.at(-1)).toEqual({ date: '2026-11-26', value: 31 });
    expect(s.recentChange).toBeNull();
  });

  it('agrees with the committed data', () => {
    const p = snapshot.production;
    const s = heroDirectoryStats(history.productionHistory, {
      registered: p.summary.totalParticipants,
      withIssuer: p.summary.liveInProduction,
      observedAt: p.timestamp,
      apiFamilies: p.summary.apiFamilies,
      participants: p.participants,
    });
    expect(s.series[0].value).toBe(history.productionHistory[0].totalParticipants);
    expect(s.sinceFirst).toBe(p.summary.totalParticipants - s.firstCount);
    const latest = history.productionHistory.at(-1)!;
    if (latest.date === p.timestamp.slice(0, 10)) {
      for (const { family, count } of s.familyCoverage) {
        expect(count).toBe((latest.apiFamilyCoverage as Record<string, number>)[family] ?? 0);
      }
    }
  });
});

describe('sparklinePoints', () => {
  it('draws a stepped line inside the box', () => {
    const pts = sparklinePoints(
      [
        { date: '2026-01-01', value: 1 },
        { date: '2026-01-11', value: 3 },
      ],
      100,
      20,
      0
    );
    expect(pts).toBe('0.0,20.0 100.0,20.0 100.0,0.0');
  });
});

describe('signed', () => {
  it('prefixes the sign', () => {
    expect(signed(5)).toBe('+5');
    expect(signed(0)).toBe('0');
    expect(signed(-2)).toBe('−2');
  });
});
