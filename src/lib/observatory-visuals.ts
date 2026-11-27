/**
 * Build-time geometry and series for the Observatory charts.
 *
 * Every figure is derived from saved directory observations
 * (data/observatory/history.json and the latest snapshot). Counts are
 * directory registrations and published metadata. They do not establish
 * operational status, availability or traffic.
 */

export interface ObservationPoint {
  date: string;
  totalParticipants: number;
  liveInProduction: number;
  apiFamilyCoverage?: Record<string, number>;
}

export interface GrowthPoint {
  date: string;
  registrations: number;
  withIssuer: number;
}

const DAY = 86_400_000;
const day = (date: string) => Date.parse(`${date.slice(0, 10)}T00:00:00Z`);

/** Change points plus both endpoints, oldest first. */
export function growthSeries(history: ObservationPoint[]): GrowthPoint[] {
  const points = [...history].sort((a, b) => a.date.localeCompare(b.date));
  return points
    .filter(
      (p, i) =>
        i === 0 ||
        i === points.length - 1 ||
        p.totalParticipants !== points[i - 1].totalParticipants ||
        p.liveInProduction !== points[i - 1].liveInProduction
    )
    .map((p) => ({
      date: p.date,
      registrations: p.totalParticipants,
      withIssuer: p.liveInProduction,
    }));
}

/** Change points for one API family; zero before the family is first observed. */
export function familySeries(
  history: ObservationPoint[],
  family: string
): { date: string; value: number }[] {
  const points = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const value = (p: ObservationPoint) => p.apiFamilyCoverage?.[family] ?? 0;
  return points
    .filter((p, i) => i === 0 || i === points.length - 1 || value(p) !== value(points[i - 1]))
    .map((p) => ({ date: p.date, value: value(p) }));
}

/** First saved observation on which a family was published by any registration. */
export function familyFirstObserved(history: ObservationPoint[], family: string): string | null {
  const points = [...history].sort((a, b) => a.date.localeCompare(b.date));
  return points.find((p) => (p.apiFamilyCoverage?.[family] ?? 0) > 0)?.date ?? null;
}

export interface Scale {
  x: (date: string) => number;
  y: (value: number) => number;
}

export function timeScale(
  start: string,
  end: string,
  yMax: number,
  width: number,
  height: number
): Scale {
  const t0 = day(start);
  const span = Math.max(day(end) - t0, DAY);
  return {
    x: (date) => ((day(date) - t0) / span) * width,
    y: (value) => height - (value / yMax) * height,
  };
}

const n = (value: number) => Number(value.toFixed(2));

/**
 * Stepped SVG path: a count holds until the observation that changes it.
 * With `closeTo`, the path is closed along that baseline for an area fill.
 */
export function stepPath(
  series: { date: string; value: number }[],
  scale: Scale,
  closeTo?: number
): string {
  if (series.length === 0) return '';
  const parts: string[] = [];
  series.forEach((p, i) => {
    const x = n(scale.x(p.date));
    if (i === 0) parts.push(`M${x},${n(scale.y(p.value))}`);
    else parts.push(`H${x}`, `V${n(scale.y(p.value))}`);
  });
  if (closeTo !== undefined) {
    parts.push(`V${n(scale.y(closeTo))}`, `H${n(scale.x(series[0].date))}`, 'Z');
  }
  return parts.join('');
}

/** First-of-month ticks strictly inside the range, every `every` months. */
export function monthTicks(start: string, end: string, every = 2): string[] {
  const ticks: string[] = [];
  const cursor = new Date(day(start));
  cursor.setUTCDate(1);
  cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  const last = day(end);
  while (cursor.getTime() < last) {
    ticks.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCMonth(cursor.getUTCMonth() + every);
  }
  return ticks;
}

/** A round axis maximum just above the data, and its tick values. */
export function niceAxis(max: number): { max: number; ticks: number[] } {
  const step = max <= 10 ? 2 : max <= 20 ? 5 : max <= 50 ? 10 : max <= 100 ? 20 : 50;
  const top = Math.max(step, Math.ceil((max + 0.5) / step) * step);
  const ticks: number[] = [];
  for (let v = 0; v <= top; v += step) ticks.push(v);
  return { max: top, ticks };
}

export function shortMonth(date: string, withYear = false): string {
  return new Date(day(date)).toLocaleDateString('en-GB', {
    month: 'short',
    ...(withYear ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  });
}

export function longDate(date: string): string {
  return new Date(day(date)).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
