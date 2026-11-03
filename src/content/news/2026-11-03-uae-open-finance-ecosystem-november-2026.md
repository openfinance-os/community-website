---
title: "UAE Open Finance is showing up in the banking app"
date: 2026-11-03
type: community
region: uae
author: Open Finance OS
description: "In November 2026, UAE Open Finance is something a customer can open in a banking app. Here is what that does and does not yet mean, and what has to move before the 31 December V2.2 deadline."
image: /news/dfs-2026/cover.svg
imageAlt: "UAE Open Finance is showing up in the banking app, November 2026. A bar shows 13 of 30 production registrations publishing an authorization server on 2 November 2026."
imageCaption: "Production directory snapshot, 2 November 2026. 13 of 30 registrations publish an authorization server."
---

Open a banking app in the UAE and, at one bank, open finance is no longer only a regulatory project. [Fintech News UAE reported on 22 October 2026](/news/2026-10-22-open-finance-arrives-on-the-nbf-direct-app-with-mu) that National Bank of Fujairah had added it to NBF Direct, with the rollout starting in September. Customers can share account data with approved third-party apps, link accounts at other banks, and see them in one place. They choose which approved firms can see the data. The report says the UAE central bank is bringing the model in step by step under its UAE Open Finance rules.

That is the shift this month. A person can meet UAE Open Finance inside an app they already use. The questions that follow are plain. What can a customer actually do? What is still plumbing? What has to change before 31 December 2026?

## What can a customer actually do?

The NBF report is one bank, one app, and a rollout that began in September 2026. It describes a permission and a view: share data with an approved firm, link other banks, look at them together. It does not say every bank offers that screen, and it does not say how far the rollout had reached on the day of the report.

For a customer, UAE Open Finance becomes a button. For a fintech, there is a journey someone can try. For a bank, the screen a person sees and the directory record are not the same fact.

## What is still plumbing?

The public directory is the plumbing anyone can check. On 2 November 2026, at 14:47 UTC, **13 of 30** production registrations publish an active authorization server. The figure is from that day's Observatory snapshot of the trust-framework directory at data.directory.openfinance.ae. Publishing an authorization server means the registration has an active one with a nonempty issuer. It does not mean a customer can open a feature, and it does not measure traffic. The [methodology](/observatory/methodology) is the definition we use.

<figure class="post-visual">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 300" width="1440" height="600" role="img" aria-labelledby="fig-eco-auth" focusable="false"><title id="fig-eco-auth">On 2 November 2026 at 14:47 UTC, 13 of 30 production registrations publish an authorization server. The bar is 13 parts in teal out of 30. Source: data.directory.openfinance.ae.</title>
  <rect width="720" height="300" fill="#ffffff" />
  <rect width="720" height="6" fill="#E8A85C" />
  <g aria-hidden="true" font-family="DM Sans, system-ui, sans-serif">
    <text x="40" y="52" fill="#526662" font-size="16" font-weight="600" letter-spacing="1.1">2 NOVEMBER 2026, 14:47 UTC</text>
    <text x="40" y="118" fill="#0D4F4F" font-size="56" font-weight="500">13 of 30</text>
    <text x="40" y="158" fill="#132C2B" font-size="22">publish an authorization server</text>
    <defs>
      <clipPath id="eco-auth-bar">
        <rect x="40" y="186" width="630" height="40" rx="10" />
      </clipPath>
    </defs>
    <g clip-path="url(#eco-auth-bar)">
      <rect x="40" y="186" width="630" height="40" fill="#E7EFEA" />
      <rect x="40" y="186" width="273" height="40" fill="#0D4F4F" />
    </g>
    <text x="40" y="268" fill="#526662" font-size="16">Production directory snapshot. Source: data.directory.openfinance.ae.</text>
  </g>
</svg>
<figcaption>13 of 30 production registrations publish an authorization server. Snapshot of 2 November 2026, 14:47 UTC. Public directory at data.directory.openfinance.ae.</figcaption>
</figure>

Read the bar as a map of what is published, not of what a customer can tap. A registration can publish the server and still have no journey in an app. The directory tells you who has published the authorization server. It does not tell you whose customers can already link another bank.

Traffic is the other signal. Between November 2025 and September 2026, [Ecosystem Watch](/observatory/watch/) records **1,416,887** API calls. The run is dated 2 November 2026, and the logs run through 25 October 2026. October is left out because that month was still incomplete. Calls mean the pipes carried requests. They do not say which of those requests a person would recognise as the NBF Direct feature.

## What has to change before 31 December?

Tier-1 banks are due to release V2.2 of the UAE Open Finance standards into production by 31 December 2026. The final text is not out. It is still a release candidate, and the roadmap still lists the publication date as TBC.

On the Ecosystem Watch run of 2 November 2026, **0 of 8** Tier-1 banks are registering V2.2. The text they would register against is not final, so the zero is expected. The deadline is fixed anyway.

The countdown, and what a bank or a fintech can do while the wording is still moving, is in [UAE Open Finance V2.2: Due by Year-End, Still Not Final](/news/2026-11-02-uae-open-finance-v2-2-deadline/). Read that next. This note will not walk the same ground.

## What should you watch?

Watch for more apps that do what the NBF report describes: a person chooses an approved firm, shares an account, and sees other banks in one place. One reported rollout is a start. It is not yet the market.

Watch the directory as metadata. An authorization server on a registration is the start of a question, not proof that a customer feature is live.

Watch V2.2. The 31 December deadline is close, the final text is still TBC, and the 2 November Watch run still shows no Tier-1 bank registering it. When the text lands, or the first registration appears, [that briefing](/news/2026-11-02-uae-open-finance-v2-2-deadline/) is where the detail sits.

## Stay in touch

- **Subscribe to the newsletter** at [openfinance-os.org/newsletter](/newsletter).
- **Join the community Slack** with [this invite link](https://join.slack.com/t/openfinance-os/shared_invite/zt-4f6yrsi0w-qPd32ve~7Czekf0BWJRgLQ).
- **Read issue #1** of the newsletter, on [why a registration publishes an authorization server](/newsletter/archive/uae-open-finance-why-12-of-30-registrations).
