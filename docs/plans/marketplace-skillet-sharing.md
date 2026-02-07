# Claude Code Marketplace for Open Finance — Sharing Skills, Plugins & MCP Servers

> **Status:** Plan / RFC
> **Date:** 2026-02-07
> **Scope:** Extend the existing Commons section with Claude Code extensibility content

---

## 1. Overview

Add a **Claude Code marketplace** to the community website where Open Finance practitioners can discover, share, and install **skills, plugins, MCP servers, and hooks** purpose-built for working with the UAE Open Finance ecosystem.

Everything is **open source**, listed under the existing **Commons** section — not a separate top-level route. This keeps the site's information architecture simple while giving Claude Code extensions the specialized metadata they need (install commands, plugin manifests, hook configurations).

### What Can Be Shared?

| Component Type | What It Is | Example for Open Finance |
|---|---|---|
| **Skill** | A reusable SKILL.md that gives Claude specialized knowledge or workflow | A `/review-consent-flow` skill that audits CBUAE consent API implementations |
| **Plugin** | A packaged bundle of skills, hooks, agents, and MCP servers | An `openfinance-dev` plugin with TPP onboarding workflows, API testing, and compliance checks |
| **MCP Server** | A Model Context Protocol server that connects Claude to external tools/data | An MCP server that queries the Raidiam Trust Framework Directory or ASPSP sandbox APIs |
| **Hook** | A shell command that runs at Claude Code lifecycle events | A `PostToolUse` hook that auto-formats generated CBUAE API request payloads |
| **CLAUDE.md Rules** | Reusable project rules for Open Finance development patterns | A `.claude/rules/cbuae-api-style.md` that enforces CBUAE API naming conventions |
| **Agent** | A custom agent definition for specialized workflows | An agent that walks through ASPSP registration step-by-step |

---

## 2. Why Under Commons (Not a Separate Section)

The existing Commons section already supports:
- Four content types: **insight**, **reference**, **artifact**, **utility**
- Taxonomy: use cases, audience, maturity, license
- Contributor attribution
- GitHub/demo/docs links
- Client-side filtering

Claude Code extensions map naturally onto Commons types:

| Claude Code Component | Commons Type | Rationale |
|---|---|---|
| Skill (standalone SKILL.md) | **artifact** | A shareable template/file |
| Plugin (full bundle) | **utility** | Forkable code & tools |
| MCP Server | **utility** | Forkable service |
| Hook configuration | **artifact** | A shareable config snippet |
| CLAUDE.md rules | **reference** | Curated guidance |
| Walkthrough/tutorial | **insight** | Original thinking on how to use these tools |

Rather than building a parallel system, we **extend Commons** with optional Claude Code-specific metadata that activates richer display when present.

---

## 3. Proposed Schema Changes

### 3.1 Extend the Commons Collection

Add optional Claude Code fields to the existing `commonsCollection` schema in `src/content/config.ts`:

```typescript
// New enums for Claude Code extensions
const claudeCodeComponentTypes = [
  'skill',
  'plugin',
  'mcp-server',
  'hook',
  'rules',
  'agent',
] as const;

const hookEvents = [
  'SessionStart',
  'UserPromptSubmit',
  'PreToolUse',
  'PostToolUse',
  'PostToolUseFailure',
  'Stop',
  'Notification',
  'PreCompact',
  'SessionEnd',
] as const;

// Add to the commonsCollection schema (all optional — existing entries unaffected)
const commonsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // ── Existing fields (unchanged) ──
    title: z.string(),
    type: z.enum(commonsTypes),
    summary: z.string(),
    date: z.coerce.date(),
    whyItMatters: z.string().optional(),
    useCases: z.array(z.enum(useCases)).default([]),
    audience: z.array(z.enum(audiences)).default(['all']),
    maturity: z.enum(maturityLevels).default('concept'),
    license: z.enum(licenses).optional(),
    source: z.object({
      platform: z.enum(sourcePlatforms),
      url: z.string().url().optional(),
    }).optional(),
    authoredByContributor: z.boolean().default(true),
    contributor: z.string(),
    contributorUrl: z.string().url().optional(),
    links: z.object({
      github: z.string().url().optional(),
      demo: z.string().url().optional(),
      docs: z.string().url().optional(),
      article: z.string().url().optional(),
    }).optional(),
    disclaimers: z.array(z.string()).default([]),
    featured: z.boolean().default(false),

    // ── NEW: Claude Code extension metadata (all optional) ──
    claudeCode: z.object({
      // What kind of Claude Code component is this?
      componentType: z.enum(claudeCodeComponentTypes),

      // Install / usage command (displayed as copyable block)
      // e.g. "claude plugin install openfinance-os/openfinance-dev"
      // e.g. "claude mcp add --transport http openfinance-directory https://mcp.openfinance.ae/"
      installCommand: z.string().optional(),

      // For plugins: the plugin manifest fields
      pluginName: z.string().optional(),        // e.g. "openfinance-dev"
      version: z.string().optional(),           // semver

      // For skills: the slash command name
      skillCommand: z.string().optional(),      // e.g. "/review-consent-flow"

      // For hooks: which lifecycle event(s)
      hookEvents: z.array(z.enum(hookEvents)).default([]),

      // For MCP servers: transport type and capabilities
      mcpTransport: z.enum(['stdio', 'http', 'sse']).optional(),
      mcpTools: z.array(z.string()).default([]),  // tool names the server provides

      // Compatibility
      minClaudeCodeVersion: z.string().optional(),  // e.g. "2.1.3"

      // Inline snippet — for hooks/rules that are small enough to show directly
      // (the full content is in the markdown body, but this gives a quick preview)
      snippet: z.string().optional(),
    }).optional(),
  }),
});
```

### 3.2 Key Design Decisions

1. **Fully backward compatible** — the `claudeCode` field is optional. All existing Commons entries continue to work unchanged.
2. **No new content collection** — we reuse `commons`, so existing filters (type, audience, use case, maturity) work for Claude Code extensions too.
3. **New filter dimension** — add a "Claude Code" filter chip to the Commons page that shows only entries with `claudeCode` metadata present. Optionally filter by `componentType`.
4. **Rich display when present** — when a Commons entry has `claudeCode` data, the card and detail page render additional elements (install command, component type badge, snippet preview).

---

## 4. Content Examples

### 4.1 A Skill

```markdown
---
title: "Review CBUAE Consent Flow"
type: artifact
summary: "A Claude Code skill that audits your consent API implementation against CBUAE standards."
date: 2026-02-01
useCases: [compliance, identity]
audience: [developer, tpp]
maturity: demo
license: mit
contributor: "OpenFinance Community"
contributorUrl: "https://github.com/openfinance-os"
links:
  github: "https://github.com/openfinance-os/claude-skills"
claudeCode:
  componentType: skill
  skillCommand: "/review-consent-flow"
  installCommand: "cp SKILL.md .claude/skills/review-consent-flow/SKILL.md"
  minClaudeCodeVersion: "2.1.3"
  snippet: |
    Analyze the current project's consent API implementation.
    Check against CBUAE Open Finance Standard v1.0:
    - Consent lifecycle (create, authorize, revoke, expire)
    - Required scopes and permissions model
    - Token binding and FAPI compliance
---

## What It Does

This skill teaches Claude how to review your consent flow implementation
against the CBUAE Open Finance standard...

## Usage

```
/review-consent-flow
```

Claude will scan your project for consent-related endpoints and check them
against the CBUAE specification.
```

### 4.2 A Plugin

```markdown
---
title: "Open Finance Developer Kit"
type: utility
summary: "A Claude Code plugin bundling skills, hooks, and MCP tools for UAE Open Finance development."
date: 2026-01-15
useCases: [payments, data, compliance, onboarding]
audience: [developer, tpp, bank]
maturity: production-ready
license: apache-2.0
contributor: "OpenFinance OS"
contributorUrl: "https://github.com/openfinance-os"
links:
  github: "https://github.com/openfinance-os/claude-plugin-openfinance"
  docs: "https://github.com/openfinance-os/claude-plugin-openfinance/wiki"
claudeCode:
  componentType: plugin
  pluginName: "openfinance-dev"
  version: "1.0.0"
  installCommand: "claude plugin install openfinance-os/claude-plugin-openfinance"
  minClaudeCodeVersion: "2.1.3"
---

## Included Skills

- `/openfinance-dev:review-consent` — Audit consent API compliance
- `/openfinance-dev:scaffold-tpp` — Generate a TPP project skeleton
- `/openfinance-dev:test-sandbox` — Run integration tests against ASPSP sandboxes

## Included Hooks

- **PostToolUse (Write/Edit)**: Auto-validates generated API request schemas
- **SessionStart**: Loads latest CBUAE API spec version

## MCP Server

Connects to the Raidiam Directory to look up participant details during development.
```

### 4.3 An MCP Server

```markdown
---
title: "CBUAE Directory MCP Server"
type: utility
summary: "An MCP server that gives Claude access to the UAE Open Finance Trust Framework Directory."
date: 2026-01-20
useCases: [data, onboarding]
audience: [developer]
maturity: demo
license: mit
contributor: "Community Contributor"
links:
  github: "https://github.com/example/cbuae-directory-mcp"
claudeCode:
  componentType: mcp-server
  mcpTransport: http
  mcpTools: ["lookup_participant", "list_participants", "get_api_families", "check_status"]
  installCommand: "claude mcp add --transport http cbuae-directory https://mcp.example.com/cbuae"
  minClaudeCodeVersion: "2.1.0"
---

## What It Provides

This MCP server connects Claude to the Raidiam Trust Framework Directory API,
giving it real-time access to participant data during your development session...
```

### 4.4 A Hook Configuration

```markdown
---
title: "Auto-format CBUAE API Payloads"
type: artifact
summary: "A PostToolUse hook that validates and formats CBUAE API request/response payloads."
date: 2026-02-05
useCases: [payments, compliance]
audience: [developer]
maturity: concept
license: mit
contributor: "Community Contributor"
claudeCode:
  componentType: hook
  hookEvents: [PostToolUse]
  snippet: |
    {
      "hooks": {
        "PostToolUse": [{
          "matcher": "Write|Edit",
          "hooks": [{
            "type": "command",
            "command": "node scripts/validate-cbuae-payload.js $FILE_PATH"
          }]
        }]
      }
    }
---

## Setup

Add this to your `.claude/settings.json` or `.claude/settings.local.json`...
```

### 4.5 Reusable CLAUDE.md Rules

```markdown
---
title: "CBUAE API Development Rules"
type: reference
summary: "A set of .claude/rules/ files that enforce CBUAE API conventions in your project."
date: 2026-01-25
useCases: [compliance, payments, data]
audience: [developer, tpp, bank]
maturity: production-ready
license: cc-by-4.0
contributor: "OpenFinance Community"
links:
  github: "https://github.com/openfinance-os/claude-rules-cbuae"
claudeCode:
  componentType: rules
  installCommand: "cp -r rules/* .claude/rules/"
  snippet: |
    # CBUAE API Style
    - Use camelCase for JSON field names per CBUAE spec
    - Always include x-fapi-interaction-id header
    - Consent IDs must be UUIDv4
    - All timestamps in ISO 8601 with timezone
---

## What's Included

```
.claude/rules/
├── cbuae-api-style.md       # Naming and format conventions
├── cbuae-security.md        # FAPI/mTLS requirements
├── cbuae-consent.md         # Consent lifecycle rules
└── cbuae-error-handling.md  # Standard error response format
```
```

---

## 5. UI Changes to Commons

### 5.1 New Filter: "Claude Code" Toggle

Add a filter row to the existing Commons filter section:

```
Platform    [All] [Claude Code]
```

When "Claude Code" is active, only entries with `claudeCode` metadata are shown. Optionally expand to sub-filters:

```
Component   [All] [Skill] [Plugin] [MCP Server] [Hook] [Rules] [Agent]
```

### 5.2 Enhanced Card Display

When a Commons entry has `claudeCode` metadata, the card shows additional elements:

```
┌──────────────────────────────────────┐
│ [UTILITY]  [Claude Code: Plugin]    │
│                                      │
│ Open Finance Developer Kit           │
│ A Claude Code plugin bundling skills,│
│ hooks, and MCP tools for UAE Open    │
│ Finance development.                 │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ $ claude plugin install          │ │
│ │   openfinance-os/claude-plugin.. │ │
│ └──────────────────────────────────┘ │
│                                      │
│ [Payments] [Data] [Compliance]       │
│                                      │
│ OpenFinance OS  ·  Production Ready  │
│ ─────────────────────────────────────│
│ [GitHub] [Docs]                      │
└──────────────────────────────────────┘
```

Key additions over a standard Commons card:
- **Component type badge** — "Claude Code: Plugin" next to the existing type badge
- **Install command preview** — monospace block with copy button
- **Skill command name** — e.g., `/review-consent-flow` displayed prominently

### 5.3 Enhanced Detail Page

When viewing a Commons entry that has `claudeCode` data, the detail page adds:

1. **Install/Setup block** — prominent, copyable install command at the top
2. **Component type indicator** — icon + label (Skill, Plugin, MCP Server, etc.)
3. **Snippet preview** — syntax-highlighted code block showing the configuration or SKILL.md excerpt
4. **Compatibility note** — minimum Claude Code version required
5. **For plugins** — list of included skills, hooks, MCP servers
6. **For MCP servers** — list of tools provided
7. **For hooks** — lifecycle events and matcher patterns

---

## 6. Implementation Plan

### Phase 1: Schema Extension & Seed Content

**Goal:** Extend Commons to support Claude Code metadata and publish initial entries.

| Task | Files Affected |
|---|---|
| Add `claudeCodeComponentTypes` and `hookEvents` enums to config | `src/content/config.ts` |
| Add optional `claudeCode` field to `commonsCollection` schema | `src/content/config.ts` |
| Create 3-5 seed entries (one per component type) | `src/content/commons/*.md` |
| Verify existing entries still build correctly | CI |

### Phase 2: UI Enhancements

**Goal:** Make Claude Code entries discoverable and visually distinct.

| Task | Files Affected |
|---|---|
| Add "Claude Code" filter toggle to Commons page | `src/pages/commons/index.astro` |
| Add component type sub-filters | `src/pages/commons/index.astro` |
| Build `InstallCommand` component (copyable code block) | `src/components/commons/InstallCommand.astro` |
| Build `ComponentTypeBadge` component | `src/components/commons/ComponentTypeBadge.astro` |
| Enhance card rendering when `claudeCode` is present | `src/pages/commons/index.astro` (card template) |
| Enhance detail page with install block, snippet, compatibility | `src/pages/commons/[slug].astro` |
| Add Claude Code icon/badge styles | Scoped CSS in components |

### Phase 3: Contribution Workflow

**Goal:** Make it easy for the community to submit Claude Code extensions.

| Task | Files Affected |
|---|---|
| Update `/commons/contribute` page with Claude Code section | `src/pages/commons/contribute.astro` |
| Add frontmatter templates for each component type | Documentation in contribute page |
| Add CI validation for `claudeCode` schema in PRs | `.github/workflows/ci.yml` or new workflow |
| Create a `CONTRIBUTING-CLAUDE-CODE.md` in the repo root | `CONTRIBUTING-CLAUDE-CODE.md` |

### Phase 4: Discovery & Cross-References

**Goal:** Deep integration with the rest of the community site.

| Task | Description |
|---|---|
| Add "Claude Code Tools" preview to homepage | Show 2-3 featured Claude Code entries on the home page |
| Cross-reference with Learn section | Link to Claude Code extensions from TPP/Bank guides |
| Add to RSS feed | Include Claude Code entries in the site RSS |
| Dedicated landing at `/commons?filter=claude-code` | Deep-linkable filtered view |
| Badge on Commons stats bar | "X Claude Code Extensions" counter |

---

## 7. Technical Notes

### Static Site Compatibility

All of this works within the existing static Astro architecture:
- Schema extension is build-time only (Zod validation at build)
- Filtering is client-side JavaScript (extending existing filter logic)
- No new API endpoints or data collection scripts needed for Phase 1-3
- Content submitted via GitHub PR (same as existing Commons workflow)

### Snippet Rendering

For the `snippet` field, render using Astro's built-in Shiki syntax highlighting (already configured with the `dark-plus` theme). Detect language from the component type:
- Skills → `markdown`
- Hooks → `json`
- Rules → `markdown`
- MCP Servers → `bash` (install command)

### Card Filtering Logic

Extend the existing `applyFilters()` function in the Commons page:

```javascript
// Add to activeFilters
const activeFilters = {
  type: 'all',
  audience: 'all',
  useCase: 'all',
  claudeCode: 'all',       // new: 'all' | 'claude-code'
  componentType: 'all',    // new: 'all' | 'skill' | 'plugin' | 'mcp-server' | ...
};

// Add to filter matching logic
const claudeCodeMatch =
  activeFilters.claudeCode === 'all' ||
  (activeFilters.claudeCode === 'claude-code' && cardEl.dataset.claudeCode === 'true');

const componentTypeMatch =
  activeFilters.componentType === 'all' ||
  cardEl.dataset.componentType === activeFilters.componentType;
```

---

## 8. Content Governance

### Submission Criteria

All Claude Code extensions must be:
1. **Open source** — public GitHub repository with a recognized OSS license
2. **Relevant to Open Finance** — targets CBUAE APIs, UAE ASPSP integrations, or Open Finance development workflows
3. **Documented** — README with install instructions, what it does, and basic usage
4. **Safe** — no credential harvesting, no destructive actions without confirmation, no data exfiltration
5. **Reviewed** — at least one community maintainer reviews the PR before merge

### Security Considerations for Claude Code Extensions

Claude Code extensions can execute arbitrary commands (especially hooks and MCP servers). The listing should:
- Clearly label which components execute code vs. which are passive (rules, skills)
- Encourage users to review the source before installing
- Include a disclaimer on the detail page: "Review the source code before installing. Claude Code extensions can execute commands on your machine."
- For hooks specifically, display the exact commands that will run

---

## 9. Open Questions

1. **Naming on the page**: Should we label the filter "Claude Code" or something more generic like "Developer Tools" in case other AI coding tools adopt similar patterns?

2. **Hosting plugin repos**: Should the community website repo itself contain plugin source code, or only reference external repos? (Recommendation: reference only — keep plugins in their own repos.)

3. **Verification/testing**: Should we run a CI step that actually validates plugin manifests or SKILL.md files against Claude Code's expected format?

4. **Observatory integration**: Could we build an MCP server that wraps the Observatory's data and list it as a featured entry? This would be a compelling "first plugin" to seed the marketplace.

---

## 10. Summary

Instead of building a separate marketplace, we extend the existing **Commons** section with optional Claude Code metadata. This approach:

- **Keeps it simple** — no new routes, no new content collections, no new navigation items
- **Leverages existing infrastructure** — same filters, same cards, same contribution workflow, same CI
- **Adds value progressively** — Claude Code entries get richer display (install commands, snippets, component badges) while non-Claude Code entries remain unchanged
- **Stays open source** — everything submitted via GitHub PR, all entries must be OSS
- **Scales naturally** — as more extensions are contributed, the "Claude Code" filter becomes more valuable; if it outgrows Commons, it can be promoted to its own section later
