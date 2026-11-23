import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { pngSize } from '../png-size';
import { V22_DEADLINE, v22StructuredData } from '../v22-deadline';

const ALLOWED_TOKENS = [
  'Tier-1',
  'Tier-2',
  'V2.2',
  'V9',
  'v3.0',
  '31 December 2026',
  '31 Dec 2026',
  '31 March 2027',
  '31 Mar 2027',
  '25 March 2026',
  '25 Mar 2026',
];

function leftoverDigits(value: string): string[] {
  let text = value;
  for (const token of ALLOWED_TOKENS) {
    text = text.split(token).join(' ');
  }
  return text.match(/\d+/g) ?? [];
}

const URL_FIELDS = new Set(['path', 'ogPath', 'sourceUrl', 'href']);

function walkStrings(value: unknown, path: string, hits: string[]): void {
  if (typeof value === 'string') {
    const digits = leftoverDigits(value);
    if (digits.length > 0) hits.push(`${path}: ${digits.join(', ')} in ${value}`);
    if (value.includes('UAE open finance')) hits.push(`${path}: lowercase UAE Open Finance`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkStrings(item, `${path}[${index}]`, hits));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (URL_FIELDS.has(key)) continue;
      walkStrings(child, `${path}.${key}`, hits);
    }
  }
}

describe('V2.2 deadline explainer facts', () => {
  it('uses only the roadmap dates and version labels', () => {
    const hits: string[] = [];
    walkStrings(V22_DEADLINE, 'copy', hits);
    expect(hits).toEqual([]);
  });

  it('keeps the social-card lines identical to the page title', () => {
    expect(V22_DEADLINE.ogLines.join(' ')).toBe(V22_DEADLINE.title);
  });

  it('cites Roadmap v3.0 and the two Tier-1 dates', () => {
    const blob = JSON.stringify(V22_DEADLINE);
    expect(blob).toContain('Uplift to V2.2 Final of the Standards (To be Published Shortly)');
    expect(blob).toContain('TBC');
    expect(blob).toContain('31 December 2026');
    expect(blob).toContain('31 March 2027');
    expect(blob).toContain('25 March 2026');
    expect(V22_DEADLINE.sourceUrl).toBe(
      'https://openfinanceuae.atlassian.net/wiki/spaces/OF/pages/6259008/Roadmap'
    );
    expect(V22_DEADLINE.path).toBe('/learn/uae-open-finance-v2-2-deadline/');
    expect(blob).toContain('Tier-2');
    expect(blob).not.toContain('28 Feb');
    expect(blob).not.toContain('31 May 2027');
    expect(blob).not.toContain('30 Jun');
    expect(V22_DEADLINE.description.length).toBeLessThanOrEqual(170);
  });

  it('emits Article and FAQPage JSON-LD under the real title', () => {
    const data = v22StructuredData({
      pageUrl: 'https://openfinance-os.org/learn/uae-open-finance-v2-2-deadline/',
      imageUrl: 'https://openfinance-os.org/learn/uae-open-finance-v2-2-deadline/og.png',
      publisherUrl: 'https://openfinance-os.org/',
      publisherLogo: 'https://openfinance-os.org/brand/logo-icon-512.png',
    });
    const graph = data['@graph'] as Array<Record<string, unknown>>;
    const article = graph.find((node) => node['@type'] === 'Article');
    const faq = graph.find((node) => node['@type'] === 'FAQPage');
    expect(article?.headline).toBe(V22_DEADLINE.title);
    expect(article?.name).toBe(V22_DEADLINE.title);
    expect(faq?.name).toBe(V22_DEADLINE.title);
    const questions = faq?.mainEntity as Array<{
      name: string;
      acceptedAnswer: { text: string };
    }>;
    expect(questions.map((item) => item.name)).toEqual(
      V22_DEADLINE.faqs.map((item) => item.question)
    );
    expect(questions.map((item) => item.acceptedAnswer.text)).toEqual(
      V22_DEADLINE.faqs.map((item) => item.answer)
    );
  });

  it('reads the committed social card at its real pixel size', () => {
    const bytes = readFileSync(
      join(process.cwd(), 'public', V22_DEADLINE.ogPath.replace(/^\//, ''))
    );
    expect(pngSize(bytes)).toEqual({ width: 1200, height: 630 });
  });
});
