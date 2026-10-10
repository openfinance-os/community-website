---
title: "One business. More than one bank."
type: insight
summary: "A synthetic SME example: how a consent-based account view could help a clinic understand cash across banks, and what evidence remains outside that view."
date: 2026-10-10
useCases:
  - sme
  - data
audience:
  - bank
  - tpp
  - developer
maturity: concept
authoredByContributor: true
contributor: "OpenFinance-OS"
links:
  demo: https://data-sandbox.openfinance-os.org/examples/accounting-multi-bank-demo/
  github: https://github.com/openfinance-os/data-sandbox/tree/4fe782c7e6c8e4c7c3384ccf21210db63b105db9/examples/accounting-multi-bank-demo
disclaimers:
  - "Synthetic scenario and data. No real customer permission is collected and no bank account is connected."
  - "The linked demo shows account matching and aggregation. The proposed cash-flow view needs additional inputs and validation."
  - "This resource does not establish compliance, approval, a named bank's coverage or an organisation's readiness."
featured: false
---

## The question

> What cash do we have across our accounts, and what do we need to check before the next payments?

A business with several bank relationships can look at each account separately. Bringing the permitted account data together could make its next cash conversation more useful: which receipts have arrived, which payments are approaching, and whether money has simply moved between its own accounts.

This worked example helps product and programme teams explore that question. It is an OpenFinance-OS interpretation of a community fixture, rather than evidence of a live service or a business outcome.

## Meet the scenario

**Crestline Wellness Clinic LLC — Healthcare Clinic** is a fictional business in the [community Data Sandbox](/commons/data-sandbox). The clinic persona has an operating-bank relationship, an Islamic deposit relationship and a digital-bank relationship. Patient receipts and irregular insurer reimbursements sit alongside payroll, rent and other operating expenses.

The practice manager wants to understand cash across those accounts. Bank records can show recorded movements. They do not, by themselves, explain every unpaid invoice, outstanding insurance claim or future obligation. Those questions still need the clinic's own records and an appropriate process for handling them.

The scenario is grounded in the [clinic persona at a pinned source revision](https://github.com/openfinance-os/data-sandbox/blob/4fe782c7e6c8e4c7c3384ccf21210db63b105db9/personas/sme-clinic-receivables.yaml). The clinic, customers and bank identifiers in generated fixtures are synthetic. The scenario uses **bank data sharing**; insurer reimbursements in bank transactions do not make it an insurance data sharing example.

## The evidence we can inspect

The existing [multi-bank demo](https://data-sandbox.openfinance-os.org/examples/accounting-multi-bank-demo/) reads the persona's declared bank footprint, retrieves synthetic account bundles, and matches beneficiary IBANs in the primary bundle to account identifiers in the other bundles. It then assembles accounts into a combined ledger table. The [demo implementation at the same pinned revision](https://github.com/openfinance-os/data-sandbox/blob/4fe782c7e6c8e4c7c3384ccf21210db63b105db9/examples/accounting-multi-bank-demo/app.js) makes those steps inspectable.

Choose **Crestline Wellness Clinic LLC — Healthcare Clinic** and the **Median** profile. Inspect the account-matching rows and combined ledger, including absent values. Rich, Median and Sparse are illustrative data-completeness profiles, not assessments of named banks. The hosted demo can change; the source links above fix the version underlying this article.

The demo has no real authentication or consent flow. A real account-data proposition would need to establish the customer's authority, relevant permission and selected account scope through the applicable journey. The [CBUAE Open Finance Framework (C 03/2025)](https://rulebook.centralbank.ae/en/rulebook/open-finance-framework-0) is the official source for applicable requirements; use [official Open Finance documentation](https://openfinanceuae.atlassian.net/wiki/spaces/OF/overview) for the relevant technical journey and version.

## From matching accounts to a useful cash view

<ol class="case-flow" aria-label="Illustrative account-data journey">
  <li><strong>Select and authorise</strong><p>The customer chooses the scope and completes the applicable authentication and consent journey.</p></li>
  <li><strong>Retrieve and reconcile</strong><p>The service brings permitted account data together and checks identity, timing and completeness.</p></li>
  <li><strong>Explain and review</strong><p>The business sees useful context, missing information and the next checks to make.</p></li>
</ol>

These are design steps for a possible service. Exact behaviour depends on its proposition, role, applicable requirements and selected technical standards.

A combined balance is only the start. A useful view should show account coverage and update times, distinguish receipts from internal transfers, and expose uncertain classifications for review.

<div class="case-cash-view" aria-label="Proposed cash-flow view, with no live financial data">
  <div><strong>Cash held</strong><p>Balances by account, currency, balance type and source observation time.</p></div>
  <div><strong>Money moving</strong><p>Receipts and outflows, with possible own-account transfers flagged for reconciliation.</p></div>
  <div><strong>Payments ahead</strong><p>Available scheduled items checked against the clinic's own ledger.</p></div>
</div>

**Proposed design — additional inputs needed.** The demo establishes a synthetic account-matching and aggregation example. It does not implement the cash view above, a forecast, or transaction-level reconciliation of every economic event. Scheduled obligations and expected receipts need separate inputs and validation. A missing balance must stay unknown rather than become zero.

## What would you need to validate?

Use the synthetic demo to explore data shapes. Use partner, customer and operational evidence to test the proposition in practice.

| Decision question | Evidence to collect |
| --- | --- |
| Have we connected the right accounts? | Customer authority, account matching logic, permissions and selected account scope. |
| Can we trust the combined picture? | Balance semantics, source timestamps, currency treatment, required fields and missing-data behaviour. |
| Are we counting a transfer twice? | Reconciliation rules and tested own-account transfer cases, with uncertain matches shown for review. |
| What remains outside the bank view? | Internal invoice and receivable records, their permitted use, and explicit assumptions about expected receipts and expenses. |
| Who handles a stale or failed connection? | Refresh expectations, customer communication, consent withdrawal and an accountable support owner. |

For this clinic scenario, patient health and claim details require particular care. Do not assume consent makes sensitive health data suitable for Open Finance processing. Keep this example focused on business bank records and check applicable sensitive-data restrictions with the responsible compliance team before designing any connection to other records.

## Keep the unknowns visible

The community example helps a team inspect data and discuss design choices. It cannot establish a named bank's production coverage, a participant's approval status or the team's readiness. Directory registration, issuer publication, certification, go-live approval and observed traffic are different evidence. See the [Observatory methodology](/observatory/methodology) before using those signals in a decision.

Customer comprehension, usable account coverage, integration behaviour, operational controls and business value still need validation. No saving, lending outcome or launch recommendation is claimed here.

## Your next decision

Open the synthetic demo, select the clinic and Median profile, and inspect account matching and the ledger. Then take one uncertainty into the [Open Finance readiness worksheet](/learn/readiness): record the evidence you have, its source and date, an owner and the next action.

<div class="case-next-actions">
  <a class="btn btn-primary" href="https://data-sandbox.openfinance-os.org/examples/accounting-multi-bank-demo/">Open the synthetic demo</a>
  <a class="btn btn-outline" href="/learn/readiness">Use the decision worksheet</a>
</div>

## Sources and further reading

- [Synthetic clinic persona](https://github.com/openfinance-os/data-sandbox/blob/4fe782c7e6c8e4c7c3384ccf21210db63b105db9/personas/sme-clinic-receivables.yaml) — community fixture at source revision `4fe782c7`.
- [Multi-bank demo implementation](https://github.com/openfinance-os/data-sandbox/tree/4fe782c7e6c8e4c7c3384ccf21210db63b105db9/examples/accounting-multi-bank-demo) — community code at the same revision.
- [Multi-LFI integration guide](https://data-sandbox.openfinance-os.org/src/integrate.html#multi-lfi) — maintained community implementation example.
- [CBUAE Open Finance Framework (C 03/2025)](https://rulebook.centralbank.ae/en/rulebook/open-finance-framework-0) — official regulatory source; verify the applicable version and requirements.
- [Official Open Finance documentation](https://openfinanceuae.atlassian.net/wiki/spaces/OF/overview) — technical documentation; check the relevant release and errata.

OpenFinance-OS is a community initiative and is not affiliated with, endorsed by, or officially connected to the CBUAE, Al Tareq Platform, or any financial institution. Always verify information with official sources.
