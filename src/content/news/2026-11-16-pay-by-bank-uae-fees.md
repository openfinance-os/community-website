---
title: "Pay by Bank UAE Fees: 38 bps, Capped at AED 50, vs Cards"
date: 2026-11-16
type: opinion
region: uae
country: AE
author: OpenFinance-OS
description: "Pay by bank UAE fees under UAE Open Finance: a merchant collection costs the TPP 38 bps, capped at AED 50, and a transfer 25 fils. How that compares with cards."
image: /news/pay-by-bank-uae-fees/hero.svg
imageAlt: "Large figure reading 38 bps, the Year 1 cap on the fee a TPP pays the payer's bank for a pay-by-bank merchant collection, capped at AED 50 per payment with the first AED 200 per merchant per day exempt. Small bars compare it with 1.00% Visa debit interchange online and a published card gateway rate of 2.9% plus AED 1."
imageCaption: "Year 1 merchant-collection cap under the AlTareq Commercial and Pricing Model, beside Visa's UAE online debit interchange and Stripe's published UAE card rate."
---

What does it cost a UAE merchant to take a payment straight from a customer's bank account, through the checkout button labelled "Pay by bank using AlTareq" ([AlTareq Brand Guidelines](https://openfinanceuae.atlassian.net/wiki/spaces/OF/pages/196116611))? The AlTareq Commercial and Pricing Model has the answer for the bank's share. For a merchant collection, the fee a TPP pays the payer's bank is capped at **38 basis points in Year 1, with a maximum of AED 50 per payment** ([AlTareq Commercial and Pricing Model](https://openfinanceuae.atlassian.net/wiki/spaces/OF/pages/124846096/Commercial+and+Pricing+Model)).

The model is public, regulated by CBUAE and part of the AlTareq Standards. A breach of it counts as a breach of the Open Finance Regulation ([AlTareq Commercial and Pricing Model](https://openfinanceuae.atlassian.net/wiki/spaces/OF/pages/124846096/Commercial+and+Pricing+Model)). Fees between TPPs and banks include VAT, CBUAE reviews the model yearly with the Nebras Board, and the document is still version 1.0 ([AlTareq Commercial and Pricing Model](https://openfinanceuae.atlassian.net/wiki/spaces/OF/pages/124846096/Commercial+and+Pricing+Model)). So these are caps, not list prices.

## The fee schedule in one place

For retail and SME customers, the model caps what a TPP pays the bank (LFI) that executes the payment:

- **Merchant collections:** 38 bps in Year 1, falling to 35, 32, 29 and **25 bps by Year 5**. Also capped at **AED 50 per payment**.
- **The first AED 200 a TPP collects per merchant per day is exempt**, but only if the Merchant ID is in the payment request.
- **Person to person and SME to SME:** 25 fils per payment.
- **Me to me:** 20 fils in Year 1, 18 fils in Year 2 and 17 fils from Year 3.
- **SME bulk payments:** 25 fils per payment, capped at 250 fils per batch, with no limit on batch size.
- **Large value, rent and invoice collection** through a payment link in a smart invoice or equivalent: AED 4 per payment. Examples include rent and retail or SME invoices above AED 5,000.

All of these come from section 2.1.2 of the [model](https://openfinanceuae.atlassian.net/wiki/spaces/OF/pages/124846096/Commercial+and+Pricing+Model). The same 38 bps glide path and AED 50 cap apply to corporate merchant collections (corporate means turnover above AED 100 million a year). The [Nebras pricing page](https://nebras-open-finance.com/pricing/) gives the same figures.

On top of that, Nebras charges the TPP **2.5 fils per payment call** through the API Hub. A balance check or Confirmation of Payee call made within two hours of a payment drops to 0.5 fils, limited to one of each per payment ([AlTareq Commercial and Pricing Model](https://openfinanceuae.atlassian.net/wiki/spaces/OF/pages/124846096/Commercial+and+Pricing+Model)). Consent and payment status calls are free ([Nebras endpoint pricing](https://nebras-open-finance.com/pricing/endpoints/)). A Confirmation of Payee check is mandatory before consent creation when the payee is new to the TPP, so a first payment to an unknown payee adds 0.5 fils; a pre-verified merchant needn't add one ([Confirmation of Payee requirements](https://nebras-open-finance.com/tech/tpp-standards/v2.1/banking/confirmation-of-payee/requirements)).

![Who pays whom on a pay-by-bank merchant collection, with caps for other payment types](/news/pay-by-bank-uae-fees/fee-flow.svg)

## Three layers, and only two are binding

A pay-by-bank payment has three fee layers.

1. **TPP to the payer's bank:** 38 bps, maximum AED 50. This is binding.
2. **TPP to Nebras:** 2.5 fils per chargeable call. Also binding, and invoiced monthly by Nebras.
3. **Merchant to TPP:** here the model uses softer language. TPPs "are requested to keep pricing capped" at **63 bps in Year 1, falling to 50 bps by Year 5**, with no AED maximum stated ([AlTareq Commercial and Pricing Model](https://openfinanceuae.atlassian.net/wiki/spaces/OF/pages/124846096/Commercial+and+Pricing+Model), section 2.1.3).

The payer pays nothing extra. Banks may not add their own charges for payments initiated through Open Finance APIs. The payer's bank, not the TPP, picks the rail: intra-bank, Aani, or UAEFTS as the fallback. The caps are the same whichever one settles the payment ([AlTareq Commercial and Pricing Model](https://openfinanceuae.atlassian.net/wiki/spaces/OF/pages/124846096/Commercial+and+Pricing+Model); [Nebras payment status guide](https://nebras-open-finance.com/tech/tpp-standards/v2.1/banking/service-initiation/domestic-payments/overview/payment-status)).

![Merchant collection caps step down over five years: 38 to 25 bps for the bank fee, 63 to 50 bps for the merchant price](/news/pay-by-bank-uae-fees/glide-path.svg)

## How it compares with cards

The model describes a merchant collection as "equivalent to the use of a Debit Card via Retail or e-Commerce POS type functionality". So the fair comparison for the bank layer is debit card interchange, the part of a card fee that goes to the cardholder's bank.

Visa's UAE schedule puts domestic consumer debit interchange at **0.75% in store, capped at AED 37.50**, and **1.00% online, capped at AED 50** ([Visa UAE interchange schedule, effective 18 Oct 2025](https://ae.visamiddleeast.com/content/dam/VCOM/regional/cemea/unitedarabemirates/home-page/support-consumer/visa-uae-irf-disclosure-schedule-18-Oct-2025.pdf)). Visa notes that merchants don't pay interchange directly. They pay a merchant discount rate to their acquirer, and interchange is one part of it.

For the merchant layer, the clearest public benchmark is a gateway's published rate. Stripe lists **2.9% + AED 1 per successful domestic card payment** in the UAE ([Stripe UAE pricing](https://stripe.com/ae/pricing)).

Here is how those rates work out on four payment sizes, using Year 1 rates. All figures are our calculation from the published rates.

| Payment | Pay by bank: fee to payer's bank (38 bps, max AED 50) | Pay by bank: merchant price TPPs are asked to stay under (63 bps) | Visa online debit interchange (1%, max AED 50) | Published card gateway rate (2.9% + AED 1) |
| --- | --- | --- | --- | --- |
| AED 100 | AED 0.38 (or zero within the AED 200 daily exemption) | AED 0.63 | AED 1.00 | AED 3.90 |
| AED 1,000 | AED 3.80 | AED 6.30 | AED 10.00 | AED 30.00 |
| AED 5,000 | AED 19.00 | AED 31.50 | AED 50.00 | AED 146.00 |
| AED 20,000 | AED 50.00 | AED 126.00 | AED 50.00 | AED 581.00 |

![Effective fee rate by payment size for the pay-by-bank bank fee, Visa online debit interchange and a published card gateway rate](/news/pay-by-bank-uae-fees/effective-rate.svg)

Three things stand out.

**At the bank layer, pay by bank is cheaper up to about AED 13,000.** 38 bps is well under the 1% online debit rate. Both are capped at AED 50, though. Debit hits its cap at AED 5,000, and pay by bank hits it at about AED 13,158 (our calculation). Above that, the bank's cut is the same AED 50 either way.

**The AED 50 cap protects the TPP, not the merchant.** The 63 bps merchant price has no AED ceiling in the model. On a AED 20,000 payment, a TPP charging the full 63 bps would take AED 126 while paying the bank AED 50. For big tickets, the AED 4 rent and invoice category matters more, if the payment really runs through an invoice payment link.

**Against what merchants actually pay for cards, the gap is wide.** A 63 bps ceiling is a fraction of 2.9% + AED 1 at every size in the table. Keep in mind that 63 bps is a requested ceiling, not a quote. Real TPP pricing is set bilaterally and isn't public.

## What the data can't tell us yet

The [Ecosystem Watch](/observatory/watch/) counted **AED 124.8 million in accepted payments in October 2026** and AED 414.9 million across the 12 full months to October. It also shows **95.7% of payments accepted** (run of 8 November 2026, logs through 3 November).

But the Watch withholds fee totals. The public logs don't show payment context, merchant exemptions, individual payment values or the timing needed for the two-hour discount ([Ecosystem Watch](/observatory/watch/)). So we can't split October's AED 124.8 million between 38 bps collections and 25 fils transfers, or say what anyone earned. We covered October's numbers in [842,969 Calls: UAE Open Finance Doubled in October](/news/2026-11-09-uae-open-finance-october-2026-numbers).

## What this means for builders

**Send the billing fields, and get them right.** The fee category travels in the payment itself. In Standards v2.1, `OpenFinanceBilling.Type` takes `Collection`, `LargeValueCollection`, `PushP2P`, `PullP2P` or `Me2Me`, and the optional `OpenFinanceBilling.MerchantId` (8 to 20 characters) carries the Merchant ID. The AED 200 daily exemption only applies when that Merchant ID is present. Both values must match the consent exactly at `POST /payments` ([bank initiation API spec, v2.1 errata3](https://github.com/Nebras-Open-Finance/api-specs/blob/main/dist/standards/v2.1-errata3/uae-bank-initiation-openapi.yaml); [single instant payment requirements](https://nebras-open-finance.com/tech/tpp-standards/v2.1/banking/service-initiation/domestic-payments/single-instant-payment/requirements)). Rent tagged `Collection` could cost up to AED 50 at the bank layer, against AED 4 as `LargeValueCollection`. SME bulk is billed differently: on file payments the bank reports the number of successful transactions ([bank initiation API spec, v2.1 errata3](https://github.com/Nebras-Open-Finance/api-specs/blob/main/dist/standards/v2.1-errata3/uae-bank-initiation-openapi.yaml)).

**For LFIs, keep payment statuses current.** Fees apply only to technically successful calls. If a payment status is still pending three calendar days after initiation, it's excluded from the fees payable to the LFI ([AlTareq Commercial and Pricing Model](https://openfinanceuae.atlassian.net/wiki/spaces/OF/pages/124846096/Commercial+and+Pricing+Model)). Success is `AcceptedWithoutPosting` on Aani and `AcceptedCreditSettlementCompleted` on UAEFTS or intra-bank ([Nebras payment status guide](https://nebras-open-finance.com/tech/tpp-standards/v2.1/banking/service-initiation/domestic-payments/overview/payment-status)).

**Watch v2.2-rc2, but don't build on it yet.** The release candidate's changelog, as of 16 November, has three changes for payments. Payment records gain `PaymentRail` (`AANI`, `FTS` or `LFI`), and LFIs must submit to Aani or UAEFTS within three seconds. An optional `UseFTS` flag forces UAEFTS with no fallback to Aani. Payment consents gain `OnBehalfOf`, which names the party a TPP collects for. The billing fields are unchanged. It's a release candidate, so treat it as a preview, not a production target; v2.1 with errata3 stays current ([v2.2-rc2 changelog](https://nebras-open-finance.com/tech/release-notes-and-erratas/changelog/v2.2-rc2/); [release notes and errata](https://nebras-open-finance.com/tech/release-notes-and-erratas/)).

**Price for the glide path.** The bank fee falls by roughly a third over five years, from 38 to 25 bps. Year 1 margins won't hold.

## Follow the numbers

Try your own scenarios in the [Nebras pricing calculator](https://nebras-open-finance.com/pricing/), track weekly volumes in the [Ecosystem Watch](/observatory/watch/), or [subscribe to the newsletter](/newsletter/). Building a pay-by-bank flow? Tell us which fee question to chart next in the [community](/community/).

*Open Finance OS is an independent, community-run project. It is not affiliated with CBUAE or Nebras. Fee figures are as published in the AlTareq Commercial and Pricing Model, Visa's UAE schedule and Stripe's UAE pricing page, checked on 16 November 2026. Worked examples are our calculations, not quotes. Card comparisons show public list rates. Many merchants pay negotiated rates.*
