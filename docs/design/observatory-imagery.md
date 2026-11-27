# Observatory imagery

27 November 2026. Five stills for the Observatory pages, made to sit in the same world as the shared-horizon hero: Gulf shoreline, translucent teal glass, one restrained amber reflection, rendered at dusk so the page keeps its deep teal surface in both themes.

All five images are decorative and carry empty alt text. They do not represent traffic, adoption, or the status of any registration. In particular, the lit and unlit objects in the specimen field, the archive plates and the lattice tiles are not a count of anything on the page.

## Source and delivery

Higgsfield, GPT Image 2.6, 21:9, 2k, high quality, with `public/media/shared-horizon-poster.webp` as the style reference.

- `public/media/observatory-instrument.webp`: generation `0873017d-8b56-4b41-87c3-4df731dcfaad`. Three tilted glass rings around a faceted lens on a sand spit. Used behind the page introduction (`ObservatoryHero.astro`). 1920 × 823, 47,230 bytes. SHA-256 `c9b202af2a89128374a58dfb2cca45eb83c43daf77068dfae6c094d1bb85bc53`.
- `public/media/observatory-field.webp`: generation `fdd8e657-4792-4d83-8d4f-d87eb2803940`. Glass beads and discs on a dark tidal flat. Used behind the reading guide (`EvidenceBand.astro`). 1920 × 823, 48,730 bytes. SHA-256 `16e7682ab792052685e5e7b6455ab27e7f922368f1fbaff71349ce050224b509`.
- `public/media/observatory-workbench.webp`: generation `39b6e6a6-13cd-42e1-b2ae-5cb7f1853178`. The same instrument unfinished on a test bench, with an amber lens. Used behind the sandbox introduction and the sandbox participant strip. 1920 × 823, 51,442 bytes. SHA-256 `aa4475107dbe1f27b02744f05ea9f0d75b314ce7c4fe7c0ee8e8406716f98fa2`.
- `public/media/observatory-archive.webp`: generation `f4a3cf38-a06f-45df-8402-0be82a51d05c`. A row of upright glass plates, one lit amber. Used on the datasets and methodology pages. 1920 × 823, 57,568 bytes. SHA-256 `f4a3bb36583e53a3e6cfdb92cddfa6596571364f6212394b74fe1c3e7af8ba13`.
- `public/media/observatory-lattice.webp`: generation `6087bf57-d238-40e2-b742-14a7d2161246`. A grid of glass tiles, one lit amber. Used on the coverage and comparison page. 1920 × 823, 51,684 bytes. SHA-256 `30f63f122de77cc45242576aa965bc55c01dca6009909d0e1c9db14c7f4de62c`.

The instrument also sits behind the Watch introduction and the production participant strip, and the field behind the briefing introduction, through `ObservatoryBand.astro`.

The committed files were downscaled from the 2688 × 1152 originals through a 2200px JPEG intermediate. Regenerate from the Higgsfield originals if a larger or cleaner master is needed. The Astro image pipeline produces the responsive variants.

## Presentation

Every band sets `data-theme="dark"` on their own element so text and controls inside them use the dark tokens whatever the page theme is. A left-to-right protection gradient keeps the heading, the glass readout and the links readable over the image. On narrow screens the instrument sits above the heading and fades into the band colour.
