import { writeFileSync, readFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  fetchParticipants,
  fetchRoles,
  fetchFromBothEnvironments,
  getDirectoryUrl,
} from './utils/directory-client.js';
import type {
  RawParticipant,
  RawRole,
  TransformedParticipant,
  ObservatorySnapshot,
  ObservatorySummary,
  DualEnvironmentSnapshot,
  Environment,
  TrendData,
  HistoricalDataPoint,
  HistoricalTrends,
  AuthCapabilities,
  ApiResourceInfo,
} from './types/participant.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '..', 'data', 'observatory', 'snapshots');
const HISTORY_FILE = join(__dirname, '..', 'data', 'observatory', 'history.json');
const NAME_MAPPINGS_FILE = join(__dirname, '..', 'data', 'participants', 'name-mappings.json');

const SNAPSHOT_VERSION = '2.0.0';

// Test/support organizations to exclude from data
const EXCLUDED_ORGANIZATIONS = new Set([
  'TEST ORG',
  'Ozone API Test 2',
  'Nebras Support',
  'Test Organization',
  'Demo Organization',
]);

// Load name mappings for cleaner display names
let nameMappings: Record<string, string> = {};
try {
  if (existsSync(NAME_MAPPINGS_FILE)) {
    nameMappings = JSON.parse(readFileSync(NAME_MAPPINGS_FILE, 'utf-8'));
    console.log(`Loaded ${Object.keys(nameMappings).length} name mappings`);
  }
} catch (error) {
  console.warn('Failed to load name mappings:', error);
}

// Apply name mapping to get display name
function getDisplayName(originalName: string): string {
  return nameMappings[originalName] || originalName;
}

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

  // Extract API families and detailed resource info from all active auth servers
  const apiFamilies = new Set<string>();
  const apiResources: ApiResourceInfo[] = [];
  let supportsCiba = false;
  let supportsDCR = false;
  let supportsRedirect = false;
  let authServerCount = 0;

  for (const authServer of raw.AuthorisationServers) {
    if (authServer.Status === 'Active') {
      authServerCount++;

      // Aggregate auth capabilities
      if (authServer.SupportsCiba) supportsCiba = true;
      if (authServer.SupportsDCR) supportsDCR = true;
      if (authServer.SupportsRedirect) supportsRedirect = true;

      for (const resource of authServer.ApiResources) {
        if (resource.Status === 'Active') {
          const mapped = API_FAMILY_MAP[resource.ApiFamilyType];
          if (mapped) {
            apiFamilies.add(mapped);
            apiResources.push({
              family: mapped,
              version: resource.ApiVersion,
              certificationStatus: resource.CertificationStatus,
              familyComplete: resource.FamilyComplete,
            });
          }
        }
      }
    }
  }

  // Check if has active auth server with issuer
  const hasAuthServer = raw.AuthorisationServers.some(
    (server) => server.Status === 'Active' && server.Issuer
  );

  // Check Shariah compliance flag
  const isShariahCompliant = raw.Flags?.shariah_compliant?.includes('True') ?? false;

  const authCapabilities: AuthCapabilities = {
    supportsCiba,
    supportsDCR,
    supportsRedirect,
  };

  const displayName = getDisplayName(raw.OrganisationName);

  return {
    id: raw.OrganisationId,
    name: displayName,
    legalName: raw.LegalEntityName,
    shortName: displayName,
    status: raw.Status,
    roles: roles.sort(),
    city: raw.City,
    registrationNumber: raw.RegistrationNumber,
    apiFamilies: Array.from(apiFamilies).sort(),
    hasAuthServer,
    isShariahCompliant,
    authCapabilities,
    apiResources,
    authServerCount,
    isLive: hasAuthServer, // Live if has active auth server
  };
}

// Transform a role (registered-only org without full participant data)
function transformRole(raw: RawRole): TransformedParticipant {
  // Extract active roles
  const roles = raw.OrgDomainRoleClaims.filter((claim) => claim.Status === 'Active')
    .map((claim) => claim.AuthorisationDomainRoleName)
    .filter((role, index, arr) => arr.indexOf(role) === index);

  // Use registered name, falling back to org ID for unnamed registrations
  const rawName = raw.RegisteredName || raw.OrganisationId;
  const displayName = getDisplayName(rawName);

  return {
    id: raw.OrganisationId,
    name: displayName,
    legalName: rawName,
    shortName: displayName,
    status: raw.Status,
    roles: roles.sort(),
    city: 'Unknown', // /roles endpoint doesn't include city
    registrationNumber: raw.RegistrationNumber,
    apiFamilies: [],
    hasAuthServer: false,
    isShariahCompliant: false, // Would need to look up from profiles
    authCapabilities: {
      supportsCiba: false,
      supportsDCR: false,
      supportsRedirect: false,
    },
    apiResources: [],
    authServerCount: 0,
    isLive: false, // Registered only, not live
  };
}

// Check if organization should be excluded (test/support orgs)
function shouldExclude(name: string | undefined | null): boolean {
  if (!name) return false; // Missing names are real orgs, not excluded
  // Check exact match first
  if (EXCLUDED_ORGANIZATIONS.has(name)) return true;
  // Check case-insensitive match
  const nameLower = name.toLowerCase();
  for (const excluded of EXCLUDED_ORGANIZATIONS) {
    if (nameLower === excluded.toLowerCase()) return true;
  }
  // Check for common test patterns
  if (nameLower.includes('test org') || nameLower.includes('demo org')) return true;
  // Exclude Nebras support variants
  if (nameLower.startsWith('nebras')) return true;
  return false;
}

// Merge participants (live) with roles (all registered)
// Each unique OrganisationId is counted as a separate registration
function mergeParticipantsAndRoles(
  participants: TransformedParticipant[],
  roles: RawRole[]
): TransformedParticipant[] {
  const seenIds = new Set<string>();
  const merged: TransformedParticipant[] = [];
  let excludedCount = 0;
  let duplicateCount = 0;

  // Process participants first (live orgs with auth servers)
  for (const p of participants) {
    // Skip excluded test orgs
    if (shouldExclude(p.legalName) || shouldExclude(p.name)) {
      excludedCount++;
      continue;
    }
    // Skip duplicates by ID
    if (seenIds.has(p.id)) {
      duplicateCount++;
      continue;
    }

    seenIds.add(p.id);
    merged.push(p);
  }

  // Add roles that aren't already in participants
  for (const role of roles) {
    // Skip if already seen by ID or not active
    if (seenIds.has(role.OrganisationId) || role.Status !== 'Active') {
      if (seenIds.has(role.OrganisationId)) duplicateCount++;
      continue;
    }
    // Skip excluded test orgs
    if (shouldExclude(role.RegisteredName)) {
      excludedCount++;
      continue;
    }

    seenIds.add(role.OrganisationId);
    merged.push(transformRole(role));
  }

  if (excludedCount > 0) {
    console.log(`  Filtered out ${excludedCount} test/support organizations`);
  }
  if (duplicateCount > 0) {
    console.log(`  Removed ${duplicateCount} duplicate entries (by ID)`);
  }

  // Sort by name (with null safety)
  return merged.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

function calculateSummary(participants: TransformedParticipant[]): ObservatorySummary {
  const byStatus: Record<string, number> = {};
  const byRole: Record<string, number> = {};
  const byCity: Record<string, number> = {};
  const byCertificationStatus: Record<string, number> = {};
  const byApiVersion: Record<string, number> = {};
  const allApiFamilies = new Set<string>();

  let liveInProduction = 0;
  let shariahCompliantCount = 0;
  let multiRoleCount = 0;
  let tppCount = 0;
  let cibaCount = 0;
  let dcrCount = 0;
  let redirectCount = 0;

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

    // Count certification statuses and API versions
    for (const resource of p.apiResources) {
      byCertificationStatus[resource.certificationStatus] =
        (byCertificationStatus[resource.certificationStatus] || 0) + 1;
      byApiVersion[resource.version] = (byApiVersion[resource.version] || 0) + 1;
    }

    // Enhanced metrics
    if (p.hasAuthServer) liveInProduction++;
    if (p.isShariahCompliant) shariahCompliantCount++;
    if (p.roles.length > 1) multiRoleCount++;
    if (p.roles.includes('TPP')) tppCount++;

    // Auth capabilities
    if (p.authCapabilities.supportsCiba) cibaCount++;
    if (p.authCapabilities.supportsDCR) dcrCount++;
    if (p.authCapabilities.supportsRedirect) redirectCount++;
  }

  return {
    totalParticipants: participants.length,
    byStatus,
    byRole,
    byCity,
    apiFamilies: Array.from(allApiFamilies).sort(),
    liveInProduction,
    shariahCompliantCount,
    multiRoleCount,
    tppCount,
    byAuthCapabilities: {
      ciba: cibaCount,
      dcr: dcrCount,
      redirect: redirectCount,
    },
    byCertificationStatus,
    byApiVersion,
  };
}

function calculateTrends(
  current: TransformedParticipant[],
  previous: ObservatorySnapshot | null
): TrendData {
  if (!previous) {
    return {
      participantChange: current.length,
      newParticipants: current.map((p) => p.id),
      removedParticipants: [],
      roleChanges: {},
      apiFamilyChanges: {},
    };
  }

  const currentIds = new Set(current.map((p) => p.id));
  const previousIds = new Set(previous.participants.map((p) => p.id));

  const newParticipants = current.filter((p) => !previousIds.has(p.id)).map((p) => p.id);
  const removedParticipants = previous.participants
    .filter((p) => !currentIds.has(p.id))
    .map((p) => p.id);

  // Calculate role changes
  const roleChanges: Record<string, number> = {};
  const currentSummary = calculateSummary(current);
  for (const role of Object.keys(currentSummary.byRole)) {
    const currentCount = currentSummary.byRole[role] || 0;
    const previousCount = previous.summary.byRole[role] || 0;
    if (currentCount !== previousCount) {
      roleChanges[role] = currentCount - previousCount;
    }
  }

  // Calculate API family coverage changes
  const apiFamilyChanges: Record<string, number> = {};
  for (const family of currentSummary.apiFamilies) {
    const currentCount = current.filter((p) => p.apiFamilies.includes(family)).length;
    const previousCount = previous.participants.filter((p) =>
      p.apiFamilies.includes(family)
    ).length;
    if (currentCount !== previousCount) {
      apiFamilyChanges[family] = currentCount - previousCount;
    }
  }

  return {
    participantChange: current.length - previous.participants.length,
    newParticipants,
    removedParticipants,
    roleChanges,
    apiFamilyChanges,
  };
}

function loadPreviousSnapshot(environment: Environment): ObservatorySnapshot | null {
  const latestPath = join(DATA_DIR, environment, 'latest.json');
  if (existsSync(latestPath)) {
    try {
      const content = readFileSync(latestPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
  return null;
}

function createSnapshot(
  participants: TransformedParticipant[],
  environment: Environment,
  previousSnapshot: ObservatorySnapshot | null
): ObservatorySnapshot {
  const summary = calculateSummary(participants);
  const trends = calculateTrends(participants, previousSnapshot);

  return {
    timestamp: new Date().toISOString(),
    source: getDirectoryUrl(environment),
    version: SNAPSHOT_VERSION,
    environment,
    summary,
    participants,
    trends,
  };
}

function createDualEnvironmentSnapshot(
  production: ObservatorySnapshot | null,
  sandbox: ObservatorySnapshot | null
): DualEnvironmentSnapshot {
  const productionIds = new Set(production?.participants.map((p) => p.id) || []);
  const sandboxIds = new Set(sandbox?.participants.map((p) => p.id) || []);

  const inBothEnvironments = [...productionIds].filter((id) => sandboxIds.has(id));
  const productionOnly = [...productionIds].filter((id) => !sandboxIds.has(id));
  const sandboxOnly = [...sandboxIds].filter((id) => !productionIds.has(id));

  const allIds = new Set([...productionIds, ...sandboxIds]);

  return {
    timestamp: new Date().toISOString(),
    version: SNAPSHOT_VERSION,
    production,
    sandbox,
    crossEnvironment: {
      inBothEnvironments,
      productionOnly,
      sandboxOnly,
      totalUniqueParticipants: allIds.size,
    },
  };
}

function updateHistoricalData(snapshot: ObservatorySnapshot, environment: Environment): void {
  let history: HistoricalTrends;

  if (existsSync(HISTORY_FILE)) {
    try {
      history = JSON.parse(readFileSync(HISTORY_FILE, 'utf-8'));
    } catch {
      history = createEmptyHistory();
    }
  } else {
    history = createEmptyHistory();
  }

  const dataPoint: HistoricalDataPoint = {
    date: snapshot.timestamp.split('T')[0],
    totalParticipants: snapshot.summary.totalParticipants,
    liveInProduction: snapshot.summary.liveInProduction,
    byRole: { ...snapshot.summary.byRole },
    byCity: { ...snapshot.summary.byCity },
    apiFamilyCoverage: {},
    tppCount: snapshot.summary.tppCount,
    shariahCompliantCount: snapshot.summary.shariahCompliantCount,
  };

  // Calculate API family coverage
  for (const family of snapshot.summary.apiFamilies) {
    dataPoint.apiFamilyCoverage[family] = snapshot.participants.filter((p) =>
      p.apiFamilies.includes(family)
    ).length;
  }

  // Add to appropriate history array
  const historyArray =
    environment === 'production' ? history.productionHistory : history.sandboxHistory;

  // Check if we already have data for this date
  const existingIndex = historyArray.findIndex((dp) => dp.date === dataPoint.date);
  if (existingIndex >= 0) {
    historyArray[existingIndex] = dataPoint;
  } else {
    historyArray.push(dataPoint);
  }

  // Also add to combined dataPoints (using production as primary)
  if (environment === 'production') {
    const combinedIndex = history.dataPoints.findIndex((dp) => dp.date === dataPoint.date);
    if (combinedIndex >= 0) {
      history.dataPoints[combinedIndex] = dataPoint;
    } else {
      history.dataPoints.push(dataPoint);
    }
  }

  // Add milestones for new participants
  if (snapshot.trends?.newParticipants.length) {
    for (const participantId of snapshot.trends.newParticipants) {
      const participant = snapshot.participants.find((p) => p.id === participantId);
      if (participant) {
        history.milestones.push({
          date: dataPoint.date,
          event: `${participant.name} joined ${environment}`,
          participantId,
          participantName: participant.name,
        });
      }
    }
  }

  // Sort arrays by date
  history.dataPoints.sort((a, b) => a.date.localeCompare(b.date));
  history.productionHistory.sort((a, b) => a.date.localeCompare(b.date));
  history.sandboxHistory.sort((a, b) => a.date.localeCompare(b.date));
  history.milestones.sort((a, b) => a.date.localeCompare(b.date));

  history.lastUpdated = new Date().toISOString();

  // Ensure directory exists
  const historyDir = dirname(HISTORY_FILE);
  if (!existsSync(historyDir)) {
    mkdirSync(historyDir, { recursive: true });
  }

  writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
  console.log(`Updated historical data: ${HISTORY_FILE}`);
}

function createEmptyHistory(): HistoricalTrends {
  return {
    lastUpdated: new Date().toISOString(),
    dataPoints: [],
    productionHistory: [],
    sandboxHistory: [],
    milestones: [],
  };
}

function writeSnapshot(
  snapshot: ObservatorySnapshot,
  environment: Environment,
  isDryRun: boolean
): void {
  const envDir = join(DATA_DIR, environment);

  // Validate: do not write empty snapshots
  if (snapshot.participants.length === 0) {
    console.warn(`WARNING: Skipping write for ${environment} - snapshot has 0 participants`);
    return;
  }

  // Warn if participant count dropped significantly from previous snapshot
  const previous = loadPreviousSnapshot(environment);
  if (previous && previous.participants.length > 0) {
    const dropPercent =
      ((previous.participants.length - snapshot.participants.length) /
        previous.participants.length) *
      100;
    if (dropPercent > 20) {
      console.warn(
        `WARNING: ${environment} participant count dropped by ${dropPercent.toFixed(1)}% (${previous.participants.length} → ${snapshot.participants.length})`
      );
    }
  }

  if (!isDryRun) {
    if (!existsSync(envDir)) {
      mkdirSync(envDir, { recursive: true });
    }

    // Write latest.json
    const latestPath = join(envDir, 'latest.json');
    writeFileSync(latestPath, JSON.stringify(snapshot, null, 2));
    console.log(`Written: ${latestPath}`);

    // Write dated snapshot
    const datePath = join(envDir, `${snapshot.timestamp.split('T')[0]}.json`);
    writeFileSync(datePath, JSON.stringify(snapshot, null, 2));
    console.log(`Written: ${datePath}`);

    // Update historical data
    updateHistoricalData(snapshot, environment);
  } else {
    console.log(`[DRY RUN] Would write to ${environment}/latest.json`);
  }
}

function writeDualSnapshot(snapshot: DualEnvironmentSnapshot, isDryRun: boolean): void {
  if (!isDryRun) {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }

    // Write combined latest.json at root level
    const latestPath = join(DATA_DIR, 'latest.json');
    writeFileSync(latestPath, JSON.stringify(snapshot, null, 2));
    console.log(`Written: ${latestPath}`);

    // Write dated combined snapshot
    const datePath = join(DATA_DIR, `${snapshot.timestamp.split('T')[0]}.json`);
    writeFileSync(datePath, JSON.stringify(snapshot, null, 2));
    console.log(`Written: ${datePath}`);
  } else {
    console.log(`[DRY RUN] Would write combined snapshot to latest.json`);
  }
}

function printSummary(snapshot: ObservatorySnapshot, environment: Environment): void {
  const { summary } = snapshot;
  console.log(`\n${environment.toUpperCase()} Environment Summary:`);
  console.log(`  Total participants: ${summary.totalParticipants}`);
  console.log(`  Live in production: ${summary.liveInProduction}`);
  console.log(`  By status: ${JSON.stringify(summary.byStatus)}`);
  console.log(`  By role: ${JSON.stringify(summary.byRole)}`);
  console.log(`  By city: ${JSON.stringify(summary.byCity)}`);
  console.log(`  API families: ${summary.apiFamilies.join(', ')}`);
  console.log(`  Shariah compliant: ${summary.shariahCompliantCount}`);
  console.log(`  Multi-role participants: ${summary.multiRoleCount}`);
  console.log(`  TPP count: ${summary.tppCount}`);
  console.log(
    `  Auth capabilities: CIBA=${summary.byAuthCapabilities.ciba}, DCR=${summary.byAuthCapabilities.dcr}, Redirect=${summary.byAuthCapabilities.redirect}`
  );

  if (snapshot.trends) {
    console.log(`  Trends:`);
    console.log(
      `    Participant change: ${snapshot.trends.participantChange >= 0 ? '+' : ''}${snapshot.trends.participantChange}`
    );
    if (snapshot.trends.newParticipants.length > 0) {
      console.log(`    New participants: ${snapshot.trends.newParticipants.length}`);
    }
    if (snapshot.trends.removedParticipants.length > 0) {
      console.log(`    Removed participants: ${snapshot.trends.removedParticipants.length}`);
    }
  }
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const productionOnly = process.argv.includes('--production-only');
  const sandboxOnly = process.argv.includes('--sandbox-only');

  console.log('OpenFinance-OS Observatory Collector v2.0');
  console.log('=========================================');
  if (isDryRun) {
    console.log('DRY RUN MODE - No files will be written\n');
  }

  try {
    let productionSnapshot: ObservatorySnapshot | null = null;
    let sandboxSnapshot: ObservatorySnapshot | null = null;

    if (!sandboxOnly) {
      // Fetch and process production data
      console.log('\nFetching production data...');
      try {
        // Fetch from both /participants and /roles endpoints
        const [rawParticipants, rawRoles] = await Promise.all([
          fetchParticipants({ environment: 'production' }),
          fetchRoles({ environment: 'production' }),
        ]);

        // Transform participants (live with APIs)
        const liveParticipants = rawParticipants.map(transformParticipant);

        // Merge with roles (adds registered-only orgs)
        const allParticipants = mergeParticipantsAndRoles(liveParticipants, rawRoles);
        console.log(
          `Merged: ${liveParticipants.length} live + ${allParticipants.length - liveParticipants.length} registered = ${allParticipants.length} total`
        );

        const previousProduction = loadPreviousSnapshot('production');
        productionSnapshot = createSnapshot(allParticipants, 'production', previousProduction);
        printSummary(productionSnapshot, 'production');
        writeSnapshot(productionSnapshot, 'production', isDryRun);
      } catch (error) {
        console.error('Failed to fetch production data:', error);
        if (productionOnly) {
          process.exit(1);
        }
      }
    }

    if (!productionOnly) {
      // Fetch and process sandbox data
      console.log('\nFetching sandbox data...');
      try {
        // Fetch from both /participants and /roles endpoints
        const [rawParticipants, rawRoles] = await Promise.all([
          fetchParticipants({ environment: 'sandbox' }),
          fetchRoles({ environment: 'sandbox' }),
        ]);

        // Transform participants (live with APIs)
        const liveParticipants = rawParticipants.map(transformParticipant);

        // Merge with roles (adds registered-only orgs)
        const allParticipants = mergeParticipantsAndRoles(liveParticipants, rawRoles);
        console.log(
          `Merged: ${liveParticipants.length} live + ${allParticipants.length - liveParticipants.length} registered = ${allParticipants.length} total`
        );

        const previousSandbox = loadPreviousSnapshot('sandbox');
        sandboxSnapshot = createSnapshot(allParticipants, 'sandbox', previousSandbox);
        printSummary(sandboxSnapshot, 'sandbox');
        writeSnapshot(sandboxSnapshot, 'sandbox', isDryRun);
      } catch (error) {
        console.error('Failed to fetch sandbox data:', error);
        console.log('Continuing with production data only...');
      }
    }

    // Skip writing combined snapshot if no data was fetched from either environment
    if (!productionSnapshot && !sandboxSnapshot) {
      console.error(
        '\nNo data fetched from any environment. Skipping snapshot write to preserve existing data.'
      );
      process.exit(1);
    }

    // Create combined dual-environment snapshot
    if (!productionOnly && !sandboxOnly) {
      // If one environment failed, fall back to its previous snapshot to avoid losing data
      const effectiveProduction = productionSnapshot ?? loadPreviousSnapshot('production');
      const effectiveSandbox = sandboxSnapshot ?? loadPreviousSnapshot('sandbox');

      if (!productionSnapshot) {
        console.warn(
          '\nWARNING: Production fetch failed, using previous snapshot for combined data'
        );
      }
      if (!sandboxSnapshot) {
        console.warn('\nWARNING: Sandbox fetch failed, using previous snapshot for combined data');
      }

      console.log('\nCreating combined snapshot...');
      const dualSnapshot = createDualEnvironmentSnapshot(effectiveProduction, effectiveSandbox);

      console.log('\nCross-Environment Analysis:');
      console.log(
        `  Total unique participants: ${dualSnapshot.crossEnvironment.totalUniqueParticipants}`
      );
      console.log(
        `  In both environments: ${dualSnapshot.crossEnvironment.inBothEnvironments.length}`
      );
      console.log(`  Production only: ${dualSnapshot.crossEnvironment.productionOnly.length}`);
      console.log(`  Sandbox only: ${dualSnapshot.crossEnvironment.sandboxOnly.length}`);

      writeDualSnapshot(dualSnapshot, isDryRun);
    }

    console.log('\nCollection complete!');
  } catch (error) {
    console.error('Collection failed:', error);
    process.exit(1);
  }
}

main();
