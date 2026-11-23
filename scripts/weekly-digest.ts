/**
 * Weekly digest — "This week in UAE Open Finance".
 *
 * A deterministic, factual weekly summary generated from data already in
 * the repo: the registry changelog (diffed daily snapshots) and the
 * Ecosystem Watch history (dated cumulative and period-based metrics). No LLM, no external
 * calls — so the independent record can't hallucinate.
 *
 * Opens a PR adding a post to src/content/news/, then merges it immediately —
 * every figure is computed deterministically from data already committed to
 * the repo (registry snapshots + Ecosystem Watch history), so there is no
 * editorial judgment call to gate on; the PR exists purely as an audit trail.
 * Reuses createFilePR from the news pipeline (unlike news curation, which
 * still gates external articles on manual review).
 *
 * Usage:
 *   tsx scripts/weekly-digest.ts            # open a PR (needs GH_TOKEN)
 *   tsx scripts/weekly-digest.ts --dry-run  # print + write to disk, no PR
 *
 * Env: GH_TOKEN, GITHUB_REPOSITORY (owner/repo).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { summarizeWatch, type WatchRun, type WatchPeriod } from './utils/watch-digest.js';
import {
  getRecentEvents,
  getTrackingSince,
  type ChangelogEvent,
} from '../src/lib/registry-changelog.js';
import { createFilePR } from './utils/github-pr-creator.js';

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT = process.cwd();
const NEWS_DIR = join(ROOT, 'src', 'content', 'news');

function readJson<T>(rel: string): T {
  return JSON.parse(readFileSync(join(ROOT, rel), 'utf8')) as T;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

const eventVerb: Record<ChangelogEvent['type'], string> = {
  went_live: 'first published an active authorization server with an issuer in our observations',
  joined: 'joined the production registry',
  role_added: 'added a role',
  api_family_added: 'had additional API families first observed (collection coverage can change)',
  role_removed: 'had role claims no longer observed',
  api_family_removed: 'had API families no longer observed',
  resource_changed: 'had resource declarations change (observation, not deployment evidence)',
  went_offline:
    'no longer published an active authorization server with an issuer in our observations',
  left: 'left the registry',
};

export function buildDigest(): {
  slug: string;
  title: string;
  description: string;
  markdown: string;
} {
  const latest = readJson<{
    timestamp: string;
    summary: { liveInProduction: number; totalParticipants: number };
  }>('data/observatory/snapshots/production/latest.json');
  const observedDate = latest.timestamp.slice(0, 10);
  const live = latest.summary.liveInProduction;
  const total = latest.summary.totalParticipants;

  // Registry changes in the last 7 days
  const events = getRecentEvents(7);

  // Watch: latest run vs the run closest to 7 days earlier
  const history = readJson<{ runs: WatchRun[] }>('data/watch/history.json');
  const runs = history.runs || [];
  const cur = runs[runs.length - 1];
  const period = existsSync(join(ROOT, 'data/watch/payload.json'))
    ? readJson<WatchPeriod>('data/watch/payload.json')
    : undefined;

  // Window label: from the earliest event (or a week ago) to the observed date
  const start = new Date(Date.parse(observedDate) - 7 * 24 * 3600 * 1000)
    .toISOString()
    .slice(0, 10);
  const rangeLabel = `${fmtDate(start)}–${fmtDate(observedDate)}`;
  const slug = `${observedDate}-weekly-digest`;
  const title = `This week in UAE Open Finance — ${rangeLabel}`;

  // ---- registry section ----
  const registryLines: string[] = [];
  registryLines.push(
    `**${live}** of **${total}** production directory registrations publish an active authorization server with an issuer. This is published metadata, not verified service availability or traffic.`
  );
  if (events.length === 0) {
    registryLines.push('\nNo changes to the production registry this week.');
  } else {
    registryLines.push(
      `\n${events.length} registry ${events.length === 1 ? 'change' : 'changes'} this week:\n`
    );
    for (const e of events) {
      const detail = e.detail ? ` (${e.detail})` : '';
      registryLines.push(`- **${fmtDate(e.date)}** — ${e.name} ${eventVerb[e.type]}${detail}`);
    }
  }

  // ---- activity section ----
  const activity = cur ? summarizeWatch(cur, period) : '';

  // ---- description ----
  const changeSummary =
    events.length === 0
      ? 'no registry changes'
      : `${events.length} registry ${events.length === 1 ? 'change' : 'changes'}`;
  const description = `UAE Open Finance: ${total} production registrations, ${live} with a published authorization server; ${changeSummary}. Dated activity measures with explicit reporting windows.`;

  const markdown = `---
title: "${title.replace(/"/g, '\\"')}"
date: ${observedDate}
type: milestone
region: uae
author: Open Finance OS
description: "${description.replace(/"/g, '\\"')}"
---

Our weekly read on the UAE Open Finance ecosystem, drawn straight from the [Observatory](/observatory) and the [Ecosystem Watch](/observatory/watch/). Every figure below is computed from public data — the trust-framework directory and the Al Tareq platform's own logs — with our [methodology](/observatory/methodology) in the open.

## The registry

${registryLines.join('\n')}
${activity ? `\n## Ecosystem activity\n\n${activity}\n` : ''}
## Dig deeper

- **[Full registry changelog →](/observatory#changelog)** — every registration, authorization-server and role change since ${getTrackingSince()}
- **[Ecosystem Watch →](/observatory/watch/)** — adoption, reliability and standards, week by week
- **[Download the data →](/observatory/data)** — the snapshots and history behind this digest

*This is an independent, community-run digest — not official. Building or integrating? Consult the [official Open Finance documentation](https://openfinanceuae.atlassian.net/wiki/spaces/OF/overview). [nebras-open-finance.com](https://nebras-open-finance.com/) is a community technical reference, not an official operator site. Check the relevant version and errata.*
`;

  return { slug, title, description, markdown };
}

async function main() {
  const { slug, title, description, markdown } = buildDigest();
  const filePath = `src/content/news/${slug}.md`;

  if (existsSync(join(NEWS_DIR, `${slug}.md`))) {
    console.log(`Digest for this week already exists (${slug}.md) — nothing to do.`);
    return;
  }

  if (DRY_RUN) {
    const out = join(NEWS_DIR, `${slug}.md`);
    writeFileSync(out, markdown, 'utf8');
    console.log(`DRY RUN — wrote ${out}\n`);
    console.log(markdown);
    return;
  }

  const token = process.env.GH_TOKEN;
  if (!token) {
    console.error('Missing GH_TOKEN — cannot open the digest PR.');
    process.exit(1);
  }
  const repoEnv = process.env.GITHUB_REPOSITORY || 'openfinance-os/community-website';
  const [owner, repo] = repoEnv.split('/');

  const pr = await createFilePR(
    {
      branchName: `digest/${slug}`,
      filePath,
      content: markdown,
      commitMessage: `feat(news): weekly digest ${slug}`,
      prTitle: `[Digest] ${title}`,
      prBody: `Auto-generated weekly ecosystem digest.\n\n> ${description}\n\nAll figures are computed deterministically from committed data (registry snapshots + Ecosystem Watch history) — auto-merged on creation, no manual review needed.`,
      labels: ['weekly-digest', 'auto-generated'],
      autoMerge: true,
    },
    { token, owner, repo }
  );
  console.log(`Published digest PR #${pr.number}: ${pr.url}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error('Weekly digest failed:', err);
    process.exit(1);
  });
}
