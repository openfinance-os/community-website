import { join } from 'node:path';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import {
  includeInSitemap,
  loadNewsLastModified,
  loadNewsletterLastModified,
} from './src/lib/sitemap-pages.mjs';

const newsLastModified = loadNewsLastModified(join(process.cwd(), 'src/content/news'));
const newsletterLastModified = loadNewsletterLastModified(
  join(process.cwd(), 'data/newsletter/issues.json')
);

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
        const key = pathname.endsWith('/') ? pathname : `${pathname}/`;
        const newsDate = newsLastModified.get(key);
        const issueDate = newsletterLastModified.get(key);
        if (newsDate) item.lastmod = newsDate;
        else if (issueDate) item.lastmod = issueDate;
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
