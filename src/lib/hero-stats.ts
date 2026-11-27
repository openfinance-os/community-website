/**
 * Build-time figures for the homepage hero's directory snapshot.
 *
 * Every number here is derived from saved directory observations
 * (data/observatory/history.json and the latest snapshot). Counts are
 * directory registrations and published metadata — they do not establish
 * operational status, availability or traffic.
 */

export interface HistoryPoint {
  date: string;
  totalParticipants: number;
  liveInProduction: number;
}

export interface ParticipantFamilies {
  apiFamilies?: string[];
}

export interface HeroDirectoryStats {
  /** Registrations at the first saved observation. */
  firstCount: number;
  /** ISO date (YYYY-MM-DD) of the first saved observation. */
  firstDate: string;
  /** Change since the first saved observation. */
  sinceFirst: number;
  /** Change versus the last observation on or before `windowDays` before the latest. */
  recentChange: number | null;
  windowDays: number;
  /** Registrations publishing at least one authorization-server issuer (legacy liveInProduction). */
  withIssuer: number;
  /** Registrations publishing each API family, in the order families are listed. */
  familyCoverage: { family: string; count: number }[];
  /** Compact series for a sparkline: change points plus both endpoints. */
  series: { date: string; value: number }[];
}

const DAY = 86_400_000;

export function heroDirectoryStats(
  history: HistoryPoint[],
  current: {
    registered: number;
    withIssuer: number;
    observedAt: string;
    apiFamilies: string[];
    participants: ParticipantFamilies[];
  },
  windowDays = 90
): HeroDirectoryStats {
  const points = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const observedDay = current.observedAt.slice(0, 10);
  // The latest snapshot is authoritative for "now"; history may lag or lead by a run.
  const merged = points.filter((p) => p.date < observedDay);
  merged.push({
    date: observedDay,
    totalParticipants: current.registered,
    liveInProduction: current.withIssuer,
  });

  const first = merged[0];
  const cutoff = new Date(Date.parse(observedDay) - windowDays * DAY).toISOString().slice(0, 10);
  const baseline = [...merged].reverse().find((p) => p.date <= cutoff);

  const series = merged
    .filter(
      (p, i) =>
        i === 0 ||
        i === merged.length - 1 ||
        p.totalParticipants !== merged[i - 1].totalParticipants
    )
    .map((p) => ({ date: p.date, value: p.totalParticipants }));

  return {
    firstCount: first.totalParticipants,
    firstDate: first.date,
    sinceFirst: current.registered - first.totalParticipants,
    recentChange: baseline ? current.registered - baseline.totalParticipants : null,
    windowDays,
    withIssuer: current.withIssuer,
    familyCoverage: current.apiFamilies.map((family) => ({
      family,
      count: current.participants.filter((p) => p.apiFamilies?.includes(family)).length,
    })),
    series,
  };
}

/** SVG polyline points for a sparkline, time on x, value on y. */
export function sparklinePoints(
  series: { date: string; value: number }[],
  width: number,
  height: number,
  pad = 2
): string {
  if (series.length === 0) return '';
  const t0 = Date.parse(series[0].date);
  const t1 = Date.parse(series[series.length - 1].date);
  const values = series.map((p) => p.value);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const x = (d: string) =>
    t1 === t0 ? width / 2 : pad + ((Date.parse(d) - t0) / (t1 - t0)) * (width - 2 * pad);
  const y = (v: number) =>
    hi === lo ? height / 2 : height - pad - ((v - lo) / (hi - lo)) * (height - 2 * pad);
  // Stepped: registrations change on observation days, not continuously.
  const out: string[] = [];
  series.forEach((p, i) => {
    if (i > 0) out.push(`${x(p.date).toFixed(1)},${y(series[i - 1].value).toFixed(1)}`);
    out.push(`${x(p.date).toFixed(1)},${y(p.value).toFixed(1)}`);
  });
  return out.join(' ');
}

export function signed(n: number): string {
  return n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0';
}
