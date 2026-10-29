# Learning and readiness implementation

10 October 2026. Review branch: `codex/content-readiness`, initially based on `a6c71d1` (homepage image/loading fixes, PR #605). PR #608 contains the implementation and subsequent publication review. The checks below are dated evidence from the initial implementation; they do not establish that the latest head has green CI, is merged or is deployed to production.

## Reader outcome

Home and Learn offer three starting paths: Understand, Prepare and Build. The existing Observatory directory, coverage, saved briefings and Watch remain directly accessible. A synthetic SME example connects customer benefit to inspectable community evidence; the readiness worksheet helps a team assign an uncertainty, owner and next action.

Canonical additions are `/commons/sme-multi-bank-cash-flow` and `/learn/readiness`. Learn curates the case without duplicating it. Search explicitly indexes readiness; published Commons entries continue to enter search automatically. Existing `/news/[slug]` articles, redirects and the news RSS feed retain their routes. RSS invitations describe news and weekly digests accurately.

## Content and source corrections

The case pins the clinic fixture and demo implementation to revision `4fe782c7`. Matching and ledger aggregation are demonstrated; the proposed cash view requires further inputs and validation. No live customer outcomes, named-bank capabilities or readiness score are asserted. Commons maturity labels now explain their limits.

The CBUAE C 03/2025 framework replaces the repealed C7/2023 regulation as the learning entry source. Official documentation, official API specifications, community references and public observations have separate labels. The [official consolidated errata](https://openfinanceuae.atlassian.net/wiki/spaces/OF/pages/1366294554) were verified on 10 October 2026 as the authoritative v2.1 / API Hub v8 corrections. The older Insurance Data Sharing v2.1 customer-experience section is flagged as outdated; the learning source guidance explicitly directs readers to check the corrections. Home, About, the digest generator and fourteen historical digest footers correct the community site's attribution. Dated digest corrections preserve original observations, figures and reporting windows. Historical strategy documents retain a source correction rather than presenting their operator affiliation assumptions as current.

The Global corrections remove unverified participant comparisons and distinguish payment reform (PSD3/PSR) from broader financial-data access (FiDA). These reference pages do not substitute for comparable, dated adoption research.

## Worksheet behaviour and privacy

All eight areas are static HTML and remain available without JavaScript. Optional fields are temporary page state. There is no submit endpoint, persistent answer storage, scoring or personalised report. Enhanced printing expands every area and mirrors complete entered values with `textContent`. Without JavaScript, all prompts and blank writing spaces remain printable; native control rendering does not guarantee that long typed answers will print in full. The page states this fallback explicitly. Screen collapse controls are progressive enhancement.

The shared PostHog bootstrap and enhanced analytics exclude `/learn/readiness`, with and without a trailing slash. No worksheet answers are attached to outbound URLs or events. Neutral specialist-support guidance appears after the complete public resource without selecting or linking to an advisory provider. Printing excludes that guidance.

## Editorial and commercial-link resolution

The maintainer explicitly authorized a review of PR #608, resolution of the editorial and commercial-link points, green CI and merge when ready. This follow-up is a delegated editorial and source review, rather than a claim of an independent human review. GitHub verifies the PR author and repository admin [@michartmann](https://github.com/michartmann) as the responsible editorial contact. Learn, Getting Started, readiness and the SME article expose the actual review treatment: AI-assisted drafting and source review by Codex on 10 October 2026. The case retains Open Finance OS contributor metadata. No claim is made that the editorial contact personally authored or reviewed every statement.

`docs/EDITORIAL.md` prohibits promoting specific commercial products over others. The selected MiddleLeap advisory link is removed from the worksheet, and the equivalent existing paid-support paragraph is removed from the Data Sandbox article. Readiness instead offers neutral criteria for choosing specialist support: relevant experience, scope, fees and conflicts of interest. Existing founder links and disclosure remain in the footer and About. This resolves the publication issue under the current policy without amending editorial policy or governance.

No external messages or policy amendments are part of this follow-up. Merge is authorized once review and CI are ready; the final head, checks, merge and deployment evidence must be recorded separately. Formative reader sessions and commercial conversion evidence remain unperformed. Source review and software tests do not establish customer comprehension, and referral or print clicks alone do not establish usefulness or qualified demand.

## Initial implementation validation — 10 October 2026

Local checks passed: Astro check (zero errors or warnings, twenty existing hints), Prettier across the repository, `git diff --check`, all 156 unit tests including worksheet analytics exclusions, all six Watch Python test scripts, and the static build (323 pages).

Browser checks passed for Home, Learn, Getting Started, readiness, the SME case, Global and EU at 320, 390 and 768 px in light and dark themes: 42 checks with no horizontal overflow. Readiness hash links reveal the relevant area, Expand all works, entered values reach print mirrors, and case CTA fills/text are readable. Search finds readiness and the SME case by “cash flow”.

The initial no-JavaScript check found all eight worksheet areas and forty-four native fields visible in print. The enhanced tagged PDF contained every area and the sample answer across six non-empty pages; the then-present paid-support invitation was absent. That evidence did not establish reliable full-answer printing from native controls without JavaScript. The follow-up explicitly provides a blank worksheet fallback and reserves complete answer printing for the enhanced flow. Print evidence is limited to the observed browser output, and formative reader research remains pending.

The revised navigation E2E expectation targets the canonical Updates route. The full automated browser suite is left to CI; local browser verification used the Codex browser. CI and deployment evidence remain separate from these local checks.

Built-output review checked 251 internal links across six entry pages, resolving 47 unique paths. Canonicals use the expected production URLs; the sitemap includes both new routes and excludes all five draft Commons entries. RSS contains the 78 news entries, including fourteen weekly digests, with existing article destinations. Existing Home-to-Watch fragment IDs are generated by Watch JavaScript; new-page fragment targets exist in static HTML.

## Publication follow-up validation — 10 October 2026

The branch merges main at `09a40a4`, including PR #606 navigation fixes, PR #607 prose and heading accessibility fixes, and the latest directory snapshot. The Learn conflict is resolved by retaining the new role paths and a semantic `dl` with grouped `dt`/`dd` glossary entries. Existing accessibility regressions remain intact.

After the editorial fixes, Astro check reports zero errors or warnings and twenty existing hints. Repository formatting and `git diff --check` pass. All 156 unit tests pass with 95.29% statement coverage; all six Watch Python scripts pass; the static build produces 323 pages. Four new E2E cases cover no-JavaScript blank worksheet printing, enhanced full-answer printing, and readiness/SME search discovery at mobile and desktop sizes. They await execution in CI. The PR records final-head CI and deployment evidence separately after those checks complete.
