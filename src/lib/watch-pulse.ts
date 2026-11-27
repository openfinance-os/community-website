/**
 * Build-time figures for the Observatory's standards, traffic and reliability
 * panels. Everything is read from the saved weekly Watch payload
 * (data/watch/payload.json): the public API logs, the api-specs repository and
 * its breaking-changes registers. Nothing here is estimated unless it says so,
 * and measures the public sources do not carry are reported as unavailable.
 */
import savedPayload from '../../data/watch/payload.json';

type Row = (string | number | boolean | null)[];

export interface WatchPulsePayload {
  runDate: string;
  asOfData: string;
  headline: { errPct: number; byVersion: [string, number][] };
  activity: {
    vals: number[];
    monthsFull: string[];
    partialIdx: number;
    lastFullVal: number;
    momPct: number;
    fullTotal: number;
  };
  payActivity: { lastFullVal: number; momPct: number; fullTotal: number };
  partial: {
    month: string;
    calls: number;
    errPct: number;
    payCount: number;
    paySuccessPct: number;
    valueAED: number;
  };
  families: [string, number][];
  lfi: Row[];
  payments: { rows: [string, number][]; successPct: number };
  authPct: number;
  consent: { full: { requests: number; consents: number; convPct: number } };
  standards: { version: string; errata: string; apiHub: string };
  websiteSpecBranch: string;
  breaking: { tpp: Row[]; lfi: Row[]; pending: Row[] };
  changeLog: { layer: string; title: string; status: string; since: string; url: string }[];
  summary: { area: string; text: string }[];
  history: { runDate: string; errPct: number; paySucc: number }[];
}

export interface MonthCalls {
  month: string;
  calls: number;
  partial: boolean;
}

const monthAfter = (month: string) => {
  const [y, m] = month.split('-').map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
};

/** Change points of a per-run series, keeping both endpoints. */
function changePoints<T extends { runDate: string }>(runs: T[], value: (r: T) => number) {
  const sorted = [...runs].sort((a, b) => a.runDate.localeCompare(b.runDate));
  return sorted
    .filter((r, i) => i === 0 || i === sorted.length - 1 || value(r) !== value(sorted[i - 1]))
    .map((r) => ({ date: r.runDate, value: value(r) }));
}

export function watchPulse(payload: WatchPulsePayload = savedPayload as never) {
  const { activity } = payload;
  const months: MonthCalls[] = activity.vals.map((calls, i) => ({
    month:
      i < activity.monthsFull.length
        ? activity.monthsFull[i]
        : monthAfter(activity.monthsFull[activity.monthsFull.length - 1]),
    calls,
    partial: i === activity.partialIdx,
  }));

  // Response mix across full months, weighted from the per-key shares the
  // Watch publishes. Those shares are rounded to 0.1, so this is approximate.
  const calls = payload.lfi.reduce((sum, r) => sum + Number(r[1]), 0);
  const share = (index: number) =>
    calls > 0
      ? payload.lfi.reduce((sum, r) => sum + Number(r[1]) * Number(r[index]), 0) / calls
      : 0;
  const mix4xx = Number(share(3).toFixed(1));
  const mix5xx = Number(share(4).toFixed(1));

  const accepted = payload.payments.rows
    .filter(([status]) => status.startsWith('Accepted'))
    .reduce((sum, [, count]) => sum + count, 0);
  const paymentRecords = payload.payments.rows.reduce((sum, [, count]) => sum + count, 0);

  return {
    runDate: payload.runDate,
    asOfData: payload.asOfData,
    standards: {
      ...payload.standards,
      draftBranch: payload.websiteSpecBranch,
      enforcedTpp: payload.breaking.tpp.length,
      enforcedLfi: payload.breaking.lfi.length,
      pending: payload.breaking.pending.length,
      changes: payload.changeLog.filter((c) => c.layer === 'Standards'),
      deadline: payload.summary.find((s) => s.area === 'Deadlines')?.text ?? null,
    },
    traffic: {
      months,
      lastFull: months[activity.partialIdx - 1] ?? months[months.length - 1],
      momPct: activity.momPct,
      fullTotal: activity.fullTotal,
      partial: payload.partial,
      families: payload.families,
      byVersion: payload.headline.byVersion,
      paymentValueLastFull: payload.payActivity.lastFullVal,
      paymentValueMomPct: payload.payActivity.momPct,
    },
    reliability: {
      errPct: payload.headline.errPct,
      errSeries: changePoints(payload.history, (r) => r.errPct),
      mix: { ok: Number((100 - mix4xx - mix5xx).toFixed(1)), c4xx: mix4xx, c5xx: mix5xx },
      logKeys: payload.lfi.length,
      logKeysUnder15: payload.lfi.filter((r) => Number(r[2]) <= 15).length,
      paymentAcceptedPct: payload.payments.successPct,
      paymentAccepted: accepted,
      paymentRecords,
      authPct: payload.authPct,
      consent: payload.consent.full,
    },
  };
}

export type WatchPulse = ReturnType<typeof watchPulse>;

/** 842969 -> "843K", 2259856 -> "2.26M". */
export function compact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`;
  if (value >= 10_000) return `${Math.round(value / 1000)}K`;
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(value);
}
