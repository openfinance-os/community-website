/** Directory terminology. Role claims describe permissions, not an entity's licence type. */
export const taxonomySource = {
  version: '2026-10-08',
  url: 'https://openfinanceuae.atlassian.net/wiki/spaces/TFDocsv5/pages/235077660/Trust%2BFramework%2BUser%2BDocumentation',
};
export const roleLabels: Record<string, string> = {
  LFI: 'Licensed Financial Institution',
  BDSP: 'Bank Data Sharing Provider',
  BSIP: 'Bank Service Initiation Provider',
  ISP: 'Insurance Service Provider',
  TSP: 'Technical Services Provider',
  TPP: 'Third Party Provider',
  'API Read_Write': 'API read and write permission',
};

export const apiFamilyAliases: Record<string, string> = {
  'account-information': 'accounts',
  payment: 'payments',
  confirmation: 'cop',
  product: 'products',
};

export const apiFamilyDefinitions: Record<string, { label: string; description: string }> = {
  accounts: { label: 'Accounts', description: 'Account information access' },
  payments: { label: 'Payments', description: 'Payment initiation services' },
  cop: { label: 'Confirmation of Payee', description: 'Payee verification' },
  products: { label: 'Products', description: 'Product information' },
  insurance: { label: 'Insurance', description: 'Insurance information and services' },
  atm: { label: 'ATM', description: 'ATM information' },
};

export function normalizeApiFamily(rawFamily: string): string {
  return apiFamilyAliases[rawFamily] || rawFamily;
}

export function apiFamilyLabel(family: string): string {
  return apiFamilyDefinitions[family]?.label || family;
}

export function describeApiFamilies(published: string[]) {
  return [...new Set([...Object.keys(apiFamilyDefinitions), ...published])].map((key) => ({
    key,
    label: apiFamilyLabel(key),
    description:
      apiFamilyDefinitions[key]?.description || 'Family identifier published by the directory',
  }));
}
