---
title: "Saudi Open Banking vs UAE Open Finance: Licences First, Hub First"
date: 2026-11-12
type: opinion
region: mena
author: OpenFinance-OS
description: "Saudi open banking vs UAE Open Finance in 2026: SAMA licenses providers on a shared standard, while the UAE routes every call through one hub. What differs for builders."
image: /news/saudi-vs-uae-open-finance/hero.svg
imageAlt: "Two side-by-side panels headed Licences first, hub first. Saudi Arabia: a shared standard certified in SAMA's Lab, with a licensed provider connecting to each bank, account information first and payments next. UAE: every call runs through one API Hub that holds consent and tokens, with payments and data launched together."
imageCaption: "Two connection models, not a scoreboard. Saudi side is our reading of SAMA's framework and payments rules; UAE side from the Open Finance UAE skill."
---

Saudi Arabia and the UAE are both building regulated open banking in 2026, and they are doing it in almost opposite ways. Saudi Arabia started with a standard, a test lab and a sandbox, and in March 2026 it began turning sandbox firms into licensed providers ([SAMA, 26 Mar 2026](https://www.sama.gov.sa/en-US/MediaCenter/News/Pages/news-1135.aspx)). The UAE started with a single, centrally run API Hub that every call has to pass through ([Open Finance UAE skill](https://github.com/middleleap/ai-dlc/blob/main/plugins/middleleap-open-finance-uae/skills/open-finance-uae/SKILL.md)).

Teams that build in both markets often treat them as one "GCC connector". They shouldn't. This post sets out what is different, what the public numbers do and don't show, and what that means for builders.

## The short version

- **Saudi Arabia: licences on top of a shared standard.** SAMA's Open Banking Framework is a set of use cases, business rules and technical standards. Its Open Banking Lab simulates bank APIs and runs the conformance suites that banks and fintechs certify against ([SAMA Open Banking](https://openbanking.sama.gov.sa/index-en.html)).
- **Four account-information licences announced, as far as we can find.** Two on 26 March 2026, including Lean Technologies' Saudi company, then Tatbiq Darahem on 10 May and Malaa on 22 July ([SAMA, 26 Mar 2026](https://www.sama.gov.sa/en-us/mediacenter/news/pages/news-1136.aspx); [Saudi Compliance timeline](https://saudicompliance.com/en/licensing/open-banking-licence/); [Arab News](https://www.arabnews.com/finance/saudi-central-bank-licenses-malaa-raising-payment-providers-to-33-2652003)). We found no announced payment-initiation licence as of 12 November 2026.
- **UAE: one hub for everything.** Every call runs through a single API Hub that holds consents and issues tokens, and payments and data sharing launched together ([Open Finance UAE skill](https://github.com/middleleap/ai-dlc/blob/main/plugins/middleleap-open-finance-uae/skills/open-finance-uae/SKILL.md)).
- **The two markets measure different things.** Saudi Arabia publishes connected-account totals. The UAE's public logs count API calls and payments. So this post compares the models and keeps each market's numbers in its own section. It doesn't rank one against the other.

A note on the "33" figure you may have seen: when SAMA licensed Malaa, it said there were now 33 licensed **payment** companies in the Kingdom. That count covers all payment service providers, not just open banking ones ([Arab News](https://www.arabnews.com/finance/saudi-central-bank-licenses-malaa-raising-payment-providers-to-33-2652003)).

<figure class="post-visual">
<img src="/news/saudi-vs-uae-open-finance/topology.svg" alt="Two diagrams. Saudi Arabia: a licensed provider connects to Bank A, Bank B and Bank C, each implementing SAMA's standard and certified in the Open Banking Lab. UAE: a TPP connects only to the API Hub, which holds consents and issues tokens, and the Hub connects to each LFI." />
<figcaption>Where the connection runs. Saudi side is our reading of SAMA's published framework and payments regulations; UAE side from the Open Finance UAE skill.</figcaption>
</figure>

## Two architectures

In the UAE, **TPPs never call banks directly**. Every request runs TPP to API Hub to LFI and back. The Hub, operated by Nebras, is the authorization server and the consent store. Only the Hub issues tokens, and LFIs must not keep their own consent state. The customer still authenticates at their bank, but the bank is not the one granting access to the TPP ([Open Finance UAE skill](https://github.com/middleleap/ai-dlc/blob/main/plugins/middleleap-open-finance-uae/skills/open-finance-uae/SKILL.md)).

Saudi Arabia's rules describe a direct relationship. Under the payments regulations, a bank holding a payment account must give licensed account-information and payment-initiation providers access once the customer consents. It must treat their requests as if they came from the customer, and it cannot demand a commercial contract first. Each provider must "securely communicate with the Payment Account Service Provider and identify itself for each communication session" ([SAMA Rulebook, Articles 96–99](https://rulebook.sama.gov.sa/en/entiresection/1546)). We found no central hub in SAMA's published material. What holds the market together is the common standard and the Lab's certification. That is our reading of the public texts, not a statement from SAMA.

There is also a private layer in the middle, at least as the market was described in 2023. Fintech Saudi's Annual Fintech Report for that year, published with SAMA's support, said "sponsor" TPPs in the sandbox "set up direct API connections with banks" and "handle the consent management" — three of them, averaging about 10 banks each (Fintech Saudi, Annual Fintech Report 2023). That is not a public, market-wide hub like the UAE's, and we have not seen an official update of that structure since licensing began in March 2026.

The practical difference is where state lives. In the UAE, one place knows every consent in the market. In Saudi Arabia, the rules place consent obligations on the provider and the bank, including a duty on account-information providers to delete data when consent is withdrawn ([SAMA Rulebook, Article 99](https://rulebook.sama.gov.sa/en/entiresection/1546)).

## Same idea, different order

<figure class="post-visual">
<img src="/news/saudi-vs-uae-open-finance/timeline.svg" alt="Two timelines. Saudi Arabia: Open Banking Framework release 1 for account information in November 2022, release 2 for payment initiation in September 2024, licensing starts 26 March 2026 with two account-information licences, Tatbiq Darahem 10 May, Malaa 22 July, and a SAMA bank forum on payment-initiation readiness 16 September 2026. UAE: Open Finance Regulation (Circular 7/2023) issued 31 December 2023, Circular 3/2025 in force 10 July 2025, Retail release 1 covering payments and data due September 2025, the Ecosystem Watch monthly series starting November 2025, and October 2026 as the busiest month in the public logs so far." />
<figcaption>Saudi Arabia went data first and is now preparing payments; the UAE launched payments and data together on the Hub. Sources: SAMA, Saudi Compliance, KSA.com, Open Finance UAE skill, Ecosystem Watch.</figcaption>
</figure>

Saudi Arabia went data first. Release 1 of the framework covered account information in November 2022, and release 2 added payment initiation in September 2024 ([Saudi Compliance timeline](https://saudicompliance.com/en/licensing/open-banking-licence/); [Zero to One, 3 Sep 2024](https://zto.sa/en/3339)). Every licence announced so far is for account information.

The official series for connected accounts is 115,000 at the end of 2023 and 334,000 at the end of 2024, according to summaries of Fintech Saudi's Annual Fintech Report 2024, which we could not open as a PDF ([Fintech News Middle East, 25 Sep 2025](https://fintechnews.ae/27891/)). The Governor then cited over 337,000 open-banking-connected accounts on 15 September 2026 ([BIS](https://www.bis.org/speeches/20261005-keynote-speech-money2020-middle-east)). Those are Saudi figures on the same unit, not a comparison with the UAE. The 2024 and 2026 totals are almost the same, which may mean growth has slowed, or that the figures are defined differently. Summaries of the 2024 report also disagree on customer counts, so we treat the later headlines with care.

At SAMA's Open Banking Forum the next day, 16 September 2026, the next-stage agenda was banks' readiness for payment initiation, business use and service quality ([KSA.com](https://www.ksa.com/economy/sama-open-banking-forum-banks-riyadh/)).

The UAE's Retail release 1 bundled consent, single instant payments, Confirmation of Payee, balances and customer data, with a September 2025 deadline for Tier-1 banks ([Open Finance UAE skill](https://github.com/middleleap/ai-dlc/blob/main/plugins/middleleap-open-finance-uae/skills/open-finance-uae/SKILL.md)). Across the 12 full months to October 2026, the public logs show 2,259,856 API calls and AED 414.9 million in accepted payments, with 16 LFIs and 17 TPPs carrying successful traffic. Payment calls (1,005,071) and account-information calls (980,545) have been almost level ([Ecosystem Watch, run 8 Nov 2026](/observatory/watch/)).

The UAE's scope is also wider by design. Participation is mandatory for all CBUAE licensees, and the framework already includes insurance APIs, not just bank accounts ([Open Finance UAE skill](https://github.com/middleleap/ai-dlc/blob/main/plugins/middleleap-open-finance-uae/skills/open-finance-uae/SKILL.md)).

## One name in both markets

Lean Technologies is the clearest link between the two. In Saudi Arabia, it was one of the first two companies SAMA licensed for account information on 26 March 2026 ([SAMA](https://www.sama.gov.sa/en-us/mediacenter/news/pages/news-1136.aspx)). In the UAE, Lean carries 83.0% of attributed API calls across the 12 full months ([Ecosystem Watch](/observatory/watch/)). The same provider has to run two integration models: one hub-mediated connection in the UAE, and certified connections to each bank in Saudi Arabia.

## Why we don't rank the markets by their numbers

<figure class="post-visual">
<img src="/news/saudi-vs-uae-open-finance/disclosure.svg" alt="Table of what each market publishes. Saudi Arabia: licence announcements, and a headline usage unit of connected accounts reported annually and in a 2026 speech; monthly call volumes, accepted payment value, consents and error rates not found in public sources, with no payment-initiation licence seen. UAE: a public directory of registrations, a headline usage unit of API calls and payments updated weekly, 842,969 calls in October 2026, AED 414.9 million in accepted payments over 12 months, 117,803 consents created and a 12.7% error rate." />
<figcaption>What each market publishes as of 12 Nov 2026. "Not found" means we did not find it in public sources, not that it doesn't exist. Sources: Fintech Saudi, BIS, SAMA, Ecosystem Watch.</figcaption>
</figure>

Saudi Arabia's public usage figures count connected accounts. Fintech Saudi has published year-end totals, and the Governor gave a September 2026 figure in a speech ([Fintech News Middle East, 25 Sep 2025](https://fintechnews.ae/27891/); [BIS](https://www.bis.org/speeches/20261005-keynote-speech-money2020-middle-east)). The UAE's figures count API calls and accepted payments, read from public logs every week ([Ecosystem Watch](/observatory/watch/)). Accounts are not calls, and neither is money moved, so no ratio or ranking between them would mean anything. Even the UAE's consent count isn't an account count: a consent is a permission, not an account ([Ecosystem Watch](/observatory/watch/)). A fair comparison would need the same measure from both markets, and only the UAE publishes a regular one at the moment.

The real gap is transparency. The UAE's Hub produces logs anyone can read, which is why this site can publish monthly numbers. We found no Saudi equivalent of public call volumes, payment values or error rates. That's a design consequence, not a criticism. With no central hub, there's no single place where those logs naturally collect.

## What this means for builders

**Don't import assumptions in either direction.** A UAE integration that expects the bank to hold the consent or issue the token will be wrong. A Saudi integration that expects a central consent store or one routing endpoint will be wrong too. Keep one product layer and two country adapters.

**Plan certification as part of the build.** In Saudi Arabia, the Lab's conformance suites are the gate ([SAMA Open Banking](https://openbanking.sama.gov.sa/index-en.html)). In the UAE, TPPs need FAPI 2.0, functional and CX certification, then live proving with at least one LFI ([Open Finance UAE skill](https://github.com/middleleap/ai-dlc/blob/main/plugins/middleleap-open-finance-uae/skills/open-finance-uae/SKILL.md)).

**Price the payment case differently.** The UAE publishes a scheme-wide pricing model, with 38 bps on merchant collections in year one ([Open Finance UAE skill](https://github.com/middleleap/ai-dlc/blob/main/plugins/middleleap-open-finance-uae/skills/open-finance-uae/SKILL.md)). Saudi rules say banks cannot require a commercial contract before granting access ([SAMA Rulebook, Article 96](https://rulebook.sama.gov.sa/en/entiresection/1546)), but we found no published Saudi fee schedule for open banking payments.

## What we'll watch

Three things will tell us how the two models are converging: the first Saudi payment-initiation licence, any regular Saudi usage statistics, and whether UAE traffic keeps spreading beyond one dominant TPP.

## Follow the numbers

Track the UAE side every week in the [Ecosystem Watch](/observatory/watch/), read last month's figures in [842,969 Calls: UAE Open Finance Doubled in October](/news/2026-11-09-uae-open-finance-october-2026-numbers), or [subscribe to the newsletter](/newsletter/) for the weekly digest.

*Open Finance OS is an independent, community-run project. It is not affiliated with CBUAE, Nebras or SAMA. UAE figures are our observations of public data, not official statistics. Saudi figures are as published by SAMA and the sources linked. Interpretations are ours.*
