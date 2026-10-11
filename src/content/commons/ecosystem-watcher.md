---
title: "Ecosystem Watcher: UAE Open Finance Evidence Dashboard"
type: utility
summary: "A saved weekly dashboard of UAE Open Finance standards, production-directory registrations and observed public-log traffic, with source dates, reporting windows and coverage limits."
date: 2026-06-22

useCases:
  - compliance
  - data
audience:
  - bank
  - tpp
  - regulator
maturity: production-ready

source:
  platform: other
  url: https://openfinance-os.org/observatory/watch/

authoredByContributor: true
contributor: "OpenFinance-OS Community"
contributorUrl: https://github.com/openfinance-os

links:
  demo: https://openfinance-os.org/observatory/watch/

whyItMatters: "Compare the release calendar with dated registration and traffic observations, while keeping published metadata separate from operational evidence. Sources, reporting windows and observation limits help practitioners judge what the evidence supports."

disclaimers:
  - "Directory registration, published API families and declared certification do not establish working services or regulatory compliance."
  - "Public traffic logs omit environment labels; successful calls cannot be assumed to be production traffic."
  - "Coverage is limited to the source snapshots and log windows shown; missing observations do not establish unavailability."
  - "OpenFinance-OS is a community initiative and is not affiliated with, endorsed by, or officially connected to the CBUAE, Al Tareq Platform, or any financial institution. Always verify information with official sources."
featured: true
---

## Overview

Ecosystem Watcher brings together a saved weekly briefing, the regulatory release calendar, dated production-directory registrations and aggregate public traffic logs. It reports what each source shows and when it was checked; it does not independently test institutions' services or determine regulatory compliance.

The dashboard distinguishes its latest data run, last source check and operational-log cutoff. Directory metadata and traffic observations remain separate evidence: the public logs omit environment labels, so matching successful calls to a production-directory registration does not prove production traffic. See the [Observatory methodology](/observatory/methodology/) for registration definitions and collection limits.

## Key Features

- **Release registration coverage** — Active API-family registrations in the production directory, compared with the CBUAE release calendar. Family registration does not prove that every required function works or establish compliance.
- **Traffic observations** — successful calls in the public logs, with explicit reporting periods. Adoption heatmaps use the last two full months and distinguish observed traffic, exposed capabilities and missing evidence.
- **Standards and deadlines** — source-linked standards changes and the mandate timeline, with dates that can be checked against the underlying sources.
- **Dated changes and alerts** — the saved dashboard marks new, changed and standing observations from its weekly run or source check.

## Who It's For

Open Finance practitioners across the UAE ecosystem:

### LFIs and banks
Compare published API-family registrations with the release calendar, and assess traffic observations within their stated source windows.

### TPPs and fintechs
Identify published capabilities and observed activity, then confirm service availability and integration requirements with the operator before planning customer journeys.

### Regulator-adjacent and Nebras community
Explore dated observations and their sources as context for ecosystem research, with the coverage limits visible alongside the evidence.

## Try It Now

Visit [openfinance-os.org/observatory/watch](https://openfinance-os.org/observatory/watch/) to explore the saved weekly dashboard. Check the run date, source-check date and log cutoff before using its figures. (The former ecosystem-watcher.openfinance-os.org address redirects here.)
