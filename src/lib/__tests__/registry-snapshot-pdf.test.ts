import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pdf = readFileSync(new URL('../../../public/registry-snapshot.pdf', import.meta.url));

describe('registry snapshot PDF', () => {
  it('is the 28 Oct 2026 production snapshot', () => {
    const text = pdf.toString('latin1');
    expect(text.startsWith('%PDF')).toBe(true);
    expect(text).toContain('29 organisations');
    expect(text).toContain('30 registration IDs');
    expect(text).toContain('12 publish an authorization server');
    expect(text).toContain('28 Oct 2026');
    expect(text).toContain('ADCB');
    expect(text).toContain('Mercury Payments Services LLC');
    expect(text).toContain(
      'Independent, community-run. Not an official CBUAE or Nebras publication.'
    );
  });
});
