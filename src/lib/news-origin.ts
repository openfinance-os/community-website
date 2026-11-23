export type NewsOrigin = 'external' | 'digest' | 'analysis';

export function newsOrigin(entry: {
  id: string;
  data: { origin?: string; source?: string; title: string };
}): NewsOrigin {
  if (
    entry.data.origin === 'external' ||
    entry.data.origin === 'digest' ||
    entry.data.origin === 'analysis'
  ) {
    return entry.data.origin;
  }
  if (entry.data.source) return 'external';
  if (entry.id.includes('weekly-digest') || /^this week in\b/i.test(entry.data.title)) {
    return 'digest';
  }
  return 'analysis';
}

export function isOwnPost(origin: NewsOrigin): boolean {
  return origin !== 'external';
}
