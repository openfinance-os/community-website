import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchParticipants } from './utils/directory-client.js';
import type {
  RawParticipant,
  TransformedParticipant,
  ObservatorySnapshot,
  ObservatorySummary,
} from './types/participant.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '..', 'data', 'observatory', 'snapshots');

// API family type mapping (from raw API to display names)
const API_FAMILY_MAP: Record<string, string> = {
  'account-information': 'accounts',
  payment: 'payments',
  confirmation: 'cop',
  product: 'products',
};

function transformParticipant(raw: RawParticipant): TransformedParticipant {
  // Extract active roles
  const roles = raw.OrgDomainRoleClaims.filter((claim) => claim.Status === 'Active')
    .map((claim) => claim.Role)
    .filter((role, index, arr) => arr.indexOf(role) === index);

  // Extract API families from all active auth servers
  const apiFamilies = new Set<string>();
  for (const authServer of raw.AuthorisationServers) {
    if (authServer.Status === 'Active') {
      for (const resource of authServer.ApiResources) {
        if (resource.Status === 'Active') {
          const mapped = API_FAMILY_MAP[resource.ApiFamilyType];
          if (mapped) {
            apiFamilies.add(mapped);
          }
        }
      }
    }
  }

  // Check if has active auth server
  const hasAuthServer = raw.AuthorisationServers.some(
    (server) => server.Status === 'Active' && server.Issuer
  );

  // Check Shariah compliance flag
  const isShariahCompliant = raw.Flags?.shariah_compliant?.includes('True') ?? false;

  return {
    id: raw.OrganisationId,
    name: raw.OrganisationName,
    legalName: raw.LegalEntityName,
    shortName: raw.OrganisationName,
    status: raw.Status,
    roles: roles.sort(),
    city: raw.City,
    registrationNumber: raw.RegistrationNumber,
    apiFamilies: Array.from(apiFamilies).sort(),
    hasAuthServer,
    isShariahCompliant,
  };
}

function calculateSummary(participants: TransformedParticipant[]): ObservatorySummary {
  const byStatus: Record<string, number> = {};
  const byRole: Record<string, number> = {};
  const byCity: Record<string, number> = {};
  const allApiFamilies = new Set<string>();

  for (const p of participants) {
    // Count by status
    byStatus[p.status] = (byStatus[p.status] || 0) + 1;

    // Count by role (each participant can have multiple roles)
    for (const role of p.roles) {
      byRole[role] = (byRole[role] || 0) + 1;
    }

    // Count by city
    byCity[p.city] = (byCity[p.city] || 0) + 1;

    // Collect all API families
    for (const family of p.apiFamilies) {
      allApiFamilies.add(family);
    }
  }

  return {
    totalParticipants: participants.length,
    byStatus,
    byRole,
    byCity,
    apiFamilies: Array.from(allApiFamilies).sort(),
  };
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');

  console.log('OpenFinance-OS Observatory Collector');
  console.log('====================================');
  if (isDryRun) {
    console.log('DRY RUN MODE - No files will be written\n');
  }

  try {
    // Fetch raw data
    const rawParticipants = await fetchParticipants();

    // Transform participants
    const participants = rawParticipants.map(transformParticipant);

    // Calculate summary
    const summary = calculateSummary(participants);

    // Create snapshot
    const timestamp = new Date().toISOString();
    const snapshot: ObservatorySnapshot = {
      timestamp,
      source: 'data.directory.openfinance.ae',
      version: '1.0.0',
      summary,
      participants,
    };

    console.log('\nSnapshot Summary:');
    console.log(`  Total participants: ${summary.totalParticipants}`);
    console.log(`  By status: ${JSON.stringify(summary.byStatus)}`);
    console.log(`  By role: ${JSON.stringify(summary.byRole)}`);
    console.log(`  By city: ${JSON.stringify(summary.byCity)}`);
    console.log(`  API families: ${summary.apiFamilies.join(', ')}`);

    if (isDryRun) {
      console.log('\n[DRY RUN] Would write to:');
      console.log(`  - ${join(DATA_DIR, 'latest.json')}`);
      console.log(`  - ${join(DATA_DIR, timestamp.split('T')[0] + '.json')}`);
      return;
    }

    // Ensure directory exists
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }

    // Write latest.json
    const latestPath = join(DATA_DIR, 'latest.json');
    writeFileSync(latestPath, JSON.stringify(snapshot, null, 2));
    console.log(`\nWritten: ${latestPath}`);

    // Write dated snapshot for historical archive
    const datePath = join(DATA_DIR, `${timestamp.split('T')[0]}.json`);
    writeFileSync(datePath, JSON.stringify(snapshot, null, 2));
    console.log(`Written: ${datePath}`);

    console.log('\nCollection complete!');
  } catch (error) {
    console.error('Collection failed:', error);
    process.exit(1);
  }
}

main();
