import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  BUTTONDOWN_SENT_URL,
  fetchAllSentEmails,
  nextArchiveFile,
  syncNewsletterArchive,
} from '../sync-newsletter-archive.mjs';

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function email(overrides: Record<string, unknown> = {}) {
  return {
    id: 'em_1',
    slug: 'first-issue',
    subject: 'First',
    description: 'Preview',
    publish_date: '2026-10-01T00:00:00Z',
    body: '<p>Hello</p>',
    image: '',
    absolute_url: 'https://buttondown.com/openfinance-os/archive/first-issue/',
    status: 'sent',
    secondary_id: 'drop-me',
    ...overrides,
  };
}

describe('fetchAllSentEmails', () => {
  it('requests sent emails with the token header and keeps archive fields', async () => {
    const calls: Array<{ url: string; authorization: string }> = [];
    const issues = await fetchAllSentEmails({
      apiKey: 'secret',
      fetchImpl: async (url: string, init?: { headers?: Record<string, string> }) => {
        calls.push({ url, authorization: init?.headers?.Authorization ?? '' });
        return {
          ok: true,
          json: async () => ({ results: [email()], next: null }),
        };
      },
    });

    expect(calls).toEqual([{ url: BUTTONDOWN_SENT_URL, authorization: 'Token secret' }]);
    expect(issues).toEqual([
      {
        id: 'em_1',
        slug: 'first-issue',
        subject: 'First',
        description: 'Preview',
        publish_date: '2026-10-01T00:00:00Z',
        body: '<p>Hello</p>',
        image: null,
        absolute_url: 'https://buttondown.com/openfinance-os/archive/first-issue/',
      },
    ]);
  });

  it('follows next pages and returns the newest issue first', async () => {
    const page2 = 'https://api.buttondown.com/v1/emails?status=sent&page=2';
    const issues = await fetchAllSentEmails({
      apiKey: 'secret',
      fetchImpl: async (url: string) => ({
        ok: true,
        json: async () =>
          url === BUTTONDOWN_SENT_URL
            ? {
                results: [email(), email({ status: 'draft', slug: 'draft-issue', id: 'em_draft' })],
                next: page2,
              }
            : {
                results: [
                  email({
                    id: 'em_2',
                    slug: 'second-issue',
                    publish_date: '2026-10-29T00:00:00Z',
                    image: 'https://assets.example/two.png',
                  }),
                ],
                next: null,
              },
      }),
    });

    expect(issues.map((issue: { slug: string }) => issue.slug)).toEqual([
      'second-issue',
      'first-issue',
    ]);
    expect(issues[0].image).toBe('https://assets.example/two.png');
  });

  it('requires the API key and a results array', async () => {
    await expect(fetchAllSentEmails({ apiKey: ' ' })).rejects.toThrow(/BUTTONDOWN_API_KEY/);
    await expect(
      fetchAllSentEmails({
        apiKey: 'secret',
        fetchImpl: async () => ({ ok: false, status: 401, json: async () => ({}) }),
      })
    ).rejects.toThrow(/401/);
    await expect(
      fetchAllSentEmails({
        apiKey: 'secret',
        fetchImpl: async () => ({ ok: true, json: async () => ({ emails: [] }) }),
      })
    ).rejects.toThrow(/results/);
  });
});

describe('syncNewsletterArchive', () => {
  it('writes the archive when sent issues change and refuses to wipe it', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'newsletter-'));
    tempDirs.push(dir);
    const issuesPath = join(dir, 'issues.json');
    writeFileSync(issuesPath, '[\n  {"slug":"keep"}\n]\n');

    expect(() => nextArchiveFile(readFileSync(issuesPath, 'utf8'), [])).toThrow(/refusing to wipe/);

    const result = await syncNewsletterArchive({
      apiKey: 'secret',
      issuesPath,
      fetchImpl: async () => ({
        ok: true,
        json: async () => ({ results: [email()], next: null }),
      }),
    });

    expect(result.changed).toBe(true);
    expect(JSON.parse(readFileSync(issuesPath, 'utf8'))).toHaveLength(1);

    const again = await syncNewsletterArchive({
      apiKey: 'secret',
      issuesPath,
      fetchImpl: async () => ({
        ok: true,
        json: async () => ({ results: [email()], next: null }),
      }),
    });
    expect(again.changed).toBe(false);
  });
});
