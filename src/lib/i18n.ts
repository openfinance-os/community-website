/**
 * Arabic editions. Each English path maps to its Arabic translation. Only the
 * pages listed here have one; everything else links to the English page.
 * Paths end in a slash, matching the canonical URLs.
 */
export const arabicEditions: Record<string, string> = {
  '/': '/ar/',
  '/learn/': '/ar/learn/',
  '/learn/tpp-guide/': '/ar/learn/tpp-guide/',
  '/learn/bank-guide/': '/ar/learn/bank-guide/',
  '/learn/api-guide/': '/ar/learn/api-guide/',
  '/learn/glossary/': '/ar/learn/glossary/',
};

const englishEditions: Record<string, string> = Object.fromEntries(
  Object.entries(arabicEditions).map(([en, ar]) => [ar, en])
);

function normalise(pathname: string): string {
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

export interface Edition {
  lang: 'en' | 'ar';
  href: string;
}

/** The language of a page, from its path. */
export function pageLang(pathname: string): 'en' | 'ar' {
  return normalise(pathname).startsWith('/ar/') ? 'ar' : 'en';
}

/** Both editions of a translated page, or an empty list. */
export function editionsFor(pathname: string): Edition[] {
  const path = normalise(pathname);
  const english = englishEditions[path] ?? (arabicEditions[path] ? path : undefined);
  if (!english) return [];
  return [
    { lang: 'en', href: english },
    { lang: 'ar', href: arabicEditions[english] },
  ];
}

/** Arabic dates for page metadata, in Latin digits as UAE government sites use. */
export function arabicDate(isoDate: string): string {
  return new Date(`${isoDate.slice(0, 10)}T00:00:00Z`).toLocaleDateString('ar-AE-u-nu-latn', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Arabic wording for the Learn source-pointer box. */
export const arabicPointer = {
  heading: 'هل تبني منتجاً أو تُجري تكاملاً؟',
  note: 'تحقّق من إصدار كل مصدر وتاريخ نشره وتصحيحاته قبل التنفيذ. المراجع المجتمعية لا تحلّ محل المتطلبات الرسمية.',
};
