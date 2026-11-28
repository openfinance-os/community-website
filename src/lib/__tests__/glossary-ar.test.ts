import { describe, expect, it } from 'vitest';
import { glossaryData } from '../glossary';
import { arabicGlossary } from '../glossary-ar';

describe('Arabic glossary', () => {
  const english = glossaryData.flatMap((section) => section.terms.map((item) => item.term));

  it('translates every English term', () => {
    expect(english.filter((term) => !arabicGlossary[term])).toEqual([]);
  });

  it('has no entries for terms the English glossary dropped', () => {
    expect(Object.keys(arabicGlossary).filter((term) => !english.includes(term))).toEqual([]);
  });
});
