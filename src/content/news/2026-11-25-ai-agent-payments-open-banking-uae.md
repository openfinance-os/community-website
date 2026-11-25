---
title: "AI Agent Payments in UAE Open Banking: Where AlTareq Keeps the Mandate"
date: 2026-11-25
type: opinion
region: uae
author: OpenFinance-OS
description: "Can an AI agent pay through AlTareq? UAE Open Finance already keeps capped, revocable payment consents in one place. It just can't tell when an agent acts."
image: /news/ai-agent-payments-open-banking-uae/hero.svg
imageAlt: "Large figure reading 0 of 27: none of the 27 changes in the UAE Open Finance v2.2-rc2 changelog mention AI agents. Beneath it, a simple path shows an agent working through a licensed TPP, the API Hub holding the consent and its limits, and the customer's bank executing the payment."
imageCaption: "AlTareq already has a central mandate store; the standard has no field that names an agent. Source: Nebras v2.2-rc2 changelog, checked 23 November 2026."
---

"Payments aren't the hard part. Authority is." That's how Mastercard put it on 20 October, when it opened early access to Agent Pay for Machines. A business gives an AI agent a task and a spending limit, and the agent pays for services within it ([Mastercard, 20 Oct 2026](https://www.mastercard.com/global/en/news-and-trends/press/2026/october/Mastercard-Agent-Pay-for-Machines-in-action.html)). The same day, Visa, BILL and Billtrust launched a live pilot in which a registered BILL payment agent pays supplier invoices the buyer has already approved ([Visa, 20 Oct 2026](https://investor.visa.com/news/news-details/2026/Visa-BILL-and-Billtrust-Launch-First-Live-Pilot-for-Trusted-AI-Agent-Payments-Between-Buyer-and-Supplier-Platforms/default.aspx)).

The past week brought more of the same. Plaid launched Agent Detection on 16 November so financial firms can tell whether a person or an agent is acting ([Plaid](https://plaid.com/blog/agent-detection-agentic-finance/)). On 18 November, Visa opened Agentic Ready to merchants and acquirers, with more than 85 acceptance participants in Europe ([Visa](https://www.visa.co.uk/about-visa/newsroom/press-releases.3478924.html)). And on 18 November the Financial Data Exchange, the North American open banking standards body, said AI tools should reach bank data through governed, consent-based APIs rather than screen scraping, while naming agent identity and consent as open work ([FDX](https://www.globenewswire.com/news-release/2026/11/18/3406052/0/en/leading-standards-body-weighs-in-on-how-ai-tools-access-financial-data.html); [our coverage](/news/2026-11-18-fdx-sets-out-how-ai-agents-should-access-consumer-fin/)).

So can an AI agent pay through AlTareq? Technically, yes. But the UAE standard doesn't know when one is.

## No agent in the architecture

AlTareq has no participant called an agent. A licensed TPP calls the API Hub, and the customer approves the consent at their bank, on a screen rendered from exactly what the TPP asked for ([consent requirements](https://nebras-open-finance.com/tech/tpp-standards/v2.1/consent/requirements)). Banks that adopt CAAP send customers to a Nebras-run journey that authenticates them with EFR or UAE Pass instead ([CAAP](https://nebras-open-finance.com/tech/lfi-api-hub/v2.1/caap)).

The consent itself lives in one place. "The API Hub is the single source of truth for all consents," as the [Consent Manager guide](https://nebras-open-finance.com/tech/lfi-api-hub/v2.1/api-hub/consent-manager) puts it. So any agent payment in the UAE today is a TPP payment under a consent in that store. The agent sits behind the TPP, where the Hub can't see it.

![How an agent's payment would run through AlTareq today, and what each party can see](/news/ai-agent-payments-open-banking-uae/authority-path.svg)

## The mandate already exists

Mastercard's pitch is "authorize once, transact many times". AlTareq's current standard, v2.1, already has a version of that: the multi-payment consent. The closest fit for an agent is **Variable On Demand**. The consent must carry at least one cap, which the customer approves at their bank: a maximum per payment, a maximum number of payments per period, or a maximum value per period. The API Hub checks every `POST /payments` against those caps and rejects anything over them ([Variable On Demand requirements](https://nebras-open-finance.com/tech/tpp-standards/v2.1/banking/service-initiation/domestic-payments/multi-payments/variable-on-demand/requirements)). The period is "a cap window, not a cadence", so the TPP, or an agent behind it, decides when to pay ([choosing a payment type](https://nebras-open-finance.com/knowledge-base/articles/choosing-a-payment-type)).

Two more limits make this a sensible agent mandate. A consent can't run for more than a year, and its expiry should match what the service needs. The customer can also revoke it directly at their bank ([consent requirements](https://nebras-open-finance.com/tech/tpp-standards/v2.1/consent/requirements)).

| | Mastercard Agent Pay for Machines | Visa, BILL and Billtrust pilot | AlTareq Variable On Demand |
| --- | --- | --- | --- |
| Who sets the limit | The business, per task and budget | The buyer's approved payment instruction | The TPP proposes it; the customer approves it at their bank |
| Where the limit is enforced | Signed vouchers within the approved limit, checked by the provider | Tokenised credentials with controls aligned to the approved instruction | API Hub, on every payment |
| How the agent is identified | The agent signs each payment voucher | Visa Trusted Agent Protocol and Agentic Directory | Not identified |
| Status | Early access, pilot stage | Live pilot | In the current standard (v2.1) |

The card networks are building registries because their authority is spread across issuers, wallets and tokens. AlTareq already has a central store for the mandate. What it doesn't have is a way to name who is using it.

## What the standard can't see

Every UAE payment carries a Risk block. Its `IsCustomerPresent` flag is "false for automated/background payments", and `ChannelType` has seven values: `ECommerce`, `InStore`, `InApp`, `Telephone`, `Mail`, `RecurringPayment` and `Other`. None of them means an agent. The same list appears in the v2.1 and v2.2-rc2 Risk pages ([Risk, v2.1](https://nebras-open-finance.com/tech/tpp-standards/v2.1/banking/service-initiation/personal-identifiable-information/risk); [Risk, v2.2-rc2](https://nebras-open-finance.com/tech/tpp-standards/v2.2-rc2/banking/service-initiation/personal-identifiable-information/risk)). So an agent payment looks the same as a scheduled subscription. Anything else has to go in a free-form `SupplementaryData` object, because the payload must match the schema exactly ([Delegated SCA requirements](https://nebras-open-finance.com/tech/tpp-standards/v2.1/banking/service-initiation/domestic-payments/multi-payments/delegated-sca/requirements)).

Version 2.2 doesn't change this. The v2.2-rc2 changelog lists **27 changes across 20 functional areas, and none of them mentions an agent** ([v2.2-rc2 changelog](https://nebras-open-finance.com/tech/release-notes-and-erratas/changelog/v2.2-rc2/)). The two nearest changes point at other parties:

- **§21, Emirates ID on every payment.** Under any long-lived consent, a TPP must send a retail customer's Emirates ID on every `POST /payments`. The bank can then confirm each payment is for the same person who approved the consent ([knowledge base](https://nebras-open-finance.com/knowledge-base/articles/emirates-id-long-lived-payments)). This identifies the human, not the software acting for them.
- **§11, `OnBehalfOf` on payment consents.** A TPP can name the entity it acts for: trading name, legal name and identifier. That's a business, not an agent.

![Areas touched by the 27 changes in the v2.2-rc2 changelog; none concerns agents](/news/ai-agent-payments-open-banking-uae/changelog-areas.svg)

## Delegated SCA isn't the agent route

Delegated SCA can look like the shortcut, because the TPP authenticates the customer for each payment with its own strong customer authentication. But its consent schedule must be an empty object, so the Hub enforces no amount caps. Every payment also needs fresh evidence of multi-factor authentication: at least two factors and a recent challenge time ([Delegated SCA requirements](https://nebras-open-finance.com/tech/tpp-standards/v2.1/banking/service-initiation/domestic-payments/multi-payments/delegated-sca/requirements)). That gives an agent fewer limits and still needs a human for every payment. Variable On Demand is the better fit.

![Three UAE payment consent types compared for agent use](/news/ai-agent-payments-open-banking-uae/consent-fit.svg)

## Nobody can count agent payments yet

The rails are busy. From 1 to 16 November, the public logs show 648,493 API calls and 18,700 payments, 97.1% of them accepted and worth AED 70.6 million ([Ecosystem Watch, run of 23 Nov 2026](/observatory/watch/)). But the logs don't show payment context ([Ecosystem Watch](/observatory/watch/)), and the standard has no agent marker for them to record. So no one outside a TPP can say how many of those payments an agent started. We covered last month's totals in [842,969 Calls: UAE Open Finance Doubled in October](/news/2026-11-09-uae-open-finance-october-2026-numbers).

## What builders can do now

**TPPs building agent features:** use Variable On Demand with tight caps and the shortest expiry the service needs. Set `IsCustomerPresent` to false when the agent acts alone, and document what you put in `SupplementaryData`. Start capturing Emirates IDs now, since v2.2 requires them on every long-lived payment.

**LFIs:** a Variable On Demand consent with `IsCustomerPresent: false` is where agent traffic will appear first. Watch those patterns in fraud monitoring before anyone labels them.

**The community:** agent context belongs in the standard, not in free-form fields. Nebras takes proposals through its [Service Desk and puts them to a public vote](https://nebras-open-finance.com/proposals). A structured agent indicator in the Risk block would be a small change, and much easier to make before agent volume arrives than after.

Our view: in one respect the UAE is ahead of the card networks. The limits, the central consent record and the revocation path already exist. The gap is one field, and it's worth filling before v2.2 is final.

## Follow the numbers

Track weekly volumes in the [Ecosystem Watch](/observatory/watch/), read the [consent requirements](https://nebras-open-finance.com/tech/tpp-standards/v2.1/consent/requirements), or [subscribe to the newsletter](/newsletter/). Building an agent on AlTareq? Tell us in the [community](/community/) what it needs from the standard.

*Open Finance OS is an independent, community-run project. It is not affiliated with CBUAE or Nebras. Standards references are to v2.1 (current) and the v2.2-rc2 release candidate as published on 23 November 2026. Card-network details are as announced by the companies and describe pilots, not general availability.*
