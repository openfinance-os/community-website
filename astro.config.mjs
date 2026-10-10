import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://openfinance-os.org',

  output: 'static',

  // Preserve the HTML-aware inline whitespace behavior used before Astro 7.
  compressHTML: true,

  // Production redirects live in public/_redirects (Cloudflare, server-side
  // 301s) — see that file. astro.config redirects are intentionally NOT used:
  // on Cloudflare they generate meta-refresh pages that get served instead of
  // the 301, and conflicting rules caused a redirect loop (/global <-> /learn/global).

  build: {
    assets: '_astro',
    inlineStylesheets: 'auto',
  },

  markdown: {
    shikiConfig: {
      theme: 'github-dark-high-contrast',
      wrap: true,
    },
  },

  integrations: [
    sitemap({
      filter: (page) => !page.includes('/github'),
    }),
  ],

  vite: {
    resolve: {
      alias: {
        '@': '/src',
        '@data': '/data',
        '@components': '/src/components',
        '@layouts': '/src/layouts',
        '@lib': '/src/lib',
      },
    },
  },
});
