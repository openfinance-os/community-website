import { describe, it, expect } from 'vitest';
import { findProfile, getDisplayCity, calculateCityDistribution } from '../city-utils';
import type { ProfilesMap, ParticipantProfile } from '../types';

// Test fixtures
const mockProfiles: ProfilesMap = {
  'Emirates NBD': {
    shortName: 'ENBD',
    fullName: 'Emirates NBD Bank PJSC',
    headquarters: {
      city: 'Dubai',
      country: 'UAE',
      countryCode: 'AE',
    },
  },
  FAB: {
    shortName: 'FAB',
    fullName: 'First Abu Dhabi Bank PJSC',
    headquarters: {
      city: 'Abu Dhabi',
      country: 'UAE',
      countryCode: 'AE',
    },
  },
  Mashreq: {
    shortName: 'Mashreq',
    fullName: 'Mashreq Bank PSC',
    headquarters: {
      city: 'Dubai',
      country: 'UAE',
      countryCode: 'AE',
    },
  },
};

describe('city-utils', () => {
  describe('findProfile', () => {
    it('finds profile by exact name match', () => {
      const participant = {
        name: 'Emirates NBD',
        shortName: 'ENBD',
        legalName: 'Emirates NBD Bank PJSC',
      };

      const result = findProfile(participant, mockProfiles);

      expect(result).toBeDefined();
      expect(result?.headquarters?.city).toBe('Dubai');
    });

    it('finds profile by shortName when name does not match', () => {
      const participant = {
        name: 'First Abu Dhabi Bank',
        shortName: 'FAB',
        legalName: 'First Abu Dhabi Bank PJSC',
      };

      const result = findProfile(participant, mockProfiles);

      expect(result).toBeDefined();
      expect(result?.headquarters?.city).toBe('Abu Dhabi');
    });

    it('finds profile by fuzzy matching with legalName', () => {
      const participant = {
        name: 'Mashreq Bank',
        shortName: undefined,
        legalName: 'Mashreq Bank PSC',
      };

      const result = findProfile(participant, mockProfiles);

      expect(result).toBeDefined();
      expect(result?.fullName).toBe('Mashreq Bank PSC');
    });

    it('returns undefined when no match found', () => {
      const participant = {
        name: 'Unknown Bank',
        shortName: 'UNK',
        legalName: 'Unknown Bank Ltd',
      };

      const result = findProfile(participant, mockProfiles);

      expect(result).toBeUndefined();
    });

    it('handles empty profiles map', () => {
      const participant = {
        name: 'Emirates NBD',
        shortName: 'ENBD',
        legalName: 'Emirates NBD Bank PJSC',
      };

      const result = findProfile(participant, {});

      expect(result).toBeUndefined();
    });

    it('handles participant with only name', () => {
      const participant = {
        name: 'Mashreq',
        shortName: undefined,
        legalName: undefined,
      };

      const result = findProfile(participant, mockProfiles);

      expect(result).toBeDefined();
      expect(result?.shortName).toBe('Mashreq');
    });
  });

  describe('getDisplayCity', () => {
    it('returns participant city when not Unknown', () => {
      const participant = {
        name: 'Emirates NBD',
        shortName: 'ENBD',
        legalName: 'Emirates NBD Bank PJSC',
        city: 'Dubai',
      };

      const result = getDisplayCity(participant, mockProfiles);

      expect(result).toBe('Dubai');
    });

    it('falls back to profile headquarters when city is Unknown', () => {
      const participant = {
        name: 'Emirates NBD',
        shortName: 'ENBD',
        legalName: 'Emirates NBD Bank PJSC',
        city: 'Unknown',
      };

      const result = getDisplayCity(participant, mockProfiles);

      expect(result).toBe('Dubai');
    });

    it('returns Unknown when city is Unknown and no profile found', () => {
      const participant = {
        name: 'Unknown Bank',
        shortName: 'UNK',
        legalName: 'Unknown Bank Ltd',
        city: 'Unknown',
      };

      const result = getDisplayCity(participant, mockProfiles);

      expect(result).toBe('Unknown');
    });

    it('returns Unknown when profile has no headquarters', () => {
      const profilesWithoutHQ: ProfilesMap = {
        Test: {
          shortName: 'TST',
          fullName: 'Test Bank',
          // No headquarters
        },
      };

      const participant = {
        name: 'Test',
        shortName: 'TST',
        legalName: 'Test Bank',
        city: 'Unknown',
      };

      const result = getDisplayCity(participant, profilesWithoutHQ);

      expect(result).toBe('Unknown');
    });
  });

  describe('calculateCityDistribution', () => {
    it('calculates distribution for participants with known cities', () => {
      const participants = [
        { name: 'Bank A', shortName: 'A', legalName: 'Bank A Ltd', city: 'Dubai' },
        { name: 'Bank B', shortName: 'B', legalName: 'Bank B Ltd', city: 'Dubai' },
        { name: 'Bank C', shortName: 'C', legalName: 'Bank C Ltd', city: 'Abu Dhabi' },
      ];

      const result = calculateCityDistribution(participants, {});

      expect(result).toEqual({
        Dubai: 2,
        'Abu Dhabi': 1,
      });
    });

    it('uses profile fallback for Unknown cities', () => {
      const participants = [
        {
          name: 'Emirates NBD',
          shortName: 'ENBD',
          legalName: 'Emirates NBD Bank PJSC',
          city: 'Unknown',
        },
        { name: 'FAB', shortName: 'FAB', legalName: 'First Abu Dhabi Bank PJSC', city: 'Unknown' },
        { name: 'Some Bank', shortName: 'SB', legalName: 'Some Bank', city: 'Sharjah' },
      ];

      const result = calculateCityDistribution(participants, mockProfiles);

      expect(result).toEqual({
        Dubai: 1,
        'Abu Dhabi': 1,
        Sharjah: 1,
      });
    });

    it('handles empty participants array', () => {
      const result = calculateCityDistribution([], mockProfiles);

      expect(result).toEqual({});
    });

    it('handles all Unknown cities with no profiles', () => {
      const participants = [
        { name: 'Bank A', shortName: 'A', legalName: 'Bank A Ltd', city: 'Unknown' },
        { name: 'Bank B', shortName: 'B', legalName: 'Bank B Ltd', city: 'Unknown' },
      ];

      const result = calculateCityDistribution(participants, {});

      expect(result).toEqual({
        Unknown: 2,
      });
    });

    it('correctly aggregates multiple participants in same city', () => {
      const participants = [
        { name: 'Bank A', shortName: 'A', legalName: 'Bank A', city: 'Dubai' },
        { name: 'Bank B', shortName: 'B', legalName: 'Bank B', city: 'Dubai' },
        { name: 'Bank C', shortName: 'C', legalName: 'Bank C', city: 'Dubai' },
        { name: 'Bank D', shortName: 'D', legalName: 'Bank D', city: 'Abu Dhabi' },
        { name: 'Bank E', shortName: 'E', legalName: 'Bank E', city: 'Abu Dhabi' },
      ];

      const result = calculateCityDistribution(participants, {});

      expect(result.Dubai).toBe(3);
      expect(result['Abu Dhabi']).toBe(2);
      expect(Object.keys(result)).toHaveLength(2);
    });
  });
});
