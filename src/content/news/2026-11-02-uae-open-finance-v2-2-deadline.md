---
title: "UAE Open Finance V2.2: Due by Year-End, Still Not Final"
date: 2026-11-02
type: opinion
region: uae
author: OpenFinance-OS
description: "Tier-1 UAE banks and insurers must release V2.2 by 31 December 2026, but it's still a release candidate. No production API declares v2.2. What to do now."
image: /news/v2-2-deadline/hero.svg
imageAlt: "59 days to the V2.2 release deadline of 31 December 2026, counted from 2 November. 0 of 51 production API declarations are on v2.2."
imageCaption: "Nebras roadmap and production directory snapshot, 1 November 2026."
---

Under the [Nebras roadmap](https://openfinanceuae.atlassian.net/wiki/spaces/OF/pages/6259008/Roadmap), Tier-1 banks and Tier-1 insurers must release **V2.2 of the UAE Open Finance Standards into production by 31 December 2026**. That's 59 days from today.

The standard isn't final yet. The roadmap still lists V2.2's publication date as **TBC**. The current text is a release candidate, [v2.2-rc2](https://nebras-open-finance.com/tech/release-notes-and-erratas/changelog/v2.2-rc2/), which was still being revised last week. In the production directory, **none of the 51 API resource declarations is on v2.2** ([Observatory snapshot, 1 November 2026](/observatory/data)).

This post sets out the deadline, where the ecosystem stands, what the v2.1 uplift tells us about how long migrations really take, and what you can do before the final text arrives.

## What the roadmap says

The [Nebras roadmap](https://openfinanceuae.atlassian.net/wiki/spaces/OF/pages/6259008/Roadmap) (version 3.0, published 25 March 2026) gives each group two dates. The first is the CBUAE-regulated LFI release deadline. The second is the public go-live after buddy testing.

| Group | LFI release deadline | Public go-live |
|---|---|---|
| Banking, Tier 1 | 31 Dec 2026 | 31 Mar 2027 |
| Insurance, Tier 1 | 31 Dec 2026 | 31 Mar 2027 |
| Banking, Tier 2 | 28 Feb 2027 | 31 May 2027 |
| Insurance, Tier 2 | 31 Mar 2027 | 30 Jun 2027 |

V2.2 pairs with **API Hub V9**. The roadmap describes the release as "Uplift to V2.2 Final of the Standards (To be Published Shortly)". Tier 1 means eight banks (FAB, Emirates NBD, ADCB, DIB, Mashreq, ADIB, HSBC and CBD) and 16 insurers ([Ecosystem Watch](/observatory/watch/)).

<figure class="post-visual fit">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 600" width="320" height="600" role="img" aria-labelledby="fig-news-v2-2-deadline-timeline-svg" focusable="false"><title id="fig-news-v2-2-deadline-timeline-svg">Timeline of V2.2 dates from the Nebras roadmap. Today, 2 November 2026: V2.2 is still release candidate rc2 and its publication date is TBC. 31 December 2026: LFI release deadline for Tier-1 banks and Tier-1 insurers. 28 February 2027: Tier-2 banks. 31 March 2027: public go-live for Tier-1, and release deadline for Tier-2 insurers. 31 May 2027: Tier-2 bank go-live. 30 June 2027: Tier-2 insurer go-live.</title>
  <g aria-hidden="true" font-family="DM Sans, system-ui, sans-serif">
    <rect width="320" height="600" fill="var(--color-card, #ffffff)" />
    <line x1="40" y1="40" x2="40" y2="560" stroke="var(--color-border, #dce5df)" stroke-width="4" stroke-linecap="round" />
    <!-- Today -->
    <circle cx="40" cy="48" r="10" fill="var(--color-card, #ffffff)" stroke="var(--color-accent, #e8a85c)" stroke-width="3" />
    <text x="64" y="44" fill="var(--color-text, #132c2b)" font-size="16" font-weight="500">2 Nov 2026 · today</text>
    <text x="64" y="66" fill="var(--color-text-secondary, #526662)" font-size="15">V2.2 still rc2. Final: TBC</text>
    <!-- Tier-1 deadline -->
    <circle cx="40" cy="140" r="10" fill="var(--color-brand-ink, #0d4f4f)" />
    <text x="64" y="136" fill="var(--color-brand-ink, #0d4f4f)" font-size="16" font-weight="500">31 Dec 2026</text>
    <text x="64" y="158" fill="var(--color-text, #132c2b)" font-size="15">Release deadline:</text>
    <text x="64" y="178" fill="var(--color-text, #132c2b)" font-size="15">Tier-1 banks and insurers</text>
    <!-- Tier-2 banks -->
    <circle cx="40" cy="244" r="10" fill="var(--color-text-secondary, #526662)" />
    <text x="64" y="240" fill="var(--color-text, #132c2b)" font-size="16" font-weight="500">28 Feb 2027</text>
    <text x="64" y="262" fill="var(--color-text-secondary, #526662)" font-size="15">Release deadline: Tier-2 banks</text>
    <!-- 31 Mar 2027 -->
    <circle cx="40" cy="330" r="10" fill="var(--color-soft, #e7efea)" stroke="var(--color-brand-ink, #0d4f4f)" stroke-width="2" />
    <text x="64" y="326" fill="var(--color-text, #132c2b)" font-size="16" font-weight="500">31 Mar 2027</text>
    <text x="64" y="348" fill="var(--color-text-secondary, #526662)" font-size="15">Go-live: Tier-1 banks, insurers</text>
    <text x="64" y="368" fill="var(--color-text-secondary, #526662)" font-size="15">Release deadline: Tier-2 insurers</text>
    <!-- 31 May 2027 -->
    <circle cx="40" cy="432" r="10" fill="var(--color-soft, #e7efea)" stroke="var(--color-text-secondary, #526662)" stroke-width="2" />
    <text x="64" y="428" fill="var(--color-text, #132c2b)" font-size="16" font-weight="500">31 May 2027</text>
    <text x="64" y="450" fill="var(--color-text-secondary, #526662)" font-size="15">Go-live: Tier-2 banks</text>
    <!-- 30 Jun 2027 -->
    <circle cx="40" cy="520" r="10" fill="var(--color-soft, #e7efea)" stroke="var(--color-text-secondary, #526662)" stroke-width="2" />
    <text x="64" y="516" fill="var(--color-text, #132c2b)" font-size="16" font-weight="500">30 Jun 2027</text>
    <text x="64" y="538" fill="var(--color-text-secondary, #526662)" font-size="15">Go-live: Tier-2 insurers</text>
    <text x="16" y="590" fill="var(--color-text-secondary, #526662)" font-size="13">Nebras roadmap v3.0. Not to scale.</text>
  </g>
</svg>
<figcaption>V2.2 release deadlines and public go-live dates, from the Nebras roadmap v3.0. Publication of V2.2 final is still TBC.</figcaption>
</figure>

## Where the ecosystem stands today

The production directory snapshot of 1 November 2026 lists 51 API resource declarations across 30 registrations ([Observatory data](/observatory/data)):

- **41** declare v2.1
- **7** declare v1.2
- **3** declare v2.0
- **0** declare v2.2

The Ecosystem Watch run of 2 November puts the cohort at **0 of 8 Tier-1 banks and 0 of 16 Tier-1 insurers** registering v2.2 ([Ecosystem Watch](/observatory/watch/)). That's no surprise, since there's no final standard to register against. It does mean the whole Tier-1 cohort starts this uplift from zero, with a moving target and a fixed date.

<figure class="post-visual fit">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 400" width="320" height="400" role="img" aria-labelledby="fig-news-v2-2-deadline-versions-svg" focusable="false"><title id="fig-news-v2-2-deadline-versions-svg">Bar chart of 51 API resource declarations in the UAE production directory on 1 November 2026, by standards version. v2.1: 41. v1.2: 7. v2.0: 3. v2.2: 0. Bars are scaled from 0 to 51.</title>
  <g aria-hidden="true" font-family="DM Sans, system-ui, sans-serif">
    <rect width="320" height="400" fill="var(--color-card, #ffffff)" />
    <text x="16" y="32" fill="var(--color-text-secondary, #526662)" font-size="16">51 production API declarations</text>
    <text x="16" y="54" fill="var(--color-text-secondary, #526662)" font-size="15">1 November 2026</text>
    <!-- v2.1: 41. Bar width is 41 / 51 x 288 = 231.5. -->
    <text x="16" y="96" fill="var(--color-text, #132c2b)" font-size="16" font-weight="500">v2.1</text>
    <text x="304" y="96" text-anchor="end" fill="var(--color-text, #132c2b)" font-size="16" font-weight="500">41</text>
    <rect x="16" y="108" width="288" height="16" rx="4" fill="var(--color-border, #dce5df)" />
    <rect x="16" y="108" width="231.5" height="16" rx="4" fill="var(--color-brand-ink, #0d4f4f)" />
    <!-- v1.2: 7. Bar width is 7 / 51 x 288 = 39.5. -->
    <text x="16" y="168" fill="var(--color-text, #132c2b)" font-size="16" font-weight="500">v1.2</text>
    <text x="304" y="168" text-anchor="end" fill="var(--color-text, #132c2b)" font-size="16" font-weight="500">7</text>
    <rect x="16" y="180" width="288" height="16" rx="4" fill="var(--color-border, #dce5df)" />
    <rect x="16" y="180" width="39.5" height="16" rx="4" fill="var(--color-text-secondary, #526662)" />
    <!-- v2.0: 3. Bar width is 3 / 51 x 288 = 16.9. -->
    <text x="16" y="240" fill="var(--color-text, #132c2b)" font-size="16" font-weight="500">v2.0</text>
    <text x="304" y="240" text-anchor="end" fill="var(--color-text, #132c2b)" font-size="16" font-weight="500">3</text>
    <rect x="16" y="252" width="288" height="16" rx="4" fill="var(--color-border, #dce5df)" />
    <rect x="16" y="252" width="16.9" height="16" rx="4" fill="var(--color-text-secondary, #526662)" />
    <!-- v2.2: 0. Bar width is 0 / 51 x 288 = 0.0. -->
    <text x="16" y="312" fill="var(--color-text, #132c2b)" font-size="16" font-weight="500">v2.2</text>
    <text x="304" y="312" text-anchor="end" fill="var(--color-text, #132c2b)" font-size="16" font-weight="500">0</text>
    <rect x="16" y="324" width="288" height="16" rx="4" fill="var(--color-soft, #e7efea)" stroke="var(--color-accent, #e8a85c)" stroke-width="2" />
    <text x="16" y="376" fill="var(--color-text-secondary, #526662)" font-size="13">Source: Open Finance OS Observatory snapshot.</text>
  </g>
</svg>
<figcaption>API resource declarations by standards version, production directory, 1 November 2026.</figcaption>
</figure>

## The v2.1 precedent

The last uplift gives us a useful baseline. V2.1 was published on **7 January 2026**, and the LFI release deadline for Tier-1 extended data sharing on v2.1 was **30 April 2026** ([Nebras roadmap](https://openfinanceuae.atlassian.net/wiki/spaces/OF/pages/6259008/Roadmap)). That gave institutions 113 days from final text to deadline.

Six months after that deadline:

- **7 of 8** Tier-1 banks register v2.1 in production, and one still registers v1.2 ([Ecosystem Watch](/observatory/watch/)).
- In live traffic from November 2025 to September 2026, v2.1 carried **51.0%** of API calls. v1.2 carried **36.1%** and v2.0 **13.0%** ([Ecosystem Watch](/observatory/watch/)).

Older versions don't switch off on deadline day. They run side by side with the new one for months. For V2.2, the time between final text and deadline will be shorter than 113 days whatever date the final text lands, because today is already 59 days out.

## What's still moving in rc2

V2.2 is still changing week to week. Recent revisions on the official website's spec branch include ([Nebras changelog](https://nebras-open-finance.com/tech/release-notes-and-erratas/changelog/v2.2-rc2/); [Ecosystem Watch](/observatory/watch/)):

- The `aud` claim becomes a single string in every signed message.
- Confirmation of Payee responses gain a required `AccountStatus`.
- A TPP can ask for a payment to settle over UAEFTS with a new `UseFTS` flag.
- Every consent identifier is typed `format: uuid`. This landed on 26 October.

On 26 October, Nebras also opened [OFP-020](https://nebras-open-finance.com/proposals/ofp-020), a proposal to bring bulk and batch payments into V2.2. Among other questions, it asks TPPs whether a maximum of 5,000 instructions per request is enough. The Watch records the current set of consultations, OFP-015 to OFP-020, closing in the next few days.

## What V2.2 asks of LFIs

The changelog is explicit about where the work falls. Several changes are marked as requiring action from every LFI ([Nebras changelog](https://nebras-open-finance.com/tech/release-notes-and-erratas/changelog/v2.2-rc2/)):

1. **Payment rail on the payment log.** Every `PATCH /payment-log/{id}` must name the rail (`AANI`, `FTS` or `LFI`). On AANI and UAEFTS, `AcceptedSettlementCompleted` is no longer terminal, so a second patch is required.
2. **A 3-second window.** Screening, rail submission and the first patch must happen within 3 seconds of returning the `201`.
3. **Paginated payment log.** A caller that doesn't iterate pages will silently show only the first 25 payments.
4. **Transaction narratives are required.** Placeholders such as `N/A` or `Unknown` don't count.
5. **Confirmation of Payee is reshaped.** The LFI receives only the IBAN and returns the holder's name plus account status.
6. **Identity data patterns.** Emirates IDs need the `784` prefix, and names are Latin-script only, so LFIs that hold Arabic names must return their stored transliteration.
7. **Lending balances.** Credit cards, finance and mortgages must return defined balance types.

The changelog notes that the API Hub's enforcement date for the payment-log change "is set separately from the version cutover", so watch for that date too.

<figure class="post-visual fit">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 640" width="320" height="640" role="img" aria-labelledby="fig-news-v2-2-deadline-flow-svg" focusable="false"><title id="fig-news-v2-2-deadline-flow-svg">Sequence of the v2.2 payment-log contract on AANI and UAEFTS. The TPP calls POST /payments through the API Hub, and the LFI returns 201. Within 3 seconds, the LFI screens the payment, submits it to the rail and patches the payment log to AcceptedSettlementCompleted, naming the rail. When the rail responds, the LFI patches the terminal status: AcceptedWithoutPosting on AANI, AcceptedCreditSettlementCompleted on UAEFTS, or Rejected.</title>
  <g aria-hidden="true" font-family="DM Sans, system-ui, sans-serif">
    <rect width="320" height="640" fill="var(--color-card, #ffffff)" />
    <g fill="none" stroke="var(--color-text-secondary, #526662)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M160 76 V96 M154 90 L160 100 L166 90" />
      <path d="M160 176 V196 M154 190 L160 200 L166 190" />
      <path d="M160 384 V404 M154 398 L160 408 L166 398" />
    </g>
    <rect x="40" y="16" width="240" height="56" rx="12" fill="var(--color-card, #ffffff)" stroke="var(--color-border, #dce5df)" stroke-width="1.5" />
    <text x="160" y="40" text-anchor="middle" fill="var(--color-text, #132c2b)" font-size="16" font-weight="500">TPP → API Hub → LFI</text>
    <text x="160" y="62" text-anchor="middle" fill="var(--color-text-secondary, #526662)" font-size="15">POST /payments</text>
    <rect x="40" y="104" width="240" height="68" rx="12" fill="var(--color-soft, #e7efea)" stroke="var(--color-brand-ink, #0d4f4f)" stroke-width="2" />
    <text x="160" y="134" text-anchor="middle" fill="var(--color-brand-ink, #0d4f4f)" font-size="20" font-weight="500">LFI returns 201</text>
    <text x="160" y="158" text-anchor="middle" fill="var(--color-text-secondary, #526662)" font-size="15">the 3-second clock starts</text>
    <rect x="16" y="204" width="288" height="176" rx="14" fill="var(--color-card, #ffffff)" stroke="var(--color-accent, #e8a85c)" stroke-width="2" />
    <text x="160" y="236" text-anchor="middle" fill="var(--color-text, #132c2b)" font-size="18" font-weight="500">Within 3 seconds</text>
    <text x="160" y="266" text-anchor="middle" fill="var(--color-text, #132c2b)" font-size="15">Screen (fraud, monitoring, AML)</text>
    <text x="160" y="290" text-anchor="middle" fill="var(--color-text, #132c2b)" font-size="15">Submit to AANI or UAEFTS</text>
    <text x="160" y="314" text-anchor="middle" fill="var(--color-text, #132c2b)" font-size="15">PATCH payment log:</text>
    <text x="160" y="338" text-anchor="middle" fill="var(--color-brand-ink, #0d4f4f)" font-size="15" font-weight="500">AcceptedSettlementCompleted</text>
    <text x="160" y="362" text-anchor="middle" fill="var(--color-text-secondary, #526662)" font-size="14">with paymentRail (not terminal)</text>
    <rect x="16" y="412" width="288" height="176" rx="14" fill="var(--color-soft, #e7efea)" stroke="var(--color-brand-ink, #0d4f4f)" stroke-width="2" />
    <text x="160" y="444" text-anchor="middle" fill="var(--color-text, #132c2b)" font-size="18" font-weight="500">When the rail responds</text>
    <text x="160" y="472" text-anchor="middle" fill="var(--color-text, #132c2b)" font-size="15">PATCH the terminal status:</text>
    <text x="160" y="500" text-anchor="middle" fill="var(--color-brand-ink, #0d4f4f)" font-size="14" font-weight="500">AANI: AcceptedWithoutPosting</text>
    <text x="160" y="526" text-anchor="middle" fill="var(--color-brand-ink, #0d4f4f)" font-size="14" font-weight="500">UAEFTS: AcceptedCredit-</text>
    <text x="160" y="546" text-anchor="middle" fill="var(--color-brand-ink, #0d4f4f)" font-size="14" font-weight="500">SettlementCompleted</text>
    <text x="160" y="572" text-anchor="middle" fill="var(--color-text-secondary, #526662)" font-size="14">or Rejected on either rail</text>
    <text x="16" y="620" fill="var(--color-text-secondary, #526662)" font-size="13">Nebras v2.2-rc2 changelog. Draft.</text>
  </g>
</svg>
<figcaption>The v2.2 payment-log sequence on AANI and UAEFTS: submit and patch within 3 seconds, then patch the terminal status when the rail responds.</figcaption>
</figure>

The payment-log changes interact with commercial rules already in force. Since its 19 October revision, the [Commercial and Pricing Model](https://openfinanceuae.atlassian.net/wiki/spaces/OF/pages/124846096/Commercial+and+Pricing+Model) gives LFIs three calendar days to patch payment status. Payments still pending after that earn the LFI no fee. Payment-log discipline is about to become both a conformance issue and a revenue issue.

## What to do before the final text lands

**If you're an LFI:**

- **Start with your data.** Narrative coverage, Emirates ID formats, Latin transliterations and lending balance types live in core systems, not in the API layer. They take the longest to fix, whatever the final API shape.
- **Map your payment-status pipeline against the rail-specific sequence.** Measure your real time from `201` to rail submission today.
- **Plan for v2.1 and v2.2 to run side by side.** The v2.1 precedent says you'll serve more than one version for a while.

**If you're a TPP:**

- **Parse tolerantly.** The CoP confirmation `Data` object is `additionalProperties: false`, so strict v2.1 clients will reject v2.2 responses until they're regenerated.
- **Treat `PaymentRail` as optional.** It's absent until the LFI has routed the payment.

**Everyone:** comment on the open proposals while they're open. In a hub model, every LFI uplifts onto one shared platform, so community input on the spec reaches the whole market at once.

## Follow the countdown

We track V2.2 every week. The [Ecosystem Watch](/observatory/watch/) shows the Tier-1 cohort, spec-branch changes and the roadmap dates side by side. The [registry data](/observatory/data) is downloadable, and the [methodology](/observatory/methodology) is open. **[Subscribe to the RSS feed](/rss.xml)** to get the weekly digest the day V2.2 final is published or the first v2.2 declaration appears in production. Building toward V2.2 and seeing something we haven't? [Start a discussion on GitHub](https://github.com/openfinance-os/community-website/discussions).

---

*This is an independent, community-run analysis, not official. Release candidates must not be used as the basis for a production implementation. Consult the [official Open Finance documentation](https://openfinanceuae.atlassian.net/wiki/spaces/OF/overview) and the CBUAE [Open Finance Regulation](https://rulebook.centralbank.ae/en/rulebook/open-finance-regulation).*

### Sources
- Nebras, Roadmap v3.0 (published 25 Mar 2026): https://openfinanceuae.atlassian.net/wiki/spaces/OF/pages/6259008/Roadmap
- Nebras, Version Changelog v2.1 → v2.2-rc2: https://nebras-open-finance.com/tech/release-notes-and-erratas/changelog/v2.2-rc2/
- Nebras, OFP-020 Introduce Bulk/Batch Payments in V2.2 (opened 26 Oct 2026): https://nebras-open-finance.com/proposals/ofp-020
- Nebras, Commercial and Pricing Model (Confluence v35, 19 Oct 2026): https://openfinanceuae.atlassian.net/wiki/spaces/OF/pages/124846096/Commercial+and+Pricing+Model
- Open Finance OS production registry snapshot, observed 2026-11-01 12:41 UTC: /observatory/data
- Open Finance OS Ecosystem Watch, run 2026-11-02 (logs through 2026-10-25): /observatory/watch/
- UAE architecture rules: MiddleLeap Open Finance UAE skill (github.com/middleleap/ai-dlc)
