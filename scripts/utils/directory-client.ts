import type { RawParticipant } from '../types/participant.js';

const API_BASE = 'https://data.directory.openfinance.ae';
const PARTICIPANTS_ENDPOINT = '/participants';

export async function fetchParticipants(): Promise<RawParticipant[]> {
  const url = `${API_BASE}${PARTICIPANTS_ENDPOINT}`;

  console.log(`Fetching participants from ${url}...`);

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'OpenFinance-OS-Collector/1.0 (https://openfinance-os.org)',
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error('Unexpected API response format: expected array');
  }

  console.log(`Fetched ${data.length} participants`);

  return data as RawParticipant[];
}
