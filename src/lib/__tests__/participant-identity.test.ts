import { describe, expect, it } from 'vitest';
import { participantPaths, participantUrl } from '../participant-identity';
import { apiFamilyLabel, describeApiFamilies, normalizeApiFamily, roleLabels } from '../taxonomy';
import { glossaryAnchor, glossaryData } from '../glossary';
import production from '../../../data/observatory/snapshots/production/latest.json';
import sandbox from '../../../data/observatory/snapshots/sandbox/latest.json';

describe('registration identity', () => {
  it.each([
    ['production', production],
    ['sandbox', sandbox],
  ] as const)('generates unique %s paths and preserves every ID', (environment, snapshot) => {
    const paths = participantPaths(snapshot.participants, environment);
    expect(new Set(paths.map((p) => p.params.slug)).size).toBe(paths.length);
    for (const registration of snapshot.participants) {
      expect(paths.find((p) => p.params.slug === registration.id)?.props.matches[0].id).toBe(
        registration.id
      );
    }
  });

  it('resolves colliding Mercury names to distinct pages and a legacy chooser', () => {
    const paths = participantPaths(production.participants, 'production');
    const mercury = paths.find((p) => p.params.slug === 'mercury')!;
    expect(mercury.props.matches).toHaveLength(2);
    expect(mercury.props.redirectTo).toBeUndefined();
    expect(new Set(mercury.props.matches.map((p) => participantUrl(p))).size).toBe(2);
  });

  it('keeps ID routes stable through renames and redirects unambiguous old names', () => {
    expect(participantUrl({ id: 'stable-id' })).toBe('/observatory/participant/stable-id');
    expect(participantUrl({ id: 'stable-id' }, 'sandbox')).toBe(
      '/observatory/sandbox/participant/stable-id'
    );
    const paths = participantPaths([{ id: 'stable-id', name: 'Renamed' }], 'production');
    expect(paths.find((p) => p.params.slug === 'renamed')?.props.redirectTo).toBe(
      '/observatory/participant/stable-id'
    );
    expect(participantPaths([{ id: 'id', name: '!!!' }], 'production')).toHaveLength(1);
    expect(participantPaths([{ id: 'id', name: 'id' }], 'production')).toHaveLength(1);
  });
});

describe('shared terminology and discovery', () => {
  it('keeps role meanings and novel family metadata visible', () => {
    expect(roleLabels.ISP).toBe('Insurance Service Provider');
    expect(normalizeApiFamily('account-information')).toBe('accounts');
    expect(normalizeApiFamily('future-family')).toBe('future-family');
    expect(apiFamilyLabel('future-family')).toBe('future-family');
    expect(
      describeApiFamilies(['future-family', 'insurance']).filter((f) => f.key === 'future-family')
    ).toHaveLength(1);
  });

  it('has unique glossary anchors including searchable authentication concepts', () => {
    const terms = glossaryData.flatMap((section) => section.terms);
    expect(new Set(terms.map((t) => glossaryAnchor(t.term))).size).toBe(terms.length);
    expect(terms.some((t) => t.term === 'CIBA')).toBe(true);
    expect(terms.some((t) => t.term === 'DCR')).toBe(true);
    expect(glossaryAnchor(' Al Tareq ')).toBe('al-tareq');
  });
});
