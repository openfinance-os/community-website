import { describe, expect, it } from 'vitest';
import samples from '../../../data/sandbox/samples.json';
import { areas, sources } from '../back-office';
import {
  explorerUrl,
  formatDay,
  formatMoney,
  humanise,
  samplePersonas,
  sampleSource,
} from '../sandbox-samples';

describe('sandbox samples', () => {
  it('keeps the generator watermark on every payload, naming its own persona and seed', () => {
    for (const persona of samplePersonas) {
      expect(persona.views.length).toBeGreaterThan(0);
      for (const view of persona.views) {
        expect(view.watermark).toMatch(/^SYNTHETIC — Open Finance Data Sandbox/);
        expect(view.watermark).toContain(`persona:${persona.id}`);
        expect(view.watermark).toContain(`lfi:${persona.profile}`);
        expect(view.watermark).toContain(`seed:${persona.seed}`);
        expect(JSON.parse(view.json)._watermark).toBe(view.watermark);
      }
    }
  });

  it('links each persona to the full explorer with its own seed and the corpus', () => {
    for (const persona of samplePersonas) {
      const url = new URL(persona.explorerUrl);
      expect(url.hostname).toBe('data-sandbox.openfinance-os.org');
      expect(url.searchParams.get('persona')).toBe(persona.id);
      expect(url.searchParams.get('seed')).toBe(String(persona.seed));
      expect(url.searchParams.get('lfi')).toBe(persona.profile);
      expect(url.searchParams.get('corpus')).toBe(sampleSource.corpusVersion);
    }
    expect(explorerUrl('a_b', 'median', 7, '0.1.0')).toBe(
      'https://data-sandbox.openfinance-os.org/src/index.html?persona=a_b&lfi=median&seed=7&corpus=0.1.0'
    );
  });

  it('does not republish identity blocks or institution names from insurance payloads', () => {
    const text = JSON.stringify(samples);
    expect(text).not.toContain('"PolicyHolder":');
    expect(text).not.toContain('"EmiratesId":');
    expect(text).not.toContain('payment-details');
  });

  it('pins the sample to a sandbox commit and the specification versions', () => {
    expect(sampleSource.commit).toMatch(/^[0-9a-f]{40}$/);
    expect(sampleSource.spec.banking.version).toMatch(/^v2\.1/);
    expect(sampleSource.spec.insurance.version).toMatch(/^v2\.1/);
  });

  it('formats money, dates and enum names for reading', () => {
    expect(formatMoney({ Amount: '183706.53', Currency: 'AED' })).toBe('AED 183,706.53');
    expect(formatMoney(undefined)).toBe('Not provided');
    expect(formatDay('2026-05-01T00:00:00Z')).toBe('1 May 2026');
    expect(formatDay('2026-01-31')).toBe('31 Jan 2026');
    expect(humanise('CurrentAccount')).toBe('Current account');
    expect(humanise('POS')).toBe('POS');
    expect(humanise(undefined)).toBe('Not provided');
  });
});

describe('back-office requirements', () => {
  it('gives every area both perspectives and a linked source', () => {
    expect(areas.length).toBeGreaterThanOrEqual(6);
    const ids = new Set(areas.map((area) => area.id));
    expect(ids.size).toBe(areas.length);
    for (const area of areas) {
      expect(area.lfi.length).toBeGreaterThan(0);
      expect(area.tpp.length).toBeGreaterThan(0);
      expect(sources[area.anchor.source].href).toMatch(/^https:\/\//);
    }
  });
});
