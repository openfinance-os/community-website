/**
 * City resolution utilities for Observatory data
 *
 * Provides fallback logic when the API returns "Unknown" city
 * by looking up participant profiles for headquarters information.
 */

import type { Participant, ParticipantProfile, ProfilesMap } from './types';

/**
 * Find a participant's profile from the profiles map
 */
export function findProfile(
  participant: Pick<Participant, 'name' | 'shortName' | 'legalName'>,
  profiles: ProfilesMap
): ParticipantProfile | undefined {
  // Try direct lookup by name or shortName
  const directMatch =
    profiles[participant.name] ||
    (participant.shortName ? profiles[participant.shortName] : undefined);

  if (directMatch) {
    return directMatch;
  }

  // Try fuzzy matching
  return Object.values(profiles).find(
    (p) =>
      p.shortName === participant.shortName ||
      p.fullName === participant.legalName ||
      (p.shortName && participant.name.includes(p.shortName))
  );
}

/**
 * Get the display city for a participant, using profile fallback if needed
 */
export function getDisplayCity(
  participant: Pick<Participant, 'name' | 'shortName' | 'legalName' | 'city'>,
  profiles: ProfilesMap
): string {
  if (participant.city !== 'Unknown') {
    return participant.city;
  }

  const profile = findProfile(participant, profiles);
  return profile?.headquarters?.city || 'Unknown';
}

/**
 * Calculate city distribution with profile fallbacks
 */
export function calculateCityDistribution(
  participants: Pick<Participant, 'name' | 'shortName' | 'legalName' | 'city'>[],
  profiles: ProfilesMap
): Record<string, number> {
  const byCity: Record<string, number> = {};

  for (const participant of participants) {
    const city = getDisplayCity(participant, profiles);
    byCity[city] = (byCity[city] || 0) + 1;
  }

  return byCity;
}
