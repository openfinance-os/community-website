---
title: "12 of 30: Why Most UAE Open Finance Registrations Don't Publish an Authorization Server"
date: 2026-10-29
type: opinion
region: uae
author: OpenFinance-OS
description: "Only 12 of 30 production registrations in the UAE Open Finance directory publish an active authorization server. We break down the other 18 and what the gap does and doesn't mean."
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

## The trend: registrations are growing faster than issuers

From the Observatory's daily history:

| Snapshot | Registrations | With issuer |
|---|---|---|
| 26 Dec 2025 | 17 | 9 |
| 13 Jul 2026 | 23 | 11 |
| 15 Sep 2026 | 26 | 12 |
| 28 Oct 2026 | 30 | 12 |

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
