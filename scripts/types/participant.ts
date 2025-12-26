// Raw API response types from data.directory.openfinance.ae

export interface RawApiResource {
  ApiResourceId: string;
  ApiVersion: string;
  FamilyComplete: boolean;
  CertificationStatus: string;
  ApiFamilyType: string;
  Status: string;
  ApiDiscoveryEndpoints: Array<{
    ApiDiscoveryId: string;
    ApiEndpoint: string;
  }>;
}

export interface RawAuthServer {
  AuthorisationServerId: string;
  OrganisationId: string;
  Issuer: string;
  Status: string;
  CustomerFriendlyName: string;
  CustomerFriendlyLogoUri: string;
  SupportsCiba: boolean;
  SupportsDCR: boolean;
  SupportsRedirect: boolean;
  ApiResources: RawApiResource[];
}

export interface RawRoleClaim {
  AuthorisationDomainRoleIdentifier: string;
  Status: string;
  AuthorisationDomain: string;
  Role: string;
}

// Raw response from /roles endpoint (simpler structure, no auth servers)
export interface RawRolesDomainClaim {
  AuthorisationDomainName: string;
  Status: string;
}

export interface RawRolesRoleClaim {
  AuthorisationDomainName: string;
  AuthorisationDomainRoleName: string;
  Status: string;
}

export interface RawRole {
  OrganisationId: string;
  Status: string;
  RegistrationNumber: string;
  RegisteredName: string;
  OrgDomainClaims: RawRolesDomainClaim[];
  OrgDomainRoleClaims: RawRolesRoleClaim[];
}

export interface RawParticipant {
  OrganisationId: string;
  Status: string;
  OrganisationName: string;
  LegalEntityName: string;
  City: string;
  Country: string;
  RegistrationNumber: string;
  Flags: Record<string, string[]> | null;
  AuthorisationServers: RawAuthServer[];
  OrgDomainRoleClaims: RawRoleClaim[];
}

// Transformed output types

export interface AuthCapabilities {
  supportsCiba: boolean;
  supportsDCR: boolean;
  supportsRedirect: boolean;
}

export interface ApiResourceInfo {
  family: string;
  version: string;
  certificationStatus: string;
  familyComplete: boolean;
}

export interface TransformedParticipant {
  id: string;
  name: string;
  legalName: string;
  shortName: string;
  status: string;
  roles: string[];
  city: string;
  registrationNumber: string;
  apiFamilies: string[];
  hasAuthServer: boolean;
  isShariahCompliant: boolean;
  // Enhanced fields
  authCapabilities: AuthCapabilities;
  apiResources: ApiResourceInfo[];
  authServerCount: number;
  // Registration status - distinguishes between Live (has APIs) vs Registered only
  isLive: boolean;
}

export interface AuthCapabilitiesSummary {
  ciba: number;
  dcr: number;
  redirect: number;
}

export interface ObservatorySummary {
  totalParticipants: number;
  byStatus: Record<string, number>;
  byRole: Record<string, number>;
  byCity: Record<string, number>;
  apiFamilies: string[];
  // Enhanced metrics
  liveInProduction: number;
  shariahCompliantCount: number;
  multiRoleCount: number;
  tppCount: number;
  byAuthCapabilities: AuthCapabilitiesSummary;
  byCertificationStatus: Record<string, number>;
  byApiVersion: Record<string, number>;
}

export interface TrendData {
  participantChange: number;
  newParticipants: string[];
  removedParticipants: string[];
  roleChanges: Record<string, number>;
  apiFamilyChanges: Record<string, number>;
}

export type Environment = 'production' | 'sandbox';

export interface ObservatorySnapshot {
  timestamp: string;
  source: string;
  version: string;
  environment: Environment;
  summary: ObservatorySummary;
  participants: TransformedParticipant[];
  trends?: TrendData;
}

// Dual environment snapshot for combined view
export interface DualEnvironmentSnapshot {
  timestamp: string;
  version: string;
  production: ObservatorySnapshot | null;
  sandbox: ObservatorySnapshot | null;
  crossEnvironment: {
    inBothEnvironments: string[];
    productionOnly: string[];
    sandboxOnly: string[];
    totalUniqueParticipants: number;
  };
}

// Historical data types for trend analysis
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

export interface HistoricalTrends {
  lastUpdated: string;
  dataPoints: HistoricalDataPoint[];
  productionHistory: HistoricalDataPoint[];
  sandboxHistory: HistoricalDataPoint[];
  milestones: Array<{
    date: string;
    event: string;
    participantId?: string;
    participantName?: string;
  }>;
}
