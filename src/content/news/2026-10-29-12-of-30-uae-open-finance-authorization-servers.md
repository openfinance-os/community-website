---
title: "12 of 30: Why Most UAE Open Finance Registrations Don't Publish an Authorization Server"
date: 2026-10-29
type: opinion
region: uae
author: OpenFinance-OS
description: "Only 12 of 30 production registrations in the UAE Open Finance directory publish an active authorization server. We break down the other 18 and what the gap does and doesn't mean."
image: /news/12-of-30/hero.svg
imageAlt: "12 of 30 production registrations publish an authorization server on 28 October 2026. A bar shows 12 with an issuer and 18 without."
imageCaption: "Production directory snapshot, 28 October 2026."
---

Each week our digest reports one line that confuses people more than any other: **12 of the 30 production directory registrations publish an active authorization server with an issuer.** Last week the figure was 12 of 29. Al Buharia National Insurance Co joined the production registry on 27 October and took the total to 30. The 12 didn't change.

It's easy to read that as "only 40% of the ecosystem works." That reading is wrong. This post explains what the number measures, who the other 18 are, and why most of them *shouldn't* publish an authorization server at all.

All figures come from the Observatory's production snapshot of 28 October 2026 (12:08 UTC), which is derived from the public trust-framework directory. Our methodology is open.

## What "publishes an authorization server" actually means

The Observatory counts a registration as having an authorization server when it has **at least one active authorization server with a non-empty issuer** in the production directory ([methodology](/observatory/methodology)).

That is **published metadata**. We don't test whether the issuer is reachable, certified, integrated or carrying traffic. The legacy fields `isLive` and `liveInProduction` in our datasets keep this narrow meaning. Despite the name, they don't mean "verified live."

## The UAE model: one authorization server role, not many

If you come from the UK or EU, you'd expect each bank to run its own authorization server. The UAE doesn't work that way.

UAE Open Finance is **centralised**. The Nebras-operated, Ozone-powered **API Hub** is the authorization server and consent store. The rules are:

- TPPs never call banks directly. Traffic flows `TPP → API Hub → LFI → API Hub → TPP`.
- Consents are created and stored only in the API Hub.
- Only the API Hub issues access tokens. LFIs never do.
- The customer *authenticates* at their bank, while the API Hub *authorizes*.

In short, the **API Hub is the control plane and the LFI (licensed financial institution) is the execution layer**. A published issuer against an LFI's registration shows that an authorization endpoint has been provisioned for that institution's APIs. It doesn't mean the bank runs its own token service. For the operator's rules, see the [official Open Finance documentation](https://openfinanceuae.atlassian.net/wiki/spaces/OF/overview).

<figure class="post-visual fit">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 620" width="320" height="620" role="img" aria-labelledby="fig-news-12-of-30-model-svg" focusable="false"><title id="fig-news-12-of-30-model-svg">Flow diagram of the UAE model. Traffic runs from the TPP to the API Hub, to the LFI, back to the API Hub, and back to the TPP. The API Hub authorizes, issues the access token, and stores consent. The LFI executes, and the customer authenticates at their bank.</title>
  <g aria-hidden="true" font-family="DM Sans, system-ui, sans-serif">
    <rect width="320" height="620" fill="var(--color-card, #ffffff)" />
    <g fill="none" stroke="var(--color-text-secondary, #526662)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M160 76 V96 M154 90 L160 100 L166 90" />
      <path d="M160 240 V260 M154 254 L160 264 L166 254" />
      <path d="M160 412 V432 M154 426 L160 436 L166 426" />
      <path d="M160 504 V524 M154 518 L160 528 L166 518" />
    </g>
    <rect x="80" y="16" width="160" height="56" rx="12" fill="var(--color-card, #ffffff)" stroke="var(--color-border, #dce5df)" stroke-width="1.5" />
    <text x="160" y="50" text-anchor="middle" fill="var(--color-text, #132c2b)" font-size="20" font-weight="500">TPP</text>
    <rect x="16" y="104" width="288" height="132" rx="14" fill="var(--color-soft, #e7efea)" stroke="var(--color-brand-ink, #0d4f4f)" stroke-width="2" />
    <text x="160" y="140" text-anchor="middle" fill="var(--color-brand-ink, #0d4f4f)" font-size="22" font-weight="500">API Hub</text>
    <text x="160" y="168" text-anchor="middle" fill="var(--color-text, #132c2b)" font-size="16" font-weight="500">Authorizes</text>
    <text x="160" y="192" text-anchor="middle" fill="var(--color-text-secondary, #526662)" font-size="16">Issues the access token</text>
    <text x="160" y="214" text-anchor="middle" fill="var(--color-text-secondary, #526662)" font-size="16">Stores consent</text>
    <rect x="16" y="272" width="288" height="136" rx="14" fill="var(--color-card, #ffffff)" stroke="var(--color-accent, #e8a85c)" stroke-width="2" />
    <text x="160" y="308" text-anchor="middle" fill="var(--color-text, #132c2b)" font-size="22" font-weight="500">LFI</text>
    <text x="160" y="336" text-anchor="middle" fill="var(--color-text, #132c2b)" font-size="16" font-weight="500">Executes</text>
    <text x="160" y="362" text-anchor="middle" fill="var(--color-text-secondary, #526662)" font-size="16">Customer authenticates</text>
    <text x="160" y="384" text-anchor="middle" fill="var(--color-text-secondary, #526662)" font-size="16">at their bank</text>
    <rect x="80" y="444" width="160" height="56" rx="12" fill="var(--color-soft, #e7efea)" stroke="var(--color-brand-ink, #0d4f4f)" stroke-width="2" />
    <text x="160" y="478" text-anchor="middle" fill="var(--color-brand-ink, #0d4f4f)" font-size="20" font-weight="500">API Hub</text>
    <rect x="80" y="536" width="160" height="56" rx="12" fill="var(--color-card, #ffffff)" stroke="var(--color-border, #dce5df)" stroke-width="1.5" />
    <text x="160" y="570" text-anchor="middle" fill="var(--color-text, #132c2b)" font-size="20" font-weight="500">TPP</text>
  </g>
</svg>
<figcaption>The API Hub authorizes. The licensed institution executes.</figcaption>
</figure>

With that model in mind, the 18 make more sense.

## Who the 12 are

| Group | Registrations | Count |
|---|---|---|
| Banks | ADCB, ADIB, CBD, DIB, Emirates NBD, FAB, HSBC, Mashreq, NBF, Wio Bank | 10 |
| Insurers | ADNIC, LIVA | 2 |

All 12 hold the LFI role, and each declares at least one API family. The ten banks publish `accounts`. Eight of them also publish `cop` (Confirmation of Payee), `payments` and `products`. Emirates NBD and HSBC each added `atm` v2.1 this month. The two insurers publish `insurance`.

## Who the 18 are

The 18 registrations without a published issuer fall into three groups.

### 1. Data recipients and payment initiators (5)

Lean Technologies, Mercury (BDSP/BSIP registration), NymCard Payment Services, PAY TEN Payment Services Provider and Spare Digital Technologies hold BDSP/BSIP roles. These are the roles of consumers of data and initiators of payments.

In a hub model, a TPP **consumes** APIs through the API Hub and authorizes against it. It has no reason to publish an authorization server of its own. A missing issuer here is the expected state, not a shortfall.

### 2. Infrastructure and technical providers (3)

Mercury (TSP / Cert_Management registration), Ozone API and Raidiam Services Limited hold roles such as `TSP`, `API Read_Write` and `pki-test-harness`. They support the platform, certificates and testing, so they aren't data holders that expose customer accounts. Mercury appears twice because the directory counts **registration IDs, not legal entities**.

### 3. LFIs with no published issuer yet (10)

This is the group to watch:

- **Banks:** EIB, Standard Chartered
- **Insurers:** Al Buharia National Insurance Co, Al Wathba National Insurance Co, Dubai Insurance Company, Emirates Insurance Company, Orient Insurance, Salama, Union Insurance, Zurich

Several are recent arrivals. Dubai Insurance Company joined production on 18 August, Standard Chartered on 2 October, Zurich on 19 October, EIB on 20 October and Al Buharia on 27 October ([registry changelog](/observatory#changelog)). None of the ten declares an API family in the snapshot yet.

These are the registrations where a new issuer would actually change the picture.

<figure class="post-visual fit">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 648" width="320" height="648" role="img" aria-labelledby="fig-news-12-of-30-breakdown-svg" focusable="false"><title id="fig-news-12-of-30-breakdown-svg">Breakdown of 30 production registrations. 12 publish an issuer: 10 banks and 2 insurers. 18 do not: 5 data recipients and payment initiators, 3 infrastructure and technical providers, and 10 licensed institutions with no published issuer yet.</title>
  <defs>
    <pattern id="of12-infra" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="6" height="6" fill="var(--color-soft, #e7efea)" />
      <line x1="0" y1="0" x2="0" y2="6" stroke="var(--color-text-secondary, #526662)" stroke-width="2" />
    </pattern>
  </defs>
  <g aria-hidden="true" font-family="DM Sans, system-ui, sans-serif">
    <rect width="320" height="648" fill="var(--color-card, #ffffff)" />
    <text x="20" y="36" fill="var(--color-text-secondary, #526662)" font-size="16">30 production registrations</text>
    <text x="20" y="80" fill="var(--color-text, #132c2b)" font-size="16">
      <tspan fill="var(--color-brand-ink, #0d4f4f)" font-size="36" font-weight="500">12</tspan>
      <tspan dx="10">with an issuer</tspan>
    </text>
    <text x="20" y="124" fill="var(--color-text, #132c2b)" font-size="16">
      <tspan font-size="36" font-weight="500">18</tspan>
      <tspan dx="10">without an issuer</tspan>
    </text>
    <!-- 10 banks -->
    <g fill="var(--color-brand-ink, #0d4f4f)">
      <rect x="20" y="148" width="40" height="40" rx="8" />
      <rect x="68" y="148" width="40" height="40" rx="8" />
      <rect x="116" y="148" width="40" height="40" rx="8" />
      <rect x="164" y="148" width="40" height="40" rx="8" />
      <rect x="212" y="148" width="40" height="40" rx="8" />
      <rect x="260" y="148" width="40" height="40" rx="8" />
      <rect x="20" y="196" width="40" height="40" rx="8" />
      <rect x="68" y="196" width="40" height="40" rx="8" />
      <rect x="116" y="196" width="40" height="40" rx="8" />
      <rect x="164" y="196" width="40" height="40" rx="8" />
    </g>
    <!-- 2 insurers -->
    <g fill="var(--color-accent, #e8a85c)">
      <rect x="212" y="196" width="40" height="40" rx="8" />
      <rect x="260" y="196" width="40" height="40" rx="8" />
    </g>
    <!-- 5 data recipients and payment initiators -->
    <g fill="var(--color-text-secondary, #526662)">
      <rect x="20" y="244" width="40" height="40" rx="8" />
      <rect x="68" y="244" width="40" height="40" rx="8" />
      <rect x="116" y="244" width="40" height="40" rx="8" />
      <rect x="164" y="244" width="40" height="40" rx="8" />
      <rect x="212" y="244" width="40" height="40" rx="8" />
    </g>
    <!-- 3 infrastructure and technical providers -->
    <g fill="url(#of12-infra)">
      <rect x="260" y="244" width="40" height="40" rx="8" />
      <rect x="20" y="292" width="40" height="40" rx="8" />
      <rect x="68" y="292" width="40" height="40" rx="8" />
    </g>
    <!-- 10 LFIs with no published issuer yet -->
    <g fill="var(--color-soft, #e7efea)" stroke="var(--color-accent, #e8a85c)" stroke-width="2">
      <rect x="116" y="292" width="40" height="40" rx="8" />
      <rect x="164" y="292" width="40" height="40" rx="8" />
      <rect x="212" y="292" width="40" height="40" rx="8" />
      <rect x="260" y="292" width="40" height="40" rx="8" />
      <rect x="20" y="340" width="40" height="40" rx="8" />
      <rect x="68" y="340" width="40" height="40" rx="8" />
      <rect x="116" y="340" width="40" height="40" rx="8" />
      <rect x="164" y="340" width="40" height="40" rx="8" />
      <rect x="212" y="340" width="40" height="40" rx="8" />
      <rect x="260" y="340" width="40" height="40" rx="8" />
    </g>
    <rect x="20" y="404" width="18" height="18" rx="4" fill="var(--color-brand-ink, #0d4f4f)" />
    <text x="48" y="418" fill="var(--color-text, #132c2b)" font-size="16">10 banks</text>
    <rect x="20" y="438" width="18" height="18" rx="4" fill="var(--color-accent, #e8a85c)" />
    <text x="48" y="452" fill="var(--color-text, #132c2b)" font-size="16">2 insurers</text>
    <rect x="20" y="476" width="18" height="18" rx="4" fill="var(--color-text-secondary, #526662)" />
    <text x="48" y="490" fill="var(--color-text, #132c2b)" font-size="16">
      <tspan x="48">5 data recipients and</tspan>
      <tspan x="48" dy="20">payment initiators</tspan>
    </text>
    <rect x="20" y="532" width="18" height="18" rx="4" fill="url(#of12-infra)" />
    <text x="48" y="546" fill="var(--color-text, #132c2b)" font-size="16">
      <tspan x="48">3 infrastructure and</tspan>
      <tspan x="48" dy="20">technical providers</tspan>
    </text>
    <rect x="20" y="588" width="18" height="18" rx="4" fill="var(--color-soft, #e7efea)" stroke="var(--color-accent, #e8a85c)" stroke-width="2" />
    <text x="48" y="602" fill="var(--color-text, #132c2b)" font-size="16">
      <tspan x="48">10 LFIs with no published</tspan>
      <tspan x="48" dy="20">issuer yet</tspan>
    </text>
  </g>
</svg>
<figcaption>12 publish an issuer. 18 do not.</figcaption>
</figure>

## The trend: registrations are growing faster than issuers

From the Observatory's daily history:

| Snapshot | Registrations | With issuer |
|---|---|---|
| 26 Dec 2025 | 17 | 9 |
| 13 Jul 2026 | 23 | 11 |
| 15 Sep 2026 | 26 | 12 |
| 28 Oct 2026 | 30 | 12 |

<figure class="post-visual fit">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 620" width="320" height="620" role="img" aria-labelledby="fig-news-12-of-30-trend-svg" focusable="false"><title id="fig-news-12-of-30-trend-svg">Bar chart of registrations and registrations with an issuer. 26 December 2025: 17 registrations and 9 with an issuer. 13 July 2026: 23 and 11. 15 September 2026: 26 and 12. 28 October 2026: 30 and 12. Each bar is scaled from 0 to 30.</title>
  <g aria-hidden="true" font-family="DM Sans, system-ui, sans-serif">
    <rect width="320" height="620" fill="var(--color-card, #ffffff)" />
    <rect x="16" y="18" width="14" height="14" rx="3" fill="var(--color-brand-ink, #0d4f4f)" />
    <text x="36" y="30" fill="var(--color-text, #132c2b)" font-size="15">Registrations</text>
    <rect x="168" y="18" width="14" height="14" rx="3" fill="var(--color-accent, #e8a85c)" />
    <text x="188" y="30" fill="var(--color-text, #132c2b)" font-size="15">With issuer</text>
    <!-- 26 Dec 2025: 17 registrations, 9 with issuer. Bar width is value / 30 × 288. -->
    <text x="16" y="68" fill="var(--color-text, #132c2b)" font-size="16" font-weight="500">26 Dec 2025</text>
    <text x="16" y="96" fill="var(--color-text-secondary, #526662)" font-size="15">Registrations</text>
    <text x="304" y="96" text-anchor="end" fill="var(--color-text, #132c2b)" font-size="16" font-weight="500">17</text>
    <rect x="16" y="108" width="288" height="14" rx="4" fill="var(--color-border, #dce5df)" />
    <rect x="16" y="108" width="163.2" height="14" rx="4" fill="var(--color-brand-ink, #0d4f4f)" />
    <text x="16" y="150" fill="var(--color-text-secondary, #526662)" font-size="15">With issuer</text>
    <text x="304" y="150" text-anchor="end" fill="var(--color-text, #132c2b)" font-size="16" font-weight="500">9</text>
    <rect x="16" y="162" width="288" height="14" rx="4" fill="var(--color-border, #dce5df)" />
    <rect x="16" y="162" width="86.4" height="14" rx="4" fill="var(--color-accent, #e8a85c)" />
    <!-- 13 Jul 2026: 23 and 11 -->
    <text x="16" y="204" fill="var(--color-text, #132c2b)" font-size="16" font-weight="500">13 Jul 2026</text>
    <text x="16" y="232" fill="var(--color-text-secondary, #526662)" font-size="15">Registrations</text>
    <text x="304" y="232" text-anchor="end" fill="var(--color-text, #132c2b)" font-size="16" font-weight="500">23</text>
    <rect x="16" y="244" width="288" height="14" rx="4" fill="var(--color-border, #dce5df)" />
    <rect x="16" y="244" width="220.8" height="14" rx="4" fill="var(--color-brand-ink, #0d4f4f)" />
    <text x="16" y="286" fill="var(--color-text-secondary, #526662)" font-size="15">With issuer</text>
    <text x="304" y="286" text-anchor="end" fill="var(--color-text, #132c2b)" font-size="16" font-weight="500">11</text>
    <rect x="16" y="298" width="288" height="14" rx="4" fill="var(--color-border, #dce5df)" />
    <rect x="16" y="298" width="105.6" height="14" rx="4" fill="var(--color-accent, #e8a85c)" />
    <!-- 15 Sep 2026: 26 and 12 -->
    <text x="16" y="340" fill="var(--color-text, #132c2b)" font-size="16" font-weight="500">15 Sep 2026</text>
    <text x="16" y="368" fill="var(--color-text-secondary, #526662)" font-size="15">Registrations</text>
    <text x="304" y="368" text-anchor="end" fill="var(--color-text, #132c2b)" font-size="16" font-weight="500">26</text>
    <rect x="16" y="380" width="288" height="14" rx="4" fill="var(--color-border, #dce5df)" />
    <rect x="16" y="380" width="249.6" height="14" rx="4" fill="var(--color-brand-ink, #0d4f4f)" />
    <text x="16" y="422" fill="var(--color-text-secondary, #526662)" font-size="15">With issuer</text>
    <text x="304" y="422" text-anchor="end" fill="var(--color-text, #132c2b)" font-size="16" font-weight="500">12</text>
    <rect x="16" y="434" width="288" height="14" rx="4" fill="var(--color-border, #dce5df)" />
    <rect x="16" y="434" width="115.2" height="14" rx="4" fill="var(--color-accent, #e8a85c)" />
    <!-- 28 Oct 2026: 30 and 12 -->
    <text x="16" y="476" fill="var(--color-text, #132c2b)" font-size="16" font-weight="500">28 Oct 2026</text>
    <text x="16" y="504" fill="var(--color-text-secondary, #526662)" font-size="15">Registrations</text>
    <text x="304" y="504" text-anchor="end" fill="var(--color-text, #132c2b)" font-size="16" font-weight="500">30</text>
    <rect x="16" y="516" width="288" height="14" rx="4" fill="var(--color-border, #dce5df)" />
    <rect x="16" y="516" width="288" height="14" rx="4" fill="var(--color-brand-ink, #0d4f4f)" />
    <text x="16" y="558" fill="var(--color-text-secondary, #526662)" font-size="15">With issuer</text>
    <text x="304" y="558" text-anchor="end" fill="var(--color-text, #132c2b)" font-size="16" font-weight="500">12</text>
    <rect x="16" y="570" width="288" height="14" rx="4" fill="var(--color-border, #dce5df)" />
    <rect x="16" y="570" width="115.2" height="14" rx="4" fill="var(--color-accent, #e8a85c)" />
  </g>
</svg>
<figcaption>Registrations and published issuers, 26 December 2025 to 28 October 2026. Bars are scaled from 0 to 30.</figcaption>
</figure>

Registrations grew by 13 between 26 December 2025 and 28 October 2026, while registrations with an issuer grew by 3. Most of the new entries are insurers and banks joining as LFIs, so this gap is mostly **onboarding lag**. It doesn't mean the model is failing. Joining the directory and exposing production APIs are separate milestones.

## What the 12 are doing with it

A published issuer isn't traffic. The Ecosystem Watch, which draws on the Al Tareq platform's own logs, shows what the ecosystem is doing in practice:

- **1,416,887** cumulative API calls across full months (November 2025 to September 2026)
- **95.3%** payment success and an **18.4%** API error rate across completed months
- **16 LFIs and 17 TPPs** with successful traffic in the source's last two completed months
- October is partial: logs run to 21 October, and **431,788** October calls already exceed September's total

([Ecosystem Watch](/observatory/watch/), [26 Oct digest](/news/2026-10-26-weekly-digest))

The directory count and the traffic count measure different things. Neither one alone tells you whether a given institution is ready for your use case.

## What to do with this if you're building

1. **Don't read the 12 as the full list of live institutions.** Check the [coverage table](/observatory/coverage/) for the API families and versions each registration declares.
2. **Don't expect a TPP to publish an issuer.** In the UAE you authorize against the API Hub.
3. **Watch the ten LFIs above.** A new issuer or API family on one of them is the signal that matters, and every change appears in our changelog within a day.
4. **Check the standards version.** Declarations in the snapshot are mostly v2.1, with some v1.2 and v2.0 still present. Check the version and errata before you integrate.

## Follow the numbers

Every figure in this post is reproducible. [Download the registry snapshot and history](/observatory/data), read the [methodology](/observatory/methodology), and subscribe to the [RSS feed](/rss.xml) for the weekly digest. If you see something we've misread, [start a discussion on GitHub](https://github.com/openfinance-os/community-website/discussions).

---

*This is an independent, community-run analysis, not official. Building or integrating? Consult the [official Open Finance documentation](https://openfinanceuae.atlassian.net/wiki/spaces/OF/overview).*

### Sources
- OpenFinance-OS registry snapshot, observed 2026-10-28 12:08 UTC: /observatory/data/registry-latest.json
- OpenFinance-OS registry history (since 2025-12-26): /observatory/data/registry-history.json
- Observatory methodology: /observatory/methodology
- Ecosystem Watch: /observatory/watch/
- Weekly digest, 26 Oct 2026: /news/2026-10-26-weekly-digest
- UAE architecture rules: Middleleap Open Finance UAE skill (github.com/middleleap/ai-dlc), summarising CBUAE / Nebras sources
