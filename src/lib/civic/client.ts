import type {
	DivisionsByAddressResponse,
	ElectionsResponse,
	VoterInfoResponse,
} from './types';

/**
 * Thin fetch client for the Google Civic Information API v2.
 * Free tier: 25,000 queries/day per project; auth is a plain API key
 * (server-side only — never expose it to the browser).
 */
const BASE_URL = 'https://www.googleapis.com/civicinfo/v2';

export class CivicApiError extends Error {
	constructor(
		readonly status: number,
		message: string,
	) {
		super(message);
		this.name = 'CivicApiError';
	}
}

async function civicFetch<T>(
	path: string,
	params: Record<string, string>,
	apiKey: string,
): Promise<T> {
	const url = new URL(`${BASE_URL}/${path}`);
	for (const [key, value] of Object.entries(params)) {
		url.searchParams.set(key, value);
	}
	url.searchParams.set('key', apiKey);

	const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
	if (!res.ok) {
		let message = `Google Civic API responded ${res.status}`;
		try {
			const body = (await res.json()) as { error?: { message?: string } };
			if (body.error?.message) message = body.error.message;
		} catch {
			// non-JSON error body; keep the status message
		}
		throw new CivicApiError(res.status, message);
	}
	return (await res.json()) as T;
}

/** Address → the OCD political divisions (districts) containing it. */
export function fetchDivisionsByAddress(address: string, apiKey: string) {
	return civicFetch<DivisionsByAddressResponse>('divisionsByAddress', { address }, apiKey);
}

/** Upcoming elections Google currently has data for. */
export function fetchElections(apiKey: string) {
	return civicFetch<ElectionsResponse>('elections', {}, apiKey);
}

/**
 * Election-day data for an address: polling place, early vote sites, drop
 * boxes, ballot contests, and election-administration contacts. Only returns
 * data while Google supports an active election covering the address —
 * otherwise the API responds 400 ("Election unknown").
 */
export function fetchVoterInfo(address: string, apiKey: string, electionId?: string) {
	const params: Record<string, string> = { address };
	if (electionId) params.electionId = electionId;
	return civicFetch<VoterInfoResponse>('voterinfo', params, apiKey);
}
