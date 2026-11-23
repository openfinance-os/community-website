import { lookupNewsletterImage, normalizeOpenFinanceCasing } from './newsletter-images.mjs';

export interface NewsletterIssue {
  id: string;
  slug: string;
  subject: string;
  description: string;
  publish_date: string;
  body: string;
  image: string | null;
  absolute_url: string;
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const ALLOWED_TAGS = new Set([
  'a',
  'b',
  'blockquote',
  'br',
  'code',
  'div',
  'em',
  'figcaption',
  'figure',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  'span',
  'strong',
  'sub',
  'sup',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
]);

/** Elements whose contents are discarded, not unwrapped. */
const DROP_CONTENT = new Set([
  'embed',
  'iframe',
  'math',
  'noscript',
  'object',
  'script',
  'style',
  'svg',
  'template',
  'textarea',
  'title',
]);

const VOID_TAGS = new Set(['br', 'hr', 'img']);

const SAFE_STYLE_PROPS = new Set([
  'border',
  'border-bottom',
  'border-collapse',
  'border-color',
  'border-left',
  'border-left-color',
  'border-left-style',
  'border-left-width',
  'border-right',
  'border-style',
  'border-top',
  'border-width',
  'color',
  'display',
  'font-family',
  'font-size',
  'font-weight',
  'height',
  'line-height',
  'margin',
  'margin-bottom',
  'margin-left',
  'margin-right',
  'margin-top',
  'max-width',
  'padding',
  'padding-bottom',
  'padding-left',
  'padding-right',
  'padding-top',
  'text-align',
  'text-decoration',
  'vertical-align',
  'width',
]);

interface ParsedTag {
  name: string;
  closing: boolean;
  selfClosing: boolean;
  attrs: Map<string, string>;
}

export function assertIssues(value: unknown): NewsletterIssue[] {
  if (!Array.isArray(value)) throw new Error('Newsletter issues must be an array');
  return value.map((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`Newsletter issue ${index} is not an object`);
    }
    const record = item as Record<string, unknown>;
    const issue: NewsletterIssue = {
      id: requiredString(record, 'id', index),
      slug: requiredString(record, 'slug', index),
      subject: requiredString(record, 'subject', index),
      description: requiredString(record, 'description', index),
      publish_date: requiredString(record, 'publish_date', index),
      body: requiredString(record, 'body', index),
      image: optionalImage(record.image, index),
      absolute_url: requiredString(record, 'absolute_url', index),
    };
    if (!SLUG_RE.test(issue.slug)) {
      throw new Error(`Newsletter issue ${index} has an invalid slug`);
    }
    return issue;
  });
}

function requiredString(record: Record<string, unknown>, key: string, index: number): string {
  const value = record[key];
  if (typeof value !== 'string') {
    throw new Error(`Newsletter issue ${index} is missing ${key}`);
  }
  return value;
}

function optionalImage(value: unknown, index: number): string | null {
  if (value === null) return null;
  if (typeof value === 'string') return value;
  throw new Error(`Newsletter issue ${index} has an invalid image`);
}

export function sortIssuesNewestFirst<T extends { publish_date: string; slug: string }>(
  issues: readonly T[]
): T[] {
  return [...issues].sort((a, b) => {
    const byDate = b.publish_date.localeCompare(a.publish_date);
    return byDate !== 0 ? byDate : a.slug.localeCompare(b.slug);
  });
}

export function issueImage(issue: Pick<NewsletterIssue, 'image'>): string | null {
  const image = issue.image?.trim() ?? '';
  return image.length > 0 ? image : null;
}

export function formatIssueDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function issueExcerpt(
  issue: Pick<NewsletterIssue, 'description' | 'body'>,
  max = 180
): string {
  const description = issue.description.replace(/\s+/g, ' ').trim();
  const text = description || plainText(issue.body);
  if (text.length <= max) return text;
  const window = text.slice(0, max + 1);
  const space = window.lastIndexOf(' ');
  const clipped = (
    space > Math.floor(max * 0.6) ? window.slice(0, space) : text.slice(0, max)
  ).trim();
  return `${clipped}…`;
}

function plainText(html: string): string {
  return decodeEntities(sanitizeIssueHtml(html).replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, '&');
}

/**
 * Makes Buttondown issue HTML safe to embed.
 * Strips scripts, the editor-mode comment, tracking pixels, and dark-card backgrounds.
 */
export function sanitizeIssueHtml(html: string): string {
  const source = html.replace(/<!--[\s\S]*?-->/g, '').replace(/\u0000/g, '');
  let out = '';
  let index = 0;
  let unsafeAnchors = 0;

  while (index < source.length) {
    if (source[index] !== '<') {
      if (source[index] === '&') {
        const entity = source.slice(index).match(/^&(?:#\d+|#x[0-9a-f]+|[a-z]+);/i);
        if (entity) {
          out += entity[0];
          index += entity[0].length;
        } else {
          out += '&amp;';
          index += 1;
        }
        continue;
      }
      out += escapeTextChar(source[index]);
      index += 1;
      continue;
    }

    const tagEnd = findTagEnd(source, index);
    const raw = source.slice(index, tagEnd);
    const tag = parseTag(raw);
    if (!tag) {
      out += '&lt;';
      index += 1;
      continue;
    }

    if (DROP_CONTENT.has(tag.name) && !tag.closing) {
      index = tag.selfClosing ? tagEnd : skipBlock(source, tagEnd, tag.name);
      continue;
    }
    if (tag.closing && DROP_CONTENT.has(tag.name)) {
      index = tagEnd;
      continue;
    }
    if (tag.name === 'img' && !tag.closing && isTrackingPixel(tag.attrs)) {
      index = tagEnd;
      continue;
    }
    if (tag.name === 'a' && !tag.closing && !safeUrl(tag.attrs.get('href') ?? '')) {
      unsafeAnchors += 1;
      index = tagEnd;
      continue;
    }
    if (tag.name === 'a' && tag.closing && unsafeAnchors > 0) {
      unsafeAnchors -= 1;
      index = tagEnd;
      continue;
    }

    out += serializeTag(tag);
    index = tagEnd;
  }

  return normalizeOpenFinanceCasing(
    out
      .replace(/<script[\s\S]*?(?:<\/script>|$)/gi, '')
      .replace(/javascript\s*:/gi, '')
      .replace(/buttondown-editor-mode:[^<\n]*/gi, '')
      .trim()
  );
}

function escapeTextChar(char: string): string {
  if (char === '<') return '&lt;';
  if (char === '>') return '&gt;';
  return char;
}

function findTagEnd(source: string, start: number): number {
  let quote: string | null = null;
  for (let index = start + 1; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === '>') return index + 1;
  }
  return source.length;
}

function parseTag(raw: string): ParsedTag | null {
  const match = raw.match(/^<\s*(\/)?\s*([a-zA-Z][\w:-]*)\s*([\s\S]*?)>$/);
  if (!match) return null;
  const closing = Boolean(match[1]);
  const name = match[2].toLowerCase();
  const attrs = new Map<string, string>();
  if (!closing) {
    const attrSource = match[3].replace(/\/\s*$/, '');
    const attrRe = /([^\s=/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
    for (const attr of attrSource.matchAll(attrRe)) {
      const key = decodeBasic(attr[1]).toLowerCase();
      if (key.startsWith('on') || key === 'srcdoc') continue;
      attrs.set(key, attr[2] ?? attr[3] ?? attr[4] ?? '');
    }
  }
  return {
    name,
    closing,
    selfClosing: /\/\s*>$/.test(raw) || VOID_TAGS.has(name),
    attrs,
  };
}

function skipBlock(source: string, from: number, name: string): number {
  const closer = new RegExp(`</\\s*${name}\\s*>`, 'i');
  const match = closer.exec(source.slice(from));
  if (!match) return source.length;
  return from + match.index + match[0].length;
}

function isTrackingPixel(attrs: Map<string, string>): boolean {
  const src = attrs.get('src') ?? '';
  const width = numericDimension(attrs.get('width'));
  const height = numericDimension(attrs.get('height'));
  const style = attrs.get('style') ?? '';
  const tiny =
    (width !== null && height !== null && width <= 1 && height <= 1) ||
    (/width\s*:\s*[01](?:px)?/i.test(style) && /height\s*:\s*[01](?:px)?/i.test(style));
  const tracker =
    /pixel|beacon|spacer|track\.gif|open\.gif|email_open/i.test(src) ||
    /\/open\/?(?:$|\?)/i.test(src);
  return (
    tiny || (tracker && (!(attrs.get('alt') ?? '').trim() || /display\s*:\s*none/i.test(style)))
  );
}

function numericDimension(value: string | undefined): number | null {
  if (!value || !/^\d+(\.\d+)?$/.test(value.trim())) return null;
  return Number(value);
}

function serializeTag(tag: ParsedTag): string {
  if (!ALLOWED_TAGS.has(tag.name)) return '';
  if (tag.closing) return VOID_TAGS.has(tag.name) ? '' : `</${tag.name}>`;
  const attrs = sanitizedAttrs(tag);
  if (tag.name === 'img' && !attrs.some(([key]) => key === 'src')) return '';
  if (tag.name === 'a' && !attrs.some(([key]) => key === 'href')) return '';
  const rendered = attrs.map(([key, value]) => ` ${key}="${escapeAttr(value)}"`).join('');
  return `<${tag.name}${rendered}>`;
}

function sanitizedAttrs(tag: ParsedTag): Array<[string, string]> {
  const attrs: Array<[string, string]> = [];
  if (tag.name === 'a') {
    const href = safeUrl(tag.attrs.get('href') ?? '');
    if (href) {
      attrs.push(['href', href]);
      if (isExternalHttp(href)) {
        attrs.push(['rel', 'noopener noreferrer']);
        attrs.push(['target', '_blank']);
      }
    }
  }
  if (tag.name === 'img') {
    const rawSrc = tag.attrs.get('src') ?? '';
    const known = lookupNewsletterImage(rawSrc);
    const src = known?.src ?? safeUrl(rawSrc);
    if (src && (known || !isTrackingPixel(tag.attrs))) {
      if (known) {
        attrs.push(['src', known.src]);
        attrs.push(['srcset', `${known.src} ${known.width}w`]);
        attrs.push(['sizes', known.sizes]);
        attrs.push(['width', String(known.width)]);
        attrs.push(['height', String(known.height)]);
        attrs.push(['alt', known.alt]);
      } else {
        attrs.push(['src', src]);
        attrs.push(['alt', tag.attrs.get('alt') ?? '']);
        for (const key of ['width', 'height'] as const) {
          const value = tag.attrs.get(key);
          if (value && /^\d+(\.\d+)?%?$/.test(value)) attrs.push([key, value]);
        }
      }
    }
  }
  if (tag.name === 'td' || tag.name === 'th') {
    for (const key of ['colspan', 'rowspan'] as const) {
      const value = tag.attrs.get(key);
      if (value && /^\d+$/.test(value)) attrs.push([key, value]);
    }
  }
  if (tag.name === 'table' && tag.attrs.get('role') === 'presentation') {
    attrs.push(['role', 'presentation']);
  }
  const style = safeStyle(tag.attrs.get('style') ?? '');
  if (style && !(tag.name === 'img' && !attrs.some(([key]) => key === 'src'))) {
    attrs.push(['style', style]);
  }
  return attrs;
}

function safeStyle(value: string): string | null {
  const kept: string[] = [];
  for (const part of value.split(';')) {
    const decl = part.trim();
    if (!decl) continue;
    const colon = decl.indexOf(':');
    if (colon === -1) continue;
    const prop = decl.slice(0, colon).trim().toLowerCase();
    const rawValue = decl.slice(colon + 1).trim();
    if (!SAFE_STYLE_PROPS.has(prop)) continue;
    if (prop === 'background' || prop.startsWith('background-')) continue;
    if (/url\s*\(|expression\s*\(|javascript\s*:|@import|behavior\s*:/i.test(rawValue)) continue;
    kept.push(`${prop}: ${rawValue}`);
  }
  return kept.length > 0 ? kept.join('; ') : null;
}

function safeUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith('//')) return null;
  const decoded = decodeBasic(trimmed).replace(/[\u0000-\u0020]+/g, '');
  if (/^(javascript|data|vbscript):/i.test(decoded)) return null;
  if (trimmed.startsWith('/') || trimmed.startsWith('#') || trimmed.startsWith('?')) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'mailto:') {
      return trimmed;
    }
  } catch {
    return null;
  }
  return null;
}

function isExternalHttp(href: string): boolean {
  if (!/^https?:/i.test(href)) return false;
  try {
    const host = new URL(href).hostname.replace(/^www\./, '');
    return host !== 'openfinance-os.org';
  } catch {
    return true;
  }
}

function decodeBasic(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => safeCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#([0-9]+);/gi, (_, num: string) => safeCodePoint(Number.parseInt(num, 10)))
    .replace(/&colon;/gi, ':')
    .replace(/&amp;/gi, '&');
}

function safeCodePoint(code: number): string {
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return '';
  return String.fromCodePoint(code);
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
