interface WatchSummaryPayload {
  runDate?: string;
  asOfData?: string;
  checked?: { date?: string };
  summary?: { area: string; text: string }[];
  links?: Record<string, string>;
}

function escape(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!;
  });
}

function date(value?: string): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Not recorded';
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    return 'Not recorded';
  }
  const label = parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return `<time datetime="${value}">${label}</time>`;
}

/** The fetchable summary remains available when the interactive renderer cannot run. */
export function renderWatchSummary(payload: WatchSummaryPayload): string {
  const sources: [string, string][] = [
    ['Public API metrics', 'https://nebras-open-finance.com/metrics'],
    ['Production directory', 'https://data.directory.openfinance.ae/participants'],
    ['API specifications', 'https://github.com/Nebras-Open-Finance/api-specs'],
    [
      'Open Finance Roadmap',
      'https://openfinanceuae.atlassian.net/wiki/spaces/OF/pages/6259008/Roadmap',
    ],
  ];
  const labels: Record<string, string> = {
    standards: 'Standards release notes',
    errata: 'Consolidated errata',
    apiHub: 'API Hub release notes',
    specBranch: 'Published specification branch',
    v22draft: 'Draft release notes',
  };
  for (const [key, href] of Object.entries(payload.links ?? {})) {
    if (labels[key]) sources.push([labels[key], href]);
  }
  const sourceLinks = sources.flatMap(([label, href]) => {
    try {
      const url = new URL(href);
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return [];
      return [`<li><a href="${escape(url.href)}">${escape(label)}</a></li>`];
    } catch {
      return [];
    }
  });
  const summary = (payload.summary ?? []).map(
    (row) => `<li><strong>${escape(row.area)}:</strong> ${escape(row.text)}</li>`
  );
  return `<section id="watch-summary" class="card head" aria-labelledby="watch-summary-title">
    <h1 id="watch-summary-title">Saved Ecosystem Watch briefing</h1>
    <p>Independent weekly summary · <a href="/observatory/briefing/">Read the integrated briefing</a></p>
    <div class="fresh"><span>Latest data run ${date(payload.runDate)}</span>
      <span>Data as of ${date(payload.asOfData)}</span>
      <span>Last checked ${date(payload.checked?.date)}</span></div>
    <h2>This week</h2><ul>${summary.join('') || '<li>No summary recorded for this run.</li>'}</ul>
    <p class="note">Directory metadata and public logs without environment labels do not independently verify
      production API availability. Data can lag the publication or check date; absence of traffic
      does not prove an institution is not certified.</p>
    <h2>Sources</h2><ul>${sourceLinks.join('')}</ul>
    <p class="note">JavaScript adds the interactive dashboard below. This dated summary remains
      available when JavaScript is disabled or the dashboard cannot load.</p>
  </section>`;
}
