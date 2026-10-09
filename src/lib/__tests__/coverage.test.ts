import { describe, expect, it } from 'vitest';
import {
  coverageCsv,
  coverageParams,
  defaultCoverageFilters,
  filterCoverage,
  readCoverageState,
  type DirectoryRecord,
} from '../coverage';
import {
  directoryRecords,
  getDirectoryRecords,
  getObservatorySnapshot,
  validateObservatorySnapshot,
} from '../observatory-data';
import { diffSnapshots } from '../registry-changelog';
import { watchBriefing } from '../watch-briefing';

const fixture: DirectoryRecord = {
  key: 'production:one',
  id: 'one',
  name: 'Example',
  legalName: 'Example Ltd',
  environment: 'production',
  source: 'https://example.test',
  profileUrl: '/observatory/participant/one',
  observedAt: '2026-10-08T00:00:00Z',
  issuerPublished: true,
  roles: ['BDSP'],
  families: ['accounts', 'insurance'],
  resources: [
    {
      family: 'accounts',
      rawFamily: 'account-information',
      version: '1.2',
      certification: 'Self-Certified',
      complete: false,
    },
    {
      family: 'insurance',
      rawFamily: 'insurance',
      version: '2.1',
      certification: null,
      complete: null,
    },
  ],
};

describe('coverage evidence', () => {
  it('requires the family and version to match the same resource', () => {
    expect(
      filterCoverage([fixture], { ...defaultCoverageFilters, family: 'insurance', version: '1.2' })
    ).toEqual([]);
    expect(
      filterCoverage([fixture], { ...defaultCoverageFilters, family: 'insurance', version: '2.1' })
    ).toEqual([fixture]);
  });
  it('retains the same ID separately in production and sandbox', () => {
    const sandbox = { ...fixture, key: 'sandbox:one', environment: 'sandbox' as const };
    expect(
      filterCoverage([fixture, sandbox], { ...defaultCoverageFilters, environment: 'both' })
    ).toHaveLength(2);
    expect(
      filterCoverage([fixture, sandbox], { ...defaultCoverageFilters, environment: 'sandbox' })
    ).toEqual([sandbox]);
  });
  it('round-trips filters and valid comparisons while rejecting invalid URL state', () => {
    const filters = {
      ...defaultCoverageFilters,
      family: 'insurance',
      version: '2.1',
      query: 'Example & one',
    };
    expect(readCoverageState(coverageParams(filters, [fixture.key]), [fixture])).toEqual({
      filters,
      selected: [fixture.key],
    });
    const params = new URLSearchParams(
      'environment=invalid&family=made-up&version=9&compare=invalid&compare=production:one&compare=production:one'
    );
    expect(readCoverageState(params, [fixture])).toEqual({
      filters: defaultCoverageFilters,
      selected: [fixture.key],
    });
  });
  it('exports only matching resources, dates and evidence gaps; neutralizes spreadsheet formulas', () => {
    const csv = coverageCsv([{ ...fixture, name: '=HYPERLINK("bad")' }], {
      ...defaultCoverageFilters,
      family: 'insurance',
    });
    expect(csv).toContain('"insurance"');
    expect(csv).not.toContain('"account-information"');
    expect(csv).toContain('2026-10-08T00:00:00Z');
    expect(csv).toContain('Unknown in directory dataset');
    expect(csv).toContain('"\'=HYPERLINK(""bad"")"');
    expect(csv.split('\r\n').filter(Boolean)).toHaveLength(2);
  });
  it('keeps unknown families and every declared version, and preserves missing declarations as unknown', () => {
    const snapshot = structuredClone(getObservatorySnapshot('production'));
    snapshot.participants[0].apiResources.push({
      family: 'future-family',
      version: '3',
      certificationStatus: '',
      familyComplete: false,
    });
    const record = directoryRecords(snapshot, 'production')[0];
    expect(record.families).toContain('future-family');
    expect(record.resources.at(-1)).toMatchObject({
      family: 'future-family',
      version: '3',
      certification: null,
      complete: false,
    });
    Reflect.deleteProperty(snapshot.participants[0].apiResources.at(-1)!, 'familyComplete');
    expect(directoryRecords(snapshot, 'production')[0].resources.at(-1)?.complete).toBeNull();
  });
  it('validates current observations instead of inventing fresh fallbacks', () => {
    expect(() =>
      validateObservatorySnapshot(
        { ...getObservatorySnapshot('production'), timestamp: undefined },
        'production'
      )
    ).toThrow(/timestamp/);
    const snapshot = structuredClone(getObservatorySnapshot('production'));
    snapshot.participants[1].id = snapshot.participants[0].id;
    expect(() => validateObservatorySnapshot(snapshot, 'production')).toThrow(/duplicate/);
    expect(getDirectoryRecords()).toHaveLength(
      getObservatorySnapshot('production').participants.length +
        getObservatorySnapshot('sandbox').participants.length
    );
  });
});

describe('dated evidence changes', () => {
  it('captures removals and declaration changes without treating absent historical fields as removals', () => {
    const before = {
      participants: [
        {
          id: 'one',
          name: 'Example',
          roles: ['BDSP', 'BSIP'],
          apiFamilies: ['accounts', 'payments'],
          apiResources: [
            {
              family: 'accounts',
              version: '1.2',
              certificationStatus: 'Self-Certified',
              familyComplete: false,
            },
          ],
        },
      ],
    };
    const after = {
      participants: [
        {
          id: 'one',
          name: 'Example',
          roles: ['BDSP'],
          apiFamilies: ['accounts'],
          apiResources: [
            {
              family: 'accounts',
              version: '2.1',
              certificationStatus: 'Self-Certified',
              familyComplete: true,
            },
          ],
        },
      ],
    };
    const events = diffSnapshots(before, after, '2026-10-08');
    expect(events.map((event) => event.type)).toEqual([
      'role_removed',
      'api_family_removed',
      'resource_changed',
    ]);
    expect(events.at(-1)?.detail).toContain('accounts v1.2');
    expect(events.at(-1)?.detail).toContain('accounts v2.1');
    expect(
      diffSnapshots(before, { participants: [{ id: 'one', name: 'Example' }] }, '2026-10-08')
    ).toEqual([]);
  });
  it('does not infer declaration changes from reordering', () => {
    const resources = [
      { family: 'accounts', version: '1.2' },
      { family: 'accounts', version: '2.1' },
    ];
    expect(
      diffSnapshots(
        { participants: [{ id: 'one', name: 'Example', apiResources: resources }] },
        { participants: [{ id: 'one', name: 'Example', apiResources: [...resources].reverse() }] },
        '2026-10-08'
      )
    ).toEqual([]);
  });
});

describe('saved Watch briefing', () => {
  it('keeps run date separate from log cutoff and limits links to known Watch sections', () => {
    const result = watchBriefing({
      runDate: '2026-10-05',
      asOfData: '2026-09-29',
      summary: [
        { area: 'Standards', text: 'Observed change', href: 'javascript:bad', status: 'new' },
      ],
    });
    expect(result).toMatchObject({ runDate: '2026-10-05', asOfData: '2026-09-29' });
    expect(result.items[0].href).toBe('/observatory/watch/#standards');
    expect(() => watchBriefing({ runDate: '2026-10-05', summary: [] })).toThrow(/cutoff/);
  });
});
