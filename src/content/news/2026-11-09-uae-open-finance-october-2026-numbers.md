---
title: "842,969 Calls: UAE Open Finance Doubled in October"
date: 2026-11-09
type: opinion
region: uae
author: OpenFinance-OS
description: "UAE Open Finance API calls more than doubled in October 2026 to 842,969, and accepted payments reached AED 124.8m. What grew, who drove it and what to watch."
image: /news/october-2026/hero.svg
imageAlt: "Large figure reading 842,969 API calls in October 2026, beside small monthly bars that jump from 405,147 in September, with a note that accepted payments reached AED 124.8 million."
imageCaption: "Monthly API calls and accepted payment value, October 2026. Source: Ecosystem Watch, run 8 November 2026."
---

October was the first month UAE Open Finance cleared **800,000 API calls**. The public logs show **842,969 calls**, up from 405,147 in September, a rise of **108.1%** ([Ecosystem Watch, run 8 Nov 2026](/observatory/watch/)).

Money moved faster too. Accepted payments in October were worth **AED 124.8 million**, up 32.3% on September's AED 94.3 million ([Ecosystem Watch](/observatory/watch/)).

This is the first of a monthly series. Each month we'll take the latest full month from the Watch and ask three questions: what grew, who drove it, and what changed for people building on Al Tareq.

All figures come from the Ecosystem Watch run of 8 November 2026, which reads public operational logs through 3 November 2026. October is now a complete month. November is partial and is kept out of the full-month totals ([Ecosystem Watch](/observatory/watch/)).

## The numbers

- **842,969 API calls in October**, the highest month on record. September had 405,147 ([Ecosystem Watch](/observatory/watch/)).
- **2,259,856 calls across 12 full months**, November 2025 to October 2026 ([Ecosystem Watch](/observatory/watch/)).
- **AED 124.8 million in accepted payments in October**, and **AED 414.9 million** across the 12 full months. Only payments with an accepted status count towards value ([Ecosystem Watch](/observatory/watch/); [metrics code](https://github.com/openfinance-os/community-website/blob/main/tools/watch/of_watch_metrics.py)).
- **95.7% of payments accepted** across 91,185 payment-status records. 1,753 were rejected, about 1.9% by our calculation ([Ecosystem Watch](/observatory/watch/)).
- **12.7% of calls returned a 4xx or 5xx error** across the full months, down from 18.4% in the run of 26 October ([Ecosystem Watch](/observatory/watch/); [26 Oct digest](/news/2026-10-26-weekly-digest)).
- **16 LFIs and 17 TPPs** had successful traffic in the last two full months ([Ecosystem Watch](/observatory/watch/)).

<figure class="post-visual">
<img src="/news/october-2026/monthly.svg" alt="Two bar charts. Monthly API calls rise from about 27,000 in November 2025 to 405,147 in September and 842,969 in October 2026. Accepted payment value rises from near zero to AED 94.3 million in September and AED 124.8 million in October." />
<figcaption>Calls doubled in October while payment value grew by a third. Source: Ecosystem Watch, run 8 Nov 2026.</figcaption>
</figure>

## Calls doubled, value grew by a third

The two growth rates tell different stories. Calls rose 108.1%, but payment value rose 32.3%. That gap is the most useful thing in this month's data.

Across the 12 full months, payment calls (1,005,071) and account-information calls (980,545) are almost level. Confirmation of Payee adds another 273,048 ([Ecosystem Watch](/observatory/watch/)). So a big share of traffic is data sharing and payee checks, not money movement. A month in which calls double while value grows by a third suggests more of the new traffic is reading accounts or checking payees rather than paying. The public figures we publish don't split October by API family, so treat that as a reading of the data, not a measured fact.

Consent behaviour also improved. In October, 68.4% of consent requests became consents (38,766 of 56,639), against 65.3% across all full months. Cancellations were 10.5% of requests ([Ecosystem Watch](/observatory/watch/)).

<figure class="post-visual">
<img src="/news/october-2026/consent.svg" alt="Funnel showing 56,639 consent requests in October 2026, of which 38,766 (68.4%) became consents and 5,933 (10.5% of requests) were cancelled." />
<figcaption>October consent conversion beat the full-period average of 65.3%. Source: Ecosystem Watch, run 8 Nov 2026.</figcaption>
</figure>

## Who drove it

Growth was broad among banks but narrow among TPPs.

On the LFI side, ADIB was the biggest riser in the Watch's movers table, from 45,323 calls to 280,824 (+519.6%). HSBC (Retail) went from 8,276 to 31,710, and Commercial Bank of Dubai from 5,366 to 13,492 ([Ecosystem Watch](/observatory/watch/)). The Watch also recorded two first-seen pairings in October: Spare and Wio Bank, acting as a TPP, both started calling HSBC (Retail) ([Ecosystem Watch](/observatory/watch/)).

On the TPP side, one provider still dominates. **Lean Technologies accounts for 83.0% of attributed calls** across the full months, 1,760,478 of 2,120,296. The Watch puts the market's concentration index (HHI) at **6,965** on a scale where 10,000 would mean a single TPP carries all traffic ([Ecosystem Watch](/observatory/watch/); [metrics code](https://github.com/openfinance-os/community-website/blob/main/tools/watch/of_watch_metrics.py)).

<figure class="post-visual">
<img src="/news/october-2026/concentration.svg" alt="Two stacked bars. Lean Technologies carries 83.0% of attributed API calls and the other TPPs 17.0%. Wio Bank holds 57.0% of accepted payment value, Mashreq 37.9%, and nine other LFIs 5.1%." />
<figcaption>One TPP carries most calls, and two banks hold most payment value. Source: Ecosystem Watch, run 8 Nov 2026; value shares are our calculation.</figcaption>
</figure>

Payment value is concentrated on the bank side as well. Wio Bank (AED 236.7 million) and Mashreq (AED 157.1 million) together account for about 94.9% of accepted value across the full months, by our calculation ([Ecosystem Watch](/observatory/watch/)).

None of this is a criticism of any participant. Early open banking markets often look like this, with one aggregator carrying most volume while banks finish onboarding. It does mean the national numbers move with a handful of integrations.

## The error rate fell, but read it carefully

The full-month error rate dropped from 18.4% to 12.7% between the 26 October and 8 November runs ([Ecosystem Watch](/observatory/watch/)). Most of that is the denominator. October added 842,969 calls at a much lower error rate than earlier months, which pulls the cumulative figure down.

Some LFIs still stand out. Dubai Islamic Bank's full-month error share is 83.9% across 104,621 calls, and Emirates NBD's is 37.5% across 56,103 ([Ecosystem Watch](/observatory/watch/)). As we wrote [last week](/news/2026-11-03-uae-open-finance-api-error-rate), an error is not an outage, and the public logs don't say which environment a call came from.

## What October means for builders

**For TPPs, the rails can take volume.** A month of 842,969 calls with 95.7% of payments accepted is a reasonable signal that the hub-mediated path holds up under load. Every call still runs TPP to API Hub to LFI, with consent stored only in the Hub ([Open Finance UAE skill](https://github.com/middleleap/ai-dlc/blob/main/plugins/middleleap-open-finance-uae/skills/open-finance-uae/SKILL.md)). Design for the journey, not the single call.

**For LFIs, traffic arrives in steps.** ADIB's month shows how fast volume can land once a large TPP or internal channel switches on. Capacity planning based on last month's numbers will be wrong in a month like this one.

**For everyone, fees are still a black box.** The pricing model sets fees such as 38 bps on merchant collections in year one ([Open Finance UAE skill](https://github.com/middleleap/ai-dlc/blob/main/plugins/middleleap-open-finance-uae/skills/open-finance-uae/SKILL.md)). The Watch withholds fee totals because the public logs don't show payment context, exemptions or individual values ([Ecosystem Watch](/observatory/watch/)). So nobody outside the scheme can yet say what AED 124.8 million in payments earned anyone.

**And the standards clock keeps running.** No Active API resource in the production directory is on v2.2 yet. The Watch checked all 14 organisations on 8 November ([Ecosystem Watch](/observatory/watch/)). We covered the year-end deadline in [our v2.2 explainer](/news/2026-11-02-uae-open-finance-v2-2-deadline).

## What we'll watch in November

The first three days of November logged 117,314 calls, with a 2.5% error rate and 97.4% of payments accepted ([Ecosystem Watch](/observatory/watch/)). Three days is too short to call a trend. The questions for next month are whether October's step holds, whether a second TPP starts to take share from Lean, and whether value growth catches up with call growth.

## Follow the numbers

We'll publish this round-up after every full month. Read the latest [Ecosystem Watch](/observatory/watch/), download the open [datasets](/observatory/data), or [subscribe to the newsletter](/newsletter/) for the weekly digest and next month's numbers.

*Open Finance OS is an independent, community-run project. It is not affiliated with CBUAE or Nebras. These figures are our observations of public data, not official statistics. Derived figures marked "our calculation" are ours.*
