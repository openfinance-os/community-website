---
title: "Open Finance Data Sandbox"
type: utility
summary: "An interactive, client-side explorer for UAE Open Finance Bank Data Sharing API payloads — 10 synthetic personas, all v2.1 AISP endpoints, three LFI populate-rate profiles, and underwriting scenarios, with no sandbox credentials required."
date: 2026-04-29

useCases:
  - data
  - underwriting
  - onboarding
audience:
  - developer
  - tpp
  - bank
maturity: demo
license: mit

source:
  platform: github

authoredByContributor: true
contributor: "OpenFinance-OS Community"
contributorUrl: https://github.com/openfinance-os

links:
  demo: https://data-sandbox.openfinance-os.org
  github: https://github.com/openfinance-os/data-sandbox

whyItMatters: "API specifications tell you the schema, but not what the data actually looks like in practice. The Data Sandbox closes that gap with realistic, validated payloads across diverse personas and data-completeness profiles, so TPPs can design and test integrations against concrete examples before touching the live sandbox."

disclaimers:
  - "Synthetic data only — not connected to any live bank or sandbox"
  - "Generated payloads are illustrative and may not capture every edge case"
  - "For exploration, design, and testing purposes"
featured: false
---

## Overview

The [Open Finance Data Sandbox](https://data-sandbox.openfinance-os.org) is a zero-setup, browser-based explorer that shows what UAE Open Finance Bank Data Sharing payloads actually look like. Every response is generated from a deterministic seeded PRNG and validated against the vendored OpenAPI specification, so what you see in the sandbox is what your integration will need to handle in production.

## Key Capabilities

- **10 synthetic UAE personas** spanning salaried expatriates, gig workers, retirees, high-net-worth individuals, and distressed accounts — designed to surface the diversity of real customer profiles.
- **All 12 v2.1 Account Information endpoints** with payloads validated against the upstream OpenAPI schema.
- **Three LFI populate-rate profiles** — Rich, Median, and Sparse — for testing how your application behaves against varying data completeness from different banks.
- **LFI comparison view** showing the same persona's data side-by-side across populate-rate profiles.
- **Underwriting scenario panel** with illustrative financial calculations on top of the synthetic data.
- **Full-spec search** and an interactive 5-step walkthrough for first-time visitors.
- **Export** as JSON, CSV, or tarball — drop fixtures straight into your test suite.
- **Embed mode** for use in presentations, documentation, or workshops.

## Tech Stack

Vanilla HTML, CSS, and JavaScript ES modules — no build chain required. Coverage is enforced by Vitest (unit), Playwright (end-to-end), and Lighthouse-CI (performance). Anonymous analytics via PostHog.

## Who It's For

### TPPs and fintechs
Design consent flows, dashboards, and analytics against representative data before requesting sandbox credentials.

### Banks and LFIs
See how your populate-rate decisions affect the TPP experience, and use the comparison view to inform implementation choices.

### Independent developers
Get hands-on with Open Finance payload shapes and edge cases without onboarding to a sandbox first.

## Try It Now

Open [data-sandbox.openfinance-os.org](https://data-sandbox.openfinance-os.org) — no registration, no credentials, no install.

## Source & License

The sandbox is open source on [GitHub](https://github.com/openfinance-os/data-sandbox). Code is MIT-licensed; synthetic data and fixtures are released under CC0 (public domain). The vendored OpenAPI specification inherits its upstream license. Contributions and issue reports are welcome.
