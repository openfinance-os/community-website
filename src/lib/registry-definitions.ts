/** Names retained in JSON for compatibility; these definitions govern their interpretation. */
export const registryDefinitions = {
  totalParticipants:
    'Distinct directory registration IDs after test/support and unnamed entries are excluded; not deduplicated legal entities.',
  hasAuthServer:
    'At least one active authorization server with a nonempty issuer is published in the directory; availability and traffic are not tested.',
  isLive: 'Legacy alias of hasAuthServer; does not mean verified live service or observed traffic.',
  liveInProduction:
    'Legacy summary field counting registrations with hasAuthServer, within the snapshot environment.',
  shariahCompliantCount:
    'Registrations whose source shariah_compliant flag includes True; not a count of all Islamic finance institutions.',
  tppCount:
    'Legacy count of explicit TPP role claims; not a population estimate or licence classification. TPP population is unavailable from these claims.',
  apiFamilies:
    'Distinct active API-resource family identifiers on active authorization servers. Version 2.1 preserves insurance, ATM and unknown identifiers previously omitted.',
  authCapabilities:
    'Directory flags aggregated across active authorization servers. False means not declared true, not a tested absence of support.',
  history:
    'Historical observations retain their original schema and collection coverage; collector changes can create apparent changes in coverage.',
};
