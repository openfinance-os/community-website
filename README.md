# OpenFinance-OS

**The community home for UAE Open Finance**

[![Build](https://github.com/openfinance-os/community-website/actions/workflows/build.yml/badge.svg)](https://github.com/openfinance-os/community-website/actions/workflows/build.yml)
[![Observatory Update](https://github.com/openfinance-os/community-website/actions/workflows/observatory-update.yml/badge.svg)](https://github.com/openfinance-os/community-website/actions/workflows/observatory-update.yml)

---

A community-owned website providing visibility into the UAE Open Finance ecosystem. Built with Astro, powered by open data.

## What is this?

OpenFinance-OS.org is a grassroots initiative that provides:

- **Observatory** — Real-time dashboard showing ecosystem participants, roles, and API coverage
- **Ecosystem Watch** — Independent weekly monitor of volumes, standards changes, and CBUAE release compliance ([/observatory/watch/](https://openfinance-os.org/observatory/watch/), see [tools/watch/README.md](tools/watch/README.md))
- **News** — Community-curated updates about UAE Open Finance
- **Learn** — Resources for developers, fintechs, and banks
- **Community** — A gathering point for collaboration and discussion

### What this is NOT

- Not an official regulator or scheme operator site
- Not affiliated with any single bank or TPP
- Not a commercial platform or vendor showcase

We link to official sources. We don't replace them.

## Quick Start

Use Node.js 22.23.1 (pinned in `.node-version`); Astro requires Node.js 22.22.0 or newer.

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The site will be available at `http://localhost:4321`

## Project Structure

```
├── src/
│   ├── components/     # Astro components
│   ├── content/        # Markdown content (news, etc.)
│   ├── layouts/        # Page layouts
│   ├── pages/          # Route pages
│   └── styles/         # Global CSS
├── brand/              # Logo and brand assets
├── data/
│   └── observatory/    # Ecosystem data snapshots
├── scripts/            # Data collection scripts
├── public/             # Static assets
└── docs/               # Governance & contribution docs
```

## Observatory Data

The Observatory pulls data from the **Raidiam Trust Framework Directory API**:

```
https://data.directory.openfinance.ae/participants
```

Data is collected daily via GitHub Actions and stored as JSON snapshots in `/data/observatory/snapshots/`.

### Manual Data Collection

```bash
# Fetch latest data (dry run)
npm run collect:dry

# Fetch and save data
npm run collect
```

## News Curation

A daily workflow (`.github/workflows/news-curation.yml`) runs `scripts/curate-news.ts`, which
pulls candidate stories from RSS and Google News search feeds, the Nebras news page, the CBUAE
homepage (plus NewsAPI when a key is set), scores them, and keeps only items that clear a
confidence gate for open finance, open banking, and the UAE programme (CBUAE Open Finance,
Nebras, Al Tareq). Accepted stories are summarised with Claude (`ANTHROPIC_MODEL`, default
`claude-haiku-5-5`) and opened as one daily digest PR. Summaries that copy the source
description, or that introduce numbers or names the source does not contain, are dropped.
Sources, weights and thresholds live in `data/news-curation/sources.json`.

What gets filtered out before scoring:

- Event, webinar, whitepaper and other gated or promotional pages (`eventUrlPatterns`,
  `eventTitlePatterns`)
- Items dated in the future (event listings) or older than `lookbackHours`
- Global stories that never mention an open banking / open finance term
  (`requireCoreTermForGlobal`)
- Anything already published, or already proposed in an open or closed PR (including items
  inside a previous digest)

Minimum scores are tiered by region (`regionThresholds`): UAE stories need the least, global
stories the most. The confidence gate then requires an open-finance or open-banking term.
A core term in the title is enough; a mention that only appears in the body is not, unless
the item is also about the UAE programme.

```bash
# Preview what the curator would propose (no PRs, no Slack)
npm run curate-news:dry

# Same, with per-article rejection reasons and score breakdowns
npx tsx scripts/curate-news.ts --dry-run --verbose
```

## Brand

Brand assets are in `/brand/`. See `/brand/logo-preview.html` for the complete visual guide.

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#0D4F4F` | Main brand color |
| Primary Light | `#1A6B6B` | Gradients, hover states |
| Accent | `#E8A85C` | Highlights, CTAs |

**Typography:** DM Sans (body) + Fraunces (headings)

## Contributing

We welcome contributions! See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

### Content Contributions

1. Fork the repo
2. Add/edit markdown in `src/content/`
3. Open a PR with a brief description

### Code Contributions

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Open a PR

## Documentation

- [Contributing Guide](docs/CONTRIBUTING.md)
- [Governance](docs/GOVERNANCE.md)
- [Editorial Standards](docs/EDITORIAL.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Product Requirements](PRD.MD)

## Tech Stack

- **Framework:** [Astro 7.3](https://astro.build)
- **Styling:** CSS with custom properties
- **Fonts:** DM Sans, Fraunces, JetBrains Mono
- **Hosting:** Cloudflare Pages
- **CI/CD:** GitHub Actions

## License

MIT License — see [LICENSE](LICENSE) for details.

---

Built by the community, for the community.

## Brand and design

The Clear signal identity is maintained in `brand/openfinance-os-brand-guidelines.html`, with the published mirror in `public/brand/`. Use DM Sans for display and UI, the open-circle logo assets, and semantic theme tokens from `src/styles/global.css`. Keep the approved Open Circuit animation and its accessible playback behavior.

The reusable Codex skill is `brand/skills/openfinance-os-brand/`. Its discoverable local installation belongs in `~/.codex/skills/openfinance-os-brand/`; copy that folder when installing or updating it. Update both guideline copies and the skill together when the identity changes.
