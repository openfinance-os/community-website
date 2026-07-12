import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://openfinance-os.org',

  output: 'static',

  // Preserve old URLs after content consolidation (see docs/plans/repositioning.md).
  redirects: {
    '/learn/global': '/global',
    '/learn/global/eu': '/global/eu',
    '/learn/global/uk': '/global/uk',
    '/learn/global/gcc': '/global/gcc',
    // Events feature removed (may return later); point old URLs at Updates.
    '/events': '/updates',
  },

  build: {
    assets: '_astro',
    inlineStylesheets: 'auto',
  },

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
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
