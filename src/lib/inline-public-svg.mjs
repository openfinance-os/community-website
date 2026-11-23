import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Inline a public SVG so page theme tokens (`--color-*`) apply.
 * Markdown images cannot inherit custom properties, and `<img>` SVGs
 * cannot see the site's `data-theme` attribute.
 *
 * @param {string} publicPath Site path such as `/news/12-of-30/hero.svg`.
 * @param {string} alt Accessible name. Required.
 * @returns {string}
 */
export function inlinePublicSvg(publicPath, alt) {
  if (
    typeof publicPath !== 'string' ||
    !publicPath.startsWith('/news/') ||
    publicPath.includes('..') ||
    !publicPath.endsWith('.svg')
  ) {
    throw new Error(`Refusing to inline SVG path: ${publicPath}`);
  }
  const text = alt?.trim();
  if (!text) throw new Error(`Missing alt text for ${publicPath}`);

  const file = join(process.cwd(), 'public', publicPath.slice(1));
  let svg = readFileSync(file, 'utf8')
    .replace(/^\uFEFF/, '')
    .trim();
  svg = svg.replace(/<\?xml[^?]*\?>\s*/i, '');
  svg = svg.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '');
  svg = svg.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  if (!/^<svg\b/i.test(svg)) throw new Error(`${publicPath} is not an SVG document`);

  const id = `fig-${publicPath.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}`;
  const safeAlt = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  return svg.replace(/<svg\b([^>]*)>/i, (_match, attrs) => {
    const cleaned = attrs.replace(/\s(?:role|aria-labelledby|aria-label|focusable)="[^"]*"/gi, '');
    return `<svg${cleaned} role="img" aria-labelledby="${id}" focusable="false"><title id="${id}">${safeAlt}</title>`;
  });
}
