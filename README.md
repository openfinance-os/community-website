# OpenFinance-OS

**The community home for UAE Open Finance**

[![Build](https://github.com/openfinance-os/community-website/actions/workflows/build.yml/badge.svg)](https://github.com/openfinance-os/community-website/actions/workflows/build.yml)
[![Observatory Update](https://github.com/openfinance-os/community-website/actions/workflows/observatory-update.yml/badge.svg)](https://github.com/openfinance-os/community-website/actions/workflows/observatory-update.yml)

---

A community-owned website providing visibility into the UAE Open Finance ecosystem. Built with Astro, powered by open data.

## What is this?

OpenFinance-OS.org is a grassroots initiative that provides:

- **Observatory** — Real-time dashboard showing ecosystem participants, roles, and API coverage
- **News** — Community-curated updates about UAE Open Finance
- **Learn** — Resources for developers, fintechs, and banks
- **Community** — A gathering point for collaboration and discussion

### What this is NOT

- Not an official regulator or scheme operator site
- Not affiliated with any single bank or TPP
- Not a commercial platform or vendor showcase

We link to official sources. We don't replace them.

## Quick Start

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

- **Framework:** [Astro 5.0](https://astro.build)
- **Styling:** CSS with custom properties
- **Fonts:** DM Sans, Fraunces, JetBrains Mono
- **Hosting:** Cloudflare Pages
- **CI/CD:** GitHub Actions

## License

MIT License — see [LICENSE](LICENSE) for details.

---

Built by the community, for the community.
