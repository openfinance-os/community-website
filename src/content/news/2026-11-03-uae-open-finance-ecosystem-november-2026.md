---
title: "UAE Open Finance: where the ecosystem stands in November 2026"
date: 2026-11-03
type: community
region: uae
author: Open Finance OS
description: "A 3 November 2026 reading of UAE Open Finance from the public directory and Ecosystem Watch: who publishes an authorization server, which API versions are declared, and what the logs show."
image: /news/dfs-2026/cover.svg
imageAlt: "UAE Open Finance in November 2026. A bar shows 13 of 30 production registrations publishing an authorization server on 2 November 2026."
imageCaption: "Production directory snapshot, 2 November 2026, 14:47 UTC. 13 of 30 registrations publish an authorization server."
---

This note is dated 3 November 2026, during Dubai FinTech Summit at Madinat Jumeirah. The picture below is the public record of UAE Open Finance.

<aside class="glance" aria-label="At a glance">
<p class="glance-label">At a glance</p>
<ul>
<li><strong>Directory, 2 November 2026, 14:47 UTC.</strong> 30 production registrations. 13 publish an authorization server. 17 do not.</li>
<li><strong>LFI role.</strong> 22 of the 30 hold it. 13 of those 22 publish an authorization server.</li>
<li><strong>API declarations, same snapshot.</strong> 51 resources: 41 on v2.1, 7 on v1.2, 3 on v2.0, none on v2.2.</li>
<li><strong>Baseline, 28 October 2026, 12:08 UTC.</strong> 12 of 30 published an authorization server.</li>
<li><strong>Logs.</strong> 1,416,887 API calls in full months from November 2025 through September 2026. Ecosystem Watch run 2 November 2026, source data through 25 October 2026.</li>
</ul>
</aside>

## The directory

The newest Observatory production snapshot is 2 November 2026, 14:47 UTC, from the public directory at data.directory.openfinance.ae. It lists **30** registrations. **13** publish an active authorization server with a nonempty issuer. **17** do not. That count is published metadata. Reachability, certification and traffic are separate questions. The [methodology](/observatory/methodology) is the definition.

On 28 October 2026, 12:08 UTC, the same count was **12 of 30**, with **18** not publishing an issuer. That baseline is the one in [12 of 30: Why Most UAE Open Finance Registrations Don't Publish an Authorization Server](/news/2026-10-29-12-of-30-uae-open-finance-authorization-servers).

<figure class="post-visual">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 440" width="1440" height="880" role="img" aria-labelledby="fig-eco-auth" focusable="false"><title id="fig-eco-auth">Two bars scaled from 0 to 30. On 28 October 2026 at 12:08 UTC, 12 of 30 production registrations publish an authorization server. On 2 November 2026 at 14:47 UTC, 13 of 30 do. Source: data.directory.openfinance.ae.</title>
  <rect width="720" height="440" fill="#ffffff" />
  <rect width="720" height="6" fill="#E8A85C" />
  <g aria-hidden="true" font-family="DM Sans, system-ui, sans-serif">
    <text x="40" y="48" fill="#526662" font-size="16" font-weight="600" letter-spacing="1.1">AUTHORIZATION SERVERS</text>
    <text x="40" y="108" fill="#0D4F4F" font-size="48" font-weight="500">13 of 30</text>
    <text x="40" y="148" fill="#132C2B" font-size="22">publish one, 2 November 2026</text>
    <text x="40" y="206" fill="#132C2B" font-size="18">28 Oct</text>
    <defs>
      <clipPath id="eco-bar-oct">
        <rect x="150" y="184" width="480" height="32" rx="8" />
      </clipPath>
      <clipPath id="eco-bar-nov">
        <rect x="150" y="236" width="480" height="32" rx="8" />
      </clipPath>
    </defs>
    <g clip-path="url(#eco-bar-oct)">
      <rect x="150" y="184" width="480" height="32" fill="#E7EFEA" />
      <rect x="150" y="184" width="192" height="32" fill="#0D4F4F" />
    </g>
    <text x="648" y="206" fill="#0D4F4F" font-size="18" font-weight="600">12</text>
    <text x="40" y="258" fill="#132C2B" font-size="18">2 Nov</text>
    <g clip-path="url(#eco-bar-nov)">
      <rect x="150" y="236" width="480" height="32" fill="#E7EFEA" />
      <rect x="150" y="236" width="208" height="32" fill="#0D4F4F" />
    </g>
    <text x="648" y="258" fill="#0D4F4F" font-size="18" font-weight="600">13</text>
    <text x="40" y="312" fill="#526662" font-size="16">Bars run from 0 to 30. 2 November: 13 with an issuer, 17 without.</text>
    <text x="40" y="340" fill="#526662" font-size="16">28 October: 12 with an issuer, 18 without.</text>
    <text x="40" y="388" fill="#526662" font-size="16">Source: data.directory.openfinance.ae. Snapshots at 12:08 UTC</text>
    <text x="40" y="416" fill="#526662" font-size="16">on 28 October and 14:47 UTC on 2 November 2026.</text>
  </g>
</svg>
<figcaption>13 of 30 on 2 November 2026, 14:47 UTC. 17 do not publish an issuer. The 28 October baseline, 12:08 UTC, was 12 of 30. Public directory at data.directory.openfinance.ae.</figcaption>
</figure>

**22** of the 30 registrations hold the LFI role. All **13** that publish an authorization server are in that group, so **9** LFI registrations do not. The other **8** registrations do not hold LFI and do not publish an authorization server. **25** of the 30 hold more than one directory role, so role counts are not a headcount of institutions. The snapshot's legacy TPP count is 0. That field is not a count of third-party providers.

Two dated registry changes sit behind the move from 12 to 13:

- **27 October 2026, 11:37 UTC.** Al Buharia National Insurance Co joins the production directory as an LFI, with no authorization server and no API family. Registrations go from 29 to 30. The authorization-server count stays 12.
- **29 October 2026, 12:18 UTC.** Standard Chartered first publishes an authorization server. It still has no API family on 2 November. The count becomes 13 of 30.

A [22 October 2026 item on this site](/news/2026-10-22-open-finance-arrives-on-the-nbf-direct-app-with-mu), sourced from fintechnews.ae, reports that the NBF Direct app added an open-finance feature and began rolling the changes out in September 2026. In the 2 November snapshot, NBF publishes an authorization server and an accounts family.

UAE Open Finance is supervised by the Central Bank of the UAE. Banking and insurance services go through a central API Hub. The Hub is the OIDC/FAPI authorization server and token issuer. The [FAQ](/learn/faq) separates the CBUAE, the Al Tareq brand and Nebras, which operates the Hub.

## What the APIs declare

The same 2 November snapshot lists **51** API resource declarations. **41** are v2.1, **7** are v1.2, **3** are v2.0, and **none** are v2.2. All 51 are marked Self-Certified. By family, the declarations are accounts 14, payments 12, confirmation of payee 11, products 10, insurance 2 and ATM 2.

<figure class="post-visual">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 420" width="1440" height="840" role="img" aria-labelledby="fig-eco-versions" focusable="false"><title id="fig-eco-versions">Bar chart of 51 production API resource declarations on 2 November 2026. v2.1 has 41, v1.2 has 7, v2.0 has 3, and v2.2 has 0. Bars are scaled from 0 to 51. Source: data.directory.openfinance.ae.</title>
  <rect width="720" height="420" fill="#ffffff" />
  <rect width="720" height="6" fill="#E8A85C" />
  <g aria-hidden="true" font-family="DM Sans, system-ui, sans-serif">
    <text x="40" y="44" fill="#526662" font-size="16" font-weight="600" letter-spacing="1.1">API VERSIONS</text>
    <text x="40" y="92" fill="#0D4F4F" font-size="36" font-weight="500">51 declarations</text>
    <text x="40" y="124" fill="#132C2B" font-size="18">Production directory, 2 November 2026, 14:47 UTC</text>
    <text x="40" y="176" fill="#132C2B" font-size="18" font-weight="600">v2.1</text>
    <rect x="120" y="156" width="510" height="28" rx="8" fill="#E7EFEA" />
    <rect x="120" y="156" width="410" height="28" rx="8" fill="#0D4F4F" />
    <text x="648" y="176" fill="#0D4F4F" font-size="18" font-weight="600">41</text>
    <text x="40" y="228" fill="#132C2B" font-size="18" font-weight="600">v1.2</text>
    <rect x="120" y="208" width="510" height="28" rx="8" fill="#E7EFEA" />
    <rect x="120" y="208" width="70" height="28" rx="8" fill="#0D4F4F" />
    <text x="648" y="228" fill="#0D4F4F" font-size="18" font-weight="600">7</text>
    <text x="40" y="280" fill="#132C2B" font-size="18" font-weight="600">v2.0</text>
    <rect x="120" y="260" width="510" height="28" rx="8" fill="#E7EFEA" />
    <rect x="120" y="260" width="30" height="28" rx="8" fill="#0D4F4F" />
    <text x="648" y="280" fill="#0D4F4F" font-size="18" font-weight="600">3</text>
    <text x="40" y="332" fill="#132C2B" font-size="18" font-weight="600">v2.2</text>
    <rect x="120" y="312" width="510" height="28" rx="8" fill="#F6F8F5" stroke="#E8A85C" stroke-width="2" />
    <text x="648" y="332" fill="#0D4F4F" font-size="18" font-weight="600">0</text>
    <text x="40" y="376" fill="#526662" font-size="16">Bars run from 0 to 51. Source: data.directory.openfinance.ae.</text>
    <text x="40" y="402" fill="#526662" font-size="16">All 51 declarations are Self-Certified in this snapshot.</text>
  </g>
</svg>
<figcaption>API resource declarations by version, production directory, 2 November 2026, 14:47 UTC. 41 on v2.1, 7 on v1.2, 3 on v2.0, none on v2.2.</figcaption>
</figure>

## What the logs show

[Ecosystem Watch](/observatory/watch/) reads the public Al Tareq platform logs. The newest run in the repo is 2 November 2026. Its source data runs through 25 October 2026. Full months are November 2025 through September 2026. October is still a partial month, so the rates below use full months only.

- **1,416,887** API calls across those full months.
- **September 2026** is the busiest full month, at **405,147** calls, recorded in the Watch as **31.8%** above the previous full month.
- **18.4%** of full-month API calls returned a 4xx or 5xx response.
- **95.3%** of full-month payment instructions were accepted. Acceptance is not final settlement.
- **16** distinct LFI log keys had calls in the full months, including error-only keys and bank segments. That is not a count of licensed institutions.
- **17** distinct non-empty TPP names had calls in those full months. The Watch does not treat that as a licensing count.
- Of full-month calls, the Watch records **51.0%** on v2.1, **36.1%** on v1.2 and **13.0%** on v2.0. Those shares round to 100.1.

The directory and the logs answer different questions. A published authorization server is metadata. A log key is observed traffic.

## What to watch next

The [2 November note on V2.2](/news/2026-11-02-uae-open-finance-v2-2-deadline) cites the Nebras roadmap, version 3.0, published 25 March 2026: Tier-1 banks and Tier-1 insurers have an LFI release deadline of **31 December 2026**. The Ecosystem Watch run of 2 November records **0 of 8** Tier-1 banks and **0 of 16** Tier-1 insurers with V2.2 registered. The 2 November directory snapshot agrees on the declarations: **0 of 51** are v2.2. The same note says the final text is still a release candidate and its publication date is TBC.

Three directory facts are still open in the 2 November snapshot:

1. **9** LFI registrations do not publish an authorization server.
2. Standard Chartered publishes an authorization server and no API family.
3. Al Buharia National Insurance Co is on the directory, as of 27 October, with neither an authorization server nor an API family.

October's logs are not a full month yet. The 2 November Watch run counts **552,359** API calls in October through 25 October. The next full-month comparison is against September's 405,147.

## Stay in touch

- **Subscribe to the newsletter** at [openfinance-os.org/newsletter](/newsletter).
- **Join the community Slack** with [this invite link](https://join.slack.com/t/openfinance-os/shared_invite/zt-4f6yrsi0w-qPd32ve~7Czekf0BWJRgLQ).
- **Read issue #1**, [UAE Open Finance: why 12 of 30 registrations publish an auth server](/newsletter/archive/uae-open-finance-why-12-of-30-registrations).
