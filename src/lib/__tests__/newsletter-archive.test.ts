import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  assertIssues,
  formatIssueDate,
  issueExcerpt,
  issueImage,
  sanitizeIssueHtml,
  sortIssuesNewestFirst,
} from '../newsletter-archive';

const issuesPath = join(process.cwd(), 'data/newsletter/issues.json');

describe('sanitizeIssueHtml', () => {
  it('strips scripts, tracking pixels, and the Buttondown editor comment', () => {
    const html = [
      '<!-- buttondown-editor-mode: fancy -->',
      '<p>Hello &amp; welcome</p>',
      '<script>alert(1)</script>',
      '<img src="https://buttondown.com/o/abc/open" width="1" height="1" alt="">',
      '<img src="https://assets.buttondown.email/images/real.png" alt="Chart" width="600">',
      '<a href="javascript:alert(1)" onclick="alert(2)">hidden</a>',
      '<td style="background:#111111;color:#ffffff;border-left:4px solid #E8A85C;">Copy</td>',
    ].join('');

    const clean = sanitizeIssueHtml(html);

    expect(clean).not.toContain('buttondown-editor-mode');
    expect(clean).not.toContain('<script');
    expect(clean).not.toContain('alert');
    expect(clean).not.toContain('width="1"');
    expect(clean).not.toContain('javascript:');
    expect(clean).not.toContain('onclick');
    expect(clean).not.toContain('background');
    expect(clean).toContain('Hello &amp; welcome');
    expect(clean).toContain('https://assets.buttondown.email/images/real.png');
    expect(clean).toContain('alt="Chart"');
    expect(clean).toContain('border-left: 4px solid #E8A85C');
    expect(clean).toContain('hidden');
    expect(clean).toContain('Copy');
  });

  it('drops iframe content and unquoted event handlers', () => {
    const clean = sanitizeIssueHtml(
      '<p>Keep</p><iframe src="https://evil.example/x"><p>inside</p></iframe><img src=https://cdn.example/a.png onerror=alert(1) alt="Diagram">'
    );

    expect(clean).toContain('Keep');
    expect(clean).not.toContain('iframe');
    expect(clean).not.toContain('inside');
    expect(clean).not.toContain('onerror');
    expect(clean).toContain('src="https://cdn.example/a.png"');
  });
});

describe('issue archive helpers', () => {
  const older = {
    id: 'em_old',
    slug: 'older-issue',
    subject: 'Older',
    description: '',
    publish_date: '2026-10-01T00:00:00Z',
    body: '<p>First sentence of the older briefing.</p>',
    image: '',
    absolute_url: 'https://buttondown.com/openfinance-os/archive/older-issue/',
  };
  const newer = {
    ...older,
    id: 'em_new',
    slug: 'newer-issue',
    subject: 'Newer',
    description: 'A ready-made preview.',
    publish_date: '2026-10-29T09:09:36Z',
    image: ' https://assets.example/header.png ',
  };

  it('sorts sent issues newest first', () => {
    expect(sortIssuesNewestFirst([older, newer]).map((issue) => issue.slug)).toEqual([
      'newer-issue',
      'older-issue',
    ]);
  });

  it('prefers the description and otherwise excerpts the body', () => {
    expect(issueExcerpt(newer)).toBe('A ready-made preview.');
    expect(issueExcerpt(older)).toBe('First sentence of the older briefing.');
    expect(issueExcerpt({ description: '', body: `<p>${'word '.repeat(80)}</p>` }, 40)).toMatch(
      /…$/
    );
  });

  it('formats the publish date in UTC and ignores blank images', () => {
    expect(formatIssueDate(newer.publish_date)).toBe('29 October 2026');
    expect(issueImage(newer)).toBe('https://assets.example/header.png');
    expect(issueImage({ image: '  ' })).toBeNull();
    expect(issueImage({ image: null })).toBeNull();
  });

  it('rejects issues that cannot become stable archive URLs', () => {
    expect(() => assertIssues([{ ...newer, slug: '../nope' }])).toThrow(/slug/);
    expect(assertIssues([newer])[0].slug).toBe('newer-issue');
  });
});

describe('committed newsletter archive', () => {
  it('keeps the sent issue and removes the editor comment when rendered', () => {
    const issues = assertIssues(JSON.parse(readFileSync(issuesPath, 'utf8')));
    expect(issues.map((issue) => issue.slug)).toContain(
      'uae-open-finance-why-12-of-30-registrations'
    );
    const issue = issues[0];
    const clean = sanitizeIssueHtml(issue.body);
    expect(issue.body).toContain('buttondown-editor-mode');
    expect(clean).not.toContain('buttondown-editor-mode');
    expect(clean).not.toContain('<script');
    expect(issue.subject).toBe(
      'UAE Open Finance: why 12 of 30 registrations publish an auth server'
    );
    expect(clean).toContain('This week in UAE Open Finance');
    expect(clean).not.toContain('assets.buttondown.email');
    expect(clean).not.toContain('buttondown.com');
    expect(clean).toContain('srcset="/newsletter/story-registry-light.webp 3600w"');
    expect(clean).toContain('width: 100%');
    expect(clean).toContain('height: auto');
    expect(issueImage(issue)).toBe('/newsletter/header.webp');
  });
});
