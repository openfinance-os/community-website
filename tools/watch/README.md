# Ecosystem Watch

The **Ecosystem Watch** is an independent weekly monitor of the UAE Open
Finance ecosystem (Al Tareq / Nebras / CBUAE), served at
[`/observatory/watch/`](https://openfinance-os.org/observatory/watch/).
It reports API & payment volumes, standards/spec changes across all three
publication layers (GitHub / Confluence / website), and CBUAE release
compliance by tier — treating every institution as a neutral peer row.

It migrated here from a standalone Cloudflare Pages project
(`ecosystem-watcher.openfinance-os.org`, which now redirects to this page).

## How it works

```
weekly job ──▶ data/watch/payload.json   (the numbers + findings, recomputed each run)
              data/watch/state.json     (diff basis for the next run)
              data/watch/history.json   (week-over-week trend, ~26 entries)
                     │  git commit + push
                     ▼
Astro build ──▶ src/pages/observatory/watch/index.html.ts
              injects payload into tools/watch/watch.template.html (__DATA__)
                     ▼
Cloudflare Pages ──▶ openfinance-os.org/observatory/watch/
```

A scheduled Claude job runs every Monday morning (Dubai time). Each run it:

0. Runs `of_watch_metrics.py guard` first. If the source data has not advanced
   since the last run (same `asOfData`, no headline signal moved), the run is a
   no-op beyond the daily deadline-radar re-stamp: it skips the heavy recompute,
   the commit, and the `history.json` append. This keeps frozen-data weeks from
   minting duplicate history rows and empty-signal commits.
1. Recomputes every figure from the freshly downloaded Nebras metrics logs
   and the production Trust Framework directory (never copies numbers
   forward). The log-derived block is produced by `of_watch_metrics.py compute`
   (money summed in integer fils, not float AED), and `of_watch_metrics.py
   verify` re-derives it from source and checks the payload to the digit before
   publishing — catching both internal-consistency failures **and** drift from
   the raw logs (an internally-consistent hand edit that no longer matches the
   source passes the old assertions but fails `verify`).
2. Diffs standards/specs (api-specs main **and** the website spec branch),
   release notes & errata, Confluence (OF space), GitHub org activity, and
   CBUAE news against `data/watch/state.json`.
3. Rebuilds `data/watch/payload.json`, appends to `history.json`, overwrites
   `state.json`, and commits the three files to this repo. The site rebuild
   does the rest.

The job's full prompt lives at [`routine-prompt.md`](./routine-prompt.md) — it is
the instruction set pasted into the scheduled Claude Code routine
(claude.ai/code/routines) that fires every Monday.

## Files

| Path | Purpose |
| --- | --- |
| `watch.template.html` | Self-contained dashboard template; consumes the payload via `var D=__DATA__` |
| `build_watch_page.py` | Standalone preview builder (the site build uses the Astro endpoint instead) |
| `of_watch_metrics.py` | Deterministic recompute of the log-derived metrics (money in integer fils) + `verify` (source-fidelity self-check) + `guard` (early-exit when data hasn't advanced) |
| `of_watch_specdiff.py` | Field-level OpenAPI diff of the tracked spec surface via `raw.githubusercontent.com` — works with no GitHub API (see "Degraded GitHub scope") |
| `test_of_watch_metrics.py` / `test_of_watch_specdiff.py` | No-network unit tests (`python3 tools/watch/test_of_watch_*.py`) |
| `of_watch_breaking.py` | Builds the `breaking` payload block from the api-specs breaking-changes registers |
| `of_watch_production.py` | Builds the production adoption grid from the Trust Framework directory + metrics logs |
| `../../data/watch/payload.json` | Latest weekly payload (rendered by the page) |
| `../../data/watch/state.json` | Diff basis between runs |
| `../../data/watch/history.json` | Week-over-week history (~26 runs) |
| `../../data/watch/references/` | CBUAE market-adoption timeline (mandate dates used by the deadline radar) |

## Local preview

```bash
python3 tools/watch/build_watch_page.py \
  tools/watch/watch.template.html data/watch/payload.json /tmp/watch.html
open /tmp/watch.html
```

Or just `npm run build` — the page lands in `dist/observatory/watch/index.html`.

## Metrics recompute & verification

```bash
# recompute the log-derived block from the live feeds (money in integer fils)
python3 tools/watch/of_watch_metrics.py compute

# gate the current payload against a fresh recompute (exit 1 on any mismatch)
python3 tools/watch/of_watch_metrics.py verify --payload data/watch/payload.json

# did the source data advance since the last run? (exit 3 = unchanged, skip)
python3 tools/watch/of_watch_metrics.py guard --state data/watch/state.json

# unit tests (no network)
python3 tools/watch/test_of_watch_metrics.py
```

`compute`/`verify`/`guard` fetch the live logs by default; pass `--api/--auth/--pay`
with local snapshots for offline runs.

## Degraded GitHub scope

The spec/standards layer (§3a/§3b) reads the `Nebras-Open-Finance` org, which is
separate from this repo. If the routine's session is scoped only to
`openfinance-os/community-website`, the GitHub integration returns **403** for
`api.github.com`, `github.com`, and `codeload` — so org repo enumeration, branch
heads, commit/PR history, and compare diffs are unavailable.

- **Full fix:** widen the session's GitHub scope (on claude.ai/code, the
  environment's repository configuration — not the network egress list) to
  include the `Nebras-Open-Finance` public repos (`api-specs`,
  `community-standards`, `postman`, `.github`, `agentic-toolkit`). Requires the
  Claude Code GitHub App to be authorized on that org.
- **Partial fix (works with no config):** `raw.githubusercontent.com` stays
  reachable, and `state.specFiles` stores each tracked file's **git blob SHA-1**,
  so the field-level OpenAPI diff needs no API. `of_watch_specdiff.py` fetches
  every tracked path via raw, recomputes the blob SHA-1, and reports changed /
  missing files with version + endpoint-count deltas and blob URLs:

  ```bash
  python3 tools/watch/of_watch_specdiff.py --state data/watch/state.json --ref main
  ```

  What raw **cannot** recover: discovery of brand-new spec files, new branches,
  and commit/PR history — those still need the API. The tool prints the tree URL
  for a manual eyeball and the routine flags the gap under ALERTS.

## Editorial stance

The watch is ecosystem-neutral regulatory oversight. It singles out no
individual institution: every LFI and TPP appears only as a row in league
tables, adoption lists, and heatmaps, identical to its peers. Every change it
reports carries a clickable source URL (GitHub commit/compare, Nebras page,
Confluence page, CBUAE rulebook, or the production directory).
