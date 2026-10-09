# Credibility and access implementation — 8 October 2026

Branch: `codex/credibility-and-access`. This implements the first batch from the [codebase and user-value review](./2026-10-08-codebase-and-user-value-review.md). This note records local implementation and validation before release; pull request checks and merge status are recorded separately in GitHub.

## What changed

- **Evidence labels:** the home page and both Observatory environments describe registration IDs, active issuer metadata and source declarations. They no longer equate directory registration with integration, testing or traffic. The TPP population card shows unavailable because directory role claims cannot establish licence classifications. JSON fields retain their existing names for compatibility, with explicit definitions in the public dataset endpoints.
- **API coverage:** collector schema 2.1 preserves insurance, ATM and unknown family identifiers, plus raw family names. Cards, charts and profiles share family labels. Profiles show every published resource version, certification declaration and completeness flag. Missing publication is distinguished from verified absence of support.
- **Identity:** canonical participant URLs use registration IDs. Old unique name URLs redirect; colliding names offer a chooser. Cards, related links and search use the same identity helper. Both Mercury registrations now have distinct profiles. Profiles contain one main landmark and display the registration ID and observation date.
- **Terminology and learning:** BDSP, BSIP, ISP and other role expansions come from one sourced dictionary. The glossary is shared with search and includes CIBA and DCR anchors. Learn descriptions now describe the short overviews and official-documentation handoffs actually available.
- **Search:** the trigger is available on mobile, hidden states remain hidden, and dynamic result rows receive their styles. Titles, descriptions and environment/registration metadata have separate rows. Results use text nodes, and embedded index data escapes markup delimiters.
- **Digests:** the generator states cumulative completed-month totals and reporting periods rather than inferring weekly growth from observations. Matching period metadata supplies observation dates, source cutoff and excluded partial month. Thirteen older digests and the latest digest received dated wording corrections; their observed totals, rates and traffic counts were preserved. Older observations explicitly state when their exact period metadata is unavailable.
- **GitHub and CI:** organization links use the public organization URL. Collector import no longer invokes network collection or writes snapshots. PR validation tests transformations offline and fails on errors. CI includes website Markdown changes and the six Watch test scripts.

## Fresh collection

The corrected collector fetched both `/participants` and `/roles` endpoints in both environments on 8 October 2026.

| Measure | Production | Sandbox |
| --- | ---: | ---: |
| Registration IDs | 27 | 79 |
| Registrations publishing an active issuer | 12 | 19 |
| Published family identifiers after normalization | 6 | 9 |

There are 82 distinct IDs across both environments, including 24 present in both. These are not deduplicated legal entities. New dated snapshots and history rows were added; prior dated archives and history rows remain unchanged. Increased family coverage reflects a collector correction and must not be presented as a new deployment.

## Open Finance skill application

Applied [UAE Open Finance](/Users/michartmann/.agents/skills/open-finance-uae/SKILL.md) to the learning material and Observatory methodology. The follow-up corrects the Hub/LFI responsibility boundary, customer-consent scope, DCR terminology, registration instructions and remaining publication-as-live claims. The glossary and its search index now include API Hub and Ozone Connect. Getting Started covers insurance and ATM information as well as banking services.

The API overview derives its family names and observation date from the production snapshot. The LFI overview dates its issuer-publication count and distinguishes it from production live proving. Environment presence no longer implies certification, planned launch or graduation.

Source handoffs distinguish [official Confluence documentation](https://openfinanceuae.atlassian.net/wiki/spaces/OF/overview) from the Nebras community technical references. The shared source note asks readers to check version, date and errata instead of promising that every linked page is always current. The technical boundary was checked against the [LFI integration guide](https://www.nebras-open-finance.com/tech/lfi-api-hub), [consent journey guide](https://www.nebras-open-finance.com/tech/lfi-api-hub/v2.1/consent-journey/api-guide) and [trust-framework guide](https://www.nebras-open-finance.com/tech/lfi-api-hub/trust-framework). Some deeper official Confluence pages did not return readable content anonymously; no regulatory-compliance conclusion or latest-version claim was made from them.

After the skill follow-up, Astro again reported zero errors and warnings, all 144 unit tests passed, and 13 Chromium tests covering navigation, metadata and search passed. The static build again produced 309 pages. Built-page inspection confirmed the Hub explanation and the eight-question FAQ structured data. Updated source formatting and `git diff --check` passed. The earlier full-browser and Watch results below belong to the first implementation batch; Watch code and data were not changed by this follow-up.

## Validation

Validation used Node 20.20.2, dependencies installed from the committed lockfile, and the Chromium version required by the pinned Playwright dependency. Dependency manifests and lockfile are unchanged.

- Astro type check: zero errors and warnings; 32 informational hints.
- Unit tests: 144 passed across nine files. Coverage: 95.71% lines/statements, 91.86% branches, 94.73% functions.
- Chromium: 37 tests passed, including new checks for metric semantics, distinct Mercury pages, legacy redirects, mobile/desktop search states, keyboard focus, result layout and retained insurance resources.
- Watch: all six standalone Python test scripts passed.
- Formatting: all changed source files passed; `git diff --check` passed.
- Static build: 309 pages built successfully, including canonical ID pages and legacy aliases.
- Visual inspection: mobile search at 390px has a 44px trigger, no horizontal overflow, separated result text and no visible empty state for a matching query. The Mercury chooser shows both registrations and their role claims.

## Remaining dependency

Public correction and suggestion submissions need a public URL or contact address. The currently linked issue/discussion repositories are inaccessible anonymously. The requested destination is still pending; repository visibility and submission routes were not changed. The public organization links are repaired, but the repository and feedback links remain inaccessible to anonymous visitors.

Coverage comparison, profile timelines and Watch integration are implemented in the [principal user tasks batch](./2026-10-08-principal-user-tasks-implementation.md). Practitioner validation and the remaining monitoring work are still pending.
