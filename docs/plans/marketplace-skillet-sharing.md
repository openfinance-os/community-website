# AI-Accelerated Open Finance — Sharing Developer Tools Under Commons

> **Status:** Plan / RFC
> **Date:** 2026-02-07
> **Scope:** Extend the existing Commons section with AI-enabled developer tooling for Open Finance
> **Review (9 October 2026):** The five sample tool entries are unpublished drafts. Their repository links returned 404 under the maintainer's existing authenticated account. Installation commands, capabilities and maturity claims in those examples are unverified proposal material. Publish an entry only after its source, supported baseline, license and install instructions have been verified.

---

## 1. Overview

Add an **AI Developer Tools** category to the community website's existing Commons section where the Open Finance community can discover, share, and install **AI-powered accelerators** — prompts, agents, MCP servers, IDE extensions, automation workflows, and knowledge bases — that help banks, TPPs, and developers build on the UAE Open Finance platform faster.

This is **tool-agnostic**: it supports Claude Code skills/plugins, Cursor rules, GitHub Copilot custom instructions, Windsurf workflows, standalone AI agents, and any other AI-assisted development pattern. The unifying theme is not a specific tool — it's **using AI to accelerate Open Finance adoption**.

Everything is **open source**, listed under the existing **Commons** section.

### The Big Idea

Open Finance is complex: CBUAE regulations, FAPI security profiles, consent lifecycle management, multi-ASPSP integration, Shariah compliance checks, sandbox testing. AI tooling can dramatically lower the barrier to entry by encoding this domain knowledge into reusable, shareable components that any developer can install and use immediately.

### What Can Be Shared?

| Category | What It Is | Example |
|---|---|---|
| **Prompt / Instruction Set** | Reusable AI instructions for any coding assistant | System prompts that teach an AI assistant CBUAE API conventions, consent patterns, and error handling |
| **MCP Server** | A Model Context Protocol server giving AI tools access to live data | An MCP server wrapping the Raidiam Trust Framework Directory for real-time participant lookups |
| **AI Agent** | An autonomous or semi-autonomous agent for a specific workflow | An agent that walks a TPP through ASPSP registration, generating configs and running checks |
| **IDE Extension / Plugin** | A packaged extension for a specific AI-enabled IDE | A Claude Code plugin, Cursor ruleset, or Copilot workspace configuration for Open Finance |
| **Automation Workflow** | CI/CD, GitHub Actions, or scripted pipelines enhanced with AI | A PR review workflow that uses AI to check CBUAE API conformance before merge |
| **Knowledge Base** | Structured domain knowledge for AI consumption | A curated set of CBUAE specs, API schemas, and example flows formatted for AI context windows |
| **Code Generator / Scaffold** | AI-powered project generators | A tool that generates a TPP project skeleton with consent flows, token management, and sandbox configs |
| **Testing / Validation Tool** | AI-assisted testing harness | A tool that uses AI to generate edge-case test scenarios for payment initiation flows |

---

## 2. Why Under Commons (Not a Separate Section)

The existing Commons section already supports:
- Four content types: **insight**, **reference**, **artifact**, **utility**
- Taxonomy: use cases, audience, maturity, license
- Contributor attribution
- GitHub/demo/docs links
- Client-side filtering

AI developer tools map naturally onto Commons types:

| AI Tool Category | Commons Type | Rationale |
|---|---|---|
| Prompt / instruction set | **artifact** | A shareable template/file |
| IDE plugin / extension | **utility** | Forkable code & tools |
| MCP server | **utility** | Forkable service |
| AI agent | **utility** | Forkable code & tools |
| Automation workflow | **artifact** | A shareable config/pipeline |
| Knowledge base | **reference** | Curated external or structured content |
| Tutorial / guide | **insight** | Original thinking on AI + Open Finance |
| Code generator | **utility** | Forkable tool |

Rather than building a parallel system, we **extend Commons** with optional AI-tooling metadata that activates richer display when present.

---

## 3. Proposed Schema Changes

### 3.1 Extend the Commons Collection

Add optional AI tooling fields to the existing `commonsCollection` schema in `src/content/config.ts`:

```typescript
// New enums for AI developer tools
const aiToolCategories = [
  'prompt',           // Reusable prompts, system instructions, rules files
  'mcp-server',       // Model Context Protocol servers
  'agent',            // Autonomous/semi-autonomous AI agents
  'ide-extension',    // Plugins for Claude Code, Cursor, Copilot, Windsurf, etc.
  'workflow',         // CI/CD pipelines, GitHub Actions with AI steps
  'knowledge-base',   // Structured domain knowledge for AI context
  'code-generator',   // AI-powered scaffolding and generation tools
  'testing-tool',     // AI-assisted test generation and validation
] as const;

const aiPlatforms = [
  'claude-code',      // Anthropic Claude Code (skills, plugins, hooks)
  'cursor',           // Cursor IDE (rules, .cursorrules)
  'copilot',          // GitHub Copilot (custom instructions, workspaces)
  'windsurf',         // Windsurf IDE
  'openai-codex',     // OpenAI Codex / ChatGPT Code Interpreter
  'continue-dev',     // Continue.dev (open-source AI code assistant)
  'aider',            // Aider (terminal-based AI pair programming)
  'mcp',              // Any MCP-compatible client
  'platform-agnostic', // Works with any AI tool
] as const;

// Add to the commonsCollection schema (all optional — existing entries unaffected)
const commonsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // ── Existing fields (unchanged) ──
    // ... all current fields remain ...

    // ── NEW: AI Developer Tool metadata (optional) ──
    aiTool: z.object({
      // What kind of AI tool is this?
      category: z.enum(aiToolCategories),

      // Which AI platforms does this work with?
      platforms: z.array(z.enum(aiPlatforms)).min(1),

      // Install / usage command (displayed as copyable block)
      // Platform-specific install commands
      installCommands: z.array(z.object({
        platform: z.enum(aiPlatforms),
        command: z.string(),
        label: z.string().optional(),  // e.g. "Claude Code", "Cursor"
      })).default([]),

      // For MCP servers: transport and capabilities
      mcpTransport: z.enum(['stdio', 'http', 'sse']).optional(),
      mcpTools: z.array(z.string()).default([]),

      // Version (if the tool is versioned)
      version: z.string().optional(),

      // What Open Finance capabilities does this accelerate?
      accelerates: z.array(z.enum([
        'api-integration',       // Connecting to ASPSP APIs
        'consent-management',    // Consent lifecycle implementation
        'compliance-checking',   // CBUAE regulatory compliance
        'sandbox-testing',       // Testing against sandbox environments
        'security-implementation', // FAPI, mTLS, token management
        'participant-onboarding', // Registering as TPP/ASPSP
        'data-mapping',          // Transforming between API schemas
        'monitoring',            // Production observability
        'documentation',         // Generating or consuming docs
      ])).default([]),

      // Inline snippet — quick preview of what this looks like
      snippet: z.string().optional(),

      // Prerequisites
      prerequisites: z.string().optional(),  // e.g. "Node 18+, active CBUAE sandbox credentials"
    }).optional(),
  }),
});
```

### 3.2 Key Design Decisions

1. **Platform-agnostic by default** — the `platforms` array supports listing multiple AI tools. A prompt/rules file might work with Claude Code, Cursor, and Copilot simultaneously.
2. **Multiple install commands** — different platforms have different install mechanisms. A single entry can show `claude plugin install ...` alongside `cp .cursorrules ...`.
3. **`accelerates` taxonomy** — instead of generic categories, this field captures *what part of the Open Finance journey* the tool accelerates. This is more useful for discovery than generic labels.
4. **Fully backward compatible** — the `aiTool` field is optional. All existing Commons entries continue to work unchanged.
5. **Additive, not prescriptive** — contributors can list a tool for one platform or ten. The schema doesn't force a specific AI tool.

---

## 4. Content Examples

### 4.1 Platform-Agnostic: Open Finance AI Rules

```markdown
---
title: "CBUAE API Development Rules for AI Assistants"
type: reference
summary: "Reusable instruction files that teach any AI coding assistant CBUAE API conventions, security patterns, and compliance requirements."
date: 2026-02-01
useCases: [compliance, payments, data]
audience: [developer, tpp, bank]
maturity: production-ready
license: cc-by-4.0
contributor: "OpenFinance Community"
links:
  github: "https://github.com/openfinance-os/ai-rules-cbuae"
aiTool:
  category: prompt
  platforms: [claude-code, cursor, copilot, platform-agnostic]
  installCommands:
    - platform: claude-code
      command: "cp -r rules/* .claude/rules/"
      label: "Claude Code"
    - platform: cursor
      command: "cp .cursorrules ."
      label: "Cursor"
    - platform: copilot
      command: "cp .github/copilot-instructions.md .github/"
      label: "GitHub Copilot"
  accelerates: [api-integration, compliance-checking, security-implementation]
  snippet: |
    # CBUAE API Conventions
    - Use camelCase for JSON field names per CBUAE spec
    - Always include x-fapi-interaction-id header (UUIDv4)
    - Consent IDs must be UUIDv4
    - All timestamps in ISO 8601 with UTC timezone
    - Payment amounts use ISO 4217 currency codes
---

## What's Included

Platform-specific instruction files that encode CBUAE Open Finance
conventions for your AI coding assistant:

| File | Platform | Purpose |
|---|---|---|
| `.claude/rules/cbuae-api.md` | Claude Code | Project rules loaded automatically |
| `.cursorrules` | Cursor | Cursor IDE rules file |
| `.github/copilot-instructions.md` | GitHub Copilot | Custom instructions for Copilot |
| `CONVENTIONS.md` | Any | Human-readable reference (also works as AI context) |

## Topics Covered

- API naming conventions and payload structure
- FAPI security profile requirements (mTLS, PKCE, PAR)
- Consent lifecycle state machine
- Error response format and status codes
- Pagination patterns for account information APIs
- Idempotency requirements for payment initiation
```

### 4.2 MCP Server: Trust Framework Directory

```markdown
---
title: "Open Finance Directory MCP Server"
type: utility
summary: "An MCP server that gives any AI assistant real-time access to the UAE Open Finance Trust Framework Directory."
date: 2026-01-20
useCases: [data, onboarding]
audience: [developer]
maturity: demo
license: mit
contributor: "Community Contributor"
links:
  github: "https://github.com/openfinance-os/directory-mcp"
  docs: "https://github.com/openfinance-os/directory-mcp/wiki"
aiTool:
  category: mcp-server
  platforms: [mcp, claude-code, continue-dev]
  mcpTransport: http
  mcpTools:
    - lookup_participant
    - list_participants_by_role
    - get_api_families
    - check_participant_status
    - get_sandbox_endpoints
  installCommands:
    - platform: claude-code
      command: "claude mcp add --transport http of-directory https://mcp.openfinance.ae/"
      label: "Claude Code"
    - platform: mcp
      command: "npx @openfinance-os/directory-mcp"
      label: "Any MCP client (stdio)"
  accelerates: [participant-onboarding, api-integration, sandbox-testing]
  prerequisites: "Node 18+"
---

## What It Provides

Ask your AI assistant questions like:
- "Which ASPSPs support the payment initiation API?"
- "What's the sandbox endpoint for ADCB?"
- "List all TPPs with active status"

The MCP server fetches live data from the Raidiam Trust Framework Directory,
so your AI always has up-to-date participant information.
```

### 4.3 AI Agent: TPP Onboarding Assistant

```markdown
---
title: "TPP Onboarding Agent"
type: utility
summary: "An AI agent that guides developers through the entire TPP registration and first-API-call journey."
date: 2026-01-28
useCases: [onboarding, compliance, identity]
audience: [developer, tpp]
maturity: concept
license: apache-2.0
contributor: "OpenFinance OS"
links:
  github: "https://github.com/openfinance-os/tpp-onboarding-agent"
aiTool:
  category: agent
  platforms: [claude-code, platform-agnostic]
  installCommands:
    - platform: claude-code
      command: "claude plugin install openfinance-os/tpp-onboarding-agent"
      label: "Claude Code Plugin"
  accelerates: [participant-onboarding, security-implementation, sandbox-testing]
  snippet: |
    This agent walks you through:
    1. Registering with the Trust Framework Directory
    2. Generating transport and signing certificates
    3. Configuring Dynamic Client Registration
    4. Making your first consent request
    5. Completing a payment initiation flow
    6. Validating your sandbox integration
---

## How It Works

The agent breaks TPP onboarding into sequential steps, generating
configuration files, certificate signing requests, and test scripts
at each stage. It validates each step before moving to the next.
```

### 4.4 Automation Workflow: AI-Powered Conformance Testing

```markdown
---
title: "AI Conformance Review GitHub Action"
type: artifact
summary: "A GitHub Action that uses AI to review PRs for CBUAE API conformance before merge."
date: 2026-02-03
useCases: [compliance, payments]
audience: [developer, tpp, bank]
maturity: demo
license: mit
contributor: "Community Contributor"
links:
  github: "https://github.com/openfinance-os/ai-conformance-action"
aiTool:
  category: workflow
  platforms: [platform-agnostic]
  accelerates: [compliance-checking, api-integration]
  snippet: |
    # .github/workflows/conformance.yml
    - uses: openfinance-os/ai-conformance-action@v1
      with:
        spec-version: "1.0"
        check-consent-lifecycle: true
        check-fapi-headers: true
        check-error-responses: true
---

## What It Checks

On every PR that touches API-related code, this action:
- Validates request/response schemas against CBUAE spec
- Checks for required FAPI headers
- Verifies consent state transitions
- Flags missing error handling patterns
- Suggests fixes with AI-generated explanations
```

### 4.5 Knowledge Base: Open Finance AI Context Pack

```markdown
---
title: "Open Finance Context Pack"
type: reference
summary: "A curated, AI-optimized knowledge base of CBUAE specs, API schemas, and integration patterns — ready to drop into any AI assistant's context."
date: 2026-01-10
useCases: [payments, data, compliance, onboarding]
audience: [developer, tpp, bank, all]
maturity: production-ready
license: cc-by-4.0
contributor: "OpenFinance Community"
links:
  github: "https://github.com/openfinance-os/context-pack"
  docs: "https://github.com/openfinance-os/context-pack/wiki"
aiTool:
  category: knowledge-base
  platforms: [platform-agnostic, claude-code, cursor, copilot]
  installCommands:
    - platform: claude-code
      command: "cp context-pack/* .claude/rules/"
      label: "Claude Code (as rules)"
    - platform: cursor
      command: "Add to Cursor's @docs or paste into project context"
      label: "Cursor"
  accelerates: [api-integration, compliance-checking, consent-management, security-implementation, documentation]
---

## What's Included

Condensed, AI-friendly versions of:
- CBUAE Open Finance Standard v1.0 (key sections)
- Account Information API — full schema with examples
- Payment Initiation API — full schema with examples
- Consent lifecycle state machine
- FAPI security profile requirements
- Common integration patterns and anti-patterns
- Glossary of UAE-specific financial terms

## Why?

AI assistants work better when they have precise, structured domain knowledge
in their context window. This pack distills hundreds of pages of CBUAE
documentation into focused, actionable reference files.
```

---

## 5. UI Changes to Commons

### 5.1 New Filter: "AI Tools" Toggle

Add a filter row to the existing Commons filter section:

```
Platform    [All] [AI Developer Tools]
```

When "AI Developer Tools" is active, only entries with `aiTool` metadata are shown. Optionally expand to sub-filters:

```
Category    [All] [Prompt] [MCP Server] [Agent] [IDE Extension] [Workflow] [Knowledge Base] [Generator] [Testing]
Works with  [All] [Claude Code] [Cursor] [Copilot] [Windsurf] [MCP] [Platform-Agnostic]
Accelerates [All] [API Integration] [Consent Mgmt] [Compliance] [Sandbox Testing] [Security] [Onboarding]
```

### 5.2 Enhanced Card Display

When a Commons entry has `aiTool` metadata, the card shows additional elements:

```
┌──────────────────────────────────────┐
│ [UTILITY]  [AI: MCP Server]         │
│                                      │
│ Open Finance Directory MCP Server    │
│ An MCP server that gives any AI      │
│ assistant real-time access to the    │
│ UAE Trust Framework Directory.       │
│                                      │
│ Works with:                          │
│ [Claude Code] [Continue] [Any MCP]  │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ $ claude mcp add --transport     │ │
│ │   http of-directory https://...  │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Accelerates: [Onboarding] [APIs]    │
│                                      │
│ Community Contributor  ·  Demo       │
│ ─────────────────────────────────────│
│ [GitHub] [Docs]                      │
└──────────────────────────────────────┘
```

Key additions over a standard Commons card:
- **AI category badge** — "AI: MCP Server" next to the existing Commons type badge
- **Platform badges** — which AI tools this works with
- **Install command preview** — monospace block with copy button (shows first/primary platform)
- **Accelerates tags** — what Open Finance capabilities this helps with

### 5.3 Enhanced Detail Page

When viewing a Commons entry that has `aiTool` data, the detail page adds:

1. **Multi-platform install block** — tabbed interface showing install commands per platform, each copyable
2. **Platform compatibility badges** — which AI tools this works with
3. **"Accelerates" section** — what Open Finance workflows this tool speeds up
4. **Snippet preview** — syntax-highlighted code block
5. **For MCP servers** — list of tools/capabilities provided
6. **Prerequisites** — system requirements
7. **Version info** — if versioned

---

## 6. Implementation Plan

### Phase 1: Schema Extension & Seed Content

**Goal:** Extend Commons to support AI tooling metadata and publish initial entries.

| Task | Files Affected |
|---|---|
| Add `aiToolCategories`, `aiPlatforms`, and `accelerates` enums | `src/content/config.ts` |
| Add optional `aiTool` field to `commonsCollection` schema | `src/content/config.ts` |
| Create 3-5 seed entries covering different categories and platforms | `src/content/commons/*.md` |
| Verify existing entries still build correctly | CI |

### Phase 2: UI Enhancements

**Goal:** Make AI tool entries discoverable and visually distinct.

| Task | Files Affected |
|---|---|
| Add "AI Developer Tools" filter toggle to Commons page | `src/pages/commons/index.astro` |
| Add category and platform sub-filters | `src/pages/commons/index.astro` |
| Build `InstallCommand` component (tabbed, copyable) | `src/components/commons/InstallCommand.astro` |
| Build `AiToolBadge` component (category + platform badges) | `src/components/commons/AiToolBadge.astro` |
| Enhance card rendering when `aiTool` is present | `src/pages/commons/index.astro` (card template) |
| Enhance detail page with multi-platform install, snippet, accelerates | `src/pages/commons/[slug].astro` |
| Add AI tool icon/badge styles | Scoped CSS in components |

### Phase 3: Contribution Workflow

**Goal:** Make it easy for the community to submit AI tools.

| Task | Files Affected |
|---|---|
| Update `/commons/contribute` page with AI tools section | `src/pages/commons/contribute.astro` |
| Add frontmatter templates for each category | Contribute page |
| Add CI validation for `aiTool` schema in PRs | `.github/workflows/ci.yml` |

### Phase 4: Discovery & Ecosystem

**Goal:** Position the site as the go-to resource for AI-accelerated Open Finance development.

| Task | Description |
|---|---|
| Homepage preview | Show featured AI tools on the home page |
| Learn section integration | Add "AI-Assisted Development" subsection to `/learn` |
| RSS feed | Include AI tool entries |
| Deep-linkable filter | `/commons?filter=ai-tools` |
| Stats badge | "X AI Tools" counter on Commons stats bar |
| Cross-reference with Observatory | Link MCP servers/tools to Observatory participants |
| "Starter Kit" bundles | Curated sets: "TPP Quick Start", "Bank Implementation", "Compliance Check" |

---

## 7. The Bigger Picture: How AI Accelerates Open Finance

This isn't just about listing tools — it's about shifting the narrative from "Open Finance is complex and hard" to "AI makes Open Finance accessible."

### Acceleration Vectors

| Challenge | How AI Tooling Helps |
|---|---|
| **Regulatory complexity** | AI rules/prompts encode CBUAE requirements so developers don't need to read 200-page specs |
| **Security implementation** | Agents guide FAPI/mTLS setup step-by-step, generating correct configs |
| **Multi-ASPSP integration** | MCP servers provide live participant data; code generators handle per-bank variations |
| **Testing burden** | AI generates edge-case test scenarios, validates conformance automatically |
| **Onboarding friction** | Agents walk new participants through registration, certificates, and first API calls |
| **Knowledge gaps** | Knowledge bases give AI assistants deep domain context, improving code suggestions |
| **Compliance maintenance** | CI/CD workflows catch regressions against evolving CBUAE standards |

### Who Benefits

- **TPP developers** — fastest path from "I want to build on Open Finance" to a working integration
- **Bank implementation teams** — AI checks their ASPSP implementations against spec before going live
- **Regulators** — can see what tools the ecosystem uses and whether they encode correct standards
- **The ecosystem as a whole** — shared tooling means consistent implementations, fewer bugs, faster adoption

---

## 8. Technical Notes

### Static Site Compatibility

All of this works within the existing static Astro architecture:
- Schema extension is build-time only (Zod validation at build)
- Filtering is client-side JavaScript (extending existing filter logic)
- No new API endpoints needed
- Content submitted via GitHub PR (same as existing Commons workflow)

### Multi-Platform Install Tabs

The detail page renders install commands in a tabbed interface:

```
┌──────────────┬──────────┬──────────────┐
│ Claude Code  │  Cursor  │  Copilot     │
├──────────────┴──────────┴──────────────┤
│                                         │
│  $ cp -r rules/* .claude/rules/         │
│                                    [Copy]│
│                                         │
└─────────────────────────────────────────┘
```

This is a client-side tab component — no framework dependency needed, just vanilla JS matching the existing filter pattern.

### Card Filtering Logic

Extend the existing `applyFilters()` function in the Commons page:

```javascript
const activeFilters = {
  type: 'all',
  audience: 'all',
  useCase: 'all',
  aiTool: 'all',          // 'all' | 'ai-tools'
  aiCategory: 'all',      // 'all' | 'prompt' | 'mcp-server' | ...
  aiPlatform: 'all',      // 'all' | 'claude-code' | 'cursor' | ...
};

const aiToolMatch =
  activeFilters.aiTool === 'all' ||
  (activeFilters.aiTool === 'ai-tools' && cardEl.dataset.aiTool === 'true');

const aiCategoryMatch =
  activeFilters.aiCategory === 'all' ||
  cardEl.dataset.aiCategory === activeFilters.aiCategory;

const aiPlatformMatch =
  activeFilters.aiPlatform === 'all' ||
  (cardEl.dataset.aiPlatforms || '').includes(activeFilters.aiPlatform);
```

---

## 9. Content Governance

### Submission Criteria

All AI tool entries must be:
1. **Open source** — public repository with a recognized OSS license
2. **Relevant to Open Finance** — must accelerate some aspect of CBUAE/UAE Open Finance development
3. **Documented** — README with what it does, how to install, and basic usage
4. **Safe** — no credential harvesting, no data exfiltration, no destructive actions without user confirmation
5. **Reviewed** — at least one community maintainer reviews the PR before merge

### Security Considerations

AI developer tools can range from passive (instruction files) to active (executing commands, connecting to APIs). The listing should:
- Clearly indicate the **execution model**: passive (prompts, rules, knowledge bases) vs. active (MCP servers, hooks, agents, workflows)
- For active tools, display exactly what they do and what permissions they require
- Include a standard disclaimer: "Review the source code before installing. AI developer tools may execute code or connect to external services."
- Encourage contributors to document their tool's security model

---

## 10. Open Questions

1. **Filter naming**: "AI Developer Tools", "AI Accelerators", or "AI Tooling"? Should match the community's language.

2. **Platform evolution**: As AI coding tools evolve, the `aiPlatforms` enum will need updates. Should we use a freeform string instead of an enum for future-proofing, or keep the enum for consistency?

3. **First entries**: What should we seed the catalog with? A strong candidate would be:
   - A platform-agnostic CBUAE rules/prompt set
   - An MCP server wrapping the Observatory's Directory data
   - A "getting started" knowledge base

4. **Measurement**: How do we track whether these tools are actually accelerating adoption? GitHub stars/forks? Survey the community? Track downloads?

5. **Learn section integration**: Should Phase 1 include a short guide in `/learn` on "Using AI to build on Open Finance", or defer this?

---

## 11. Summary

Instead of building a Claude Code-specific marketplace, we extend the existing **Commons** section with a **platform-agnostic AI tooling** metadata layer. This approach:

- **Meets developers where they are** — supports Claude Code, Cursor, Copilot, Windsurf, and any other AI tool
- **Frames AI as an accelerator** — the taxonomy is organized around *what Open Finance challenges the tool solves*, not which IDE it runs in
- **Keeps it simple** — no new routes, no new content collections, no new navigation
- **Stays open source** — everything submitted via GitHub PR, all entries must be OSS
- **Tells a bigger story** — positions the UAE Open Finance community as forward-thinking about AI-assisted development, not locked into one vendor
- **Scales naturally** — as more tools are contributed, the filter becomes more valuable; if it outgrows Commons, it can be promoted to its own section later
