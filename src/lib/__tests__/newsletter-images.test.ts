import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ISSUE_OG_HEIGHT,
  ISSUE_OG_WIDTH,
  NEWSLETTER_IMAGE_MAP,
  issueOgPath,
  normalizeOpenFinanceCasing,
  prepareIssueContent,
} from '../newsletter-images.mjs';

describe('newsletter image mapping', () => {
  it('replaces every known Buttondown host with a site file at least 2x a wide display', () => {
    const prepared = prepareIssueContent({
      subject: 'UAE open finance weekly',
      description: '',
      body: NEWSLETTER_IMAGE_MAP.map((image) => `<img src="${image.buttondown}">`).join(''),
      image: NEWSLETTER_IMAGE_MAP[0].buttondown,
    });

    expect(prepared.subject).toBe('UAE Open Finance weekly');
    expect(prepared.image).toBe('/newsletter/header.webp');
    expect(prepared.body).not.toContain('buttondown');
    for (const image of NEWSLETTER_IMAGE_MAP) {
      expect(prepared.body).toContain(image.src);
      expect(image.width).toBeGreaterThanOrEqual(2480);
    }
    expect(NEWSLETTER_IMAGE_MAP[0].width).toBeGreaterThanOrEqual(2880);
  });

  it('leaves already-mapped copy unchanged', () => {
    const once = prepareIssueContent({
      subject: 'UAE Open Finance',
      description: 'UAE Open Finance',
      body: '<img src="/newsletter/header.webp">',
      image: '/newsletter/header.webp',
    });
    expect(prepareIssueContent(once)).toEqual(once);
  });

  it('matches the committed social card to the published Open Graph size', () => {
    const slug = 'uae-open-finance-why-12-of-30-registrations';
    const file = join(process.cwd(), 'public', issueOgPath(slug).replace(/^\//, ''));
    const png = readFileSync(file);
    expect(png.readUInt32BE(16)).toBe(ISSUE_OG_WIDTH);
    expect(png.readUInt32BE(20)).toBe(ISSUE_OG_HEIGHT);
    expect(normalizeOpenFinanceCasing('uae open finance')).toBe('UAE Open Finance');
  });
});
