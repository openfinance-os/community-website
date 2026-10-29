import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const BUTTONDOWN_SENT_URL = 'https://api.buttondown.com/v1/emails?status=sent';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const ISSUES_PATH = join(root, 'data', 'newsletter', 'issues.json');

export function normalizeIssue(email) {
  if (!email || typeof email !== 'object') {
    throw new Error('Buttondown email was not an object');
  }
  const slug = stringField(email.slug, 'slug');
  if (!SLUG_RE.test(slug)) throw new Error(`Unexpected newsletter slug: ${slug}`);
  const image = email.image;
  return {
    id: stringField(email.id, 'id'),
    slug,
    subject: stringField(email.subject ?? '', 'subject'),
    description: stringField(email.description ?? '', 'description'),
    publish_date: stringField(email.publish_date ?? '', 'publish_date'),
    body: stringField(email.body ?? '', 'body'),
    image: typeof image === 'string' && image.trim() ? image : null,
    absolute_url: stringField(email.absolute_url ?? '', 'absolute_url'),
  };
}

function stringField(value, name) {
  if (typeof value !== 'string') throw new Error(`Buttondown email is missing ${name}`);
  return value;
}

export function sortIssuesNewestFirst(issues) {
  return [...issues].sort((left, right) => {
    const byDate = right.publish_date.localeCompare(left.publish_date);
    return byDate !== 0 ? byDate : left.slug.localeCompare(right.slug);
  });
}

export function dedupeIssues(issues) {
  const seen = new Set();
  const unique = [];
  for (const issue of sortIssuesNewestFirst(issues)) {
    if (seen.has(issue.slug)) continue;
    seen.add(issue.slug);
    unique.push(issue);
  }
  return unique;
}

export function renderIssuesFile(issues) {
  return `${JSON.stringify(issues, null, 2)}\n`;
}

export function nextArchiveFile(previousText, issues) {
  if (issues.length === 0 && previousText.trim() && previousText.trim() !== '[]') {
    throw new Error('Buttondown returned no sent emails; refusing to wipe the archive');
  }
  return renderIssuesFile(issues);
}

/**
 * @typedef {{ ok: boolean, status?: number, json: () => Promise<any> }} ArchiveResponse
 * @typedef {(url: string, init?: { headers?: Record<string, string> }) => Promise<ArchiveResponse>} ArchiveFetch
 */

/**
 * @param {{ fetchImpl?: ArchiveFetch, apiKey?: string, endpoint?: string }} [options]
 */
export async function fetchAllSentEmails({
  fetchImpl = globalThis.fetch,
  apiKey,
  endpoint = BUTTONDOWN_SENT_URL,
} = {}) {
  if (!apiKey || !String(apiKey).trim()) {
    throw new Error(
      'BUTTONDOWN_API_KEY is required. Add it in the repository settings under Actions secrets.'
    );
  }

  const collected = [];
  const seenUrls = new Set();
  let url = endpoint;

  while (url) {
    if (seenUrls.has(url)) break;
    seenUrls.add(url);
    const response = await fetchImpl(url, {
      headers: {
        Authorization: `Token ${apiKey}`,
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Buttondown request failed (${response.status})`);
    }
    const payload = await response.json();
    if (!payload || !Array.isArray(payload.results)) {
      throw new Error('Buttondown response did not include a results array');
    }
    for (const email of payload.results) {
      if (email?.status && email.status !== 'sent') continue;
      collected.push(normalizeIssue(email));
    }
    url = payload.next ? new URL(payload.next, url).toString() : null;
  }

  return dedupeIssues(collected);
}

/**
 * @param {{ fetchImpl?: ArchiveFetch, apiKey?: string, issuesPath?: string, endpoint?: string }} [options]
 */
export async function syncNewsletterArchive({
  fetchImpl,
  apiKey = process.env.BUTTONDOWN_API_KEY,
  issuesPath = ISSUES_PATH,
  endpoint,
} = {}) {
  const issues = await fetchAllSentEmails({ fetchImpl, apiKey, endpoint });
  const previous = existsSync(issuesPath) ? readFileSync(issuesPath, 'utf8') : '';
  const next = nextArchiveFile(previous, issues);
  if (next === previous) return { changed: false, count: issues.length, issuesPath };
  mkdirSync(dirname(issuesPath), { recursive: true });
  writeFileSync(issuesPath, next);
  return { changed: true, count: issues.length, issuesPath };
}

function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(entry).href;
}

if (isDirectRun()) {
  syncNewsletterArchive()
    .then((result) => {
      console.log(
        result.changed
          ? `Updated ${result.count} sent issue${result.count === 1 ? '' : 's'} in ${result.issuesPath}`
          : `Newsletter archive already has ${result.count} sent issue${result.count === 1 ? '' : 's'}`
      );
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}
