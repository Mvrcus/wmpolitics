import type { TrackRecordSource } from './types';

export type RosterEntry = {
	slug: string;
	source: TrackRecordSource;
	chamber: 'us-house' | 'mi-house' | 'mi-senate';
	/** Congress.gov bioguide ID (federal members only). */
	bioguideId?: string;
	/**
	 * OpenStates person name for runtime lookup (state members only). The sync
	 * resolves the ocd-person ID via /people?jurisdiction=Michigan&name=… each
	 * run rather than hardcoding UUIDs.
	 */
	openstatesName?: string;
};

/**
 * Hand-maintained map of profile slugs to external legislative-data IDs.
 * Slugs must match `slug` frontmatter in src/content/legislators/. Legislators
 * absent here (county officers and commissioners, mayor, city manager, U.S.
 * senators, past officeholders) have no machine-readable feed and degrade
 * gracefully.
 */
export const TRACK_RECORD_ROSTER: RosterEntry[] = [
	{ slug: 'bill-huizenga', source: 'congress', chamber: 'us-house', bioguideId: 'H001058' },
	{ slug: 'nancy-deboer', source: 'openstates', chamber: 'mi-house', openstatesName: 'Nancy DeBoer' },
	{ slug: 'bradley-slagh', source: 'openstates', chamber: 'mi-house', openstatesName: 'Bradley Slagh' },
	{ slug: 'roger-victory', source: 'openstates', chamber: 'mi-senate', openstatesName: 'Roger Victory' },
	{ slug: 'mark-huizenga', source: 'openstates', chamber: 'mi-senate', openstatesName: 'Mark Huizenga' },
];

export function rosterEntryForSlug(slug: string): RosterEntry | undefined {
	return TRACK_RECORD_ROSTER.find((entry) => entry.slug === slug);
}
