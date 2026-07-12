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

1. Recomputes every figure from the freshly downloaded Nebras metrics logs
   and the production Trust Framework directory (never copies numbers
   forward), and runs a self-consistency check before publishing.
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

## Editorial stance

The watch is ecosystem-neutral regulatory oversight. It singles out no
individual institution: every LFI and TPP appears only as a row in league
tables, adoption lists, and heatmaps, identical to its peers. Every change it
reports carries a clickable source URL (GitHub commit/compare, Nebras page,
Confluence page, CBUAE rulebook, or the production directory).
