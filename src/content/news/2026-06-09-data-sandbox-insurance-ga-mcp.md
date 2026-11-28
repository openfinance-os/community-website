---
title: "Data Sandbox Adds Insurance, an ATM Directory and an MCP Server"
date: 2026-06-09
type: community
region: uae
country: AE
author: Community
description: "Since its April launch the Open Finance Data Sandbox has grown from 10 to 38 synthetic personas, taken Insurance Data Sharing to GA across all 7 lines, added the ATM Locator directory, multi-bank and multi-insurer personas, an MCP server for AI agents, and fixture packages you can build from source."
featured: true
---

> **Correction, 28 November 2026.** This post first said the fixture packages and the MCP server were published on npm and PyPI. They were not. On 28 November 2026 none of `@openfinance-os/sandbox-fixtures`, `@openfinance-os/sandbox-mcp` or `openfinance-os-sandbox-fixtures` was on the public registries. The sections below now say how to use them from source.

When the [Open Finance Data Sandbox launched in April](/news/2026-04-29-data-sandbox-launch), it covered Bank Data Sharing with 10 synthetic personas. Six weeks later, it has become a much bigger thing — covering all three UAE Open Finance data domains with nearly four times the persona library.

## What's New

### 38 synthetic personas (up from 10)

The library now spans **21 banking-only personas** — retail archetypes plus 8 SME profiles (cash-heavy retail, F&B multi-outlet, e-commerce marketplace, free-zone SaaS, construction sub-contractor, healthcare clinic, RAK Emirati-owned trading, general trading) and a corporate treasury — **9 insurance-only personas**, and **8 multi-domain personas** that emit both banking and insurance payloads for the same customer. The banking view renders 29 personas; the insurance view renders 17. A 39th manifest anchors the new ATM Locator domain with a public directory of LFI-operated cash machines.

### Insurance Data Sharing, GA across all 7 lines

Motor, home, health, life, travel, renters, and employment — **30 endpoints** (policies, policy detail, payment details, and quote per line, plus 2 Insurance Consents endpoints), all generated and validated against the v2.1 OpenAPI schema, alongside the original 12 Account Information endpoints.

### Multi-bank, multi-insurer personas

The flagship retail multi-banker's realistic footprint spans **four banks** (salary primary, everyday card, digital sidekick, mortgage lender) and **three insurance carriers** — with role-keyed bundles and mod-97-valid IBANs. No single bank sees the full debt-service picture; only Open Finance aggregation across all four does. It's exactly the persona shape consent-flow and underwriting demos are built for, and most SME personas declare multi-LFI footprints too.

### An MCP server for AI agents

[`@openfinance-os/sandbox-mcp`](https://github.com/openfinance-os/data-sandbox/tree/main/packages/sandbox-mcp) exposes the whole corpus as MCP tools, resources, and prompts, so an AI agent can act as a personal-finance assistant over a synthetic customer — answering balance, spend, obligation, and coverage questions from deterministic v2.1 JSON. Use the hosted endpoint (`https://data-sandbox.fly.dev/mcp` as a custom connector in Claude.ai — anonymous, no API key) or run it locally from a clone of the [repository](https://github.com/openfinance-os/data-sandbox). The package is not on the npm registry, so `npx` cannot fetch it yet. A custom persona builder lets you compose your own profiles beyond the curated set.

### Fixture packages, built from source

The repository contains two fixture packages, `@openfinance-os/sandbox-fixtures` for Node and `openfinance-os-sandbox-fixtures` for Python. They hold v2.1-shaped JSON envelopes across the persona × LFI × endpoint matrix, with the same determinism guarantees as the browser explorer. Neither is published to npm or PyPI, so build them from a pinned commit of the [repository](https://github.com/openfinance-os/data-sandbox), or export fixtures from the explorer.

### TPP integration guide

A worked [integration guide](https://data-sandbox.openfinance-os.org/src/integrate.html) covers four plug points for wiring sandbox personas into a TPP demo journey: iframe embed, the Node `loadJourney()` and Python `load_journey()` loaders built from source, and raw HTTPS fixtures.

## Unchanged — and still the point

Everything remains zero-setup, client-side, and deterministic: the same persona, LFI profile, and seed produce byte-identical payloads on any machine, any day. The three populate-rate profiles (Rich, Median, Sparse), the side-by-side LFI comparison view, the underwriting scenario panel, full-spec search, exports, and embed mode all carry over — now across three data domains.

## Try It

Visit [data-sandbox.openfinance-os.org](https://data-sandbox.openfinance-os.org) — no registration, no credentials, no install — or read the full overview on [Commons](/commons/data-sandbox).

The sandbox is open source on [GitHub](https://github.com/openfinance-os/data-sandbox) under the MIT license; synthetic data and fixtures are released under CC0. Contributions and issue reports are welcome.
