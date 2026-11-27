import { describe, expect, it } from 'vitest';
import { documentTitle, metaDescription, MAX_DESCRIPTION_LENGTH } from '../seo';

describe('documentTitle', () => {
  it('adds the site name when the whole title fits', () => {
    expect(documentTitle('Newsletter')).toBe('Newsletter | Open Finance OS');
  });
  it('drops the site name instead of letting a long title run past 60 characters', () => {
    const long = 'Commercial Bank of Dubai Becomes First UAE Bank to Fully Activate Open Finance';
    expect(documentTitle(long)).toBe(long);
  });
  it('does not add the site name twice', () => {
    expect(documentTitle('Open Finance OS')).toBe('Open Finance OS');
    expect(documentTitle('About | Open Finance OS')).toBe('About | Open Finance OS');
  });
});

describe('metaDescription', () => {
  it('leaves short text alone apart from whitespace', () => {
    expect(metaDescription('  A short\n summary.  ')).toBe('A short summary.');
  });
  it('ends long text on a whole word within the limit', () => {
    const text = 'word '.repeat(60);
    const out = metaDescription(text);
    expect(out.length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
    expect(out.endsWith('word…')).toBe(true);
  });
});
