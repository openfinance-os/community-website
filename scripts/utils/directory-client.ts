import type { RawParticipant, RawRole, Environment } from '../types/participant.js';

// UAE Open Finance Trust Framework Directory endpoints
const DIRECTORY_ENDPOINTS = {
  production: {
    base: 'https://data.directory.openfinance.ae',
    participants: '/participants',
    roles: '/roles',
  },
  sandbox: {
    base: 'https://data.sandbox.directory.openfinance.ae',
    participants: '/participants',
    roles: '/roles',
  },
} as const;

export interface FetchOptions {
  environment: Environment;
  timeout?: number;
  retries?: number;
}

const DEFAULT_OPTIONS: FetchOptions = {
  environment: 'production',
  timeout: 30000,
  retries: 3,
};

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number,
  timeout: number
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt}/${retries} failed: ${lastError.message}`);

      if (attempt < retries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Failed to fetch after retries');
}

export async function fetchParticipants(
  options: Partial<FetchOptions> = {}
): Promise<RawParticipant[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const endpoints = DIRECTORY_ENDPOINTS[opts.environment];
  const url = `${endpoints.base}${endpoints.participants}`;

  console.log(`Fetching participants from ${opts.environment} environment: ${url}...`);

  const response = await fetchWithRetry(
    url,
    {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Open Finance OS-Collector/2.0 (https://openfinance-os.org)',
      },
    },
    opts.retries!,
    opts.timeout!
  );

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error('Unexpected API response format: expected array');
  }

  console.log(`Fetched ${data.length} participants from ${opts.environment}`);

  return data as RawParticipant[];
}

export async function fetchRoles(options: Partial<FetchOptions> = {}): Promise<RawRole[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const endpoints = DIRECTORY_ENDPOINTS[opts.environment];
  const url = `${endpoints.base}${endpoints.roles}`;

  console.log(`Fetching roles from ${opts.environment} environment: ${url}...`);

  const response = await fetchWithRetry(
    url,
    {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Open Finance OS-Collector/2.0 (https://openfinance-os.org)',
      },
    },
    opts.retries!,
    opts.timeout!
  );

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error('Unexpected API response format: expected array');
  }

  console.log(`Fetched ${data.length} roles from ${opts.environment}`);

  return data as RawRole[];
}

export async function fetchFromBothEnvironments(): Promise<{
  production: RawParticipant[] | null;
  sandbox: RawParticipant[] | null;
  errors: { production?: string; sandbox?: string };
}> {
  const errors: { production?: string; sandbox?: string } = {};
  let production: RawParticipant[] | null = null;
  let sandbox: RawParticipant[] | null = null;

  // Fetch from both environments in parallel
  const [prodResult, sandboxResult] = await Promise.allSettled([
    fetchParticipants({ environment: 'production' }),
    fetchParticipants({ environment: 'sandbox' }),
  ]);

  if (prodResult.status === 'fulfilled') {
    production = prodResult.value;
  } else {
    errors.production = prodResult.reason?.message || 'Unknown error';
    console.error(`Failed to fetch production data: ${errors.production}`);
  }

  if (sandboxResult.status === 'fulfilled') {
    sandbox = sandboxResult.value;
  } else {
    errors.sandbox = sandboxResult.reason?.message || 'Unknown error';
    console.error(`Failed to fetch sandbox data: ${errors.sandbox}`);
  }

  return { production, sandbox, errors };
}

export function getDirectoryUrl(environment: Environment): string {
  return DIRECTORY_ENDPOINTS[environment].base;
}

export function getWebDirectoryUrl(environment: Environment): string {
  return environment === 'production'
    ? 'https://web.directory.openfinance.ae'
    : 'https://web.sandbox.directory.openfinance.ae';
}
