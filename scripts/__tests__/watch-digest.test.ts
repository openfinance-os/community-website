import { describe, expect, it } from 'vitest';
import { summarizeWatch, type WatchRun } from '../utils/watch-digest';

const run: WatchRun = {
  runDate: '2026-10-05',
  totalFull: 1011740,
  errPct: 23.5,
  paySucc: 96,
  authPct: 53.3,
  liveLFIs: 16,
  liveTPPs: 16,
};

describe('digest reporting periods', () => {
  it('labels cumulative months, excluded partial month, observation and source dates', () => {
    const summary = summarizeWatch(run, {
      runDate: run.runDate,
      asOfData: '2026-09-29',
      months: ['2025-11', '2026-08'],
      curPartial: '2026-09',
    });
    expect(summary).toContain('1,011,740** cumulative API calls');
    expect(summary).toContain('2025-11 through 2026-08 (excluding partial 2026-09)');
    expect(summary).toContain('source data through **2026-09-29**');
    expect(summary).toContain('last two completed months');
    expect(summary).not.toContain('WoW');
  });

  it('does not attach current period metadata to a different historical observation', () => {
    const summary = summarizeWatch(
      { ...run, runDate: '2026-09-21' },
      { runDate: run.runDate, asOfData: '2026-09-29', months: ['2026-08'], curPartial: '2026-09' }
    );
    expect(summary).toContain('exact window is unavailable');
    expect(summary).not.toContain('2026-09-29');
  });

  it('handles missing period and adoption fields without invented comparisons', () => {
    const summary = summarizeWatch({ ...run, liveLFIs: undefined, liveTPPs: undefined });
    expect(summary).not.toContain('undefined');
    expect(summary).not.toContain('TPPs with');
    expect(summary).toContain('not reported as weekly growth');
  });
});
