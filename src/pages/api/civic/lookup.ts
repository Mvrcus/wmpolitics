import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { CivicApiError, fetchDivisionsByAddress } from '../../../lib/civic/client';
import { matchDivisions, matchedSeatSlugs } from '../../../lib/civic/divisions';
import { isCurrentLegislator, OFFICE_LABELS, sortLegislators } from '../../../lib/legislators';

export const prerender = false;

/**
 * GET /api/civic/lookup?address=...
 *
 * Resolves a street address to the officials profiled on this site, via the
 * Google Civic Information API's divisionsByAddress method. The address is
 * forwarded to Google for district resolution and never stored.
 */

const json = (body: unknown, status: number, cacheable = false) =>
	new Response(JSON.stringify(body), {
		status,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': cacheable ? 'public, max-age=3600' : 'private, no-store',
		},
	});

export const GET: APIRoute = async ({ url, locals }) => {
	const address = url.searchParams.get('address')?.trim() ?? '';
	if (address.length < 4 || address.length > 200) {
		return json({ error: 'Enter a street address, city, and ZIP.' }, 400);
	}

	const apiKey = locals.runtime?.env?.GOOGLE_CIVIC_API_KEY;
	if (!apiKey) {
		return json({ error: 'Address lookup is not configured on this deployment.' }, 503);
	}

	let response;
	try {
		response = await fetchDivisionsByAddress(address, apiKey);
	} catch (err) {
		if (err instanceof CivicApiError && err.status >= 400 && err.status < 500) {
			return json(
				{ error: 'We could not find that address. Try "street, city, ZIP".' },
				400,
			);
		}
		console.error('civic lookup failed:', err);
		return json({ error: 'District lookup is temporarily unavailable.' }, 502);
	}

	const divisions = response.divisions ?? {};
	const result = matchDivisions(divisions);
	const seatSlugs = matchedSeatSlugs(result);

	// County-wide fallback: when Google doesn't return a county commission
	// district, surface all profiled commissioners rather than none — flagged so
	// the UI can say "one of these, depending on your street".
	const approximateSeats = new Set<string>();
	if (result.countyDistrictUnknown) {
		for (let district = 1; district <= 4; district++) {
			const seat = `ottawa-county-district-${district}`;
			if (!seatSlugs.has(seat)) {
				seatSlugs.add(seat);
				approximateSeats.add(seat);
			}
		}
	}

	const legislators = await getCollection('legislators');
	const reps = sortLegislators(
		legislators.filter(
			(entry) => isCurrentLegislator(entry) && seatSlugs.has(entry.data.seatSlug),
		),
	).map((entry) => ({
		slug: entry.data.slug,
		name: entry.data.name,
		office: entry.data.office,
		officeLabel: OFFICE_LABELS[entry.data.office] ?? entry.data.office,
		district: entry.data.district,
		party: entry.data.party ?? null,
		seatSlug: entry.data.seatSlug,
		servesHolland: entry.data.servesHolland,
		photo: entry.data.photo ?? null,
		approximate: approximateSeats.has(entry.data.seatSlug),
	}));

	const notes: string[] = [];
	const inMichigan = Object.keys(divisions).some(
		(id) => id === 'ocd-division/country:us/state:mi' || id.startsWith('ocd-division/country:us/state:mi/'),
	);
	if (!inMichigan && Object.keys(divisions).length > 0) {
		notes.push('This address is outside Michigan, so none of the officials covered here represent it.');
	} else if (reps.length > 0 && reps.every((rep) => !rep.servesHolland)) {
		notes.push(
			'This address is in Michigan but outside our West Michigan coverage area — only statewide officials are shown.',
		);
	}
	if (result.countyDistrictUnknown && reps.some((rep) => rep.approximate)) {
		notes.push(
			'County commission districts could not be pinned to your street — one of the listed commissioners represents you.',
		);
	}

	return json(
		{
			address: response.normalizedInput ?? null,
			reps,
			otherDivisions: result.unmatched,
			notes,
		},
		200,
	);
};
