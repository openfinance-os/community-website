---
title: "Introducing the Open Finance Data Sandbox"
date: 2026-04-29
type: community
region: uae
author: Community
description: "A zero-setup, browser-based explorer for UAE Open Finance Bank Data Sharing API payloads — launched with 10 synthetic personas, every v2.1 AISP endpoint, and three populate-rate profiles; since grown to 38 personas across banking and insurance."
featured: false
---

> **Update (June 2026):** The sandbox has grown well beyond this launch announcement — 38 synthetic personas across Bank Data Sharing and all seven Insurance Data Sharing lines, an ATM Locator directory, multi-bank personas, an MCP server for AI agents, and pinnable fixture packages. See the [June 2026 update](/news/2026-06-09-data-sandbox-insurance-ga-mcp) or the [Commons overview](/commons/data-sandbox) for current numbers.

The Open Finance OS community is releasing the **Open Finance Data Sandbox** — an interactive, client-side explorer that shows what UAE Open Finance Bank Data Sharing payloads actually look like. Open it in a browser and start exploring. No registration, no credentials, no install.

## Why It Matters

API specifications tell you the schema, but not what the data actually looks like in practice. Teams building against the Bank Data Sharing API have to either request sandbox access first or write their own fixtures from the OpenAPI spec — both of which slow down design, prototyping, and integration testing.

The Data Sandbox closes that gap with realistic, validated payloads across diverse personas and data-completeness profiles, so TPPs can design and test integrations against concrete examples before touching the live sandbox.

## What's In It

- **10 synthetic UAE personas** *(38 as of June 2026 — see update above)* — salaried expatriates, gig workers, retirees, high-net-worth individuals, and distressed accounts.
- **All 12 v2.1 Account Information endpoints**, with payloads validated against the upstream OpenAPI schema.
- **Three LFI populate-rate profiles** — Rich, Median, and Sparse — for testing how your application behaves against varying data completeness.
- **LFI comparison view** showing the same persona's data side-by-side across profiles.
- **Underwriting scenario panel** with illustrative financial calculations.
- **Full-spec search** and a 5-step interactive walkthrough.
- **Export** as JSON, CSV, or tarball — drop fixtures straight into your test suite.
- **Embed mode** for use in presentations, documentation, and workshops.

## Who It's For

**TPPs and fintechs** designing consent flows, dashboards, and analytics before requesting sandbox credentials. **Banks and LFIs** evaluating how populate-rate decisions affect the TPP experience. **Independent developers** getting hands-on with Open Finance payload shapes without onboarding to a sandbox first.

## Try It Now

Visit [data-sandbox.openfinance-os.org](https://data-sandbox.openfinance-os.org) — or read the full overview on [Commons](/commons/data-sandbox).

The sandbox is open source on [GitHub](https://github.com/openfinance-os/data-sandbox) under the MIT license; synthetic data and fixtures are released under CC0. Contributions and issue reports are welcome.
