import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Exact phrase that must not appear in public titles, descriptions, or search copy. */
export const LOWERCASE_UAE_OPEN_FINANCE = 'UAE open finance';

export function lowercaseUaeOpenFinanceHits(
  label: string,
  text: string | undefined | null
): string[] {
  if (!text?.includes(LOWERCASE_UAE_OPEN_FINANCE)) return [];
  return [`${label}: ${text.replace(/\s+/g, ' ').trim()}`];
}

const COPY_FIELDS = ['title', 'description', 'summary', 'subject'] as const;

function walk(dir: string, extension: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const info = statSync(path);
    if (info.isDirectory()) walk(path, extension, files);
    else if (entry.endsWith(extension)) files.push(path);
  }
  return files;
}

function quoted(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function frontmatterCopy(raw: string): Array<[string, string]> {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return [];
  const found: Array<[string, string]> = [];
  for (const key of COPY_FIELDS) {
    const field = match[1].match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
    if (field) found.push([key, quoted(field[1])]);
  }
  return found;
}

/** Titles and descriptions that are rendered or copied into the search index. */
export function collectPublicCopyHits(root: string): string[] {
  const hits: string[] = [];

  for (const file of walk(join(root, 'src/content'), '.md')) {
    const relative = file.slice(root.length + 1);
    for (const [key, value] of frontmatterCopy(readFileSync(file, 'utf8'))) {
      hits.push(...lowercaseUaeOpenFinanceHits(`${relative} ${key}`, value));
    }
  }

  const issuesPath = join(root, 'data/newsletter/issues.json');
  const issues = JSON.parse(readFileSync(issuesPath, 'utf8')) as Array<{
    slug?: string;
    subject?: string;
    description?: string;
  }>;
  issues.forEach((issue, index) => {
    const label = issue.slug || `issues[${index}]`;
    hits.push(...lowercaseUaeOpenFinanceHits(`${label} subject`, issue.subject));
    hits.push(...lowercaseUaeOpenFinanceHits(`${label} description`, issue.description));
  });

  for (const file of [
    ...walk(join(root, 'src/pages'), '.astro'),
    ...walk(join(root, 'src/layouts'), '.astro'),
    ...walk(join(root, 'src/components'), '.astro'),
  ]) {
    const relative = file.slice(root.length + 1);
    hits.push(...lowercaseUaeOpenFinanceHits(relative, readFileSync(file, 'utf8')));
  }

  return hits;
}
