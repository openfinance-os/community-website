---
title: "18.4% API Errors: What UAE Open Finance Data Tells Builders"
date: 2026-11-03
type: opinion
region: uae
author: OpenFinance-OS
description: "UAE open finance API calls hit an 18.4% error rate over 11 months, yet 95.3% of payments were accepted. What the gap means for LFIs and TPPs on Al Tareq."
image: /news/api-error-rate/hero.svg
imageAlt: "Large figure reading 18.4% of API calls returned errors, beside a grid of 50 dots with 9 highlighted, and a note that 95.3% of payments were accepted."
imageCaption: "Full-month API error rate, November 2025 to September 2026. Source: Ecosystem Watch, run 26 October 2026."
---

Our weekly [Ecosystem Watch](/observatory/watch/) carries a number that looks alarming at first glance: **18.4% of UAE Open Finance API calls returned an error** across the full months from November 2025 to September 2026 ([Ecosystem Watch, run 26 Oct 2026](/observatory/watch/)).

That is roughly one call in five. In the same Watch, **95.3% of payments were accepted** ([Ecosystem Watch](/observatory/watch/)). Both numbers are correct. This post explains how they fit together and what builders on Al Tareq should do about them.

All figures come from the Ecosystem Watch run of 26 October 2026, which uses public operational logs through 21 October 2026. We checked them again on 3 November 2026 and they had not changed. October is a partial month and is kept out of the full-month totals ([Ecosystem Watch](/observatory/watch/)).

## The numbers

Here is what the Watch reports:

- **1,416,887 API calls** across 11 full months, November 2025 to September 2026 ([Ecosystem Watch](/observatory/watch/)).
- **18.4% of those calls returned errors.** That is 260,243 errors on bank calls, plus a few hundred on insurer calls ([Ecosystem Watch](/observatory/watch/)).
- **431,788 calls in October up to the 21st**, already more than September's 405,147, with an error rate of **3.7%** ([Ecosystem Watch](/observatory/watch/)).
- **95.3% of payments accepted** across 61,515 payment-status records. Only 1,288 (about 2.1%) were rejected. The rest were pending or received ([Ecosystem Watch](/observatory/watch/)).

<figure class="post-visual">
<img src="/news/api-error-rate/monthly-calls.svg" alt="Bar chart of monthly UAE Open Finance API calls, rising from about 27,000 in November 2025 to 405,147 in September 2026, with partial October at 431,788." />
<figcaption>Monthly API calls. October is partial (logs to 21 Oct). Source: Ecosystem Watch, run 26 Oct 2026.</figcaption>
</figure>

Traffic has grown fast. Monthly calls rose from 27,038 in November 2025 to 405,147 in September 2026 ([Ecosystem Watch](/observatory/watch/)). Most of that growth came from July onwards.

## Why an 18.4% error rate doesn't mean 18.4% downtime

It is tempting to read 18.4% as "the system is down a fifth of the time." That reading is wrong for three reasons.

**First, an error is not an outage.** The figure counts calls that returned an error. Many of those are ordinary 4xx responses: an expired consent, a bad request or a missing field. A system can be fully available and still return lots of errors if clients send it requests it can't accept.

**Second, the errors are concentrated.** Dubai Islamic Bank's full-month error share is 84.1% across 104,350 calls ([Ecosystem Watch](/observatory/watch/)). By our calculation that is about 88,000 errors, or roughly a third of all errors in the period. Take that one LFI out and the rest of the ecosystem sits at about 13%. The public logs don't say which environment those calls came from, so we can't tell whether this was production traffic, testing, or a stuck integration retrying ([Ecosystem Watch](/observatory/watch/)).

**Third, the trend is improving.** October's error rate to date is 3.7% on the highest volume the ecosystem has seen ([Ecosystem Watch](/observatory/watch/)). One partial month isn't a trend line, but it is the right direction.

<figure class="post-visual">
<img src="/news/api-error-rate/rates.svg" alt="Horizontal bars: 18.4% of calls with errors in full months, 3.7% in October to date, 95.3% of payments accepted, 2.1% rejected." />
<figcaption>Calls fail more often than payments. Source: Ecosystem Watch, run 26 Oct 2026; rejected share is our calculation.</figcaption>
</figure>

## Why payments look so much better

Payments succeed far more often than calls because a payment is the end of a journey, not a single request. Before a payment is submitted, a TPP may have made several calls: creating a consent, checking the payee, and polling status. Any of those can fail and be retried without the payment itself failing.

So the 95.3% acceptance figure and the 18.4% call error rate measure different things. One counts every request. The other counts payments that got far enough to have a status ([Ecosystem Watch](/observatory/watch/)).

For builders, the gap is the point. Customers don't see your error rate. They see whether their payment went through, and how long it took.

## What the rules expect

The UAE model routes every call through the Nebras-operated API Hub: TPP to Hub to LFI and back. The Hub owns consents and tokens, and the LFI executes. The reliability targets attach to that path ([Open Finance UAE skill](https://github.com/middleleap/ai-dlc/blob/main/plugins/middleleap-open-finance-uae/skills/open-finance-uae/SKILL.md)).

<figure class="post-visual">
<img src="/news/api-error-rate/sla-flow.svg" alt="Diagram of TPP to API Hub to LFI, with three targets: 500 ms p95 per LFI endpoint, 99.5% monthly availability, and 3 seconds end-to-end for domestic instant payments." />
<figcaption>Where the reliability clocks run. Source: Open Finance UAE skill, operational policies.</figcaption>
</figure>

- **99.5% availability per calendar month** across an LFI's Ozone Connect endpoints. That allows about 3 hours 39 minutes of downtime a month, and planned maintenance still counts against it ([operational policies](https://github.com/middleleap/ai-dlc/blob/main/plugins/middleleap-open-finance-uae/skills/open-finance-uae/references/operational-policies.md)).
- **500 ms response time at p95, per endpoint**, measured from the API Hub sending the request to receiving the last byte back. The published Benchmarks standard states 500 ms as an average. The policy holds each endpoint to p95, which is stricter ([operational policies](https://github.com/middleleap/ai-dlc/blob/main/plugins/middleleap-open-finance-uae/skills/open-finance-uae/references/operational-policies.md)).
- **3 seconds end-to-end** for domestic instant payments, under the Aani scheme rule. This is a separate scheme rule. The 500 ms target covers only the API acknowledgement, and execution runs asynchronously ([operational policies](https://github.com/middleleap/ai-dlc/blob/main/plugins/middleleap-open-finance-uae/skills/open-finance-uae/references/operational-policies.md)).
- An LFI must show it meets 99.5% over a proving period against real TPP traffic before sign-off, both at go-live and at each major-version go-live ([operational policies](https://github.com/middleleap/ai-dlc/blob/main/plugins/middleleap-open-finance-uae/skills/open-finance-uae/references/operational-policies.md)).

None of these targets is an error-rate target. An LFI can meet 99.5% availability and still return a high share of errors. That is why the Watch reports both, and why neither tells the whole story alone.

## What this data can't tell you

We want to be clear about the limits. The Watch uses public traffic logs, separate from the directory data behind the rest of the Observatory ([methodology](/observatory/methodology)). The logs don't identify the environment, and they don't break errors down by status code in what we publish. We can't measure latency or availability from them, so we make no claim about whether any LFI meets the 500 ms or 99.5% targets.

## What to do: LFIs

- **Check your own share.** The Watch lists LFIs with high full-month error shares. If you are on it, find out whether the calls are production, test, or a client looping on retries.
- **Separate 4xx from 5xx in your reporting.** Client errors point to documentation and onboarding gaps. Server errors point to your platform. They need different owners.
- **Plan maintenance against the 99.5% budget.** There's no free offline quota, so three and a half hours a month goes quickly.
- **Measure at p95, not the average.** The operative target is per endpoint at p95, measured from the Hub.

## What to do: TPPs

- **Retry carefully.** Use idempotency keys and back off. Blind retries inflate error counts and can create duplicate payments.
- **Don't block on payment execution.** The 500 ms acknowledgement and the 3 s execution are different clocks. Poll or subscribe to status rather than holding the customer on a spinner.
- **Track journey success, not just call success.** The customer metric is "did the payment go through," which is the number that sits at 95.3% today.
- **Test against more than one LFI.** Error shares vary widely by institution, so one good integration doesn't predict the next.

## Follow the numbers

We publish these figures every week. Read the latest [Ecosystem Watch](/observatory/watch/), browse the open [datasets](/observatory/data), or subscribe to our [RSS feed](/rss.xml) to get each new run.

*Open Finance OS is an independent, community-run project. It is not affiliated with CBUAE or Nebras. These figures are our observations of public data, not official statistics. Derived figures marked "our calculation" are ours.*
