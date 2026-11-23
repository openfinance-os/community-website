---
title: "Data Sandbox grows up: 38 personas, Insurance Data Sharing GA, an ATM directory, and an MCP server"
date: 2026-06-09
type: community
region: uae
author: Community
description: "Since its April launch the Open Finance Data Sandbox has grown from 10 to 38 synthetic personas, taken Insurance Data Sharing to GA across all 7 lines, added the ATM Locator directory, multi-bank and multi-insurer personas, an MCP server for AI agents, and pinnable fixture packages on npm and PyPI."
featured: true
---

When the [Open Finance Data Sandbox launched in April](/news/2026-04-29-data-sandbox-launch), it covered Bank Data Sharing with 10 synthetic personas. Six weeks later, it has become a much bigger thing — covering all three UAE Open Finance data domains with nearly four times the persona library.

## What's New

### 38 synthetic personas (up from 10)

The library now spans **21 banking-only personas** — retail archetypes plus 8 SME profiles (cash-heavy retail, F&B multi-outlet, e-commerce marketplace, free-zone SaaS, construction sub-contractor, healthcare clinic, RAK Emirati-owned trading, general trading) and a corporate treasury — **9 insurance-only personas**, and **8 multi-domain personas** that emit both banking and insurance payloads for the same customer. The banking view renders 29 personas; the insurance view renders 17. A 39th manifest anchors the new ATM Locator domain with a public directory of LFI-operated cash machines.

### Insurance Data Sharing, GA across all 7 lines

Motor, home, health, life, travel, renters, and employment — **30 endpoints** (policies, policy detail, payment details, and quote per line, plus 2 Insurance Consents endpoints), all generated and validated against the v2.1 OpenAPI schema, alongside the original 12 Account Information endpoints.

### Multi-bank, multi-insurer personas

The flagship retail multi-banker's realistic footprint spans **four banks** (salary primary, everyday card, digital sidekick, mortgage lender) and **three insurance carriers** — with role-keyed bundles and mod-97-valid IBANs. No single bank sees the full debt-service picture; only Open Finance aggregation across all four does. It's exactly the persona shape consent-flow and underwriting demos are built for, and most SME personas declare multi-LFI footprints too.

### An MCP server for AI agents

[`@openfinance-os/sandbox-mcp`](https://github.com/openfinance-os/data-sandbox/tree/main/packages/sandbox-mcp) exposes the whole corpus as MCP tools, resources, and prompts, so an AI agent can act as a personal-finance assistant over a synthetic customer — answering balance, spend, obligation, and coverage questions from deterministic v2.1 JSON. Use the hosted endpoint (`https://data-sandbox.fly.dev/mcp` as a custom connector in Claude.ai — anonymous, no API key) or run it locally with `npx -y @openfinance-os/sandbox-mcp`. A custom persona builder lets you compose your own profiles beyond the curated set.

### Pinnable fixture packages

The synthetic dataset ships as versioned packages your CI can pin: [`@openfinance-os/sandbox-fixtures`](https://www.npmjs.com/package/@openfinance-os/sandbox-fixtures) on npm and `openfinance-os-sandbox-fixtures` on PyPI — v2.1-shaped JSON envelopes across the persona × LFI × endpoint matrix, with the same determinism guarantees as the browser explorer.

### TPP integration guide

A worked [integration guide](https://data-sandbox.openfinance-os.org/src/integrate.html) covers four plug points for wiring sandbox personas into a TPP demo journey: iframe embed, npm `loadJourney()`, PyPI `load_journey()`, and raw HTTPS fixtures.

## Unchanged — and still the point

Everything remains zero-setup, client-side, and deterministic: the same persona, LFI profile, and seed produce byte-identical payloads on any machine, any day. The three populate-rate profiles (Rich, Median, Sparse), the side-by-side LFI comparison view, the underwriting scenario panel, full-spec search, exports, and embed mode all carry over — now across three data domains.

## Try It

Visit [data-sandbox.openfinance-os.org](https://data-sandbox.openfinance-os.org) — no registration, no credentials, no install — or read the full overview on [Commons](/commons/data-sandbox).

The sandbox is open source on [GitHub](https://github.com/openfinance-os/data-sandbox) under the MIT license; synthetic data and fixtures are released under CC0. Contributions and issue reports are welcome.
