import { join } from 'node:path';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { includeInSitemap, loadNewsLastModified } from './src/lib/sitemap-pages.mjs';

const newsLastModified = loadNewsLastModified(join(process.cwd(), 'src/content/news'));

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
      filter: includeInSitemap,
      customPages: [
        'https://openfinance-os.org/brand/openfinance-os-brand-guidelines.html',
        'https://openfinance-os.org/brand/logo-preview.html',
      ],
      serialize(item) {
        const pathname = new URL(item.url).pathname;
        const newsDate = newsLastModified.get(pathname.endsWith('/') ? pathname : `${pathname}/`);
        if (newsDate) item.lastmod = newsDate;
        return item;
      },
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
