---
name: openfinance-os-brand
description: Apply the OpenFinance-OS Clear signal identity to its website, brand assets, and designed communications, preserving community independence and precise ecosystem evidence labels.
---

# OpenFinance-OS brand

Use this skill for OpenFinance-OS design work. This identity belongs to the independent community initiative; it is separate from Al Tareq, Nebras, CBUAE, ADCB, and other organisation brands.

## Sources

In the community-website repository, read `brand/openfinance-os-brand-guidelines.html` for the full v2.3 guide and use `brand/` assets. `public/brand/` is the published mirror; update both together. The website's maintained tokens are `src/styles/global.css`. The public guide is at https://openfinance-os.org/brand/openfinance-os-brand-guidelines.html; when working on an unpublished redesign, prefer the repository guide over the older deployed copy.

The canonical skill lives in `brand/skills/openfinance-os-brand/`. Keep the local discoverable copy at `~/.codex/skills/openfinance-os-brand/` synchronized when updating it. A user's implementation request does not by itself authorize publication or contacting other people.

## Clear signal identity

- Keep the name **OpenFinance-OS**. Lead with “Open finance. In full view.” when suitable; describe the independent view of UAE Open Finance.
- Use the supplied open-circle mark with its amber point. `logo-icon.svg` and `logo-full.svg` suit light surfaces; the `-dark.svg` versions suit dark surfaces. Exported wordmarks have outlined glyphs. Do not reuse the retired globe-in-a-square logo, add glow or gradients to the mark, or stretch it.
- Leave at least one amber-dot diameter of clear space. Minimum mark size 24px; full lockup width 180px. Below that, use the mark alone.
- Use DM Sans for display, body, and UI: 500 for display headings, 400 for body, 500–600 for UI. A live wordmark uses 700 for OpenFinance and 500 for -OS. Fraunces is retired. JetBrains Mono belongs to code, IDs, and literal technical values.
- Use pale surfaces, fine borders, 8–16px corners, and generous space. Prefer purposeful flat panels over decoration. Beta is a quiet outlined label, not a glowing orange badge.

| Role | Light | Dark |
| --- | --- | --- |
| Brand ink | #0D4F4F | #CCE4D8 |
| Amber signal | #E8A85C | #E8A85C |
| Page | #F6F8F5 | #102423 |
| Card | #FFFFFF | #17302E |
| Text | #132C2B | #F1F7F1 |
| Secondary text | #526662 | #ADC1B9 |
| Border | #DCE5DF | #2F4944 |
| Soft surface | #E7EFEA | #213C36 |

Use semantic tokens such as `--color-text`, `--color-card`, and `--color-brand-ink`. Numbered gray and primary scales invert in dark mode; avoid white text on those lightened fills. `--color-primary-fill` is the stable fill for white-text primary controls. Amber is not small text on a light background. Target AA contrast and keyboard access; do not use colour as the only status cue.

## Website and animation

Keep the purpose headline, a dated directory preview, and an obvious Observatory action. Stack the homepage actions vertically on mobile so font loading cannot switch them between one and two rows. Preserve useful navigation, search, saved briefing, directory coverage, ecosystem record, news, and official developer-hub handoff.

Retain the approved Open Circuit media (`public/media/open-circuit-hero.mp4` and its `.webp` poster). `src/components/home/OpenCircuit.astro` owns playback. It is a separate prominent responsive section below the opening screen. Keep muted inline playback, no automatic looping, pause/play/replay controls, in-view loading, offscreen/document-hidden pausing, and poster fallback. Reduced-motion and data-saving modes must not fetch or autoplay it automatically. The user can explicitly request playback. Decorative circles and animation illustrate connection; they do not encode live traffic or maturity. Generate responsive still variants through the site image pipeline, using sizes that follow the displayed media box. Keep the original poster source and video unchanged. The separate image provides the fallback until playback succeeds; avoid a duplicate full-size video poster download.

## Interior pages, dark mode and mobile

Apply the same identity to all routes and generated detail pages. Use the shared `PageLayout.astro` shell for navigation, search, theme persistence and the founder footer; Watch embeds its data template within this shell. Page introductions use a medium DM Sans heading, secondary description and fine border. Keep meaningful evidence labels and controls.

Use semantic card, surface, border, text and brand-ink tokens at the component that owns the style. Use `--color-success-text`, `--color-warning-text` and `--color-error-text` for status words; graphical indicators use their own colors. Code uses `--color-code-surface` and `--color-code-text` in both themes. Never pair lightened numbered fills with white text or use an inverted numbered gray for a code surface.

Use `minmax(0, 1fr)` tracks and `min-width: 0` for grid/flex children. Wrap long names and URLs. Wide tables and code may scroll locally; the document must remain within the viewport. Aim for 44px controls. Verify every generated page in light/dark at desktop and 390px, plus representative pages at 320px and 768px, keyboard access, 200% zoom and reduced motion. Manually inspect contrast candidates. Keep inactive capability text fully legible rather than fading the whole card. Check SVG labels and effective opacity as well as HTML text. Tooltips need theme-aware contrast, viewport-bounded placement, visible keyboard focus and Escape dismissal for both hover and focus without moving focus. Keep them attached while scrolling, hide them when their trigger leaves the viewport, and allow the pointer onto the explanation. Constrain the sticky mobile menu to the screen height with locally scrollable contents, including short landscape screens. Theme controls announce the mode they will switch to; refresh their labels after system changes, selection and reload. Automated checks do not replace a complete accessibility assessment.

## Voice and data

### Founder attribution

MiddleLeap founded OpenFinance-OS as an open-source community initiative. The project remains community-led, with independent editorial decisions.

Use “A community initiative founded by MiddleLeap.” in the footer, beside the open-source credit. Present MiddleLeap as a small linked logo beside the founder wording and above the About governance explanation. Link to https://www.middleleap.com/ with the accessible name “MiddleLeap.” Keep the attribution understated.

Use the official MiddleLeap assets in `brand/middleleap/`, mirrored in `public/brand/middleleap/`. The two glyphs are the pivot mark: the settled square on the left and the ember diamond rotated 45 degrees on the right. Keep the geometry, gradient, and one square-height of clear space. The wordmark is DM Sans 600; the full lockup is at least 120px wide. Use bone/ember on dark surfaces and ink/ember-700 on light surfaces for AA text contrast. `MiddleLeapLogo.astro` renders the supplied mark and live wordmark with the correct theme. Keep this logo static and preserve Open Circuit's animation. Do not add a hero credit or promotional call to action.

The About-page governance section explains: “OpenFinance-OS was founded by MiddleLeap as an open-source community initiative. It remains community-led, with independent editorial decisions.” Acknowledge the founding role openly and preserve the no-paid-placement and editorial-independence statements. Do not describe the founding role as sponsorship or imply official endorsement.

### Evidence and independence

Write plainly and helpfully. Preserve neutrality and community ownership. Keep directory registration, issuer publication, self-certification, go-live approval, and operational traffic distinct. Label the environment, observation date, source, and reporting window. Preserve raw family names, versions, IDs, and unknowns. Do not present saved observations as a fresh live fetch.

Use the required disclaimer on public material where context calls for it: “OpenFinance-OS is a community initiative and is not affiliated with, endorsed by, or officially connected to the CBUAE, Al Tareq Platform, or any financial institution. Always verify information with official sources.” Link to official channels; do not imply the community resource replaces certification or operator support.

## Check the result

Inspect light and dark treatments and a narrow viewport. Verify legibility, focus, overflow, and meaningful UI interactions; for website changes, verify the poster and playback modes. Keep canonical and published guides/assets and the installed skill aligned. Preserve unrelated local work. Report prototype, local build, preview, and production evidence separately.
