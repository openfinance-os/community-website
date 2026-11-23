/**
 * Shared types for the Open Finance OS website
 */

// Observatory participant profile
export interface ParticipantProfile {
  shortName?: string;
  fullName?: string;
  description?: string;
  founded?: number;
  headquarters?: {
    city: string;
    country: string;
    countryCode: string;
  };
  parentCompany?: {
    name: string;
    headquarters: string;
    countryCode: string;
  };
  type?: string;
  typeLabel?: string;
  ownership?: string;
  ownershipDetail?: string;
  marketPosition?: string;
  website?: string | null;
  specializations?: string[];
}

// Observatory participant from API
export interface Participant {
  id: string;
  name: string;
  shortName?: string;
  legalName?: string;
  status: string;
  roles: string[];
  city: string;
  apiFamilies: string[];
  hasAuthServer: boolean;
  isShariahCompliant: boolean;
  isLive?: boolean;
}

// Historical data point for trends
export interface HistoricalDataPoint {
  date: string;
  totalParticipants: number;
  liveInProduction: number;
  byRole: Record<string, number>;
  byCity: Record<string, number>;
  apiFamilyCoverage: Record<string, number>;
  tppCount: number;
  shariahCompliantCount: number;
}

// Observatory summary
export interface ObservatorySummary {
  totalParticipants: number;
  byStatus: Record<string, number>;
  byRole: Record<string, number>;
  byCity: Record<string, number>;
  apiFamilies: string[];
  liveInProduction: number;
  shariahCompliantCount: number;
  multiRoleCount: number;
  tppCount: number;
  byAuthCapabilities: {
    ciba: number;
    dcr: number;
    redirect: number;
  };
}

// Observatory snapshot
export interface ObservatorySnapshot {
  timestamp: string;
  summary: ObservatorySummary;
  participants: Participant[];
  trends?: {
    participantGrowth: number;
    apiCoverageGrowth: number;
  };
}

// Dual environment snapshot format
export interface DualEnvironmentSnapshot {
  production: ObservatorySnapshot;
  sandbox: ObservatorySnapshot;
  crossEnvironment: {
    inBothEnvironments: number;
    productionOnly: number;
    sandboxOnly: number;
    totalUnique: number;
  };
}

// Profile lookup map type
export type ProfilesMap = Record<string, ParticipantProfile>;
