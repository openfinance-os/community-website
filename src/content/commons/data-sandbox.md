---
title: "UAE Open Finance Data Sandbox: Synthetic API Examples"
type: utility
summary: "Explore synthetic UAE banking and insurance payloads, compare data completeness and export fixtures. No credentials. Not the official AlTareq sandbox."
date: 2026-06-09

useCases:
  - data
  - underwriting
  - onboarding
  - sme
  - retail
audience:
  - developer
  - tpp
  - bank
maturity: demo

source:
  platform: github

authoredByContributor: true
contributor: "Open Finance OS Community"
contributorUrl: https://github.com/openfinance-os

links:
  demo: https://data-sandbox.openfinance-os.org
  github: https://github.com/openfinance-os/data-sandbox

disclaimers:
  - "Synthetic data only. It does not connect to a live bank, a customer account, or an institution's sandbox."
  - "Not the official AlTareq API Hub sandbox, and not a certification or conformance environment."
  - "Rich, Median and Sparse describe synthetic completeness. They are not ratings of named institutions."
  - "Code is MIT. Synthetic fixtures are CC0. Pinned OpenAPI files keep the upstream MIT licence."
featured: true
---

## Try a sample payload now

The Open Finance OS Data Sandbox is an independent, browser-based explorer of synthetic UAE Open Finance payloads. Developers, TPP product teams, and LFIs can inspect banking and insurance examples, compare illustrative data-completeness profiles, and export a fixture before formal integration testing. It asks for no bank credentials and does not connect to live customer accounts or an institution's sandbox.

Last reviewed 6 November 2026 against the [public explorer](https://data-sandbox.openfinance-os.org/) and its fixture manifest.

<div class="case-next-actions">
  <a class="btn btn-primary" href="https://data-sandbox.openfinance-os.org/">Open synthetic explorer</a>
  <a class="btn btn-outline" href="https://data-sandbox.openfinance-os.org/src/index.html?persona=sme_clinic_receivables&lfi=median&seed=2864&corpus=0.1.0">Open the clinic example</a>
  <a class="btn btn-outline" href="https://openfinanceuae.atlassian.net/wiki/spaces/OF/pages/195788812/API+Hub+Sandbox+User+Guide">Need the official sandbox?</a>
</div>

**Synthetic only.** The first two links open this community tool. The third opens the official API Hub Sandbox User Guide. None of them registers you with AlTareq or issues a certificate.

<figure>
  <img
    src="/media/data-sandbox-explorer.webp"
    width="1280"
    height="813"
    alt="Community explorer with Crestline Wellness Clinic selected, the Median profile highlighted, a Synthetic label, the accounts payload, and the Export control. Captured 6 November 2026."
  />
  <figcaption>
    Crestline Wellness Clinic on the Median profile, Bank Data Sharing accounts, 6 November 2026.
    Optional fields this profile leaves empty are marked not curated. The Synthetic label stays visible.
  </figcaption>
</figure>

### Select a persona, inspect data, export a fixture

You can do this in the browser, with nothing to install.

1. Open the synthetic explorer. The first screen is the payload browser, not a login.
2. Choose a persona, then choose Rich, Median, or Sparse. The clinic link opens **Crestline Wellness Clinic LLC — Healthcare Clinic** on Median, seed 2864.
3. Select an endpoint, such as Accounts, and read the rendered fields or the raw JSON. **Export** downloads JSON, CSV, or a tarball of the active bundle.

The explorer treats the same persona, profile, and seed as one deterministic bundle. Keep all three with the corpus revision below when a test has to be repeated.

## Community data explorer or official API Hub sandbox?

No. The community Data Sandbox provides illustrative payloads for design, exploration, and application tests. The [API Hub Sandbox User Guide](https://openfinanceuae.atlassian.net/wiki/spaces/OF/pages/195788812/API+Hub+Sandbox+User+Guide) (updated 18 March 2026) describes the official sandbox as integration journeys through Model LFIs, after Trust Framework onboarding and the certificates that guide requires. It also describes that environment as a place to test conformance with the standards. A community fixture does not replace official integration testing and does not establish conformance or certification.

The official sandbox has its own synthetic users. This page is a no-credentials way to read payload shapes before that onboarding, not a claim that other resources lack sample data. Maintained Postman collections are in the [Nebras Open Finance Postman repository](https://github.com/Nebras-Open-Finance/postman). The sandbox guide says the older Confluence collections are no longer the maintained copy.

| Topic | Community Data Sandbox | Official API Hub sandbox |
| --- | --- | --- |
| Try it now | Open the explorer. No account. | Follow the API Hub Sandbox User Guide. |
| Credentials | None. | Trust Framework sandbox onboarding, an application, and transport and signing certificates, as that guide describes. |
| Bank or customer connection | No live bank and no customer account. | Model LFIs with API resources for testing. The guide says this does not use real customer accounts. |
| Consent, sign-in, payments | Example payloads only. No live consent, customer authentication, or payment. | The maintained Postman collection walks the published API flows, including authorisation. |
| Conformance | Does not establish conformance or certification. | The guide describes the sandbox as an environment for conformance testing. A community export is not that test. |
| Best used for | Payload shape, missing fields, and fixtures for a prototype or test. | Supported integration journeys after the official technical setup. |

A real request is mediated by the API Hub. The [API guide](/learn/api-guide) is the short map, and the [api-specs repository](https://github.com/Nebras-Open-Finance/api-specs) is where you check the release, tag, and errata you intend to implement.

## What the synthetic dataset covers

Checked on 6 November 2026: corpus `0.1.0`, revision `ca8646db7c61cf45b53d084fc954077774cbbfd8`, generated at 14:29 UTC. The corpus clock is 1 May 2026 UTC, so an example balance is not a live balance. The repository's stable baseline is standards v2.1 with official consolidated Errata 4 (18 September 2026). Each domain below is validated against its own pinned file. Hashes are in the [provenance record](https://github.com/openfinance-os/data-sandbox/blob/ca8646db7c61cf45b53d084fc954077774cbbfd8/spec/provenance.json).

| Domain | Published scope | Pinned specification |
| --- | --- | --- |
| Bank Data Sharing | 12 GET paths, including accounts, balances, transactions, beneficiaries, parties, statements, and product | v2.1-errata2 at `a3c8b8bf22e080046a8e0fbd9933f57431604155`, retrieved 8 October 2026 |
| Insurance Data Sharing | 30 GET paths across motor, home, health, life, travel, renters, and employment (policies, detail, payment details, and quotes) plus two insurance-consent paths | v2.1-errata3 at the same commit, retrieved 8 October 2026 |
| ATM Locator | `GET /atms`, a directory of cash machines, not a customer persona | v2.1 at `ebde95804d9bf2a13d065804ea64334b673223ca`, retrieved 20 May 2026 |

Upstream insurance quote compositions do not validate as literal JSON Schema. A reviewed adapter, documented in the [standards-conformance note](https://github.com/openfinance-os/data-sandbox/blob/ca8646db7c61cf45b53d084fc954077774cbbfd8/docs/standards-conformance.md), flattens only those compositions. It is not an upstream correction or a certification.

### Banking, insurance and ATM payloads

There are 38 customer personas: 21 banking, 9 insurance, and 8 with both, so the banking list shows 29 and the insurance list shows 17. The ATM directory is a separate manifest and has no account data. A persona may span more than one synthetic institution or insurer. That footprint is not evidence of participation or consent.

### Rich, Median and Sparse completeness profiles

No. Rich, Median, and Sparse are synthetic data-completeness profiles for populated, missing, or partial fields. They are not ratings of named banks, evidence of production data availability, or a prediction of what a particular institution will return. An empty field is unknown, not zero. Median, in the screenshot, leaves several optional fields uncurated. The underwriting summary on the same screen is an illustration from those synthetic fields, with a fixed exchange rate, and it is not a lender's policy, a lending decision, or a cash forecast.

## A multi-bank example you can inspect

**Crestline Wellness Clinic LLC — Healthcare Clinic** is fictional. It has an operating account, an Islamic deposit relationship, and a digital-bank relationship. Plausible institution labels in the demo are part of that fiction. They are not a finding about those institutions, and the profiles do not score them.

In the [multi-bank demo](https://data-sandbox.openfinance-os.org/examples/accounting-multi-bank-demo/), choose the clinic. Median is already selected; the first persona in the menu is not the clinic. On 6 November 2026 the public fixtures for this clinic, Median, and seed 2864 showed two identifier matches and four accounts. The demo matches beneficiary identifiers across the synthetic bundles. It does not forecast cash, collect consent, or execute a payment.

The [worked clinic article](/commons/sme-multi-bank-cash-flow) keeps that matching evidence separate from a proposed cash view, which still needs records the bank payload does not contain.

## Reuse fixtures in a prototype or test suite

Export writes the active bundle as JSON, CSV, or a tarball. This accounts file responded on 6 November 2026:

`https://data-sandbox.openfinance-os.org/fixtures/v1/bundles/sme_clinic_receivables/median/seed-2864/accounts.json`

`/fixtures/v1/` is the current public alias and can be replaced when the site is republished. For a repeatable test, record corpus `0.1.0`, manifest revision `ca8646db7c61cf45b53d084fc954077774cbbfd8`, the specification commit for the domain you called, and the persona, profile, and seed.

Candidate packages `@openfinance-os/sandbox-fixtures` and `openfinance-os-sandbox-fixtures` are in the repository at 0.1.0. On 6 November 2026 neither name was on the public npm registry or on PyPI, so confirm a release before installing from a registry. Until then, export from the explorer or build from the [pinned source](https://github.com/openfinance-os/data-sandbox/tree/ca8646db7c61cf45b53d084fc954077774cbbfd8). The community [integration notes](https://data-sandbox.openfinance-os.org/src/integrate.html) describe an iframe and raw fixture URLs. Their package-manager steps were not backed by a public release on the review date.

### Optional MCP access for AI-assisted demos

`@openfinance-os/sandbox-mcp` answers questions from these fixtures. `https://data-sandbox.fly.dev/mcp` responded on 6 November 2026, as a separate deployment, and the npm package was not on the public registry. Read the notes at the revision you pin. The server does not obtain consent, authenticate a customer, or reach a bank.

## Limits, licensing and next steps

These examples do not show that a bank is available, that an integration is certified, or that a live consent journey or payment will succeed. Directory metadata is a different record from a working API. Use the [coverage comparison](/observatory/coverage) and the [methodology](/observatory/methodology) before treating a registration as use.

Licences, checked on 6 November 2026:

- Application code is [MIT](https://github.com/openfinance-os/data-sandbox/blob/ca8646db7c61cf45b53d084fc954077774cbbfd8/LICENSE).
- Synthetic personas, generated payloads, and exported fixtures are [CC0](https://github.com/openfinance-os/data-sandbox/blob/ca8646db7c61cf45b53d084fc954077774cbbfd8/LICENSE-DATA). You may use that data in a commercial prototype. The dedication does not make the examples official, and it does not license the specification text.
- Pinned OpenAPI files keep the upstream licence. The `LICENSE` file in [api-specs](https://github.com/Nebras-Open-Finance/api-specs) at the commits above is MIT. Keep that notice with any copy of the specification.

Requirements are in the [CBUAE Open Finance regulation](https://rulebook.centralbank.ae/en/rulebook/open-finance-regulation-0) and the [AlTareq standards](https://openfinanceuae.atlassian.net/wiki/spaces/OF/overview). Neither source approves this tool. The [hackathon starter documentation](/commons/demo-tpp-starter-kit) is a separate community resource for that event. To correct a fixture or this page, use [Contribute](/commons/contribute).

## Questions

### Do I need an API key, consent app, or mTLS certificate?

No. The explorer runs in the browser. Those credentials are part of the official API Hub sandbox path.

### Can I export sample transactions or insurance payloads as JSON?

Yes, from Export or `/fixtures/v1/`. The file is synthetic JSON shaped like the pinned specification, not a bank response.

### Can these fixtures test real authentication or payment execution?

No. They do not sign a client, authenticate a customer, withdraw consent, or submit a payment.

### How do I pin a fixture and specification version?

Record corpus version, manifest revision, specification commit, persona, profile, and seed. `/fixtures/v1/` without that revision is only the current alias.

### Can I use the code and synthetic datasets in a commercial prototype?

Yes. MIT covers the application code, CC0 covers the synthetic data, and the upstream MIT licence covers specification text you copy. That is not certification or permission to present the data as a named institution's.

Open Finance OS is a community project. It is not the CBUAE, Nebras, or the AlTareq platform, and it is not endorsed by them.
