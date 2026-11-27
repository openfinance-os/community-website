/**
 * Search and social metadata limits. Search results cut titles at roughly 60
 * characters and descriptions at roughly 160, so longer ones end mid-word.
 */
export const SITE_NAME = 'Open Finance OS';
export const TITLE_SUFFIX = ` | ${SITE_NAME}`;
export const MAX_TITLE_LENGTH = 60;
export const MAX_DESCRIPTION_LENGTH = 160;

/** The <title> text: the page title plus the site name when both fit. */
export function documentTitle(title: string): string {
  const clean = title.replace(/\s+/g, ' ').trim();
  if (clean === SITE_NAME || clean.endsWith(TITLE_SUFFIX)) return clean;
  const withSuffix = `${clean}${TITLE_SUFFIX}`;
  return withSuffix.length <= MAX_TITLE_LENGTH ? withSuffix : clean;
}

/** A meta description that ends on a whole word within the length limit. */
export function metaDescription(text: string, max = MAX_DESCRIPTION_LENGTH): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  const head = (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.—–-]+$/, '');
  return `${head}…`;
}
