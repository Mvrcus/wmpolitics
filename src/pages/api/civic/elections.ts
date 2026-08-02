import type { APIRoute } from 'astro';
import { CivicApiError, fetchElections } from '../../../lib/civic/client';

export const prerender = false;

/**
 * GET /api/civic/elections
 *
 * Upcoming elections Google has data for, filtered to Michigan and national
 * contests. Cacheable — the list changes rarely and contains nothing personal.
 */
export const GET: APIRoute = async ({ locals }) => {
	const headers = {
		'Content-Type': 'application/json',
		'Cache-Control': 'public, max-age=21600',
	};

	const apiKey = locals.runtime?.env?.GOOGLE_CIVIC_API_KEY;
	if (!apiKey) {
		return new Response(JSON.stringify({ elections: [], configured: false }), {
			status: 200,
			headers,
		});
	}

	try {
		const response = await fetchElections(apiKey);
		const elections = (response.elections ?? [])
			.filter((election) => {
				const division = election.ocdDivisionId ?? '';
				return (
					division === 'ocd-division/country:us' ||
					division === 'ocd-division/country:us/state:mi' ||
					division.startsWith('ocd-division/country:us/state:mi/')
				);
			})
			.map(({ id, name, electionDay, ocdDivisionId }) => ({
				id,
				name,
				electionDay,
				ocdDivisionId,
			}));
		return new Response(JSON.stringify({ elections, configured: true }), {
			status: 200,
			headers,
		});
	} catch (err) {
		if (!(err instanceof CivicApiError)) console.error('civic elections failed:', err);
		return new Response(JSON.stringify({ elections: [], configured: true }), {
			status: 200,
			headers: { ...headers, 'Cache-Control': 'public, max-age=300' },
		});
	}
};
