import { describe, expect, it } from 'vitest';
import payload from '../../../data/watch/payload.json';
import { compact, watchPulse } from '../watch-pulse';

describe('watchPulse', () => {
  const pulse = watchPulse();

  it('keeps the partial month apart from full months', () => {
    const full = pulse.traffic.months.filter((m) => !m.partial);
    expect(full.map((m) => m.month)).toEqual(payload.activity.monthsFull);
    expect(full.reduce((sum, m) => sum + m.calls, 0)).toBe(payload.activity.fullTotal);
    const partial = pulse.traffic.months.filter((m) => m.partial);
    expect(partial).toHaveLength(1);
    expect(partial[0].month).toBe(payload.partial.month);
    expect(partial[0].calls).toBe(payload.partial.calls);
    expect(pulse.traffic.lastFull.month).toBe(payload.activity.monthsFull.at(-1));
    expect(pulse.traffic.lastFull.calls).toBe(payload.activity.lastFullVal);
  });

  it('reports the published error share and a response mix that agrees with it', () => {
    const { mix, errPct, errSeries } = pulse.reliability;
    expect(errPct).toBe(payload.headline.errPct);
    expect(mix.ok + mix.c4xx + mix.c5xx).toBeCloseTo(100, 5);
    // The split is weighted from shares rounded to 0.1, so allow that rounding.
    expect(Math.abs(mix.c4xx + mix.c5xx - errPct)).toBeLessThanOrEqual(0.3);
    expect(errSeries.at(-1)!.value).toBe(errPct);
    expect(errSeries[0].date).toBe(payload.history[0].runDate);
    for (let i = 1; i < errSeries.length - 1; i++) {
      expect(errSeries[i].value).not.toBe(errSeries[i - 1].value);
    }
  });

  it('counts accepted payment statuses from the saved rows', () => {
    const { paymentAccepted, paymentRecords, paymentAcceptedPct } = pulse.reliability;
    expect((paymentAccepted / paymentRecords) * 100).toBeCloseTo(paymentAcceptedPct, 1);
  });

  it('counts breaking-change register entries without merging drafts into force', () => {
    expect(pulse.standards.enforcedTpp).toBe(payload.breaking.tpp.length);
    expect(pulse.standards.enforcedLfi).toBe(payload.breaking.lfi.length);
    expect(pulse.standards.pending).toBe(payload.breaking.pending.length);
    expect(pulse.standards.changes.every((c) => c.layer === 'Standards')).toBe(true);
  });
});

describe('compact', () => {
  it('shortens large counts', () => {
    expect(compact(842969)).toBe('843K');
    expect(compact(2259856)).toBe('2.26M');
    expect(compact(4584)).toBe('4.6K');
    expect(compact(556)).toBe('556');
  });
});
