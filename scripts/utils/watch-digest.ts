export interface WatchRun {
  runDate: string;
  totalFull: number;
  errPct: number;
  paySucc: number;
  authPct: number;
  liveLFIs?: number;
  liveTPPs?: number;
}

export interface WatchPeriod {
  runDate: string;
  asOfData: string;
  months: string[];
  curPartial: string;
}

/** Observation dates do not define traffic windows. Never infer weekly growth from totals. */
export function summarizeWatch(run: WatchRun, period?: WatchPeriod): string {
  const matched = period?.runDate === run.runDate && period.months.length > 0;
  const window = matched
    ? `${period.months[0]} through ${period.months[period.months.length - 1]} (excluding partial ${period.curPartial})`
    : 'completed months; the exact window is unavailable for this archived observation';
  const lines = [
    `Ecosystem Watch observation: **${run.runDate}**${matched ? `; source data through **${period.asOfData}**` : ''}.`,
    '',
    `- **${run.totalFull.toLocaleString('en-US')}** cumulative API calls across ${window}`,
    `- Payment success **${run.paySucc}%** and API error rate **${run.errPct}%**, across completed months`,
  ];
  if (run.liveLFIs !== undefined && run.liveTPPs !== undefined) {
    lines.push(
      `- **${run.liveLFIs}** LFIs and **${run.liveTPPs}** TPPs with successful traffic in the source's last two completed months`
    );
  }
  lines.push(
    '',
    'These are cumulative and period-based measures, not activity during the digest week. Changes between observation totals are not reported as weekly growth.'
  );
  return lines.join('\n');
}
