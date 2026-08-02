import type { CivicDivision } from './types';

/**
 * Joins Google Civic divisions (OCD IDs) to our seat slugs.
 *
 * Since Google turned down the Representatives API (April 30, 2025), the Civic
 * API tells us *which districts* contain an address but not *who holds them* —
 * that join happens here against the legislators content collection, using
 * seatSlug as the key (the same convention as docs/past-officeholders-roster.md
 * and src/lib/track-record/roster.ts).
 */

const MI = 'ocd-division/country:us/state:mi';
const OTTAWA = `${MI}/county:ottawa`;

/**
 * seatSlug → OCD division IDs that seat answers to. Statewide seats share the
 * state division, so one division can match several seats. County commission
 * districts use Google's `council_district` convention when present; the
 * county-wide entry is a fallback handled in `matchDivisions`.
 */
export const SEAT_DIVISIONS: Record<string, string[]> = {
	'mi-us-senate-class-1': [MI],
	'mi-us-senate-class-2': [MI],
	'mi-governor': [MI],
	'mi-us-house-04': [`${MI}/cd:4`],
	'mi-state-senate-30': [`${MI}/sldu:30`],
	'mi-state-senate-31': [`${MI}/sldu:31`],
	'mi-state-house-85': [`${MI}/sldl:85`],
	'mi-state-house-86': [`${MI}/sldl:86`],
	'ottawa-county-sheriff': [OTTAWA],
	'ottawa-county-prosecutor': [OTTAWA],
	'ottawa-county-clerk': [OTTAWA],
	'ottawa-county-treasurer': [OTTAWA],
	'ottawa-county-district-1': [`${OTTAWA}/council_district:1`],
	'ottawa-county-district-2': [`${OTTAWA}/council_district:2`],
	'ottawa-county-district-3': [`${OTTAWA}/council_district:3`],
	'ottawa-county-district-4': [`${OTTAWA}/council_district:4`],
	'holland-mayor': [`${MI}/place:holland`],
	'holland-city-manager': [`${MI}/place:holland`],
};

export interface MatchedDivision {
	ocdId: string;
	name: string;
	seatSlugs: string[];
}

export interface DivisionMatchResult {
	matched: MatchedDivision[];
	/** Divisions Google returned that no seat here answers to (school boards, judicial circuits, …). */
	unmatched: { ocdId: string; name: string }[];
	/**
	 * True when the address is in Ottawa County but Google returned no county
	 * commission district — commissioner profiles can't be narrowed to one seat.
	 */
	countyDistrictUnknown: boolean;
}

export function matchDivisions(
	divisions: Record<string, CivicDivision>,
): DivisionMatchResult {
	// Index every ID (canonical + aliases) that refers to each returned division.
	const idsByDivision = new Map<string, Set<string>>();
	for (const [ocdId, division] of Object.entries(divisions)) {
		idsByDivision.set(ocdId, new Set([ocdId, ...(division.alsoKnownAs ?? [])]));
	}

	const matched: MatchedDivision[] = [];
	const unmatched: { ocdId: string; name: string }[] = [];
	let sawCountyDistrict = false;
	let sawOttawa = false;

	for (const [ocdId, division] of Object.entries(divisions)) {
		const ids = idsByDivision.get(ocdId)!;
		if (ocdId === OTTAWA || ids.has(OTTAWA)) sawOttawa = true;
		if (ocdId.includes('/council_district:')) sawCountyDistrict = true;

		const seatSlugs = Object.entries(SEAT_DIVISIONS)
			.filter(([, divisionIds]) => divisionIds.some((id) => ids.has(id)))
			.map(([seatSlug]) => seatSlug);

		if (seatSlugs.length > 0) {
			matched.push({ ocdId, name: division.name, seatSlugs });
		} else {
			unmatched.push({ ocdId, name: division.name });
		}
	}

	return {
		matched,
		unmatched,
		countyDistrictUnknown: sawOttawa && !sawCountyDistrict,
	};
}

/** Flattens a match result to the set of seat slugs represented at the address. */
export function matchedSeatSlugs(result: DivisionMatchResult): Set<string> {
	return new Set(result.matched.flatMap((division) => division.seatSlugs));
}
