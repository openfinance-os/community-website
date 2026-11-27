import { describe, expect, it } from 'vitest';
import history from '../../../data/observatory/history.json';
import snapshot from '../../../data/observatory/snapshots/production/latest.json';
import {
  familyFirstObserved,
  familySeries,
  growthSeries,
  monthTicks,
  niceAxis,
  stepPath,
  timeScale,
  type ObservationPoint,
} from '../observatory-visuals';

const h = (
  date: string,
  totalParticipants: number,
  liveInProduction = 0,
  apiFamilyCoverage: Record<string, number> = {}
) => ({ date, totalParticipants, liveInProduction, apiFamilyCoverage });

describe('growthSeries', () => {
  it('keeps the endpoints and every change in either count', () => {
    const series = growthSeries([
      h('2026-01-03', 17, 9),
      h('2026-01-01', 17, 9),
      h('2026-01-02', 17, 9),
      h('2026-01-04', 18, 9),
      h('2026-01-05', 18, 10),
      h('2026-01-06', 18, 10),
    ]);
    expect(series).toEqual([
      { date: '2026-01-01', registrations: 17, withIssuer: 9 },
      { date: '2026-01-04', registrations: 18, withIssuer: 9 },
      { date: '2026-01-05', registrations: 18, withIssuer: 10 },
      { date: '2026-01-06', registrations: 18, withIssuer: 10 },
    ]);
  });

  it('ends on the committed latest production observation', () => {
    const series = growthSeries(history.productionHistory as ObservationPoint[]);
    const latest = history.productionHistory.at(-1)!;
    expect(series.at(-1)).toEqual({
      date: latest.date,
      registrations: latest.totalParticipants,
      withIssuer: latest.liveInProduction,
    });
    if (latest.date === snapshot.timestamp.slice(0, 10)) {
      expect(latest.totalParticipants).toBe(snapshot.summary.totalParticipants);
      expect(latest.liveInProduction).toBe(snapshot.summary.liveInProduction);
    }
    // A registration with an issuer is a subset of registrations.
    for (const p of series) expect(p.withIssuer).toBeLessThanOrEqual(p.registrations);
  });
});

describe('family series', () => {
  const points = [
    h('2026-01-01', 17, 9, { accounts: 9 }),
    h('2026-01-02', 17, 9, { accounts: 9 }),
    h('2026-01-03', 18, 9, { accounts: 9, atm: 2 }),
    h('2026-01-04', 18, 9, { accounts: 10, atm: 2 }),
  ];

  it('reports zero before a family is first observed', () => {
    expect(familySeries(points, 'atm')).toEqual([
      { date: '2026-01-01', value: 0 },
      { date: '2026-01-03', value: 2 },
      { date: '2026-01-04', value: 2 },
    ]);
    expect(familyFirstObserved(points, 'atm')).toBe('2026-01-03');
    expect(familyFirstObserved(points, 'insurance')).toBeNull();
  });
});

describe('geometry', () => {
  it('draws a stepped path and closes it for an area', () => {
    const scale = timeScale('2026-01-01', '2026-01-11', 10, 100, 50);
    const series = [
      { date: '2026-01-01', value: 0 },
      { date: '2026-01-06', value: 5 },
      { date: '2026-01-11', value: 10 },
    ];
    expect(stepPath(series, scale)).toBe('M0,50H50V25H100V0');
    expect(stepPath(series, scale, 0)).toBe('M0,50H50V25H100V0V50H0Z');
  });

  it('places month ticks inside the range', () => {
    expect(monthTicks('2025-12-26', '2026-05-10', 2)).toEqual([
      '2026-01-01',
      '2026-03-01',
      '2026-05-01',
    ]);
  });

  it('rounds the axis above the data', () => {
    expect(niceAxis(31)).toEqual({ max: 40, ticks: [0, 10, 20, 30, 40] });
    expect(niceAxis(10)).toEqual({ max: 12, ticks: [0, 2, 4, 6, 8, 10, 12] });
    expect(niceAxis(82).max).toBe(100);
  });
});
