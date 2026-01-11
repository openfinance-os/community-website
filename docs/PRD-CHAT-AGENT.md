# PRD: OpenFinance-OS Chat AI Agent

## Habibi — The UAE Open Finance Assistant

---

## 1. Executive Summary

### 1.1 What This Is

**Habibi** is an AI-powered chat assistant embedded in the OpenFinance-OS.org website that provides conversational access to UAE Open Finance ecosystem data, documentation, and community knowledge. It serves as the intelligent interface layer connecting users to:

- **Live ecosystem data** from the Observatory (participants, APIs, roles, trends)
- **Historical analytics** (growth trends, adoption curves, comparisons)
- **Educational content** (Learn section, glossary, FAQs)
- **Community resources** (news, events, official links)

The agent is built on a **Community SDK** that wraps the Raidiam Trust Framework Directory API and exposes functionality via an **MCP (Model Context Protocol) Server**, making the same capabilities available to external AI tools (Claude Desktop, Cursor, ChatGPT, etc.).

### 1.2 Why This Matters

Open Finance ecosystems are complex. Developers, fintechs, and curious stakeholders ask the same questions repeatedly:

- "Which banks support CIBA authentication?"
- "How has participant growth changed over the last 6 months?"
- "What's the difference between BDSP and BSIP roles?"
- "Is Bank X live in production or still in sandbox?"

**Habibi answers these questions instantly**, reducing friction and democratizing access to ecosystem knowledge.

### 1.3 Strategic Value

| Stakeholder | Value |
|-------------|-------|
| **Developers** | Instant answers without digging through docs |
| **Fintechs** | Quick comparison of potential banking partners |
| **Community** | 24/7 knowledge assistant, scales community support |
| **Ecosystem** | Lower barrier to entry, faster onboarding |
| **OpenFinance-OS** | Differentiated offering, increased engagement |

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        OpenFinance-OS.org                                │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    Habibi Chat Interface                         │    │
│  │         (Embedded chat widget on website)                        │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                │                                         │
│                                ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     AI Agent Backend                             │    │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │    │
│  │   │   Claude    │  │   System    │  │  Response   │             │    │
│  │   │   API       │  │   Prompt    │  │  Formatter  │             │    │
│  │   └─────────────┘  └─────────────┘  └─────────────┘             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                │                                         │
│                                ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                  MCP Server (Tool Layer)                         │    │
│  │                                                                   │    │
│  │   ┌───────────────────────────────────────────────────────────┐  │    │
│  │   │                  Community SDK                             │  │    │
│  │   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │  │    │
│  │   │  │ Directory   │  │ Analytics   │  │  Content    │        │  │    │
│  │   │  │ Client      │  │ Engine      │  │  Search     │        │  │    │
│  │   │  └─────────────┘  └─────────────┘  └─────────────┘        │  │    │
│  │   └───────────────────────────────────────────────────────────┘  │    │
│  │                                                                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                │                                         │
└────────────────────────────────┼─────────────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Raidiam       │    │   Observatory   │    │   Content       │
│   Directory     │    │   Snapshots     │    │   (Markdown)    │
│   API           │    │   (JSON)        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
     (Live API)         (data/observatory/)    (src/content/)
```

---

## 3. Component Specifications

### 3.1 Community SDK (`@openfinance-os/sdk`)

A TypeScript/JavaScript library providing programmatic access to UAE Open Finance ecosystem data.

#### 3.1.1 Directory Client

```typescript
import { DirectoryClient } from '@openfinance-os/sdk';

const client = new DirectoryClient({
  environment: 'production' // or 'sandbox'
});

// Get all participants
const participants = await client.getParticipants();

// Get specific participant
const adib = await client.getParticipant('adib');

// Query by role
const lfis = await client.getParticipantsByRole('LFI');

// Query by capability
const cibaEnabled = await client.getParticipantsWithCapability('CIBA');
```

#### 3.1.2 Analytics Engine

```typescript
import { AnalyticsEngine } from '@openfinance-os/sdk';

const analytics = new AnalyticsEngine();

// Growth trends
const growth = await analytics.getParticipantGrowth({
  period: '6m',
  granularity: 'weekly'
});

// Role distribution over time
const rolesTrend = await analytics.getRoleDistributionTrend();

// API adoption curves
const apiAdoption = await analytics.getAPIAdoptionByFamily();

// Environment progression
const progression = await analytics.getSandboxToProductionRate();

// Comparative analysis
const comparison = await analytics.compareParticipants(['adib', 'enbd', 'fab']);
```

#### 3.1.3 Content Search

```typescript
import { ContentSearch } from '@openfinance-os/sdk';

const search = new ContentSearch();

// Search across all content
const results = await search.query('CIBA authentication');

// Search specific content type
const news = await search.searchNews('Mashreq');

// Get glossary definition
const definition = await search.getGlossaryTerm('TPP');

// Get FAQ answer
const faq = await search.findFAQ('How do I register as a TPP?');
```

#### 3.1.4 SDK Distribution

| Package | Registry | Usage |
|---------|----------|-------|
| `@openfinance-os/sdk` | npm | JavaScript/TypeScript projects |
| `openfinance-os` | PyPI | Python projects (future) |
| Source | GitHub | Direct inclusion, forking |

---

### 3.2 MCP Server

The MCP (Model Context Protocol) server exposes SDK functionality as tools that AI assistants can invoke.

#### 3.2.1 Tool Definitions

```json
{
  "tools": [
    {
      "name": "get_participants",
      "description": "Get list of Open Finance UAE ecosystem participants",
      "parameters": {
        "environment": "production | sandbox",
        "role": "LFI | TPP | BDSP | BSIP | ISP (optional)",
        "status": "Active | Inactive (optional)"
      }
    },
    {
      "name": "get_participant_details",
      "description": "Get detailed information about a specific participant",
      "parameters": {
        "identifier": "Participant name or slug"
      }
    },
    {
      "name": "compare_participants",
      "description": "Compare capabilities between 2-4 participants",
      "parameters": {
        "participants": ["list", "of", "names"]
      }
    },
    {
      "name": "get_ecosystem_stats",
      "description": "Get current ecosystem statistics and metrics",
      "parameters": {
        "environment": "production | sandbox | both"
      }
    },
    {
      "name": "get_growth_trends",
      "description": "Get historical growth and trend data",
      "parameters": {
        "metric": "participants | apis | roles",
        "period": "30d | 90d | 6m | 1y"
      }
    },
    {
      "name": "search_content",
      "description": "Search OpenFinance-OS content including docs, news, and learn resources",
      "parameters": {
        "query": "Search query",
        "content_type": "all | news | learn | glossary | faq (optional)"
      }
    },
    {
      "name": "get_glossary_term",
      "description": "Get definition of an Open Finance term",
      "parameters": {
        "term": "Term to define (e.g., TPP, CIBA, LFI)"
      }
    },
    {
      "name": "get_api_coverage",
      "description": "Get API family coverage across participants",
      "parameters": {
        "api_family": "accounts | payments | cop | products (optional)"
      }
    }
  ]
}
```

#### 3.2.2 MCP Server Deployment

| Deployment Model | Use Case |
|------------------|----------|
| **Cloudflare Worker** | Website chat widget backend |
| **Standalone Server** | Self-hosted MCP for Claude Desktop, Cursor |
| **npm Package** | `@openfinance-os/mcp-server` for custom integrations |

#### 3.2.3 MCP Configuration for AI Tools

**Claude Desktop (`claude_desktop_config.json`):**
```json
{
  "mcpServers": {
    "openfinance-uae": {
      "command": "npx",
      "args": ["@openfinance-os/mcp-server"]
    }
  }
}
```

**Cursor (`.cursor/mcp.json`):**
```json
{
  "servers": {
    "openfinance-uae": {
      "command": "npx @openfinance-os/mcp-server"
    }
  }
}
```

---

### 3.3 Chat Interface (Habibi)

#### 3.3.1 User Experience

**Entry Points:**
- Floating chat button (bottom-right corner)
- `/chat` dedicated page for full-screen experience
- Contextual prompts on Observatory pages

**Interface States:**

```
┌─────────────────────────────────────┐
│  Habibi                         ─ □ │
├─────────────────────────────────────┤
│                                     │
│  👋 Marhaba! I'm Habibi, your      │
│  guide to UAE Open Finance.         │
│                                     │
│  Try asking:                        │
│  • "Which banks are live?"          │
│  • "Compare ADIB vs ENBD"           │
│  • "What is CIBA?"                  │
│                                     │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │ Ask about Open Finance...   │ ➤  │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

**Response Types:**

| Type | Display |
|------|---------|
| Text answer | Formatted markdown |
| Data table | Responsive table with sorting |
| Chart | Inline visualization (reuse Observatory components) |
| List | Collapsible cards for participants |
| Citation | Links to source (Observatory, Learn, News) |

#### 3.3.2 Example Interactions

**Query:** "Which banks support CIBA?"

**Response:**
```
Based on the latest Observatory data, these participants support
CIBA (Client-Initiated Backchannel Authentication):

┌────────────────────┬─────────────┬─────────────┐
│ Participant        │ Environment │ API Families│
├────────────────────┼─────────────┼─────────────┤
│ Emirates NBD       │ Production  │ Accounts ✓  │
│ ADCB               │ Production  │ Accounts ✓  │
│ Mashreq Bank       │ Sandbox     │ Accounts ✓  │
└────────────────────┴─────────────┴─────────────┘

ℹ️ Data from Observatory, updated 2026-01-11
→ View full capability matrix
```

---

**Query:** "How has the ecosystem grown?"

**Response:**
```
Here's the UAE Open Finance ecosystem growth over the past 6 months:

[Embedded line chart showing participant growth]

Key highlights:
• Total participants: 10 → 18 (+80%)
• Production-ready: 4 → 12 (+200%)
• New TPPs onboarded: 5
• Most active API family: Accounts (100% coverage)

ℹ️ Source: Observatory historical data
→ View detailed analytics
```

---

**Query:** "What's the difference between BDSP and BSIP?"

**Response:**
```
**BDSP** (Banking Data Service Provider)
Provides account information and data services. Can read
account balances, transactions, and customer data.

**BSIP** (Banking Service Initiation Provider)
Can initiate actions on behalf of customers, including
payment initiation and fund transfers.

Key difference: BDSP = read access, BSIP = write access

Most UAE banks register as both to offer full Open Finance
capabilities.

ℹ️ From Learn → Glossary
→ Read more about roles
```

---

### 3.4 Historical Analytics Dashboard Integration

The chat agent provides conversational access to analytics that complement the visual Observatory dashboard.

#### 3.4.1 Analytics Capabilities

| Capability | Description | Data Source |
|------------|-------------|-------------|
| **Growth Trends** | Participant count over time | `history.json` |
| **Role Evolution** | How role distribution changed | Snapshot diffs |
| **API Adoption** | Which API families gained coverage | Snapshot comparison |
| **Sandbox→Production** | Time-to-production metrics | Environment tracking |
| **Comparative** | Side-by-side participant analysis | Live + historical |

#### 3.4.2 Natural Language Queries

The agent understands temporal and comparative queries:

```
"How many participants were there 3 months ago?"
→ Queries history.json, returns point-in-time count

"Which banks moved to production this quarter?"
→ Diffs snapshots, identifies status changes

"Show me the API adoption trend for payments"
→ Generates time-series from snapshot history

"Who has the most complete API coverage?"
→ Ranks participants by API family count
```

---

## 4. Technical Specifications

### 4.1 AI Model & Prompt Engineering

#### 4.1.1 Model Selection

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| Claude (Anthropic) | Best reasoning, MCP-native | API cost | **Primary** |
| GPT-4 (OpenAI) | Good quality | No MCP | Alternative |
| Local (Llama) | Free, private | Lower quality | Future option |

#### 4.1.2 System Prompt

```
You are Habibi, the AI assistant for OpenFinance-OS.org, the community
hub for the UAE Open Finance ecosystem.

Your role:
- Answer questions about UAE Open Finance participants, APIs, and regulations
- Provide data from the Observatory (ecosystem visibility dashboard)
- Explain concepts from the Learn section (glossary, guides, FAQs)
- Share relevant news and events
- Help developers understand how to integrate with the ecosystem

Your knowledge sources (accessed via tools):
1. Observatory data: Live participant information, roles, API coverage
2. Historical analytics: Growth trends, adoption metrics
3. Content: Learn resources, glossary, FAQs, news articles
4. Official links: CBUAE regulations, Al Tareq platform

Guidelines:
- Be helpful, accurate, and concise
- Always cite your data sources (Observatory, Learn, News)
- If unsure, say so and suggest where to find authoritative info
- Link to official sources (Al Tareq, CBUAE) for regulatory questions
- Use UAE-appropriate terminology and context
- Never make up data - only report what's in the Observatory
- For time-sensitive questions, note when data was last updated

Personality:
- Friendly and professional
- Use "Marhaba" for greetings when appropriate
- Be genuinely helpful, not salesy
- Acknowledge the community-driven nature of OpenFinance-OS
```

### 4.2 Data Flow

```
User Query
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│                    Chat Backend                              │
│  1. Receive user message                                     │
│  2. Send to Claude API with system prompt                    │
│  3. Claude decides which tools to call                       │
│  4. Execute tool calls via MCP Server                        │
│  5. Return tool results to Claude                            │
│  6. Claude generates natural language response               │
│  7. Format and send response to user                         │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
Response to User
```

### 4.3 Caching Strategy

| Data Type | Cache Duration | Invalidation |
|-----------|----------------|--------------|
| Participant list | 15 minutes | On Observatory update |
| Historical trends | 1 hour | Daily rebuild |
| Content search | 5 minutes | On content change |
| Glossary terms | 24 hours | On site deploy |

### 4.4 Rate Limiting

| Tier | Requests/minute | Requests/day |
|------|-----------------|--------------|
| Anonymous | 10 | 100 |
| Identified (cookie) | 30 | 500 |
| API key | 100 | 10,000 |

---

## 5. Integration Points

### 5.1 Website Integration

**Pages with chat context:**

| Page | Context Passed to Agent |
|------|------------------------|
| `/observatory` | Current environment, visible participants |
| `/observatory/participant/[slug]` | Specific participant data |
| `/learn` | Current topic/section |
| `/news` | Recent articles |
| Homepage | General ecosystem stats |

**Contextual prompts:**

```javascript
// On participant page
<HabibiChat
  context={{
    page: 'participant',
    participant: 'adib',
    suggestedQueries: [
      "What APIs does ADIB support?",
      "Compare ADIB with other banks",
      "When did ADIB go live?"
    ]
  }}
/>
```

### 5.2 External AI Tool Integration

The MCP server enables the same capabilities in:

| Tool | Integration | User Benefit |
|------|-------------|--------------|
| Claude Desktop | MCP config | Query ecosystem from desktop |
| Cursor | MCP config | Ecosystem data while coding |
| ChatGPT | Plugin (future) | Broader accessibility |
| Custom agents | npm package | Build on OpenFinance-OS data |

### 5.3 API Access (Future)

```
POST /api/v1/chat
Content-Type: application/json
Authorization: Bearer <api_key>

{
  "message": "Which banks support payment initiation?",
  "context": {
    "environment": "production"
  }
}
```

---

## 6. Privacy & Security

### 6.1 Data Handling

| Data Type | Handling |
|-----------|----------|
| User queries | Not stored (ephemeral) |
| Conversation history | Session-only, client-side |
| API responses | Cached, no PII |
| Analytics | Aggregate only (Plausible) |

### 6.2 Content Guardrails

The agent will NOT:
- Provide investment or legal advice
- Share non-public information
- Make predictions about regulatory decisions
- Endorse specific participants over others
- Generate or execute code on user systems

### 6.3 Transparency

- Clear "AI-generated" labeling
- Source citations for all data
- "Last updated" timestamps
- Link to methodology for derived metrics

---

## 7. Success Metrics

### 7.1 Engagement

| Metric | 3-month target | 6-month target |
|--------|----------------|----------------|
| Chat sessions/week | 100 | 500 |
| Messages/session | 3+ | 4+ |
| Return users | 30% | 40% |

### 7.2 Quality

| Metric | Target |
|--------|--------|
| Query resolution rate | >80% answered without escalation |
| Accuracy (spot-checked) | >95% factually correct |
| User satisfaction | >4.0/5.0 (feedback widget) |

### 7.3 Ecosystem Impact

| Metric | Measurement |
|--------|-------------|
| Reduced support questions | GitHub Discussions volume |
| Developer onboarding | Time to first API call |
| MCP adoption | npm downloads of MCP server |

---

## 8. Phased Rollout

### Phase 1: Foundation (4-6 weeks)

- [ ] Extract and publish Community SDK from existing `directory-client.ts`
- [ ] Implement core MCP server with 4 basic tools:
  - `get_participants`
  - `get_participant_details`
  - `get_ecosystem_stats`
  - `search_content`
- [ ] Basic chat UI component (floating widget)
- [ ] Claude API integration with system prompt
- [ ] Deploy to Cloudflare Workers

**Deliverables:**
- `@openfinance-os/sdk` on npm
- `@openfinance-os/mcp-server` on npm
- Working chat widget on staging

### Phase 2: Analytics Integration (Weeks 6-10)

- [ ] Analytics Engine implementation
- [ ] Historical data query tools:
  - `get_growth_trends`
  - `get_api_coverage`
  - `compare_participants`
- [ ] Inline chart rendering in chat responses
- [ ] Contextual suggestions based on current page

**Deliverables:**
- Analytics-aware chat responses
- Embedded visualizations
- Page-aware context

### Phase 3: Polish & Launch (Weeks 10-14)

- [ ] Response quality tuning
- [ ] Edge case handling
- [ ] Rate limiting and caching optimization
- [ ] Feedback collection widget
- [ ] Documentation for MCP setup
- [ ] Public launch announcement

**Deliverables:**
- Production-ready chat agent
- MCP setup guides for Claude Desktop, Cursor
- Blog post announcing Habibi

### Phase 4: Expansion (Months 4-6)

- [ ] Python SDK (`openfinance-os` on PyPI)
- [ ] Additional tools based on usage patterns
- [ ] Multi-language support (Arabic)
- [ ] API access for third-party integrations
- [ ] Advanced analytics (predictions, alerts)

---

## 9. Dependencies & Requirements

### 9.1 External Services

| Service | Purpose | Cost Estimate |
|---------|---------|---------------|
| Anthropic API | Claude for chat responses | ~$50-200/month |
| Cloudflare Workers | Chat backend hosting | Free tier |
| npm Registry | SDK distribution | Free |

### 9.2 Internal Requirements

| Requirement | Status |
|-------------|--------|
| Observatory data pipeline | Exists |
| Historical snapshots | Exists |
| Content collections (Learn, News) | Exists |
| Glossary content | Needs expansion |
| FAQ content | Needs creation |

### 9.3 Team Requirements

| Role | Responsibility | Effort |
|------|----------------|--------|
| Developer | SDK, MCP server, chat UI | Primary |
| Content | Glossary expansion, FAQ creation | Supporting |
| Community | Beta testing, feedback | Supporting |

---

## 10. Open Questions

1. **Naming:** Is "Habibi" appropriate and culturally resonant, or too informal?
2. **Branding:** Should the chat have distinct branding from main site?
3. **Anthropic credits:** Apply for Anthropic for Startups / Open Source programs?
4. **Arabic support:** Priority for bilingual responses?
5. **Usage limits:** How to handle potential abuse without friction for legitimate users?
6. **Competitive concern:** Will official channels see this as overreach?

---

## 11. Appendix

### A. Competitive Landscape

| Solution | Scope | Limitation |
|----------|-------|------------|
| Al Tareq docs | Official regulatory | No conversational interface |
| Raidiam docs | Trust Framework technical | Not UAE-specific |
| Bank developer portals | Individual bank APIs | Fragmented, not ecosystem-wide |
| **Habibi (ours)** | Community ecosystem | Complementary, not competitive |

### B. Sample Tool Implementations

See `/docs/samples/mcp-tools.md` for implementation examples.

### C. Prompt Engineering Guidelines

See `/docs/samples/prompt-engineering.md` for system prompt development.

---

## 12. Conclusion

Habibi transforms OpenFinance-OS from a static information hub into an interactive knowledge assistant. By packaging ecosystem access as a Community SDK and MCP Server, we:

1. **Lower barriers** for developers exploring UAE Open Finance
2. **Scale community support** with AI-powered assistance
3. **Enable ecosystem integration** for AI coding tools
4. **Differentiate OpenFinance-OS** as the intelligent community hub

The phased approach starts with proven capabilities (Observatory data) and expands based on real usage patterns.

---

*Built by the community. Open source. For everyone who wants this ecosystem to flourish.*
