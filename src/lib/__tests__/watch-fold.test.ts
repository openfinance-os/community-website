/**
 * @vitest-environment happy-dom
 */
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import payload from '../../../data/watch/payload.json';

type LogEntry = {
  title?: string;
  layer?: string;
  status?: string;
  since?: string;
  text?: string;
  url?: string;
};
type RepoRow = [string, string, string, string];
type CommitRow = [string, string, string, string];
type WatchData = Omit<typeof payload, 'changeLog' | 'repos' | 'commits'> & {
  changeLog: LogEntry[];
  repos: RepoRow[];
  commits: CommitRow[];
};
type WatchWindow = Window & { D: WatchData; H: () => string };

const QUIET = /^\s*no change\.?\s*$/i;

function repoHome(url: string) {
  const home = String(url || '').match(/^(https?:\/\/github\.com\/[^/\s]+\/[^/\s?#]+)/i);
  return home ? home[1].replace(/\.git$/i, '') : url;
}

function card(html: string, title: string) {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const heading = [...doc.querySelectorAll('h3')].find((node) =>
    (node.childNodes[0]?.textContent || '').startsWith(title)
  );
  const panel = heading?.closest('.card');
  if (!panel) throw new Error(`missing ${title} card`);
  return panel;
}

function visibleTable(panel: Element) {
  return [...panel.querySelectorAll('table')].find((table) => !table.closest('details')) ?? null;
}

function rowTitles(table: Element | null) {
  return [...(table?.querySelectorAll('tbody tr') ?? [])].map(
    (row) => row.querySelector('b')?.textContent ?? ''
  );
}

let win: WatchWindow;

beforeAll(() => {
  const template = readFileSync('tools/watch/watch.template.html', 'utf8');
  const embedded = template.replace('__DATA__', () =>
    readFileSync('data/watch/payload.json', 'utf8').replace(/</g, '\\u003c')
  );
  const script = embedded.match(/<script>([\s\S]*)<\/script>/)![1].split('document.write(H());')[0];
  window.eval(script);
  win = window as unknown as WatchWindow;
});

function render(patch?: (data: WatchData) => void) {
  const saved = structuredClone(win.D);
  if (patch) patch(win.D);
  try {
    return win.H();
  } finally {
    win.D = saved;
  }
}

describe('watch panel folding', () => {
  it('keeps new and changed log rows open and folds the rest', () => {
    const panel = card(render(), 'Change log');
    const log = payload.changeLog as LogEntry[];
    const hot = log.filter((entry) => entry.status === 'new' || entry.status === 'changed');
    const rest = log.filter((entry) => entry.status !== 'new' && entry.status !== 'changed');
    expect(hot.length).toBeGreaterThan(0);
    expect(rowTitles(visibleTable(panel))).toEqual(hot.map((entry) => entry.title));

    const details = panel.querySelector('details.more');
    expect(details?.querySelector('summary')?.textContent).toBe(`Show ${rest.length} more`);
    expect(details?.hasAttribute('open')).toBe(false);
    const hidden = details?.querySelector('table')?.textContent ?? '';
    const visible = visibleTable(panel)?.textContent ?? '';
    for (const entry of hot) {
      expect(visible).toContain(entry.text);
      expect(hidden).not.toContain(entry.text);
    }
    for (const entry of rest) {
      expect(hidden).toContain(entry.text);
      expect(visible).not.toContain(entry.text);
    }
  });

  it('shows the two latest entries when nothing is new or changed', () => {
    const entries: LogEntry[] = [
      {
        title: 'Old',
        status: 'standing',
        since: '2026-01-01',
        text: 'old body',
        url: 'https://example.com/old',
      },
      {
        title: 'Middle',
        status: 'nochange',
        since: '2026-06-01',
        text: 'middle body',
        url: 'https://example.com/mid',
      },
      {
        title: 'Newer',
        status: 'standing',
        since: '2026-11-01',
        text: 'newer body',
        url: 'https://example.com/new',
      },
      {
        title: 'Newest',
        status: 'STANDING',
        since: '2026-11-20',
        text: 'newest body',
        url: 'https://example.com/newest',
      },
    ];
    const panel = card(
      render((data) => {
        data.changeLog = entries;
      }),
      'Change log'
    );
    expect(rowTitles(visibleTable(panel))).toEqual(['Newer', 'Newest']);
    expect(panel.querySelector('summary')?.textContent).toBe('Show 2 more');
    expect(panel.querySelector('details')?.textContent).toContain('Old');
    expect(panel.querySelector('details')?.textContent).toContain('Middle');
    expect(visibleTable(panel)?.textContent).toContain('Standing');
  });

  it('breaks a date tie by original order and skips the toggle when nothing is hidden', () => {
    const panel = card(
      render((data) => {
        data.changeLog = [
          {
            title: 'First',
            status: 'nochange',
            since: '2026-11-01',
            text: 'first body',
            url: 'https://example.com/1',
          },
          {
            title: 'Second',
            status: 'standing',
            since: '2026-11-01',
            text: 'second body',
            url: 'https://example.com/2',
          },
          {
            title: 'Third',
            status: 'standing',
            since: '2026-11-01',
            text: 'third body',
            url: 'https://example.com/3',
          },
        ];
      }),
      'Change log'
    );
    expect(rowTitles(visibleTable(panel))).toEqual(['First', 'Second']);
    expect(panel.querySelector('summary')?.textContent).toBe('Show 1 more');

    const allOpen = card(
      render((data) => {
        data.changeLog = [
          {
            title: 'Only new',
            status: 'NEW',
            since: '2026-11-01',
            text: 'brand new',
            url: 'https://example.com/n',
          },
          {
            title: 'Only changed',
            status: 'CHANGED',
            since: '2026-10-01',
            text: 'edited',
            url: 'https://example.com/c',
          },
        ];
      }),
      'Change log'
    );
    expect(rowTitles(visibleTable(allOpen))).toEqual(['Only new', 'Only changed']);
    expect(allOpen.querySelector('details')).toBeNull();
    expect(allOpen.innerHTML).toContain('t-new');
    expect(allOpen.innerHTML).toContain('t-chg');
  });

  it('still understands the legacy array change-log shape', () => {
    const panel = card(
      render((data) => {
        data.changeLog = [
          ['Legacy new', 'NEW signal', 'legacy new body', 'https://example.com/new'],
          ['Legacy quiet', 'No change.', 'legacy quiet body', 'https://example.com/quiet'],
        ] as unknown as LogEntry[];
      }),
      'Change log'
    );
    expect(rowTitles(visibleTable(panel))).toEqual(['Legacy new']);
    expect(panel.querySelector('summary')?.textContent).toBe('Show 1 more');
    expect(panel.querySelector('details')?.textContent).toContain('legacy quiet body');
  });

  it('collapses unchanged repos and folds the commit list', () => {
    const panel = card(render(), 'GitHub repos');
    const quiet = (payload.repos as RepoRow[]).filter((repo) => QUIET.test(repo[2]));
    const moved = (payload.repos as RepoRow[]).filter((repo) => !QUIET.test(repo[2]));
    expect(quiet.length).toBeGreaterThan(0);
    expect(moved.length).toBeGreaterThan(0);
    expect(rowTitles(visibleTable(panel))).toEqual(moved.map((repo) => repo[0]));
    for (const repo of moved) {
      expect(visibleTable(panel)?.textContent).toContain(repo[2]);
      expect(visibleTable(panel)?.innerHTML).toContain(repo[3]);
    }

    const quietLine = [...panel.querySelectorAll('.note')].find((note) =>
      (note.childNodes[0]?.textContent || '').startsWith('No change:')
    );
    expect(quietLine?.closest('details')).toBeNull();
    const links = [...(quietLine?.querySelectorAll('a') ?? [])];
    expect(links.map((link) => link.textContent)).toEqual(quiet.map((repo) => repo[0]));
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      quiet.map((repo) => repoHome(repo[3]))
    );
    expect(quietLine?.textContent).toBe(`No change: ${quiet.map((repo) => repo[0]).join(', ')}`);

    const commits = [...panel.querySelectorAll('details.more')].find((details) =>
      details.querySelector('summary')?.textContent?.startsWith('Show ')
    );
    expect(commits?.querySelector('summary')?.textContent).toBe(
      `Show ${payload.commits.length} commit${payload.commits.length === 1 ? '' : 's'}`
    );
    expect(commits?.hasAttribute('open')).toBe(false);
    for (const commit of payload.commits as CommitRow[]) {
      expect(commits?.textContent).toContain(commit[1]);
      expect(quietLine?.textContent).not.toContain(commit[0]);
    }

    const standards = [...panel.querySelectorAll('.note')].find((note) =>
      (note.childNodes[0]?.textContent || '').startsWith('Standards:')
    );
    expect(standards?.closest('details')).toBeNull();
    expect(standards?.textContent).toContain('release notes');
    expect(standards?.textContent).toContain('errata');
    expect(standards?.textContent).toContain('website spec branch');
  });

  it('keeps a repo expanded when its note is more than the no-change sentinel', () => {
    const panel = card(
      render((data) => {
        data.repos = [
          [
            'postman',
            'abc1234',
            'No change, but a new collection was added.',
            'https://github.com/Nebras-Open-Finance/postman/commit/abc1234',
          ],
          [
            'agentic-toolkit',
            'def5678',
            'No change.',
            'https://github.com/Nebras-Open-Finance/agentic-toolkit/commit/def5678',
          ],
        ];
        data.commits = [
          ['abc1234', 'one commit subject', '2026-11-01', 'https://github.com/example/commit/abc'],
        ];
      }),
      'GitHub repos'
    );
    expect(rowTitles(visibleTable(panel))).toEqual(['postman']);
    expect(visibleTable(panel)?.textContent).toContain(
      'No change, but a new collection was added.'
    );
    const quietLine = [...panel.querySelectorAll('.note')].find((note) =>
      note.textContent?.startsWith('No change:')
    );
    expect(quietLine?.querySelector('a')?.getAttribute('href')).toBe(
      'https://github.com/Nebras-Open-Finance/agentic-toolkit'
    );
    expect(panel.querySelector('summary')?.textContent).toBe('Show 1 commit');
    const standards = [...panel.querySelectorAll('.note')].find((note) =>
      note.textContent?.startsWith('Standards:')
    );
    expect(standards?.closest('details')).toBeNull();
  });
});
