/**
 * Writes public/registry-snapshot.pdf from the committed production snapshot.
 * Point-in-time lead magnet for /newsletter/welcome (observed 28 Oct 2026).
 *
 * Usage: node scripts/build-registry-snapshot-pdf.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const data = JSON.parse(
  readFileSync(
    new URL('../data/observatory/snapshots/production/latest.json', import.meta.url),
    'utf8'
  )
);

function esc(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

const rows = [...data.participants].sort((a, b) => {
  const byName = a.name.localeCompare(b.name);
  if (byName !== 0) return byName;
  return a.id.localeCompare(b.id);
});

const organisations = new Set(
  rows.map((row) => (row.legalName || row.name || '').trim().toLowerCase())
).size;
const withAuthServer = rows.filter((row) => row.hasAuthServer).length;

if (rows.length !== 30 || organisations !== 29 || withAuthServer !== 12) {
  throw new Error(
    `Unexpected snapshot shape: ${organisations} organisations, ${rows.length} registration IDs, ${withAuthServer} auth servers`
  );
}

/** Helvetica widths in 1000-unit ems, enough to keep columns from colliding. */
const HELVETICA = {
  ' ': 278,
  '.': 278,
  ',': 278,
  '-': 333,
  _: 556,
  '/': 278,
  '(': 333,
  ')': 333,
  '&': 667,
  0: 556,
  1: 556,
  2: 556,
  3: 556,
  4: 556,
  5: 556,
  6: 556,
  7: 556,
  8: 556,
  9: 556,
  A: 667,
  B: 667,
  C: 722,
  D: 722,
  E: 611,
  F: 556,
  G: 778,
  H: 722,
  I: 278,
  J: 500,
  K: 667,
  L: 556,
  M: 833,
  N: 722,
  O: 778,
  P: 667,
  Q: 778,
  R: 722,
  S: 667,
  T: 611,
  U: 722,
  V: 667,
  W: 944,
  X: 667,
  Y: 667,
  Z: 611,
  a: 556,
  b: 556,
  c: 500,
  d: 556,
  e: 556,
  f: 278,
  g: 556,
  h: 556,
  i: 222,
  j: 222,
  k: 500,
  l: 222,
  m: 833,
  n: 556,
  o: 556,
  p: 556,
  q: 556,
  r: 333,
  s: 500,
  t: 278,
  u: 556,
  v: 500,
  w: 722,
  x: 500,
  y: 500,
  z: 500,
};

function textWidth(value, size) {
  let units = 0;
  for (const char of value) units += HELVETICA[char] ?? 700;
  return (units / 1000) * size;
}

function assertFits(value, size, maxWidth, label) {
  const width = textWidth(value, size);
  if (width > maxWidth) {
    throw new Error(`${label} is ${width.toFixed(1)}pt, wider than ${maxWidth}pt: ${value}`);
  }
}

const teal = '0.051 0.310 0.310';
const ink = '0.075 0.173 0.169';
const muted = '0.322 0.400 0.384';
const commands = [];

function fill(color, x, y, w, h) {
  commands.push(`${color} rg`, `${x} ${y} ${w} ${h} re`, 'f');
}

function text(font, size, x, y, color, value) {
  commands.push(
    'BT',
    `${color} rg`,
    `/${font} ${size} Tf`,
    `1 0 0 1 ${x} ${y} Tm`,
    `(${esc(value)}) Tj`,
    'ET'
  );
}

const pageWidth = 842;
const pageHeight = 595;
const columns = [
  { key: 'name', label: 'Name', x: 36, size: 8, width: 210 },
  { key: 'legal', label: 'Legal name', x: 250, size: 8, width: 250 },
  { key: 'roles', label: 'Roles', x: 510, size: 8, width: 220 },
  { key: 'auth', label: 'Auth server', x: 740, size: 8, width: 66 },
];

fill('0.969 0.984 0.980', 0, 0, pageWidth, pageHeight);
text('F2', 18, 36, 556, teal, 'UAE Open Finance registry snapshot');
fill('0.910 0.659 0.361', 36, 544, 150, 3);
text(
  'F1',
  11,
  36,
  522,
  ink,
  '29 organisations. 30 registration IDs. 12 publish an authorization server.'
);
text('F1', 10, 36, 506, muted, 'Data as of 28 Oct 2026. Production directory observation.');
text(
  'F1',
  9,
  36,
  488,
  muted,
  'Independent, community-run. Not an official CBUAE or Nebras publication.'
);
text(
  'F1',
  8,
  36,
  474,
  muted,
  'Authorization server means published issuer metadata, not tested availability or traffic.'
);

fill('0.941 0.969 0.969', 28, 448, 786, 16);
for (const column of columns) {
  text('F2', 8, column.x, 453, teal, column.label);
  assertFits(column.label, 8, column.width, column.label);
}

let y = 432;
for (const row of rows) {
  const cells = {
    name: row.name,
    legal: row.legalName || row.name,
    roles: row.roles.join(', '),
    auth: row.hasAuthServer ? 'Yes' : 'No',
  };
  for (const column of columns) {
    assertFits(cells[column.key], column.size, column.width, `${row.name} ${column.key}`);
    text(
      'F1',
      column.size,
      column.x,
      y,
      column.key === 'auth' && row.hasAuthServer ? teal : ink,
      cells[column.key]
    );
  }
  y -= 12.2;
}

text('F1', 8, 36, 42, muted, `Source: ${data.source}`);
text(
  'F1',
  8,
  36,
  30,
  muted,
  'Observed 2026-10-28 12:08 UTC. Registration IDs, not legal entities. https://openfinance-os.org/observatory'
);

const stream = commands.join('\n');
const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>',
  `<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}\nendstream`,
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
];

let pdf = '%PDF-1.4\n';
const offsets = [0];
for (let index = 0; index < objects.length; index += 1) {
  offsets.push(Buffer.byteLength(pdf, 'latin1'));
  pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
}
const xref = Buffer.byteLength(pdf, 'latin1');
pdf += `xref\n0 ${objects.length + 1}\n`;
pdf += '0000000000 65535 f \n';
for (let index = 1; index < offsets.length; index += 1) {
  pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

const out = new URL('../public/registry-snapshot.pdf', import.meta.url);
writeFileSync(out, pdf, 'latin1');
console.log(
  `Wrote ${out.pathname} (${Buffer.byteLength(pdf, 'latin1')} bytes, ${rows.length} rows)`
);
