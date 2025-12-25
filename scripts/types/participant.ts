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
}

export interface ObservatorySummary {
  totalParticipants: number;
  byStatus: Record<string, number>;
  byRole: Record<string, number>;
  byCity: Record<string, number>;
  apiFamilies: string[];
}

export interface ObservatorySnapshot {
  timestamp: string;
  source: string;
  version: string;
  summary: ObservatorySummary;
  participants: TransformedParticipant[];
}
