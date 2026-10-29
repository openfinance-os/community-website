import { describe, expect, it } from 'vitest';
import {
  LOWERCASE_UAE_OPEN_FINANCE,
  collectPublicCopyHits,
  lowercaseUaeOpenFinanceHits,
} from '../uae-open-finance-casing';

describe('UAE Open Finance casing', () => {
  it('flags the lower-case phrase and accepts the title-case name', () => {
    expect(lowercaseUaeOpenFinanceHits('sample', 'UAE open finance weekly')).toEqual([
      'sample: UAE open finance weekly',
    ]);
    expect(lowercaseUaeOpenFinanceHits('sample', 'UAE Open Finance weekly')).toEqual([]);
    expect(LOWERCASE_UAE_OPEN_FINANCE).toBe('UAE open finance');
  });

  it('keeps content titles, descriptions, and page copy free of the lower-case phrase', () => {
    expect(collectPublicCopyHits(process.cwd())).toEqual([]);
  });
});
