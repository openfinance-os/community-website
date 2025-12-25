import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://openfinance-os.org',

  output: 'static',

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
