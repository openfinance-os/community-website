# Shared horizon hero film

13 October 2026. Homepage integration approved by the user after reviewing the full-width coastal layout.

The opening hero retains its headline, actions and dated Observatory card. A full-width UAE coastal illustration supplies the background. Three abstract teal sculptures — a curved slab, open arch and faceted node — connect through one glass ribbon and a small pivoting link. A restrained amber reflection illustrates connection through permission. It does not represent live traffic, adoption or participant status.

The revised illustration removes the furnished villas and replaces much of the empty white field with pale sage and teal water. The foreground has an additional 112px of shoreline room on desktop and 95px on mobile. Adaptive framing keeps the arch and ribbon below the Observatory source caption. The existing Open Circuit section, source video and poster remain unchanged.

## Source and delivery

Higgsfield reference generation: `f29cb96e-539e-4927-8b47-0978ee18407d`, GPT Image 2.5. Video generation: `d3190d17-8c75-40d2-9e56-7bb39f6a2691`, Wan 3.0, matching start/end reference inputs.

- `public/media/shared-horizon-hero.mp4`: eight seconds, 1920 × 1080, H.264 High, yuv420p, 24fps, no audio, 1,515,989 bytes. Encoding uses CRF 25, a 1600k maximum bitrate, and fast-start MP4 metadata.
- `public/media/shared-horizon-poster.webp`: 1920 × 1080, 104,410 bytes. The Astro image pipeline generates responsive WebP variants from this source.

Video SHA-256: `799f9d15b1f92b5d93f7f260407c48e4347c504b11eb9ba945f88172aeb6dc19`.
Poster SHA-256: `2316780320cb61a71db0c6c95a9d6d8db8f22cce4e9830e1f716c239e582c8d2`.

## Playback and presentation

The film starts silently and loops on desktop when the hero is visible. A keyboard-operable play/pause control preserves the user's pause choice. The component pauses when the hero leaves view or the document becomes hidden. A separate still remains beneath the video and is retained if playback fails or is blocked.

Reduced-motion, data-saving and viewport widths up to 700px start with the still and do not automatically fetch the MP4. Explicit play is available. New preference changes return playback to the appropriate still policy. Dark mode blends the illustration into the site's deep teal surface; protective surface gradients preserve the headline, actions and source captions.

## Validation

The repository's pinned Node 22.23.1 was used from a task-local runtime because the installed Homebrew copy could not load its simdutf dependency.

- Astro production build: passed, 324 pages.
- Astro/TypeScript check: zero errors and zero warnings; 82 existing hints.
- Repository formatting check: passed.
- Homepage, new hero film and existing Open Circuit regressions: 78 passed, zero failed or skipped, across Chromium, Firefox and WebKit.
- Complete media decode: all 192 frames decoded, no audio stream.
- Manual light/dark desktop and mobile review: headline, actions, card, captions and film controls remain readable; the connected forms occupy the added shore area.

The existing Open Circuit test now checks the `playsinline` attribute, which is portable across the three browsers. Its media and runtime behavior are unchanged.

This evidence is local build and preview validation. It does not establish a production deployment or a complete accessibility certification.
