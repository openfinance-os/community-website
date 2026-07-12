# Repositioning & IA Redesign Plan — openfinance-os.org

_Last updated: 2026-07-12. Owner: @michartmann. Working prototype of the redesigned homepage: see the session artifact ("OpenFinance-OS — Redesign Prototype")._

## Context & diagnosis

Two sites serve UAE Open Finance with heavily overlapping missions. **nebras-open-finance.com** (operator-affiliated, funded team) structurally wins at operational content: integration docs, API specs, certification, service desk, telemetry-backed metrics. **openfinance-os.org** (community-maintained) cannot and should not compete there — but holds the one position the operator structurally cannot: **independence**. An operator can't be the neutral scorekeeper of its own program.

Technical findings that shape the plan:

- The registry collection (`scripts/collect-observatory.ts`) is already optimal — `/participants` + `/roles` are the only public trust-framework directory endpoints (verified by probing). Daily snapshots since 2025-12-26.
- Nebras's "live" dashboard is the same static-JSON architecture as ours; their advantage is only *generating* telemetry, not publishing it.
- Nebras publicly serves granular operational feeds (`nebras-open-finance.com/api/api-log.json`, `payments-log.json`, `auth-log.json`, `trust-framework.json`) with data back to launch (2025-11) — despite their page claiming a 30-day window. These power the Ecosystem Watch. Their publishing behaviour is **not a contract**; see Risks.

## Positioning statement (north star)

> **openfinance-os.org is the independent observatory for UAE Open Finance — tracking the ecosystem over time, placing it in global context, and giving the whole community neutral ground. For building and integrating, it points to the operator.**

## Non-goals (also to be written into `/about`)

This site will **not** carry: API specs, integration guides, certification/testing docs, service-desk functions, pricing/SLA content, or first-party operational dashboards duplicating the operator's. Those are the operator's job; we link there. (Independent *analysis* of operational data — the Watch — is explicitly in scope; duplication of the operator's own presentation is not.)

---

## Status — already done

| Item | Status |
| --- | --- |
| CI repair (news curation ×2, link-check), `github.token` auth, lychee config, `.lycheeignore` | ✅ merged (#305–#307) |
| Velox content removed | ✅ merged (#308) |
| Open-PR triage: 8 closed as obsolete, API-coverage card revived & merged (#309), dep bumps merged | ✅ done |
| **Ecosystem Watch migrated into the repo** at `/observatory/watch/` — weekly scheduled Claude job commits `data/watch/{payload,state,history}.json`; Astro endpoint injects into template; subdomain redirects | ✅ merged (#311) |
| Homepage redesign prototype (hero, nav, record band, changelog ledger, global band, routing strip) built from real snapshot data, validated light/dark/mobile | ✅ artifact published |

The Watch migration delivers a large share of the original "substance" phase: evidence-based adoption tracking, standards/spec diffing, release compliance, and week-over-week history now live in-repo and render on the site.

---

## Phase 1 — Remaining substance

| Item | Detail | Effort |
| --- | --- | --- |
| **Registry changelog on the Observatory/homepage** | Diff consecutive daily snapshots → dated ledger (joined / went live / role changes), as designed in the prototype's record band. Reuse `data/observatory/snapshots/` history; the Watch's `changeLog` block may already cover part of this — reuse before building | ~1–2 days |
| **Trend view** | Stepped time-series (registered, live) from snapshot history on the homepage record band | ~1 day |
| **Data page** | Document the snapshot + watch datasets as a citable public good: stable URLs, schema, "tracking since", citation guidance | ~½ day |
| **Logo enrichment** | Directory serves participant logos (`/logos/{id}/{id}.png`) — unused; add to Observatory UI | trivial |
| **Version the Watch job prompt** | The weekly scheduled job's prompt lives only in scheduler config — commit it (e.g. `tools/watch/ROUTINE.md`) so the routine is versioned and has no bus factor | ~½ hour |

## Phase 2 — Positioning & IA (ships after Phase 1 earns it)

- **Hero rewrite** (`Hero.astro`): tagline *"The independent record of UAE Open Finance — the data, the global context, the community."*; mission *"Not official, not affiliated — independent by design, so the view stays neutral."*; CTAs → Observatory + `/global`; hand-off line → Nebras developer hub.
- **Nav** (`Header.astro`): `Observatory · Global (new) · Updates · Learn · Commons · Community · About`. Promote **Global** (currently orphaned — nothing links to it). Keep "Updates" name until Phase 4 content justifies "Insights".
- **Homepage order**: Hero → record band (stats + trend + changelog, per prototype) → Global teaser → Latest news → Commons/Community → Nebras hand-off strip.
- **About**: independence-as-feature story, the non-goals above, and the routing rule: *Building? → Nebras. Understanding, tracking, comparing? → here.*
- **Observatory IA**: surface the Watch as a first-class Observatory tab alongside Registry (longer term: port the template HTML to Astro sections — optional, not urgent).

## Phase 3 — The Nebras conversation (relationship, not code)

Bring a one-page division-of-labour note. Asks:

1. **Bless the data feeds** (`/api/*.json`) as an open-data interface — the Watch consumes them weekly from the flagship repo now, so this moved from "nice to have" to **priority**. Offer the trade: they generate (only they can), we archive & analyse (only we credibly can); our archive also de-risks their 30-day-window intentions.
2. **Stable canonical doc URLs** for our Learn hand-off links (our weekly link-checker polices them automatically).
3. **Reciprocal link** — "independent ecosystem tracking & global context → openfinance-os.org".

## Phase 4 — Automation

- Weekly "This week in UAE Open Finance" digest: reuse the news-curation PR pattern, sourcing from snapshot diffs + `data/watch/history.json`. The Watch already computes most inputs.
- **Then** rename Updates → Insights, once genuine analysis ships on cadence.

## Phase 5 — Content cleanup (audited 2026-07-12)

| Content | Verdict |
| --- | --- |
| `/global` vs `/learn/global` | **Duplicated (~2,800 lines) and orphaned** — keep `/global`, redirect `/learn/global/*`, put Global in nav |
| `learn/api-guide`, `learn/bank-guide`, `learn/tpp-guide` | **Gut → pointer stubs**: 2 conceptual paragraphs + canonical Nebras deep-link. Operator-lane, high staleness risk (bank-guide even uses UK term "ASPSP"). Never delete a URL |
| `learn/getting-started` | **Slim**: keep "What is UAE Open Finance" literacy; "Journey to going live" → Nebras pointer |
| `learn/faq` | **Split**: keep newcomer/conceptual Q&A; TPP-certification / ASPSP-obligation / auth questions → Nebras |
| `learn/glossary` | Keep as-is (cheap, neutral, useful) |
| `/events` | Latest entry Nov 2025 — fold into `/community`, redirect |
| `/links` | Dissolve: Developer → Nebras stubs, International → Global, UAE Official → Learn/About; redirect |
| Observatory, Updates/News, Commons, Community, About | Keep (About gets the Phase 2 rewrite) |

Net: ~4,600 lines (~18% of page code) removed — precisely the highest-staleness, most-Nebras-duplicating material.

## Success metrics (check quarterly)

- Traffic share of `/observatory` (incl. `/watch`) + `/global` vs the operational Learn pages (event tracking already wired in Header)
- Inbound referrals from nebras-open-finance.com
- Citations/backlinks to the Data page and the Watch
- If observatory/global share isn't growing after two quarters, revisit substance, not copy

## Risks & mitigations

| Risk | Mitigation |
| --- | --- |
| Hero over-promises before the record ships on the homepage | Phase 1 before Phase 2 — hard ordering |
| Nebras feeds change/vanish (30-day claim vs full-history reality = no contract) | Watch commits recomputed aggregates weekly (archive-don't-hotlink already in place); Phase 3 blessing is the durable fix |
| Watch `economics` section (per-institution fee/income estimates) invites pushback from named institutions | Methodology + disclaimers stay front-and-centre (see `tools/watch/README.md` editorial stance); revisit after the Phase 3 conversation |
| Weekly Watch job drifts (LLM-recomputed) | Prompt versioned in repo (Phase 1); payload diffs are reviewable in git history; self-consistency check runs before publish |
| Copy reads adversarial to Nebras | Softened mission line; hand-off links signal complementarity |
| Learn slimming loses SEO traffic | Keep intros, always redirect, page-by-page after the Nebras conversation |
