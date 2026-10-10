import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { transform } from '@astrojs/compiler-rs';
import { build } from 'esbuild';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Window } from 'happy-dom';

// Compile the real Astro 7 components for the container rendering assertions.
let temporaryDirectory: string;
let components: Record<string, Parameters<AstroContainer['renderToString']>[0]>;
beforeAll(async () => {
  temporaryDirectory = await mkdtemp(resolve('node_modules/.homepage-metrics-'));
  const outfile = resolve(temporaryDirectory, 'components.mjs');
  await build({
    stdin: {
      contents: ['Hero', 'ObservatoryPreview', 'EcosystemRecord']
        .map((name) => `export { default as ${name} } from './src/components/home/${name}.astro';`)
        .join('\n'),
      resolveDir: process.cwd(),
    },
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile,
    external: ['astro/*'],
    alias: { '@lib': resolve('src/lib') },
    plugins: [
      {
        name: 'astro-test-components',
        setup(builder) {
          builder.onResolve({ filter: /\?astro&type=style/ }, (args) => ({
            path: args.path,
            namespace: 'test-style',
          }));
          builder.onLoad({ filter: /.*/, namespace: 'test-style' }, () => ({
            contents: '',
            loader: 'js',
          }));
          builder.onLoad({ filter: /\.astro$/ }, async ({ path }) => ({
            contents: (
              await transform(await readFile(path, 'utf8'), {
                filename: path,
                internalURL: 'astro/compiler-runtime',
                resultScopedSlot: true,
                resolvePath: (specifier) => specifier,
              })
            ).code,
            loader: 'ts',
          }));
        },
      },
    ],
  });
  components = await import(/* @vite-ignore */ pathToFileURL(outfile).href);
});
afterAll(async () => {
  if (temporaryDirectory) await rm(temporaryDirectory, { recursive: true, force: true });
});

describe('homepage participant meanings', () => {
  it('keeps registration, Active status and issuer counts distinct across the real panels', async () => {
    const container = await AstroContainer.create();
    const hero = await container.renderToString(components.Hero, {
      props: {
        participantCount: 10,
        activeCount: 8,
        observedAt: '2026-10-07T06:00:00Z',
      },
    });
    const preview = await container.renderToString(components.ObservatoryPreview, {
      props: {
        stats: {
          totalUnique: 20,
          production: { registered: 10, live: 3 },
          sandbox: { registered: 15, live: 4 },
          inBoth: 5,
          productionOnly: 5,
          sandboxOnly: 10,
          apiFamilies: ['insurance', 'atm'],
          apiFamilyCoverage: { insurance: 2, atm: 1 },
        },
      },
    });
    const record = await container.renderToString(components.EcosystemRecord, {
      props: {
        historyPoints: [
          { date: '2026-10-06', totalParticipants: 9, liveInProduction: 2 },
          { date: '2026-10-07', totalParticipants: 10, liveInProduction: 3 },
        ],
      },
    });
    const window = new Window();
    window.document.body.innerHTML = hero + preview + record;
    const document = window.document;
    expect(document.querySelector('.hero-stat .stat-number')?.textContent).toBe('10');
    expect(document.querySelector('.hero-stat')?.textContent).toContain(
      'production directory registrations'
    );
    expect(document.querySelector('.hero-stat')?.textContent).toContain('8 marked Active');
    expect(document.querySelector('.hero-stat')?.textContent).toContain('Observed 2026-10-07 UTC');
    expect(document.querySelector('.ecosystem-stat')?.textContent).toContain(
      'Distinct registration IDs'
    );
    const stages = [...document.querySelectorAll('.stage-header')].map((node) =>
      node.textContent?.replace(/\s+/g, ' ').trim()
    );
    expect(stages).toEqual([
      'Across both directories 20',
      'Sandbox registrations 15',
      'Production registrations 10',
    ]);
    const note = document.querySelector('.pipeline-note')?.textContent?.replace(/\s+/g, ' ');
    expect(note).toContain('4 sandbox and 3 production registrations publish an active');
    expect(note).toContain('Registration does not establish usage.');
    expect([...document.querySelectorAll('.api-label')].map((node) => node.textContent)).toEqual([
      'Insurance',
      'ATM',
    ]);
    expect(document.querySelector('svg[role="img"]')?.getAttribute('aria-label')).toContain(
      'Registered: 10. With authorization servers: 3.'
    );
    expect(document.querySelector('.legend')?.textContent).toContain('Auth server published');
    expect(
      [...document.querySelectorAll('.table-view tbody tr')].map((row) =>
        [...row.querySelectorAll('td')].map((cell) => cell.textContent)
      )
    ).toEqual([
      ['2026-10-06', '9', '2'],
      ['2026-10-07', '10', '3'],
    ]);
    expect(document.body.textContent).not.toContain('financial institutions connected');
    await window.happyDOM.abort();
  });
});
