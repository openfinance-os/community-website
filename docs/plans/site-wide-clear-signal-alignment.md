# Open Finance OS site-wide Clear signal alignment

Audit date: 10 October 2026. Baseline: main `07356b49fccf1f90b00720d133b212e0089f1b86` (MiddleLeap logo PR #603). Scope: brand guide v2.2 and the canonical Open Finance OS brand skill. No product source files were changed during this audit.

## Coverage and evidence

The build contains 323 HTML files: 219 rendered pages and 104 registration-name redirect aliases. Every alias resolves to an existing generated target. Every rendered page was visited at 1440px and 390px in explicit light and dark mode. Thirty-six representative routes additionally covered 320px and 768px in both themes, including production/sandbox participant templates, Commons resources, news articles, every main section, Learn guides, Watch, and brand reference pages. Total: 1,020 browser cases.

No page-load failures or JavaScript page errors were observed. Twenty cases exhibited document-level horizontal overflow across six routes. Automated text contrast scanning flagged 153 distinct selector/colour combinations across 729 cases; these are candidates rather than an accessibility certification. Manual inspection and source review confirmed the issues listed below. Gradient backgrounds, SVG text, and decorative hidden content were excluded from the text scanner. External network requests were blocked to make the local audit deterministic; remote destinations and remote font availability were not assessed.

Local evidence artifacts are in the `site-design-audit/` visualization folder (not committed): `inventory.json`, `results.json`, `summary.json`, screenshots for each representative section, and focused defect screenshots. Screen-reader testing and a full manual keyboard pass were not performed during this initial audit.

## Confirmed issues

| Priority | Finding | Evidence | Owning files |
| --- | --- | --- | --- |
| High | Commons resource sidebars, buttons, disclaimers, and code blocks use pale inverted gray fills behind light text in dark mode. | `commons-sidebar-dark.png`; details text measured 1.29:1 and some code text approximately 1.02:1. | `src/pages/commons/[slug].astro`, `src/pages/commons/index.astro`, `src/components/commons/InstallCommand.astro`, `src/styles/global.css` |
| High | Participant headings and metadata have insufficient contrast in both themes. Sandbox website buttons have white text on orange (2.15:1). | Both participant detail templates; section headings 2.38:1 light and 2.80:1 dark. | `src/pages/observatory/participant/[slug].astro`, `src/pages/observatory/sandbox/participant/[slug].astro` |
| High | Shared regulatory badges use white text on the inverted primary scale (2.09:1 in dark mode); active navigation and other shared text are too dim. | Regulatory badges repeat across article pages; active desktop navigation 2.63:1; footer freshness text 3.42:1 in dark mode. | `src/components/common/Badge.astro`, `Header.astro`, `Footer.astro`, `SearchDialog.astro`, `src/styles/global.css` |
| High | Participant cards and grids overflow at several screen sizes, including Sandbox desktop and tablet. | Sandbox: 505px document width at 320/390px, 937px at 768px, 1476px at 1440px. Production directory: 377px at 320px. | `src/components/observatory/ParticipantCard.astro`, `src/pages/observatory/index.astro`, `src/pages/observatory/sandbox/index.astro` |
| High | Three other page grids and Watch charts overflow narrow screens. | Commons 337px, News 330px, Methodology 344px at 320px; Watch 405px at 320/390px. | `src/pages/commons/index.astro`, `src/pages/news/index.astro`, `src/components/news/NewsCard.astro`, `src/pages/observatory/methodology.astro`, `tools/watch/watch.template.html` |
| Medium | Secondary pages retain earlier blue-gray surfaces, gradients, heavy display headings, and monospace UI labels rather than the approved semantic palette and typography. | `news-first-screen-dark.png`, `global-first-screen-dark.png`, and page source styles. | News/Updates; Learn guides; Global regional pages; Commons; About/Community; Observatory templates and charts |
| Medium | Ecosystem Watch is a separate fixed-dark, blue-accent dashboard with system typography; it does not follow the selected light theme or shared branding. | `watch-first-screen-light.png`; body font is system UI and its light/dark outputs are identical. | `tools/watch/watch.template.html`, `src/pages/observatory/watch/index.html.ts` |
| Low | The logo specimen uses system typography rather than the locally hosted DM Sans reference. | `/brand/logo-preview.html` computed body font. | `brand/logo-preview.html`, `public/brand/logo-preview.html` |

## Proposed implementation

### 1. Shared foundations

Update `src/styles/global.css` with semantic text, surface, border, link, and status-text roles. Migrate affected shared components to those roles instead of relying on inverted numbered palettes. Fix active navigation, search hints, footer metadata, badges, and card surfaces at their owners. Keep the approved Open Finance OS mark, MiddleLeap lockup, homepage composition, and Open Circuit media/playback behavior intact. Preserve existing raw directory labels and evidence distinctions.

### 2. Interior page design

Establish one reusable interior-page introduction treatment: DM Sans 500 display headings, calm page surfaces, secondary text, fine borders, and consistent spacing/container widths. Apply it to News/Updates, Learn, Global, Commons, About/Community, and Observatory rather than leaving divergent per-page hero treatments. Use DM Sans for ordinary interface labels and retain monospace for code, IDs, dates, and literal technical values.

Files: `src/layouts/PageLayout.astro`, relevant shared components, and all 29 Astro page templates under `src/pages/`. Prefer shared tokens/components and small local edits; preserve page content and interaction behavior.

### 3. Dark-mode details

Replace hard-coded white or inverted gray background declarations with card/soft/page tokens. Keep primary button fills stable across themes. Use theme-aware status text and backgrounds in badges, participant details, charts, resource panels, installation snippets, and official-source pointers. Verify code syntax colours against their actual surface.

Additional owners: `src/components/news/NewsCard.astro`, `NewsFilter.astro`; `src/components/learn/OperatorPointer.astro`; `src/components/commons/InstallCommand.astro`, `PlatformBadges.astro`, `AiToolBadge.astro`; chart/stat components under `src/components/observatory/`; both generated participant-detail templates and the generated article/resource templates.

### 4. Responsive grids and controls

Allow grid and flex children to shrink; bound minimum card widths by the available viewport; wrap participant names, raw family labels, and long identifiers. Keep genuine wide data tables in accessible local scroll containers rather than allowing the whole document to scroll horizontally. Resize or locally scroll Watch charts without hiding data. Check filter labels, navigation, buttons, pagination, and theme/search controls for mobile usability and visible keyboard focus.

### 5. Integrate Watch and reference pages

Give Ecosystem Watch the shared local fonts, brand palette, logo, light/dark preference behavior, and compatible navigation/attribution. Keep its payload, metrics, caveats, source links, freshness rules, no-JavaScript briefing, chart values, and weekly generator contracts intact. Update the standalone template and route injection together; retain its data dashboard structure.

Align both copies of the logo specimen. Document interior-page, chart, code-panel, and standalone-dashboard rules in both brand guides and the canonical/installed skill, so the same issues are not reintroduced.

## Acceptance and validation

- Rebuild and repeat the same 1,020-case page matrix; all 219 rendered routes remain reachable and every alias still resolves.
- Zero document-level overflow in the tested cases. Confirm wide tables scroll locally and remain usable by keyboard.
- Recheck confirmed low-contrast elements and shared components against AA text contrast in both themes; manually inspect unresolved gradient/chart cases.
- Run Astro check, format checks, unit tests, existing Chromium E2E suite, and Watch Python tests. Add focused regression coverage for the demonstrated grid/contrast/theme failures rather than tests that merely mirror CSS declarations.
- Exercise search, theme persistence/system preference, mobile menu/Escape/focus, directory filters/compare/CSV, Watch navigation, news filters, and installation controls.
- Review representative screenshots at 320px, 390px, 768px, and desktop, including 200% zoom and reduced-motion animation behavior.
- Confirm canonical/published guide and assets, canonical/installed skill parity, and unchanged animation bytes/playback semantics.
- Present the completed preview and scoped diff for release review; production verification follows the separately authorized PR/merge stage.

## Completed implementation — 10 October 2026

Implemented on `codex/site-wide-clear-signal-alignment` from the audited main baseline. Interior templates and shared components now use Clear signal semantic surfaces/text, DM Sans interface typography, medium display headings, stable filled controls and distinct accessible status text. Fixed grid track minimums, participant wrappers, narrow card headers, source URL wrapping and mobile controls. Code uses a stable dark surface and GitHub's high-contrast syntax theme.

Ecosystem Watch now renders through `src/pages/observatory/watch/index.astro` and the existing `PageLayout`, giving it the shared header, search, persisted/system theme, Observatory navigation and founder footer. `src/lib/watch-document.ts` embeds the saved payload and no-JavaScript briefing, and scopes the dashboard template CSS to its content. Numeric data, caveats, sources, dates and chart contracts are preserved. The shared layout explicitly preserves Watch's narrower navigation-only analytics instead of adding general-site tracking.

Updated canonical/published brand guidelines and specimen to v2.3 and synchronized the installed brand skill. Open Circuit's component, video and poster bytes are unchanged. Existing draft Commons resources remain unpublished; copy behavior was checked on the published contribution template.

### Validation evidence

- Rebuilt all pages. The same 219 rendered routes and 104 redirect aliases remain; every alias target exists.
- Repeated the 1,020-case matrix: zero document overflow, zero page errors, zero unexpected HTTP failures and zero automated text-contrast candidates. Body typography is locally hosted DM Sans throughout. The baseline was 20 overflow cases and 153 distinct contrast candidates.
- Checked six representative pages at a 720 CSS-pixel viewport, equivalent to a 1440px browser at 200% zoom, in both themes: no document overflow. This validates responsive reflow, not every browser's native zoom implementation.
- Inspected corrected mobile menus, search dialog, participant grids, Commons sidebar/code, news and Watch screenshots. Confirmed keyboard Escape/focus restoration, system/stored theme, Watch navigation, directory comparison/CSV, reduced-motion/media behavior and published code copying through browser regressions.
- 154 unit tests passed. All 66 Chromium tests passed: 55 existing regressions and 11 added design/Watch/code regressions. All six Watch Python suites passed; MiddleLeap's contrast checker passed 43/43 required pairs.
- Astro check: zero errors, zero warnings, 28 existing hints. Build, scoped formatting and `git diff --check` passed. Canonical/published guides/specimen and canonical/installed skill match byte-for-byte; animation source/media match the baseline.

After-fix evidence: the local `site-design-aligned/` visualization folder contains the full inventory/results/summary, representative screenshots, opened-search/mobile-menu/code screenshots, and `interaction-checks.json`. Browser test logs are under `/private/tmp/align-*`.

Limitations: the automated contrast scan excludes gradients, SVG text and hidden decorative content. Representative visuals and interactions were inspected, but this is not a complete screen-reader/accessibility certification or a production deployment assessment. Local preview is `http://127.0.0.1:4330/`; publication remains a separate release step.


## Release review — 10 October 2026

A second review covered keyboard states, SVG chart labels and effective opacity in inactive capability cards. It found and corrected dimmed inactive descriptions, gray SVG axis labels, an opacity-reduced chart period label, insufficiently contrasted/light-mode Watch tooltips, mobile tooltip overflow, undersized search controls and invisible keyboard selection in dark-mode search results. Directory search/select focus now uses the semantic brand ink with a clear outline. Watch information is a native 44px button with a smaller visual glyph, an accessible description, bounded tooltip placement and Escape dismissal that preserves focus.

Added regressions exercise light/dark tooltip contrast and bounds, hover plus keyboard dismissal, chart/inactive-card contrast including ancestor opacity, and keyboard search result focus. The public guide footer now consistently reports v2.3. This release leaves Open Circuit source/video/poster and the MiddleLeap logo assets unchanged.


Release regression results: all 72 Chromium tests passed (55 existing and 17 design/Watch/code tests); 154 unit tests and all six Watch Python suites passed; MiddleLeap contrast checker passed 43/43. Astro check reported zero errors, zero warnings and 28 existing hints. Build and scoped formatting passed. The initial second-review browser run overlapped a rebuild and observed temporary missing routes/assets; the full 72-test rerun used a stable completed preview with no rebuild overlap.

Focused release screenshots show tooltip hover/focus and keyboard search selection at 320px in both themes. The release audit is saved locally in `site-design-release-review/`; these visualization artifacts are not committed.

The final stable-build release audit completed all 1,020 cases across 219 rendered routes with zero document overflow, page errors, unexpected HTTP failures and automated HTML text-contrast candidates. All 104 redirect aliases still target existing generated pages.
