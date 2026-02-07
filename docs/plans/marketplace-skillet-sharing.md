# Marketplace for Open Finance Skillet Sharing

> **Status:** Plan / RFC
> **Date:** 2026-02-07
> **Scope:** New `/marketplace` section on the community website

---

## 1. Overview

A **Marketplace** section where the Open Finance community can discover, share, and evaluate reusable "skillets" — developer tools, API connectors, SDKs, compliance modules, testing harnesses, and integration accelerators built on top of the UAE Open Finance framework.

This extends the existing **Commons** concept (insights, references, artifacts, utilities) into a more structured, discoverable, and evaluatable catalog specifically for executable, deployable, or integrable components.

### What is a "Skillet"?

A skillet is a packaged, reusable component built for the Open Finance ecosystem. Examples:

| Category | Example |
|---|---|
| **Connector** | An API adapter that normalizes account-information responses across multiple ASPSPs |
| **SDK / Library** | A TypeScript SDK for CBUAE consent management flows |
| **Testing Tool** | A sandbox mock server that simulates ASPSP behavior for TPP integration testing |
| **Compliance Module** | A PII-redaction utility that ensures PDPL compliance before data export |
| **Template** | A Terraform/Pulumi module for deploying an Open Finance-ready API gateway |
| **Integration** | A pre-built Postman collection covering all CBUAE standard API endpoints |
| **Workflow** | A GitHub Actions pipeline for automated API conformance testing |

---

## 2. How It Relates to Existing Architecture

### Current state

The site is a **static Astro 5 site** deployed to Cloudflare Pages. Content lives in:
- **Astro content collections** (markdown + frontmatter in `src/content/`)
- **JSON data files** (`data/` directory)
- **Automated scripts** that collect observatory data and curate news

The existing **Commons** section (`/commons`) is the closest analog. It already supports:
- Four content types (insight, reference, artifact, utility)
- Taxonomy (use cases, audience, maturity, license)
- Contributor attribution
- GitHub/demo/docs/article links
- Client-side filtering

### Why a separate Marketplace (not just expanding Commons)

| Concern | Commons | Marketplace |
|---|---|---|
| **Primary content** | Knowledge (articles, guides, analysis) | Executable components (code, configs, packages) |
| **Evaluation** | Read and judge qualitatively | Install, run, test quantitatively |
| **Metadata depth** | Summary + links | Version, dependencies, compatibility matrix, install instructions |
| **Lifecycle** | Static once published | Versioned, updated, deprecated |
| **Community signal** | Featured flag (editor pick) | Ratings, usage stats, compatibility reports |
| **Discovery** | Filter by type/audience/use-case | Search by API family, runtime, ASPSP compatibility |

The Marketplace warrants its own section because the data model, discovery UX, and community interaction patterns are meaningfully different from editorial content.

---

## 3. Proposed Data Model

### 3.1 Skillet Schema (Astro content collection)

```typescript
// Addition to src/content/config.ts

const skilletCategories = [
  'connector',
  'sdk',
  'testing',
  'compliance',
  'template',
  'integration',
  'workflow',
  'library',
  'other',
] as const;

const runtimes = [
  'node',
  'python',
  'java',
  'go',
  'dotnet',
  'rust',
  'browser',
  'cli',
  'terraform',
  'docker',
  'language-agnostic',
] as const;

const apiFamilies = [
  'account-information',
  'payment-initiation',
  'confirmation-of-funds',
  'event-notification',
  'dynamic-client-registration',
  'consent-management',
  'multi-api',
] as const;

const skilletStatuses = [
  'active',
  'beta',
  'deprecated',
  'archived',
] as const;

const marketplaceCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // ── Identity ──
    title: z.string(),
    slug: z.string().optional(),        // auto-derived if omitted
    summary: z.string().max(280),       // short tagline
    description: z.string(),            // longer explanation (rendered in detail page)
    category: z.enum(skilletCategories),

    // ── Versioning ──
    version: z.string(),                // semver e.g. "1.2.0"
    status: z.enum(skilletStatuses).default('active'),
    datePublished: z.coerce.date(),
    dateUpdated: z.coerce.date().optional(),

    // ── Technical metadata ──
    runtime: z.array(z.enum(runtimes)).min(1),
    apiFamilies: z.array(z.enum(apiFamilies)).default([]),
    aspspCompatibility: z.array(z.string()).default([]),  // e.g. ["ADCB", "FAB", "ENBD"]
    openFinanceVersion: z.string().optional(),            // e.g. "1.0", "2.0-draft"

    // ── Taxonomy (reuse existing where possible) ──
    useCases: z.array(z.enum(useCases)).default([]),
    audience: z.array(z.enum(audiences)).default(['developer']),
    maturity: z.enum(maturityLevels).default('concept'),
    license: z.enum(licenses),

    // ── Installation / Usage ──
    installCommand: z.string().optional(),       // e.g. "npm install @openfinance/consent-sdk"
    packageRegistry: z.string().optional(),      // e.g. "npm", "pypi", "docker-hub"
    minRequirements: z.string().optional(),      // e.g. "Node 18+, TypeScript 5+"

    // ── Links ──
    links: z.object({
      github: z.string().url(),                  // required — must be open source or at least visible
      demo: z.string().url().optional(),
      docs: z.string().url().optional(),
      package: z.string().url().optional(),      // npm/pypi/crates page
      changelog: z.string().url().optional(),
    }),

    // ── Authorship ──
    contributor: z.string(),
    contributorUrl: z.string().url().optional(),
    contributorOrg: z.string().optional(),       // e.g. "ADCB", "Lean Technologies"
    authoredByContributor: z.boolean().default(true),

    // ── Community signals (populated via data file, not frontmatter) ──
    featured: z.boolean().default(false),

    // ── Governance ──
    disclaimers: z.array(z.string()).default([]),
    cbuaeCompliant: z.boolean().optional(),      // self-declared CBUAE alignment
    securityReviewed: z.boolean().default(false),
  }),
});
```

### 3.2 Community Signals (separate JSON data file)

Because the site is static, dynamic community signals (ratings, usage counts) live in a JSON data file that can be updated via GitHub Actions or a lightweight API:

```
data/marketplace/
├── signals.json          # { "skillet-slug": { stars: 12, forks: 45, downloads: 230 } }
├── reviews.json          # curated reviews (pulled from GitHub Discussions or submitted via PR)
└── compatibility.json    # community-reported ASPSP compatibility matrix
```

**`signals.json`** — populated by a GitHub Action that periodically fetches:
- GitHub stars/forks for linked repos
- npm/PyPI download counts (where applicable)
- Issue count (open/closed ratio as a health signal)

**`reviews.json`** — structured reviews:
```json
{
  "consent-sdk": [
    {
      "author": "developer-handle",
      "rating": 4,
      "comment": "Works well with ADCB sandbox. Had to patch one edge case for FAB.",
      "date": "2026-01-20",
      "verified": true
    }
  ]
}
```

**`compatibility.json`** — community-contributed ASPSP compatibility reports:
```json
{
  "consent-sdk": {
    "ADCB": { "status": "verified", "version": "1.2.0", "reportedBy": "contributor-x" },
    "FAB": { "status": "partial", "version": "1.1.0", "notes": "Consent revocation not supported" },
    "ENBD": { "status": "untested" }
  }
}
```

---

## 4. Page Structure & Routes

```
/marketplace                           → Main catalog (search, filter, browse)
/marketplace/[slug]                    → Skillet detail page
/marketplace/submit                    → Submission guide (links to GitHub PR workflow)
/marketplace/compatibility             → Cross-skillet ASPSP compatibility matrix
```

### 4.1 Marketplace Index (`/marketplace`)

**Sections:**
1. **Hero** — "Open Finance Marketplace" headline, subtitle, search bar
2. **Stats bar** — Total skillets, production-ready count, active contributors, ASPSP coverage
3. **Featured skillets** — Editor picks (2-3 cards, prominent)
4. **Filter bar** — Category, runtime, API family, maturity, ASPSP compatibility
5. **Search** — Client-side full-text search across title, summary, contributor, tags
6. **Results grid** — Cards with: title, category badge, summary, runtime icons, maturity badge, star count, contributor, install command preview

**Card design:**
```
┌──────────────────────────────────────┐
│ [CONNECTOR]  [Active]    ★ 45       │
│                                      │
│ ASPSP Account Normalizer             │
│ Normalizes account-information       │
│ responses across UAE ASPSPs into     │
│ a single consistent schema.          │
│                                      │
│ [Node] [Python]   [Payments] [Data]  │
│                                      │
│ npm install @openfinance/acct-norm   │
│                                      │
│ Lean Technologies  ·  Production Ready│
│ ─────────────────────────────────────│
│ [GitHub] [Docs] [Demo]              │
└──────────────────────────────────────┘
```

### 4.2 Skillet Detail Page (`/marketplace/[slug]`)

**Layout:**
1. **Header** — Title, category, status badge, version, last updated
2. **Quick install** — Copyable install command, package registry link
3. **Description** — Full markdown body (rendered from content collection)
4. **Technical details** sidebar:
   - Runtime(s)
   - API families supported
   - Open Finance version compatibility
   - Min requirements
   - License
   - CBUAE compliance self-declaration
5. **ASPSP Compatibility table** — Pull from `compatibility.json`, show verified/partial/untested per bank
6. **Community signals** — Stars, forks, downloads, open issues health
7. **Reviews section** — Curated reviews from `reviews.json`
8. **Links** — GitHub, docs, demo, package, changelog
9. **Related skillets** — Same category or overlapping API families
10. **Contributor info** — Name, org, link

### 4.3 Compatibility Matrix (`/marketplace/compatibility`)

A full-page table showing all skillets vs all known ASPSPs, with status indicators:
- Verified (green)
- Partial (amber)
- Untested (grey)
- Incompatible (red)

This is a high-value page for TPP developers evaluating which tools work with their target banks.

### 4.4 Submission Guide (`/marketplace/submit`)

Step-by-step instructions for submitting a skillet via GitHub PR, similar to the existing `/commons/contribute` page:
1. Fork the repo
2. Create a markdown file in `src/content/marketplace/`
3. Fill in the frontmatter schema
4. Write the description body
5. Open a PR — automated checks validate the schema
6. Community review + merge

---

## 5. Implementation Phases

### Phase 1: Foundation (Static Catalog)

**Goal:** Ship a browsable, filterable marketplace with manually curated content.

| Task | Files affected |
|---|---|
| Add `marketplace` content collection to schema | `src/content/config.ts` |
| Create marketplace index page | `src/pages/marketplace/index.astro` |
| Create skillet detail page | `src/pages/marketplace/[slug].astro` |
| Create submission guide page | `src/pages/marketplace/submit.astro` |
| Build `SkilletCard` component | `src/components/marketplace/SkilletCard.astro` |
| Build `SkilletFilter` component | `src/components/marketplace/SkilletFilter.astro` |
| Build `InstallCommand` component (copyable) | `src/components/marketplace/InstallCommand.astro` |
| Build `CompatibilityBadge` component | `src/components/marketplace/CompatibilityBadge.astro` |
| Add marketplace link to site navigation | `src/components/common/Header.astro` |
| Seed 3-5 example skillets | `src/content/marketplace/*.md` |
| Add marketplace styles | `src/styles/marketplace.css` (or scoped in components) |
| Add JSON-LD structured data (SoftwareApplication schema) | Detail page |
| Unit tests for any utility functions | `src/lib/__tests__/marketplace.test.ts` |
| E2E smoke test | `e2e/marketplace.spec.ts` |

### Phase 2: Community Signals

**Goal:** Add automated data collection and community-reported compatibility.

| Task | Files affected |
|---|---|
| Create `data/marketplace/` directory structure | `data/marketplace/` |
| Build GitHub Action to collect repo stats (stars, forks, issues) | `.github/workflows/marketplace-signals.yml` |
| Build script to fetch npm/PyPI download counts | `scripts/collect-marketplace-signals.ts` |
| Display signals on skillet cards and detail pages | Components |
| Add `compatibility.json` schema and seed data | `data/marketplace/compatibility.json` |
| Build compatibility matrix page | `src/pages/marketplace/compatibility.astro` |
| Build `CompatibilityMatrix` component | `src/components/marketplace/CompatibilityMatrix.astro` |

### Phase 3: Reviews & Trust

**Goal:** Enable community reviews and trust indicators.

| Task | Files affected |
|---|---|
| Define `reviews.json` schema | `data/marketplace/reviews.json` |
| Build review display component | `src/components/marketplace/ReviewCard.astro` |
| Create review submission workflow (via GitHub Discussion → PR) | Documentation + workflow |
| Add "verified" badge for reviews from known ecosystem participants | Component logic |
| Add "CBUAE Aligned" badge for self-declared compliance | Detail page |
| Add "Security Reviewed" badge (requires manual community review process) | Detail page |

### Phase 4: Advanced Discovery

**Goal:** Make the marketplace the go-to resource for Open Finance developer tooling.

| Task | Description |
|---|---|
| Full-text search with index | Pre-built search index at build time (e.g., Pagefind or Fuse.js) |
| "Getting Started" bundles | Curated sets of skillets for common workflows (e.g., "TPP Quick Start Kit") |
| RSS feed for new skillets | `src/pages/marketplace/rss.xml.ts` |
| Marketplace stats on homepage | Add preview component to home page |
| Cross-reference with Observatory | Link skillets to Observatory participants that use them |
| API family landing pages | `/marketplace/api/account-information` — all skillets for a given API family |

---

## 6. Technical Considerations

### Static Site Constraints

Since this is a static Astro site:
- **No server-side API** — all "dynamic" data (signals, reviews, compatibility) must be pre-built from JSON files at build time, or loaded client-side from static JSON
- **Submissions via GitHub PR** — this is consistent with the existing Commons contribution model and keeps the workflow familiar
- **Scheduled updates** — GitHub Actions (like the existing observatory collector) can periodically refresh signals data and trigger rebuilds

### Search Strategy

For Phase 1, client-side filtering (matching the existing Commons approach) is sufficient. For Phase 4, consider:
- **Pagefind** (already compatible with Astro, zero-JS index generation) for full-text search
- **Fuse.js** as a lightweight client-side fuzzy search alternative

### Schema.org Structured Data

Each skillet detail page should include `SoftwareApplication` JSON-LD:
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ASPSP Account Normalizer",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Node.js",
  "offers": { "@type": "Offer", "price": "0" },
  "author": { "@type": "Organization", "name": "Lean Technologies" }
}
```

### Relationship to Observatory

The marketplace can cross-reference Observatory participants:
- A skillet's `aspspCompatibility` array maps to participant `shortName` values from the Observatory
- The compatibility matrix page can link ASPSP names to their Observatory profile pages
- Participant detail pages (`/observatory/participant/[slug]`) could eventually show "Skillets compatible with this ASPSP"

---

## 7. Content Governance

### Submission Criteria

A skillet must meet these minimum requirements to be listed:
1. **Open source or source-available** — the GitHub repo must be publicly accessible
2. **Relevant to UAE Open Finance** — must target CBUAE APIs, UAE ASPSP integrations, or the broader Open Finance framework
3. **Minimum documentation** — at least a README with install instructions and basic usage
4. **Active maintenance** — not abandoned (some commit activity in last 6 months, or declared stable)
5. **No malware or credential harvesting** — community review before merge

### Review Process

1. Contributor opens PR with new `.md` file in `src/content/marketplace/`
2. CI validates the frontmatter schema
3. At least one community maintainer reviews the PR
4. Maintainer verifies the GitHub repo exists and matches the description
5. Merge triggers build and deploy

### Featured Criteria

A skillet earns "featured" status based on:
- Production usage by at least one known ecosystem participant
- Active maintenance and responsive issue handling
- Positive community reviews
- Broad ASPSP compatibility

---

## 8. Design Direction

The marketplace should feel like a natural extension of the existing site:
- **Same color system** — teal primary, amber accent, clean whites/grays
- **Same typography** — DM Sans body, Fraunces headings, JetBrains Mono for code/install commands
- **Card-based layout** — matching the Commons and Observatory grid patterns
- **Dark mode support** — consistent with the rest of the site
- **Category color coding** — each skillet category gets a subtle color treatment (similar to Commons type indicators)

### New Visual Elements

- **Install command block** — monospace, dark background, one-click copy button
- **Runtime icons** — small icons for Node, Python, Go, etc.
- **Compatibility indicators** — green/amber/gray/red dots in a compact row
- **Star count** — small GitHub-style star counter on cards
- **Version badge** — semver displayed near the title

---

## 9. Open Questions

1. **Naming**: Is "Marketplace" the right term given everything is free/open-source? Alternatives: "Toolkit", "Registry", "Catalog", "Forge". "Marketplace" implies commerce; "Registry" or "Catalog" may be more accurate.

2. **Scope boundary with Commons**: Should existing Commons artifacts/utilities that are code-heavy migrate to the Marketplace, or should both sections coexist with different purposes?

3. **Private/commercial skillets**: Should the marketplace list commercial (paid) tools from ecosystem vendors, or remain strictly open-source? If commercial tools are included, what metadata changes are needed (pricing, trial links)?

4. **Verification depth**: How much verification should maintainers perform before listing? Just "repo exists" or actual build/test validation?

5. **Observatory integration priority**: Should Phase 1 already link to Observatory participants, or defer to Phase 4?

---

## 10. Summary

The Marketplace adds a structured, searchable catalog of developer tools and integrations to the community website. It builds on existing patterns (content collections, GitHub-based contributions, static generation) while introducing new concepts (versioning, compatibility matrices, community signals). The phased approach lets us ship a useful catalog quickly and layer on community features over time.
