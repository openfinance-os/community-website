export interface WatchBriefingItem {
  area: string;
  status: string;
  text: string;
  href: string;
  audience: string;
}
export interface WatchBriefing {
  runDate: string;
  asOfData: string;
  items: WatchBriefingItem[];
}
const sections: Record<string, string> = {
  Standards: '#standards',
  Operations: '#operations',
  Adoption: '#adoption',
  Deadlines: '#compliance',
  Alerts: '#alerts',
};
const audiences: Record<string, string> = {
  Standards: 'Developers & integration teams',
  Operations: 'Operations & delivery teams',
  Adoption: 'Product & strategy teams',
  Deadlines: 'Delivery & compliance teams',
  Alerts: 'All practitioners',
};
/** The saved run date and operational cutoff are different evidence boundaries. */
export function watchBriefing(value: unknown): WatchBriefing {
  if (!value || typeof value !== 'object') throw new Error('Invalid Watch briefing');
  const payload = value as Record<string, unknown>;
  const validDate = (v: unknown): v is string =>
    typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v));
  if (
    !validDate(payload.runDate) ||
    !validDate(payload.asOfData) ||
    !Array.isArray(payload.summary) ||
    payload.summary.length === 0
  )
    throw new Error('Watch briefing requires run date, operational cutoff and summary items');
  const items = payload.summary.map((value): WatchBriefingItem => {
    if (!value || typeof value !== 'object') throw new Error('Invalid Watch summary item');
    const item = value as Record<string, unknown>;
    if (typeof item.area !== 'string' || typeof item.text !== 'string' || !item.text.trim())
      throw new Error('Watch summary item requires area and text');
    return {
      area: item.area,
      text:
        item.area === 'Standards'
          ? item.text.replace(/^The website /, 'The Nebras community documentation site ')
          : item.text,
      status: typeof item.status === 'string' ? item.status : 'unknown',
      href: `/observatory/watch/${sections[item.area] || '#overview'}`,
      audience: audiences[item.area] || 'Practitioners',
    };
  });
  return { runDate: payload.runDate, asOfData: payload.asOfData, items };
}
