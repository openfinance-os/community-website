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
   since the last run (same `asOfData`, no headline signal moved), it skips the
   heavy recompute and the `history.json` append (no duplicate history rows),
   but still checks standards, Confluence, the directory and news, and commits a
   small heartbeat (`payload.checked`) so readers can see the watch looked this
   week. Countdowns never need re-stamping: the page computes them in the browser.
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
| `of_watch_metrics.py` | Deterministic recompute of the log-derived metrics (money in integer fils) + `verify` (source-fidelity self-check) + `guard` (early-exit when data hasn't advanced). Transparently decodes the sharded `api-log-index.json` format the feed moved to in Sep 2026 (see "API log format" below) |
| `of_watch_specdiff.py` | Field-level OpenAPI diff of the tracked spec surface via `raw.githubusercontent.com` — works with no GitHub API (see "Degraded GitHub scope") |
| `test_of_watch_*.py` | No-network unit tests (`for t in tools/watch/test_of_watch_*.py; do python3 $t; done`) |
| `of_watch_breaking.py` | Builds the `breaking` payload block from the api-specs breaking-changes registers; auto-routes registers on a not-yet-final standards line (rc/draft/beta, or simply newer than `--current-version`) into `pending` instead of requiring hand-classification |
| `of_watch_entities.py` + `../../data/watch/entities.json` | Who each log key / directory org is (name, bank or insurer, CBUAE tier). Every tool reads this; unknown identifiers are reported, never guessed |
| `of_watch_payload.py` | No-network payload linter: neutral field names, short reader text, typed status/since on every change, 5-line summary, heartbeat, and board due dates cross-checked against the CBUAE Annexure. Also run by `verify` |
| `of_watch_production.py` | Builds the production adoption grid from the Trust Framework directory + metrics logs; the "last two full months" traffic window is computed dynamically from the log itself, not a hardcoded month pair |
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

# did the source data advance since the last run?
#   exit 0 = advanced (full recompute + commit + history append)
#   exit 3 = unchanged, not stale (skip the heavy recompute/commit)
#   exit 4 = unchanged AND stale — asOfData hasn't advanced in --stale-days
#            days (default 10) since state["asOfDataSince"]; same skip
#            behaviour as exit 3, but treat it as its own §2 alert (the
#            upstream Nebras log feed may itself have stalled, not just
#            gone quiet for this one run)
python3 tools/watch/of_watch_metrics.py guard --state data/watch/state.json

# unit tests (no network)
python3 tools/watch/test_of_watch_metrics.py
```

`compute`/`verify`/`guard` fetch the live logs by default; pass `--api/--auth/--pay`
with local snapshots for offline runs.

On an ADVANCED run (exit 0), reset `state["asOfDataSince"]` to that run's date
when state.json is rewritten — it anchors the exit-4 staleness clock for future
runs. `guard` also accepts `--today` (default: today) and `--stale-days`
(default: 10) to override the clock/threshold, e.g. for testing.

## API log format

As of Sep 2026, `nebras-open-finance.com/api/api-log.json` itself 200s with
the site's HTML shell instead of the flat JSON array it used to serve — the
log moved to a sharded, dictionary-encoded format: `api-log-index.json`
lists per-quarter shard filenames under the same `/api/` path, and each shard
is `{v, fields, dicts, rows}` (see `of_watch_metrics.py`'s "API LOG FORMAT"
docstring for the exact decode). `of_watch_metrics._get_api_rows` and
`of_watch_production._fetch_log` both decode this transparently — every
caller (`compute`, `verify`, `guard`, the production grid) still sees the
same flat list-of-dicts shape as before, live or from a `--api` snapshot. If
Nebras changes the wire format again, `_rows_from_api_json` is the one place
to teach it a third shape; a mismatch it can't parse fails loudly there
rather than silently returning zero/garbage rows further downstream.

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

  `--probe` closes most of the new-file gap without the API: it checks
  convention-derived successor folders (next minor / major version, next errata —
  e.g. `v2.2.x`, `v2.1-errata4`) for the families already tracked, so a new
  version line appearing (e.g. the Dec-2026 V2.2 uplift) is caught early.

  **Residual gap** (no host can recover it here — the egress allowlist blocks
  `github.com` / `codeload` / third-party mirrors, and `api.github.com` is
  repo-scoped): a brand-new *family* filename or non-conventional path, new
  branches, and commit/PR history. The `Nebras-Open-Finance` org is separate and
  cannot be added to this session's scope, so §3a enumeration stays unavailable
  as a standing limitation — the release-notes (§4) and Confluence attachments
  (§5), both reachable, remain the authoritative "new standard" signal.

## Page layout (reader-first)

The page answers five questions in its first screen — a "This week" summary
(Standards, Operations, Adoption, Deadlines, Alerts), then dated alerts
(New / Changed first, Standing collapsed). Below that: the hero charts with
week-over-week markers, the spec-change table, breaking changes as counts with
the full register one click away, a deadline timeline for both tiers, the
heatmaps, operations and economics. The job's long working notes live in
`payload.audit` and render only inside the collapsed "Run log" at the bottom.

The payload format is documented in `routine-prompt.md` → "PAYLOAD FORMAT" and
enforced by `of_watch_payload.py`.

## Editorial stance

The watch is ecosystem-neutral regulatory oversight. It singles out no
individual institution: every LFI and TPP appears only as a row in league
tables, adoption lists, and heatmaps, identical to its peers. This is enforced
in the schema: no payload field may be named after an institution, and headline
cards are chosen by rank rather than fixed to a name. Every change it
reports carries a clickable source URL (GitHub commit/compare, Nebras page,
Confluence page, CBUAE rulebook, or the production directory).
