Done. Updated throughout:

---

## Revised PRD — Open Finance OS.org

### Community Ecosystem Hub & Observatory

---

## 1. Purpose & Vision

### 1.1 What This Is

**Open Finance OS.org** is a community-owned website that serves as the grassroots home for the UAE Open Finance ecosystem. It provides:

- **Visibility** into ecosystem activity (the Observatory dashboard)
- **News and updates** curated by the community
- **Resources** for developers, fintechs, and banks entering the ecosystem
- **A gathering point** for community efforts, events, and collaboration
- **International context** to benchmark UAE progress globally

The domain directly ties to the **Open Finance OS** GitHub organization, reinforcing that this is an open-source, community-driven effort.

### 1.2 What This Is Not

- Not an official regulator or scheme operator site
- Not affiliated with any single bank or TPP
- Not a commercial platform or vendor showcase
- Not a replacement for Al Tareq or CBUAE official channels

**We link to official sources. We don't replace them.**

### 1.3 Relationship to Official Channels

| Official Source | Our Role |
|-----------------|----------|
| Al Tareq platform | Link to it, explain how to use it, complement with community perspective |
| CBUAE regulations | Summarize, explain, link to primary sources |
| Bank/TPP official docs | Aggregate availability, never duplicate |

### 1.4 Brand Alignment

| Asset | URL |
|-------|-----|
| Website | openfinance-os.org |
| GitHub | github.com/organizations/openfinance-os/ |
| Discussions | github.com/openfinance-os/community-website/discussions |

One name, one identity, one community.

---

## 2. Governance & Ownership

### 2.1 Community-Owned

- **Domain ownership:** Held by a neutral community entity or trusted individual with documented handover terms
- **Content:** Contributed by community members, moderated by maintainers
- **Code:** Open source under Open Finance OS GitHub organization
- **Funding:** Community-funded (no corporate sponsorship tiers, no ads)

### 2.2 Organizational Structure

**For v1:** Informal collective anchored by the GitHub organization. Domain registered by a trusted individual with clear succession terms documented in GOVERNANCE.md.

**Future option:** Formalize via Open Collective (transparent finances, fiscal sponsorship) if the community grows and needs legal standing.

### 2.3 Contributor Model

| Role | Access | Responsibilities |
|------|--------|------------------|
| **Maintainers** (2-3 people) | Merge rights, DNS access, content admin | Editorial standards, infrastructure, dispute resolution |
| **Content contributors** | PR access to content/ folder | Write articles, submit events, propose resources |
| **Code contributors** | PR access to src/ and data/ | Dashboard features, collectors, site improvements |
| **Community members** | Read, discuss, share | Feedback, evangelism, issue reporting |

### 2.4 Funding Model

**Fully community-funded. No tiers, no logos, no influence.**

**Costs (estimated annual):**
| Item | Cost |
|------|------|
| Domain (openfinance-os.org) | ~$15 |
| Hosting (Cloudflare Pages) | $0 |
| Analytics (Plausible) | ~$90 (or self-hosted free) |
| **Total** | **<$110/year** |

**Funding sources:**
- GitHub Sponsors or Open Collective
- Direct contributions from community members

**What we won't do:**
- Sponsored content
- "Partner" logos
- Paid placement or rankings
- Accept funding that implies editorial influence

---

## 3. Site Structure

```
openfinance-os.org/
├── /                     → Homepage: Ecosystem pulse + latest updates
├── /observatory          → Dashboard (ecosystem visibility)
├── /news                 → Community-curated news & updates
├── /events               → Calendar, hackathons, meetups
├── /learn                → Guides, glossary, getting started
├── /global               → International perspective & benchmarks
├── /community            → Contributors, working groups, how to join
├── /links                → Official resources (Al Tareq, CBUAE, etc.)
├── /about                → Mission, governance, transparency
└── /github               → Redirect to github.com/organizations/openfinance-os/
```

---

## 4. Homepage — The Pulse

**URL:** openfinance-os.org

**Purpose:** Answer "What's happening in UAE Open Finance?" in 10 seconds.

### Components

**Hero section:**
```
Open Finance OS
The community home for UAE Open Finance

[Key metric from Observatory]
X participants live in production

Community-built. Open source. Linking to what matters.

[Explore the Observatory]  [Join the Community]
```

**Latest updates:** (3-4 cards)
- Recent news items
- Upcoming events
- New resources added

**Observatory preview:**
- Mini donut chart: Sandbox / Production-ready / Live
- "See the full dashboard →"

**Quick links strip:**
- New here? Start with the basics →
- Official resources → Al Tareq, CBUAE
- Contribute on GitHub →

**Footer:**
- github.com/organizations/openfinance-os/
- "Built by the community, for the community"
- "Last updated: [timestamp]"
- Open Collective / GitHub Sponsors link

---

## 5. Observatory Dashboard

**URL:** openfinance-os.org/observatory

### 5.1 Data Source

The Observatory pulls data from the **Raidiam Trust Framework Directory API**:

**Primary endpoint:** `https://data.directory.openfinance.ae/participants`

**Available data points:**

| Data Point | Use in Observatory |
|------------|-------------------|
| Organization name & legal entity | Participant list, cards |
| Status (Active/Inactive) | Status badges, filtering |
| Roles (LFI, BDSP, BSIP, ISP, TPP) | Role breakdown charts |
| Registration numbers | Verification/linking |
| City/Location | Geographic distribution |
| API families exposed | API availability matrix |
| Authorization server URLs | "Live in production" indicator |

**Current ecosystem (as of initial research):**
- 10 Licensed Financial Institutions (LFIs) registered
- All major UAE banks: ADIB, CBD, ADCB, Mashreq, ENBD, DIB, FAB, WIO Bank, HSBC
- API families: Account Information, Payments, Confirmation of Payee, Products

### 5.2 Dashboard Components

**Additions for site context:**

**Header:**
```
Observatory
Real-time visibility into UAE Open Finance ecosystem health

Data derived from public registry metadata. Not official statistics.
Last updated: [date/time UTC]
```

**Transparency links:**
- "How we calculate this" → /observatory/methodology
- "Data sources" → /observatory/sources
- "See an error?" → GitHub issue template

**Methodology page** (/observatory/methodology):
- Environment status derivation rules
- Role classification logic
- Update frequency and process
- Known limitations

---

## 6. News & Updates

**URL:** openfinance-os.org/news

### 6.1 Content Types

| Type | Label | Source |
|------|-------|--------|
| Regulatory | `official` | CBUAE, Al Tareq announcements |
| Ecosystem | `milestone` | Go-lives, certifications, launches |
| Community | `community` | Contributed articles, tutorials |
| International | `global` | Relevant developments elsewhere |
| Opinion | `opinion` | Clearly labeled commentary |

### 6.2 Article Format

```markdown
---
title: "Bank X goes live on Al Tareq"
date: 2025-01-15
type: milestone
author: Community  # or contributor name
source: https://official-source.ae/announcement
---

Brief summary of what happened.

[Read the official announcement →](https://...)
```

### 6.3 Editorial Standards

- Always link to primary sources
- No speculation on unreleased regulations
- No vendor pitches
- Clear labeling of content type
- Factual tone for official/milestone content
- Opinion pieces clearly marked

### 6.4 Contribution Process

1. Fork repo, add markdown file to `content/news/`
2. Open PR with brief description
3. Maintainer reviews for standards
4. Merge and auto-deploy

---

## 7. Events

**URL:** openfinance-os.org/events

### Event Types

| Type | Examples |
|------|----------|
| Community | Meetups, hackathons, workshops |
| Official | CBUAE consultations, Al Tareq webinars (linked) |
| International | Relevant conferences |

### Event Format

```markdown
---
title: "Open Finance Hackathon 2025"
date: 2025-03-15
end_date: 2025-03-16
type: community
location: Dubai, UAE
url: https://event-registration.com
---

Brief description. What to expect. Who should attend.
```

### Submission

- PR to `content/events/`
- Anyone can submit
- Maintainers verify legitimacy (no spam, real events)

---

## 8. Learn

**URL:** openfinance-os.org/learn

### Structure

```
/learn
├── /getting-started      → "New to UAE Open Finance?"
├── /for-tpps             → TPP/Fintech guidance
├── /for-banks            → LFI perspective
├── /for-developers       → Technical resources
├── /glossary             → Terms and definitions
└── /faq                  → Common questions
```

### Content Principles

- **Link first:** If official docs exist, link to them
- **Fill gaps:** Only create content that doesn't exist elsewhere
- **Community voice:** Practical tips, gotchas, lessons learned
- **Keep current:** Review dates on all content, flag stale material

### Example: Getting Started

```markdown
# New to UAE Open Finance?

## What is Open Finance?
[Brief explanation in plain language]

## The official framework
The UAE's Open Finance framework is operated by [Al Tareq](https://...).
For official documentation, start here: [link]

## Key concepts
- **TPP** — Third Party Provider [link to glossary]
- **AISP/PISP** — [brief explanation]
- **Trust Framework** — [brief explanation]

## Getting involved
- **As a fintech:** [Link to official registration process]
- **As a bank:** [Link to official guidance]
- **As a developer:** [Link to sandbox access]

## Community resources
- [Community-contributed onboarding tips]
- [Common questions answered]
```

---

## 9. Global Perspective

**URL:** openfinance-os.org/global

### Purpose

Position UAE Open Finance in international context. Learn from other jurisdictions. Show trajectory.

### Content

**Benchmark overview:**
- Table comparing UAE, UK, EU, Brazil, Australia, Saudi, Bahrain
- Metrics: Participant counts, API standards, go-live timeline

**Jurisdiction profiles:**
- /global/uk — UK Open Banking summary
- /global/eu — PSD2/PSD3 overview
- /global/brazil — PIX + Open Finance
- /global/gcc — Regional developments

**Insights:**
- "What UAE can learn from UK's journey"
- "Cross-border interoperability trends"

**Tone:** Educational, contextual. Not "UAE is winning/losing."

---

## 10. Community

**URL:** openfinance-os.org/community

### Components

**Contributors:**
- List of active contributors (opt-in)
- Maintainer profiles

**How to contribute:**
- Content contributions
- Code contributions
- Reporting issues
- Spreading the word

**Communication:**
- GitHub Discussions (primary): github.com/openfinance-os/community-website/discussions
- Optional future: Discord/Slack if demand exists

**Working groups** (future):
- Documentation
- Observatory collectors
- International expansion

---

## 11. Official Links

**URL:** openfinance-os.org/links

**Purpose:** Be the helpful signpost. One page, well-maintained.

```markdown
# Official Resources

## UAE Regulatory
- [CBUAE Open Finance](https://...)
- [Open Finance Regulation](https://...)

## Al Tareq Platform
- [Main Portal](https://...)
- [Developer Documentation](https://...)
- [Registration Process](https://...)

## International References
- [UK Open Banking](https://...)
- [EU PSD2](https://...)
- [Brazil Open Finance](https://...)

---
Last verified: [date]
See an outdated link? [Open an issue](https://github.com/openfinance-os/...)
```

---

## 12. About

**URL:** openfinance-os.org/about

### Sections

**Mission:**
```
Open Finance OS exists to make the UAE Open Finance ecosystem 
visible, accessible, and welcoming.

We are a community of developers, fintechs, bankers, and 
enthusiasts who believe open ecosystems thrive on transparency.

We are not official. We are not affiliated. We are contributors.
```

**Governance:**
- Link to GOVERNANCE.md
- Current maintainers
- Decision-making process

**Transparency:**
- Funding sources and expenses
- Link to Open Collective (if used)

**Contact:**
- GitHub Issues for public discussion
- Email for sensitive matters (optional)

---

## 13. Technical Architecture

### Stack

```
┌─────────────────────────────────────────────────────────┐
│                   openfinance-os.org                     │
├─────────────────────────────────────────────────────────┤
│  Static site: Astro                                     │
│  Content: Markdown in /content (Git-managed)            │
│  Observatory: JSON snapshots in /data                   │
├─────────────────────────────────────────────────────────┤
│  Hosting: Cloudflare Pages                              │
│  DNS: Cloudflare                                        │
│  CI/CD: GitHub Actions                                  │
│  Analytics: Plausible (privacy-respecting)              │
└─────────────────────────────────────────────────────────┘
```

### Observatory Data Pipeline

The Observatory fetches data from the **Raidiam Trust Framework Directory API**.

```
┌─────────────────────────────────────────────────────────────┐
│              GitHub Actions (Scheduled Cron)                │
│                   Daily at 06:00 UTC                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────┐         ┌─────────────────────────┐   │
│   │  Collector      │ ──────► │ data.directory.         │   │
│   │  Script (Node)  │  fetch  │ openfinance.ae          │   │
│   │                 │ ◄────── │ /participants           │   │
│   └────────┬────────┘  JSON   └─────────────────────────┘   │
│            │                                                │
│            ▼                                                │
│   ┌─────────────────┐                                       │
│   │ data/observatory/│  (Snapshot committed to repo)       │
│   │ snapshots/       │                                      │
│   │ - latest.json    │                                      │
│   │ - YYYY-MM-DD.json│  (Historical archive)               │
│   └────────┬────────┘                                       │
│            │                                                │
│            ▼                                                │
│   ┌─────────────────┐                                       │
│   │ git commit      │  (Each snapshot = version history)   │
│   │ git push        │                                       │
│   └─────────────────┘                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
             │
             ▼ triggers
┌─────────────────────────────────────────────────────────────┐
│              Astro Build (Cloudflare Pages)                 │
│   - Imports JSON from /data at build time                   │
│   - Generates static Observatory dashboard                  │
│   - No runtime API calls = fast, reliable                   │
└─────────────────────────────────────────────────────────────┘
```

**Key benefits:**

- **No runtime dependencies** — Static site, no API calls at page load
- **Git history = time series** — Each commit provides historical data for trend charts
- **Fully transparent** — All collection logic is open source and auditable
- **No authentication required** — Directory API is publicly accessible
- **Low cost** — No database, no backend server, just GitHub Actions

### Repository

**Location:** github.com/openfinance-os/openfinance-os.org

```
openfinance-os.org/
├── src/
│   ├── pages/
│   ├── components/
│   └── layouts/
├── content/
│   ├── news/
│   ├── learn/
│   ├── events/
│   ├── global/
│   └── links.md
├── data/
│   ├── observatory/
│   │   ├── snapshots/
│   │   │   ├── latest.json          # Current state
│   │   │   └── YYYY-MM-DD.json      # Historical snapshots
│   │   └── config.json
│   └── global/
│       └── benchmarks.json
├── scripts/
│   ├── collect-directory.js          # Fetches from Raidiam API
│   ├── generate-snapshot.js          # Processes & transforms data
│   └── utils/
│       └── directory-client.js       # API client for Trust Framework
├── public/
│   └── assets/
├── .github/
│   ├── workflows/
│   │   ├── build.yml
│   │   ├── observatory-update.yml    # Daily cron to fetch directory data
│   │   └── link-check.yml
│   └── ISSUE_TEMPLATE/
├── docs/
│   ├── CONTRIBUTING.md
│   ├── GOVERNANCE.md
│   └── EDITORIAL.md
└── README.md
```

### Automation

| Workflow | Trigger | Action |
|----------|---------|--------|
| Build & deploy | Push to main | Build site, deploy to Cloudflare |
| Observatory update | Daily 06:00 UTC | Fetch from `data.directory.openfinance.ae/participants`, generate snapshot, commit, trigger rebuild |
| Link check | Weekly | Verify external links, create issue if broken |

### Collector Script Specification

**Input:** `https://data.directory.openfinance.ae/participants`

**Output:** `data/observatory/snapshots/latest.json`

```json
{
  "timestamp": "2025-01-15T06:00:00Z",
  "source": "data.directory.openfinance.ae",
  "summary": {
    "total_participants": 10,
    "by_status": { "Active": 10, "Inactive": 0 },
    "by_role": { "LFI": 10, "BDSP": 8, "BSIP": 6, "TPP": 0 },
    "by_city": { "Dubai": 5, "Abu Dhabi": 5 },
    "api_families": ["accounts", "payments", "cop", "products"]
  },
  "participants": [
    {
      "id": "...",
      "name": "Abu Dhabi Islamic Bank P.J.S.C",
      "short_name": "ADIB",
      "status": "Active",
      "roles": ["LFI", "BDSP"],
      "city": "Abu Dhabi",
      "registration_number": "01.01.02.042.1997.01",
      "api_families": ["accounts", "payments", "cop"],
      "has_auth_server": true
    }
  ]
}
```

**Processing logic:**

1. Fetch raw participant data from directory API
2. Extract and normalize fields (name, status, roles, location)
3. Derive `has_auth_server` from presence of authorization server URLs
4. Calculate summary statistics
5. Write to `latest.json` and dated archive file
6. Commit and push to trigger site rebuild

---

## 14. Design Principles

> **Brand assets location:** `/brand/` — See `/brand/openfinance-os-brand-guidelines.html` (v2.0, Clear signal) and `/brand/logo-preview.html`. Reusable skill: `brand/skills/openfinance-os-brand/SKILL.md`.

### Visual Identity

- **Clean and institutional** — trustworthy, not flashy
- **Open source aesthetic** — GitHub-inspired, developer-friendly
- **UAE-contextual** — subtle, not literal (no flags/landmarks)
- **Accessible** — WCAG 2.1 AA, mobile-first

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#0D4F4F` | Main brand color, headers |
| Primary Light | `#1A6B6B` | Gradients, hover states |
| Accent | `#E8A85C` | Restrained signal point and highlights |
| Accent Light | `#F5C989` | Gradient stops |
| Surface | `#F6F8F5` | Light page backgrounds |
| Dark | `#102423` | Dark mode background |
| Text | `#132C2B` | Light-mode body text |
| Text Secondary | `#526662` | Light-mode secondary text, taglines |

### Typography

| Font | Weights | Usage |
|------|---------|-------|
| DM Sans | 400, 500, 600, 700 | Display, body, UI, wordmark; 500 for display headings |
| JetBrains Mono | 400, 500 | Code, IDs, literal technical values |

DM Sans is served locally from `/fonts/` with its SIL Open Font License. Fraunces is retired. The v2 open-circle mark replaces the original globe tile. Keep the Open Circuit animation below the homepage opening screen with muted inline playback, poster fallback, reduced-motion/data-saving support, and pause/play/replay controls.

### Logo Assets

All assets in `/brand/`:

| Asset | File | Usage |
|-------|------|-------|
| Full logo | `logo-full.svg` | Website header, documentation, README |
| Full logo (PNG) | `logo-full-*.png` | Social media, presentations (360, 720, 1440px) |
| Icon | `logo-icon.svg` | Avatars, app icons |
| Icon (dark) | `logo-icon-dark.svg` | Dark backgrounds with glow effect |
| Icon (PNG) | `logo-icon-*.png` | Various sizes (32, 64, 128, 256, 512px) |
| Favicon | `logo-favicon.svg` | Browser tab |
| Favicon (PNG) | `favicon-16.png`, `favicon-32.png` | Legacy browser support |
| Apple Touch | `apple-touch-icon.png` | iOS home screen |
| Android | `android-chrome-*.png` | Android PWA icons (192, 512px) |

### Usage Guidelines

**Do:**
- Maintain adequate clear space around the logo
- Preserve aspect ratio when scaling
- Use dark variant on dark backgrounds for glow visibility
- Use simplified favicon version at sizes under 48px

**Don't:**
- Stretch, rotate, or distort the logo
- Change the colors or gradients
- Add effects (shadows, outlines) not in the original design
- Use the full logo at sizes too small to read

### Design Rationale

| Element | Symbolism |
|---------|-----------|
| Globe/network circles | Interconnected ecosystem — banks, TPPs, regulators |
| Orbital rings | Participation levels — sandbox, production-ready, live |
| Four cardinal nodes | Key stakeholders — Banks (LFIs), TPPs, Regulators, Developers |
| Amber accent dot | "Live" indicator — activity, momentum, growth |
| Rounded square | Modern app icon aesthetic, software/platform |
| Teal primary | Trust, stability, professionalism for financial services |
| Warm amber accent | Approachability, community warmth, activity |

---

## 15. Phased Rollout

### Phase 1: Foundation (4-6 weeks)

- [ ] Register openfinance-os.org
- [ ] Set up GitHub repo structure
- [ ] Basic site: Homepage, About, Links
- [ ] Observatory v1 dashboard
- [ ] CONTRIBUTING.md, GOVERNANCE.md
- [ ] Deploy to Cloudflare Pages

**Launch:** Soft launch, share in community channels

### Phase 2: Content (Weeks 6-12)

- [ ] News section with 5-10 initial posts
- [ ] Learn section: Getting Started, Glossary
- [ ] Events calendar
- [ ] Recruit 2-3 additional contributors
- [ ] Analytics setup

### Phase 3: Growth (Months 3-6)

- [ ] Global perspective section
- [ ] Observatory v2: time-series, funnel
- [ ] First "State of Open Finance" quarterly post
- [ ] Active GitHub Discussions
- [ ] Regular content cadence (1-2 posts/week)

### Phase 4: Maturity (Months 6-12)

- [ ] International benchmark comparisons
- [ ] Multiple active contributors
- [ ] Referenced by official channels
- [ ] Sustainable, self-running community

---

## 16. Success Metrics

### Engagement

| Metric | 6-month target |
|--------|----------------|
| Monthly visitors | 500+ |
| GitHub stars | 50+ |
| Returning visitor rate | 30%+ |

### Authority

- Inbound links from banks, TPPs, or official channels
- Citations in presentations or articles
- Requests for comment or contribution

### Community Health

| Metric | 6-month target |
|--------|----------------|
| Active contributors | 5+ |
| Content PRs per month | 2+ |
| GitHub Discussion threads | 10+ |

### Ecosystem Impact

- Reduced "where do I start?" friction
- Newcomers cite site as helpful
- Official channels aware and neutral-to-positive

---

## 17. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Perceived as competing with official channels | Medium | High | Clear disclaimers, always link to official, "community" language |
| Content goes stale | Medium | Medium | Review dates, automated link checks, community accountability |
| Single maintainer burnout | High | High | Minimum 2-3 maintainers, documented processes, low-maintenance stack |
| Low engagement | Medium | Low | Start small, prove value with Observatory, grow organically |
| Regulatory concern | Low | High | No PII, no commercial content, responsive to feedback, transparent governance |

---

## 18. Key Documents to Create

| Document | Location | Purpose |
|----------|----------|---------|
| README.md | Repo root | What this is, how to run locally |
| CONTRIBUTING.md | /docs | How to contribute content and code |
| GOVERNANCE.md | /docs | Decision-making, maintainers, succession |
| EDITORIAL.md | /docs | Content standards, tone, labeling |
| CODE_OF_CONDUCT.md | Repo root | Community standards |

---

## 19. Open Questions

1. **Domain registration:** Who registers? Document handover terms in GOVERNANCE.md
2. **Initial maintainers:** Confirm 2-3 founding maintainers
3. **Soft launch timing:** Coordinate with any upcoming community events?
4. **Official awareness:** Informal heads-up to Al Tareq contacts?
5. ~~**Observatory data access:** Confirm API availability and terms~~ **RESOLVED:** `data.directory.openfinance.ae/participants` is publicly accessible, no authentication required
6. **API rate limits:** Confirm any rate limiting on directory API (daily fetch should be fine)
7. **Additional data endpoints:** Explore other Raidiam Trust Framework endpoints for richer data (e.g., API discovery, certificates)

---

## 20. Why This Matters

Open Finance in the UAE is happening. Banks are live. TPPs are onboarding. Transactions are flowing.

But ecosystems don't thrive on infrastructure alone. They need:

- **Visibility** — Can people see what's happening?
- **Accessibility** — Can newcomers find their way in?
- **Community** — Is there a place to gather, share, learn?

Official channels handle compliance and operations. **Open Finance OS.org** handles the rest.

Built by the community. Open source. For everyone who wants this ecosystem to flourish.

---

Ready to draft GOVERNANCE.md, CONTRIBUTING.md, or the homepage wireframe?