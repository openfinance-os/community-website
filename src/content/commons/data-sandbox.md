---
title: "Open Finance Data Sandbox"
type: utility
summary: "An interactive, client-side explorer for UAE Open Finance payloads — 38 synthetic personas across Bank Data Sharing and all 7 Insurance Data Sharing lines, an ATM Locator directory, three LFI populate-rate profiles, an MCP server, and pinnable fixture packages, with no sandbox credentials required."
date: 2026-06-09

useCases:
  - data
  - underwriting
  - onboarding
  - sme
  - retail
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
featured: true
---

## Overview

The [Open Finance Data Sandbox](https://data-sandbox.openfinance-os.org) is a zero-setup, browser-based explorer for illustrative UAE Open Finance payloads — Bank Data Sharing, Insurance Data Sharing across all seven lines, and the ATM Locator directory. Responses are generated from a deterministic seeded PRNG and validated against the vendored OpenAPI specification. These synthetic examples help you explore payload shapes and test application behaviour; they do not establish a live bank's data availability or production readiness.

## Try a multi-bank reconciliation example

[Open the existing multi-bank demo](https://data-sandbox.openfinance-os.org/examples/accounting-multi-bank-demo/) and choose **Crestline Wellness Clinic LLC — Healthcare Clinic** with the **Median** profile. The example matches the primary account's beneficiary IBANs to accounts in the other synthetic bank bundles, then assembles the accounts into one ledger. With the current fixture, you can inspect **two IBAN matches and four accounts** in the resulting tables.

Everything in the example is synthetic. Rich, Median, and Sparse illustrate data completeness; they are not assessments of named banks. To use the same workflow in your own demo, follow the existing [multi-LFI integration guide](https://data-sandbox.openfinance-os.org/src/integrate.html#multi-lfi).

## Key Capabilities

- **38 synthetic UAE personas** — 21 banking-only (retail, SME, and corporate archetypes from salaried expats and gig workers to free-zone SaaS startups and corporate treasury), 9 insurance-only (covering motor, home, health, life, travel, renters, and employment), and 8 multi-domain personas that emit both banking and insurance payloads. The banking view renders 29 personas; the insurance view renders 17. A 39th manifest, the ATM directory, emits a public directory of LFI-operated cash machines rather than customer data.
- **All 12 v2.1 Account Information endpoints** for banking, **30 Insurance Data Sharing endpoints** (GA across all 7 lines — 4 endpoints each plus 2 Insurance Consents endpoints), and the **ATM Locator** `GET /atms` directory — all generated and validated against the v2.1 OpenAPI schema, with 1,500+ spec-validation tests across the persona × LFI × endpoint matrix.
- **Multi-LFI and multi-insurer footprints** — SME and retail personas whose realistic footprint spans up to four banks (salary primary, everyday card, digital sidekick, mortgage lender) and up to three insurance carriers, with role-keyed bundles and mod-97-valid IBANs. Total debt service is only legible through Open Finance aggregation across all banks — exactly the picture a TPP consent flow has to assemble.
- **Three LFI populate-rate profiles** — Rich, Median, and Sparse — for testing how your application behaves against varying data completeness from different banks.
- **LFI comparison view** showing the same persona's data side-by-side across populate-rate profiles, with cell-level diff highlighting.
- **Underwriting scenario panel** with illustrative financial calculations: implied monthly net income, frequency-normalised fixed commitments, implied DBR, and NSF/distress counts.
- **Full-spec search** (⌘K) and an interactive 5-step walkthrough for first-time visitors.
- **Export** as JSON, CSV, or tarball — drop fixtures straight into your test suite — plus pinnable fixture packages on npm (`@openfinance-os/sandbox-fixtures`) and PyPI (`openfinance-os-sandbox-fixtures`).
- **Embed mode** for use in presentations, documentation, or workshops.

## MCP Server

The sandbox ships an MCP server, [`@openfinance-os/sandbox-mcp`](https://github.com/openfinance-os/data-sandbox/tree/main/packages/sandbox-mcp), that exposes the whole corpus as tools, resources, and prompts — so an AI agent can act as a personal-finance assistant over a synthetic customer and answer balance, spend, obligation, and coverage questions from deterministic v2.1 JSON. Pick a curated persona, or compose a custom one with the persona builder.

- **Hosted (no install):** add `https://data-sandbox.fly.dev/mcp` as a custom connector in Claude.ai — anonymous, no auth, no API key.
- **Local:** `npx -y @openfinance-os/sandbox-mcp` (stdio transport for Claude Desktop / Claude Code).

## TPP Integration

If you are wiring sandbox personas into a TPP demo journey, the [integration guide](https://data-sandbox.openfinance-os.org/src/integrate.html) walks through five plug points: iframe embed, npm `loadJourney()`, PyPI `load_journey()`, raw HTTPS fixtures at `/fixtures/v1/`, and MCP.

## Tech Stack

Vanilla HTML, CSS, and JavaScript ES modules — no build chain required. The OpenAPI spec is vendored from upstream and pinned by commit SHA; every status badge and mandatory/optional flag flows from the spec, never hand-authored. Coverage is enforced by Vitest (unit), Playwright (end-to-end + accessibility), and Lighthouse-CI (performance). Anonymous analytics via PostHog.

## Who It's For

### TPPs and fintechs
Design consent flows, dashboards, and analytics against representative data — including multi-bank, multi-carrier customers — before requesting sandbox credentials.

### Banks and LFIs
See how your populate-rate decisions affect the TPP experience, and use the comparison view to inform implementation choices.

### Insurers and insurtechs
Explore Insurance Data Sharing payload shapes across all seven lines — policies, policy detail, payment details, and quotes — without onboarding to a sandbox first.

### Independent developers
Get hands-on with Open Finance payload shapes and edge cases, or wire the MCP server into an AI agent and query a synthetic customer conversationally.

## Try It Now

Open [data-sandbox.openfinance-os.org](https://data-sandbox.openfinance-os.org) — no registration, no credentials, no install.

## Optional commercial support

[MiddleLeap Open Finance advisory](https://www.middleleap.com/open-finance) is a commercial service for teams seeking paid support. OFOS is editorially independent, and this guide and the Sandbox remain free and ungated.

## Source & License

The sandbox is open source on [GitHub](https://github.com/openfinance-os/data-sandbox). Code is MIT-licensed; synthetic data and fixtures are released under CC0 (public domain). The vendored OpenAPI specification inherits its upstream license. Contributions and issue reports are welcome.
