import { inflateSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pdf = readFileSync(new URL('../../../public/registry-snapshot.pdf', import.meta.url));

/** ReportLab stores page text as ASCII85, then Flate. Decode order follows the filter array. */
function decodeAscii85(input: Buffer): Buffer {
  const cleaned = input.toString('latin1').replace(/\s+/g, '').replace(/~>$/, '');
  const bytes: number[] = [];
  let index = 0;
  while (index < cleaned.length) {
    if (cleaned[index] === 'z') {
      bytes.push(0, 0, 0, 0);
      index += 1;
      continue;
    }
    const remain = Math.min(5, cleaned.length - index);
    let value = 0n;
    for (let offset = 0; offset < 5; offset += 1) {
      const code = offset < remain ? BigInt(cleaned.charCodeAt(index + offset) - 33) : 84n;
      value = value * 85n + code;
    }
    const take = remain - 1;
    for (let shift = 3; shift >= 4 - take; shift -= 1) {
      bytes.push(Number((value >> BigInt(shift * 8)) & 255n));
    }
    index += remain;
  }
  return Buffer.from(bytes);
}

function snapshotText(file: Buffer): string {
  const source = file.toString('latin1');
  const marker = /stream\r?\n/g;
  const parts: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = marker.exec(source))) {
    const header = source.slice(Math.max(0, match.index - 500), match.index);
    const lengths = [...header.matchAll(/\/Length\s+(\d+)/g)];
    const length = Number(lengths.at(-1)?.[1]);
    if (!length) continue;
    const dataStart = match.index + match[0].length;
    marker.lastIndex = dataStart + length;
    if (
      !header.includes('ASCII85Decode') ||
      !header.includes('FlateDecode') ||
      header.includes('/Subtype /Image')
    ) {
      continue;
    }
    const raw = file.subarray(dataStart, dataStart + length);
    parts.push(inflateSync(decodeAscii85(raw)).toString('latin1'));
  }
  return parts.join('\n');
}

describe('registry snapshot PDF', () => {
  it('is the designed 28 Oct 2026 production snapshot', () => {
    const raw = pdf.toString('latin1');
    const text = snapshotText(pdf);

    expect(raw.startsWith('%PDF')).toBe(true);
    expect(raw).toContain('/Title (UAE Open Finance Registry Snapshot, October 2026)');
    expect(raw).toContain('/Author (Open Finance OS)');
    expect(raw).toContain('/Count 2');
    expect(text).toContain('29 organisations');
    expect(text).toContain('30 registration IDs');
    expect(text).toContain('28 Oct 2026');
    expect(text).toContain('publish an auth server');
    expect(text).toContain('12 of 30');
    expect(text).toContain('ADCB');
    expect(text).toContain('Mercury');
    expect(text).toContain('Independent, community-run');
  });
});
