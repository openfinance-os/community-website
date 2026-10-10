# Learning and readiness implementation

10 October 2026. Review branch: `codex/content-readiness`, based on `a6c71d1` (homepage image/loading fixes, PR #605). This is a local implementation for review. It is not a production release.

## Reader outcome

Home and Learn offer three starting paths: Understand, Prepare and Build. The existing Observatory directory, coverage, saved briefings and Watch remain directly accessible. A synthetic SME example connects customer benefit to inspectable community evidence; the readiness worksheet helps a team assign an uncertainty, owner and next action.

Canonical additions are `/commons/sme-multi-bank-cash-flow` and `/learn/readiness`. Learn curates the case without duplicating it. Search explicitly indexes readiness; published Commons entries continue to enter search automatically. Existing `/news/[slug]` articles, redirects and the news RSS feed retain their routes. RSS invitations describe news and weekly digests accurately.

## Content and source corrections

The case pins the clinic fixture and demo implementation to revision `4fe782c7`. Matching and ledger aggregation are demonstrated; the proposed cash view requires further inputs and validation. No live customer outcomes, named-bank capabilities or readiness score are asserted. Commons maturity labels now explain their limits.

The CBUAE C 03/2025 framework replaces the repealed C7/2023 regulation as the learning entry source. Official documentation, official API specifications, community references and public observations have separate labels. Home, About, the digest generator and fourteen historical digest footers correct the community site's attribution. Dated digest corrections preserve original observations, figures and reporting windows. Historical strategy documents retain a source correction rather than presenting their operator affiliation assumptions as current.

The Global corrections remove unverified participant comparisons and distinguish payment reform (PSD3/PSR) from broader financial-data access (FiDA). These reference pages do not substitute for comparable, dated adoption research.

## Worksheet behaviour and privacy

All eight areas are static HTML and remain available without JavaScript. Optional fields are temporary page state. There is no submit endpoint, persistent answer storage, scoring or personalised report. Print includes every area; enhanced printing mirrors entered values with `textContent`. Screen collapse controls are progressive enhancement.

The shared PostHog bootstrap and enhanced analytics exclude `/learn/readiness`, with and without a trailing slash. No worksheet answers are attached to referral URLs or events. The optional paid-support block appears after the complete public resource, names MiddleLeap and discloses its founding interest. Printing excludes this invitation.

## Required publication review

The case uses OpenFinance-OS contributor metadata to make the local preview inspectable; it does not claim a named human has authored or reviewed the page. Before production publication, assign a responsible human editorial owner/reviewer, record the actual review date and verify volatile technical and regulatory references. Review the interpretation and source evidence, including customer comprehension of the synthetic boundary.

The contextual MiddleLeap invitation is prepared for review only. Existing `docs/EDITORIAL.md` prohibits promoting specific commercial products over others. This implementation does not amend that policy. Confirm whether a clearly disclosed optional paid-support referral is permitted under the existing policy; if a policy change is needed, follow `docs/GOVERNANCE.md` before publication. The existing Data Sandbox support paragraph is a precedent, not proof that the policy issue is resolved.

No external messages, policy publication, merge or production release are part of this implementation. Formative reader sessions and commercial conversion evidence remain unperformed. Referral or print clicks alone would not establish usefulness or qualified demand.

## Validation

Local checks passed: Astro check (zero errors or warnings, twenty existing hints), Prettier across the repository, `git diff --check`, all 156 unit tests including worksheet analytics exclusions, all six Watch Python test scripts, and the static build (323 pages).

Browser checks passed for Home, Learn, Getting Started, readiness, the SME case, Global and EU at 320, 390 and 768 px in light and dark themes: 42 checks with no horizontal overflow. Readiness hash links reveal the relevant area, Expand all works, entered values reach print mirrors, and case CTA fills/text are readable. Search finds readiness and the SME case by “cash flow”.

With JavaScript disabled, all eight worksheet areas and forty-four native fields remain visible in print. The enhanced tagged PDF contains every area and the sample answer across six non-empty pages; the paid-support invitation is absent. This proves the observed local output, not every browser/printer combination. Formative reader research remains pending.

The revised navigation E2E expectation targets the canonical Updates route. The full automated browser suite is left to CI; local browser verification used the Codex browser. CI and deployment evidence remain separate from these local checks.

Built-output review checked 251 internal links across six entry pages, resolving 47 unique paths. Canonicals use the expected production URLs; the sitemap includes both new routes and excludes all five draft Commons entries. RSS contains the 78 news entries, including fourteen weekly digests, with existing article destinations. Existing Home-to-Watch fragment IDs are generated by Watch JavaScript; new-page fragment targets exist in static HTML.
