/**
 * Weekly digest — "This week in UAE Open Finance".
 *
 * A deterministic, factual weekly summary generated from data already in
 * the repo: the registry changelog (diffed daily snapshots) and the
 * Ecosystem Watch history (week-over-week metrics). No LLM, no external
 * calls — so the independent record can't hallucinate.
 *
 * Like news curation, it opens a PR adding a post to src/content/news/ for
 * a human to review and merge. Reuses createFilePR from the news pipeline.
 *
 * Usage:
 *   tsx scripts/weekly-digest.ts            # open a PR (needs GH_TOKEN)
 *   tsx scripts/weekly-digest.ts --dry-run  # print + write to disk, no PR
 *
 * Env: GH_TOKEN, GITHUB_REPOSITORY (owner/repo).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  getRecentEvents,
  getTrackingSince,
  type ChangelogEvent,
} from '../src/lib/registry-changelog.js';
import { createFilePR } from './utils/github-pr-creator.js';

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT = process.cwd();
const NEWS_DIR = join(ROOT, 'src', 'content', 'news');

interface WatchRun {
  runDate: string;
  totalFull: number;
  errPct: number;
  paySucc: number;
  authPct: number;
  liveLFIs?: number;
  liveTPPs?: number;
  top1Share?: number;
  hhi?: number;
}

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

/** Signed percentage/point delta, or '' when there is no meaningful baseline. */
function delta(cur: number, prev: number, unit: 'pct' | 'pp' | 'abs'): string {
  if (prev === undefined || prev === null) return '';
  const d = cur - prev;
  if (unit === 'pct') {
    if (prev === 0) return '';
    const pct = (d / prev) * 100;
    const sign = pct >= 0 ? '+' : '';
    return ` (${sign}${pct.toFixed(1)}% WoW)`;
  }
  const sign = d >= 0 ? '+' : '';
  const suffix = unit === 'pp' ? 'pp' : '';
  if (d === 0) return ' (no change WoW)';
  return ` (${sign}${d.toFixed(unit === 'pp' ? 1 : 0)}${suffix} WoW)`;
}

const eventVerb: Record<ChangelogEvent['type'], string> = {
  went_live: 'went live in production',
  joined: 'joined the production registry',
  role_added: 'added a role',
  api_family_added: 'added API families',
  went_offline: 'went offline',
  left: 'left the registry',
};

function buildDigest(): { slug: string; title: string; description: string; markdown: string } {
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
  let prev: WatchRun | undefined;
  if (cur) {
    const curMs = Date.parse(cur.runDate);
    const weekAgo = curMs - 6.5 * 24 * 3600 * 1000;
    // most recent run at or before ~a week ago; fall back to the prior run
    prev =
      [...runs].reverse().find((r) => Date.parse(r.runDate) <= weekAgo) || runs[runs.length - 2];
  }

  // Window label: from the earliest event (or a week ago) to the observed date
  const start = new Date(Date.parse(observedDate) - 7 * 24 * 3600 * 1000)
    .toISOString()
    .slice(0, 10);
  const rangeLabel = `${fmtDate(start)}–${fmtDate(observedDate)}`;
  const slug = `${observedDate}-weekly-digest`;
  const title = `This week in UAE Open Finance — ${rangeLabel}`;

  // ---- registry section ----
  const registryLines: string[] = [];
  registryLines.push(`**${live}** of **${total}** registered institutions are live in production.`);
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
  let activity = '';
  if (cur) {
    const p = prev || ({} as WatchRun);
    const lines: string[] = [];
    lines.push(
      `Ecosystem activity, week over week (Ecosystem Watch, to ${fmtDate(cur.runDate)}):\n`
    );
    lines.push(
      `- **${cur.totalFull.toLocaleString('en-US')}** API calls${delta(cur.totalFull, p.totalFull, 'pct')}`
    );
    lines.push(`- Payment success **${cur.paySucc}%**${delta(cur.paySucc, p.paySucc, 'pp')}`);
    lines.push(`- Error rate **${cur.errPct}%**${delta(cur.errPct, p.errPct, 'pp')}`);
    if (cur.liveLFIs !== undefined) {
      lines.push(
        `- **${cur.liveLFIs}** LFIs and **${cur.liveTPPs}** TPPs serving live traffic${
          p.liveLFIs !== undefined ? delta(cur.liveLFIs, p.liveLFIs, 'abs') : ''
        }`
      );
    }
    activity = lines.join('\n');
  }

  // ---- description ----
  const changeSummary =
    events.length === 0
      ? 'no registry changes'
      : `${events.length} registry ${events.length === 1 ? 'change' : 'changes'}`;
  const activitySummary =
    cur && prev
      ? `, API volume ${delta(cur.totalFull, prev.totalFull, 'pct').trim().replace(/[()]/g, '')}`
      : '';
  const description = `The week in the UAE Open Finance ecosystem: ${live} of ${total} institutions live, ${changeSummary}${activitySummary}.`;

  const markdown = `---
title: "${title.replace(/"/g, '\\"')}"
date: ${observedDate}
type: milestone
region: uae
author: OpenFinance-OS
description: "${description.replace(/"/g, '\\"')}"
---

Our weekly read on the UAE Open Finance ecosystem, drawn straight from the [Observatory](/observatory) and the [Ecosystem Watch](/observatory/watch/). Every figure below is computed from public data — the trust-framework directory and the Al Tareq platform's own logs — with our [methodology](/observatory/methodology) in the open.

## The registry

${registryLines.join('\n')}
${activity ? `\n## Ecosystem activity\n\n${activity}\n` : ''}
## Dig deeper

- **[Full registry changelog →](/observatory#changelog)** — every join, go-live and role change since ${getTrackingSince()}
- **[Ecosystem Watch →](/observatory/watch/)** — adoption, reliability and standards, week by week
- **[Download the data →](/observatory/data)** — the snapshots and history behind this digest

*This is an independent, community-run digest — not official. Building or integrating? The operator's hub is at [nebras-open-finance.com](https://nebras-open-finance.com/).*
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
      prBody: `Auto-generated weekly ecosystem digest.\n\n> ${description}\n\nMerge to publish, or close to skip this week. All figures are computed deterministically from committed data (registry snapshots + Ecosystem Watch history).`,
      labels: ['weekly-digest', 'auto-generated'],
    },
    { token, owner, repo }
  );
  console.log(`Opened digest PR #${pr.number}: ${pr.url}`);
}

main().catch((err) => {
  console.error('Weekly digest failed:', err);
  process.exit(1);
});
