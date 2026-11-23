import { describe, expect, it } from 'vitest';
import { getRegistryChangelog } from '../registry-changelog';
import { resourceChangePresentation } from '../registry-event-presentation';

describe('resource change presentation', () => {
  it('summarizes the observed HSBC change while retaining every declaration', () => {
    const event = getRegistryChangelog().find(
      (entry) =>
        entry.type === 'resource_changed' && entry.name === 'HSBC' && entry.date === '2026-10-08'
    )!;
    const change = resourceChangePresentation(event.detail!)!;
    expect(change.summary).toBe('ATM v2.1 added.');
    expect(change.before).toHaveLength(6);
    expect(change.after).toHaveLength(7);
    expect(change.after).toContain('atm v2.1; certification=Self-Certified; complete=true');
    for (const declaration of [...change.before, ...change.after]) {
      expect(event.detail).toContain(declaration);
    }
  });

  it('describes a changed completion declaration without implying an added API', () => {
    const event = getRegistryChangelog().find(
      (entry) =>
        entry.type === 'resource_changed' && entry.name === 'NBF' && entry.date === '2026-09-14'
    )!;
    const change = resourceChangePresentation(event.detail!)!;
    expect(change.summary).toBe('Accounts v2.1 updated.');
    expect(change.before[0]).toContain('complete=true');
    expect(change.after[0]).toContain('complete=false');
  });

  it('keeps a mixed change compact and preserves unknown source values', () => {
    const change = resourceChangePresentation(
      'Before: accounts vunknown; certification=unknown; complete=unknown | payments v2.0; certification=Self-Certified; complete=false. After: accounts vunknown; certification=unknown; complete=true | atm v2.1; certification=unknown; complete=unknown.'
    )!;
    expect(change.summary).toBe('3 declarations changed: 1 added · 1 updated · 1 removed.');
    expect(change.before[0]).toContain('vunknown; certification=unknown; complete=unknown');
    expect(change.after[1]).toContain('certification=unknown; complete=unknown');
  });

  it('supports empty observations and a raw-text fallback for unfamiliar formats', () => {
    expect(
      resourceChangePresentation(
        'Before: none recorded. After: insurance v2.1; certification=unknown; complete=false.'
      )
    ).toEqual({
      summary: 'Insurance v2.1 added.',
      before: [],
      after: ['insurance v2.1; certification=unknown; complete=false'],
    });
    expect(
      resourceChangePresentation(
        'Before: atm v2.1; certification=unknown; complete=false. After: none recorded.'
      )?.summary
    ).toBe('ATM v2.1 removed.');
    expect(resourceChangePresentation('Unrecognized observation details')).toBeNull();
  });
});
