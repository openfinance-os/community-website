import { describe, expect, it } from 'vitest';
import { transformParticipant, calculateSummary } from '../collect-observatory';
import type { RawParticipant, RawApiResource } from '../types/participant';

function resource(family: string, version = '2.1', status = 'Active'): RawApiResource {
  return {
    ApiResourceId: `${family}-${version}`,
    ApiFamilyType: family,
    ApiVersion: version,
    Status: status,
    CertificationStatus: 'Self-Certified',
    FamilyComplete: true,
    ApiDiscoveryEndpoints: [],
  };
}

function registration(resources: RawApiResource[]): RawParticipant {
  return {
    OrganisationId: 'registration-id',
    OrganisationName: 'Example',
    LegalEntityName: 'Example LLC',
    Status: 'Active',
    City: 'Dubai',
    Country: 'AE',
    RegistrationNumber: '123',
    Flags: null,
    OrgDomainRoleClaims: [],
    AuthorisationServers: [
      {
        AuthorisationServerId: 'server-id',
        OrganisationId: 'registration-id',
        Status: 'Active',
        Issuer: 'https://issuer.example',
        CustomerFriendlyName: 'Example',
        CustomerFriendlyLogoUri: '',
        SupportsCiba: false,
        SupportsDCR: false,
        SupportsRedirect: false,
        ApiResources: resources,
      },
    ],
  };
}

describe('directory transformations', () => {
  it('preserves insurance, ATM, unknown families and every declared version', () => {
    const result = transformParticipant(
      registration([
        resource('account-information'),
        resource('insurance'),
        resource('insurance', '2.0'),
        resource('atm'),
        resource('future-family'),
        resource('inactive', '1.0', 'Inactive'),
      ])
    );
    expect(result.apiFamilies).toEqual(['accounts', 'atm', 'future-family', 'insurance']);
    expect(result.apiResources).toHaveLength(5);
    expect(
      result.apiResources.filter((r) => r.family === 'insurance').map((r) => r.version)
    ).toEqual(['2.1', '2.0']);
    expect(result.apiResources[0].rawFamily).toBe('account-information');
    expect(calculateSummary([result]).apiFamilies).toEqual(result.apiFamilies);
  });

  it('requires an active server and an issuer for the legacy isLive flag', () => {
    const raw = registration([resource('payment')]);
    raw.AuthorisationServers[0].Issuer = '';
    expect(transformParticipant(raw).hasAuthServer).toBe(false);
    expect(transformParticipant(raw).isLive).toBe(false);
    raw.AuthorisationServers[0].Issuer = 'https://issuer.example';
    raw.AuthorisationServers[0].Status = 'Inactive';
    const result = transformParticipant(raw);
    expect(result.apiFamilies).toEqual([]);
    expect(result.isLive).toBe(false);
  });

  it('keeps source declarations separate from role classification', () => {
    const raw = registration([]);
    raw.OrgDomainRoleClaims = [
      {
        AuthorisationDomainRoleIdentifier: 'role',
        Status: 'Active',
        AuthorisationDomain: 'OF',
        Role: 'BDSP',
      },
    ];
    raw.Flags = { shariah_compliant: ['True'] };
    const result = transformParticipant(raw);
    expect(result.isShariahCompliant).toBe(true);
    expect(result.authCapabilities.supportsCiba).toBe(false);
    expect(calculateSummary([result]).tppCount).toBe(0); // Explicit TPP claims, not a licence population.
  });
});
