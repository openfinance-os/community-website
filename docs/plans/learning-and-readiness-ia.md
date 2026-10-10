# OpenFinance-OS information architecture

10 October 2026. Structure derived after assembling the Home, Learn, SME example and readiness mocks, then approved for implementation. This is an implementation specification for review, not a website release. The mocks’ review ribbon, local filenames and IA page are review tools; they do not become public navigation. See the [implementation and validation record](../reviews/2026-10-10-learning-readiness-implementation.md) for delivered behaviour and publication dependencies.

## Purpose and organising principle

Help a reader move from **understanding → practical exploration → evidence for a decision**, while preserving direct access to the ecosystem record. OpenFinance-OS serves newcomers, organisational programme/product owners and builders. Returning readers can continue using Watch, coverage and directory observations directly.

Useful public content creates the indirect commercial opportunity: a reader recognises a relevant organisational question, uses the worksheet, then chooses whether external support would help. Full content remains available before that choice. Founder attribution and any paid invitation are explicit. Commercial interest does not determine evidence labels, coverage or editorial ranking.

## Navigation and site tree

Retain **Observatory · Global · Updates · Learn · Commons · Community · About**. Search, theme and mobile controls are shared utilities. Do not add Readiness, Use Cases or MiddleLeap as global sections.

```text
/                                         Home
├─ /observatory                           Production directory evidence
│  ├─ /observatory/participant/[slug]      Registration detail
│  ├─ /observatory/sandbox                Sandbox directory evidence
│  │  └─ /observatory/sandbox/participant/[slug]
│  ├─ /observatory/coverage               Coverage & comparison
│  ├─ /observatory/briefing               Latest saved briefing
│  ├─ /observatory/watch                  Full Ecosystem Watch
│  ├─ /observatory/data                   Datasets and JSON resources
│  └─ /observatory/methodology            Evidence definitions and limits
├─ /global                                International context
│  ├─ /global/uk
│  ├─ /global/eu
│  └─ /global/gcc
├─ /updates                               News and weekly digests
│  ├─ /news/[slug]                        Individual article routes
│  └─ /rss.xml                            Existing news feed
├─ /learn                                 Task-based learning hub
│  ├─ /learn/getting-started               Customer benefit and essentials
│  ├─ /learn/readiness                    NEW: decision/evidence worksheet
│  ├─ /learn/bank-guide
│  ├─ /learn/tpp-guide
│  ├─ /learn/api-guide
│  ├─ /learn/faq
│  └─ /learn/glossary
├─ /commons                               Worked examples, references and tools
│  ├─ /commons/sme-multi-bank-cash-flow    NEW: authored synthetic example
│  ├─ /commons/data-sandbox               Existing tool introduction
│  ├─ /commons/[slug]                     Other published contributions
│  └─ /commons/contribute
├─ /community                             Ways to contribute
└─ /about                                 Purpose, governance and founder
```

Observatory **Sandbox** is a directory environment. Commons **Data Sandbox** is a synthetic data tool. Preserve this distinction in cards, search results and crosslinks. The synthetic demo is an external tool destination, not another site section.

## Reader journeys

| Reader | Path | Useful outcome |
| --- | --- | --- |
| Newcomer | Home “Understand” → Learn → Getting Started → SME example or glossary | Explains a customer benefit, permission and one relevant next step. Can follow news/RSS voluntarily. |
| Programme/product owner | Home “Prepare”, saved briefing or coverage → readiness worksheet ↔ SME example → source or internal action | Records missing evidence, its owner and next action. May choose optional paid external support after completing the public resource. |
| Builder | Home “Build” or Commons → Data Sandbox → synthetic multi-bank task → integration guide/specification | Explores a concrete scenario and recognises fixture/data limitations. The worksheet never gates tool access. |
| Returning evidence reader | Observatory, Latest briefing or Watch directly → coverage, registration or dataset → methodology when needed | Finds dated changes and sources quickly. Evergreen interpretation/worksheet links remain optional. |

Home preserves the primary Observatory CTA and directory preview. Three starting cards use **Understand / Prepare / Build**. A distinct Watch row retains a direct return path, with an accurately labelled news/weekly-digest RSS link. The SME feature connects the introduction to a concrete scenario. Approved Open Circuit media remains below the opening screen.

## Page contract

| Page | Primary reader question | Primary action |
| --- | --- | --- |
| Home | Where should I begin, or what should I inspect? | Explore Observatory; select a task path. |
| Learn | What can this enable, and where should I go next? | Choose essentials, example or worksheet. |
| Getting Started | What changes for a customer, and who participates? | Understand one scenario, then follow the appropriate source/guide. |
| Readiness worksheet | What do we need to decide next, and what evidence is missing? | Print/use the worksheet; assign uncertainty, owner and action. |
| SME example | How could several bank accounts support one useful cash view? | Try the synthetic demo or carry its evidence questions into the worksheet. |
| Coverage / briefing / Watch | What is observed, when, and what does it establish? | Inspect dated sources and limits; investigate a relevant question. |
| Data Sandbox | What does the data look like, and how can I explore it? | Open a synthetic example and its documentation. |
| Updates | What has changed in the wider ecosystem? | Read a sourced article or follow existing RSS. |
| About | Who is behind this, and how are decisions made? | Understand governance, independence and MiddleLeap’s founding role. |

Learn replaces one undifferentiated guide grid with three tasks, then short role guides, terminology help and **Sources and resources**. Label sources as official documentation, public evidence or community reference; do not group community material under “Official Resources.”

The worksheet covers proposition, role/requirements, capabilities/data quality, customer journey/permission, partners, controls, operations/change and economics/sequencing. Each area contains its question, evidence needed, source/version/date, owner, uncertainty and next action. States are Unknown, Investigating and Evidence recorded. These states do not imply compliance, certification or launch approval.

The mock’s editable textareas demonstrate a possible future worksheet interface. They do not expand the production scope by themselves. The prior plan’s static printable blank worksheet remains a valid initial implementation; persistent editing, submissions or personalised outputs require separate scope. Core prompts and print content must work without JavaScript.

## Canonical destinations and contextual links

| Mock | Public canonical route | Source implementation |
| --- | --- | --- |
| `index.html` | `/` | Existing Home components and `src/pages/index.astro` |
| `learn.html` | `/learn` | `src/pages/learn/index.astro` |
| `readiness.html` | `/learn/readiness` | New `src/pages/learn/readiness.astro` |
| `case.html` | `/commons/sme-multi-bank-cash-flow` | New Commons Markdown entry and existing slug template |

Use one canonical worksheet and one canonical case. Learn may display the case card, but links to Commons rather than duplicating it. Commons and the case link back to the Learn worksheet. Keep `/news/[slug]` article routes and existing `/news` → `/updates` and `/learn/global` → `/global` redirects. New pages need no migration. Redirect changes belong in `public/_redirects`; avoid competing Astro redirect rules.

Place crosslinks where the reader has enough context:

- Learn’s first task row links to Getting Started, the SME example and worksheet.
- Getting Started links to the scenario, glossary and appropriate official/role resources after explaining the benefit.
- The SME example offers the verified demo and worksheet after evidence/uncertainty; its side panel can repeat the worksheet action.
- Readiness links to the example and methodology before the optional support slot.
- A briefing may link to evergreen decision guidance after its observed summary, without rewriting dated observations as readiness judgements.

The support slot identifies **MiddleLeap**, **paid support** and the founding interest. It remains visually understated after the full worksheet. A reviewed, fitting external destination is a publication dependency; the mock links to general MiddleLeap information and does not invent an engagement package. Global founder credit continues separately in the footer and About. Referral URLs transmit no worksheet answers or internal organisational information.

## Taxonomy, metadata and editorial maintenance

Use the existing Commons schema: `insight` for the authored case, `sme`/`data` use cases and appropriate existing audience values. Do not add executive/insurance enums solely for this pilot. Retain other published contributions and draft exclusion. Explain maturity in terms of the resource; synthetic/demo status does not indicate a regulated production service.

Before publication, record a real author/contributor, responsible reviewer, page review date, sources and interests where material. Distinguish page review date from source observation date, fixture version and operational reporting window. No placeholder reviewer names or fabricated community activity should reach the site.

Follow **question → scenario → evidence → interpretation → uncertainty → next action**. Attribute official requirements to their sources, community explanations to their authors, and interpretation to OpenFinance-OS. Maintain a practical review cadence through a designated editorial owner before publication; this IA does not invent that person. Review volatile references when they change and the case whenever the fixture/demo changes.

Reviewed interpretation stays separate from automatically generated observations. Correct inaccurate generator copy as well as affected visible material. Commercial-link policy changes follow the existing documented governance process; preparation of content does not itself publish those changes.

## Discovery and implementation order

Use the shared `PageLayout` for canonical metadata, footer and accessibility shell. Add readiness explicitly to `SearchDialog.astro`’s hardcoded page inventory. Published Commons content already enters search automatically; keep drafts excluded. Include useful words such as cash flow, multi-bank, readiness and evidence in visible summaries. Align Bank Guide search wording with current LFI terminology.

Make `/rss.xml` visible from Updates and an appropriate learning/returning-reader surface. It covers the news collection, including weekly digests; it does not automatically include Commons or every Watch item. Sitemap discovery should include the new static routes. Verify canonical and article links in the built output.

Implement in reviewable order:

1. Correct essential evidence/source labels and recurring generator attribution; confirm the current fixture/demo and editorial responsibilities.
2. Improve Getting Started and Learn, publish the case and static printable worksheet, then add Home/contextual/search/RSS discovery.
3. Resolve commercial-link treatment and external destination; publish the optional support slot only when those dependencies are satisfied.
4. Observe reader task completion and available referral evidence before adding further journeys, content or software.

## Acceptance conditions

Each reader can identify a relevant starting path. The case and worksheet are reachable within two deliberate selections from their entry surfaces and crosslink directly. Readers can use the public resource without signing up or contacting MiddleLeap.

Verify light/dark, keyboard, desktop, narrow mobile and print hierarchy; search discovery, draft exclusion, accurate RSS labels, canonical routes and existing redirects. Worksheet prompts survive without JavaScript. Source labels, dates and synthetic limitations remain visible at their relevant decision points.

Formative reader sessions should test explanation of a benefit, interpretation of public evidence, recognition of synthetic material and assignment of a missing-evidence action. Any confusion that a directory record or worksheet implies approval must be corrected before publication. Session recruitment and results remain pending until conducted.

Assess useful progression and qualified enquiries separately. Print/outbound clicks are weak proxies, not proof of task completion or commercial causation. Distinguish footer attribution from contextual support using existing authorised analytics. Broader content and funnel infrastructure depend on observed needs, not invented traffic or conversion targets.
