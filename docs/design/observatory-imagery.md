# Observatory imagery

27 November 2026. Two stills for the production Observatory page, made to sit in the same world as the shared-horizon hero: Gulf shoreline, translucent teal glass, one restrained amber reflection, rendered at dusk so the page keeps its deep teal surface in both themes.

Both images are decorative and carry empty alt text. They do not represent traffic, adoption, or the status of any registration. In particular, the lit and unlit objects in the specimen field are not a count of anything on the page.

## Source and delivery

Higgsfield, GPT Image 2.6, 21:9, 2k, high quality, with `public/media/shared-horizon-poster.webp` as the style reference.

- `public/media/observatory-instrument.webp`: generation `0873017d-8b56-4b41-87c3-4df731dcfaad`. Three tilted glass rings around a faceted lens on a sand spit. Used behind the page introduction (`ObservatoryHero.astro`). 1920 × 823, 47,230 bytes. SHA-256 `c9b202af2a89128374a58dfb2cca45eb83c43daf77068dfae6c094d1bb85bc53`.
- `public/media/observatory-field.webp`: generation `fdd8e657-4792-4d83-8d4f-d87eb2803940`. Glass beads and discs on a dark tidal flat. Used behind the reading guide (`EvidenceBand.astro`). 1920 × 823, 48,730 bytes. SHA-256 `16e7682ab792052685e5e7b6455ab27e7f922368f1fbaff71349ce050224b509`.

The committed files were downscaled from the 2688 × 1152 originals through a 2200px JPEG intermediate. Regenerate from the Higgsfield originals if a larger or cleaner master is needed. The Astro image pipeline produces the responsive variants.

## Presentation

Both bands set `data-theme="dark"` on their own element so text and controls inside them use the dark tokens whatever the page theme is. A left-to-right protection gradient keeps the heading, the glass readout and the links readable over the image. On narrow screens the instrument sits above the heading and fades into the band colour.
