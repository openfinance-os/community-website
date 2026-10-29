// Checks that a generated summary is original and grounded in the source text.
//
// Original: it must not be the description (or a light edit of it). The
// curator used to paste the feed description through as the summary.
// Grounded: numbers, acronyms, and multi-word proper names in the summary
// have to appear in the title, description, or content. Wording that is not
// a claim ("announced", "published") may differ from the source.

export interface SummaryReview {
  ok: boolean;
  reasons: string[];
}

const SHINGLE_SIZE = 5;
/** Share of summary shingles that also occur in the description. Above this, it is a copy. */
const COPY_SHINGLE_RATIO = 0.55;
/** Minimum share of meaningful summary words that must occur in the source. */
const MIN_CONTENT_OVERLAP = 0.4;

const STOP_WORDS = new Set([
  'that',
  'this',
  'with',
  'from',
  'have',
  'has',
  'been',
  'were',
  'was',
  'are',
  'its',
  'their',
  'into',
  'over',
  'after',
  'before',
  'under',
  'said',
  'says',
  'will',
  'would',
  'about',
  'than',
  'then',
  'them',
  'they',
  'your',
  'when',
  'what',
  'which',
  'while',
  'where',
  'there',
  'these',
  'those',
  'also',
  'more',
  'most',
  'other',
  'such',
  'only',
]);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/&#8217;|&rsquo;|’|‘/g, "'")
    .replace(/&amp;/g, ' and ')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[^a-z0-9%$]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function words(text: string): string[] {
  const normalized = normalize(text);
  return normalized ? normalized.split(' ') : [];
}

function shingles(tokens: string[], size: number): string[] {
  if (tokens.length < size) return [];
  const result: string[] = [];
  for (let i = 0; i <= tokens.length - size; i++) {
    result.push(tokens.slice(i, i + size).join(' '));
  }
  return result;
}

/** True when the summary is the description or a lightly edited restatement of it. */
export function isCopiedSummary(summary: string, description: string): boolean {
  const summaryTokens = words(summary);
  const descriptionTokens = words(description);
  if (summaryTokens.length === 0 || descriptionTokens.length === 0) return false;

  const summaryNorm = summaryTokens.join(' ');
  const descriptionNorm = descriptionTokens.join(' ');
  if (summaryNorm === descriptionNorm) return true;
  if (descriptionNorm.includes(summaryNorm) && summaryTokens.length >= 8) return true;
  if (summaryNorm.includes(descriptionNorm) && descriptionTokens.length >= 8) return true;

  const summaryShingles = shingles(summaryTokens, SHINGLE_SIZE);
  if (summaryShingles.length === 0) return false;
  const descriptionShingles = new Set(shingles(descriptionTokens, SHINGLE_SIZE));
  const copied = summaryShingles.filter((shingle) => descriptionShingles.has(shingle)).length;
  return copied / summaryShingles.length >= COPY_SHINGLE_RATIO;
}

/** True when `raw` (e.g. "12,000" or "32%") occurs as its own number in the source. */
function numberIsGrounded(raw: string, source: string): boolean {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return true;
  const flat = source.replace(/,/g, '');
  return new RegExp(`(^|[^0-9])${digits}([^0-9]|$)`).test(flat);
}

/** Numbers, percentages, acronyms, and multi-word proper names introduced by the summary. */
export function findUngroundedClaims(summary: string, sourceText: string): string[] {
  const source = sourceText.toLowerCase();
  const claims: string[] = [];

  const numbers = summary.match(/\d[\d,]*(?:\.\d+)?%?/g) || [];
  for (const raw of numbers) {
    if (!numberIsGrounded(raw, source)) claims.push(`number:${raw}`);
  }

  const acronyms = summary.match(/\b[A-Z]{2,6}\b/g) || [];
  for (const acronym of acronyms) {
    if (!source.includes(acronym.toLowerCase())) claims.push(`acronym:${acronym}`);
  }

  const phrases =
    summary.match(/\b[A-Z][A-Za-z0-9&'’-]+(?:\s+[A-Z][A-Za-z0-9&'’-]+){1,5}\b/g) || [];
  for (const phrase of phrases) {
    if (!source.includes(phrase.toLowerCase())) claims.push(`name:${phrase}`);
  }

  const quoted = summary.match(/"([^"]{8,200})"|“([^”]{8,200})”/g) || [];
  for (const quote of quoted) {
    const inner = quote.replace(/^["“]|["”]$/g, '');
    if (!source.includes(inner.toLowerCase())) claims.push(`quote:${inner}`);
  }

  return claims;
}

/**
 * Accept a summary only when it is non-empty, not a copy of the description,
 * and every numeric or named claim appears in the source text.
 */
export function reviewSummary(
  summary: string,
  source: { title?: string; description?: string; content?: string | null }
): SummaryReview {
  const reasons: string[] = [];
  const trimmed = summary.trim();
  if (trimmed.length < 40) {
    reasons.push('too-short');
    return { ok: false, reasons };
  }

  const description = source.description || '';
  if (isCopiedSummary(trimmed, description)) reasons.push('copied-description');
  if (normalize(trimmed) === normalize(source.title || '') && normalize(trimmed).length > 0) {
    reasons.push('copied-title');
  }

  const sourceText = [source.title, source.description, source.content].filter(Boolean).join('\n');
  reasons.push(...findUngroundedClaims(trimmed, sourceText));

  const content = words(trimmed).filter((word) => word.length > 3 && !STOP_WORDS.has(word));
  if (content.length >= 8) {
    const sourceWords = new Set(words(sourceText));
    const overlap = content.filter((word) => sourceWords.has(word)).length / content.length;
    if (overlap < MIN_CONTENT_OVERLAP) reasons.push('low-overlap');
  }

  return { ok: reasons.length === 0, reasons };
}
