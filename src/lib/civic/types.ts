/**
 * Response shapes for the Google Civic Information API v2.
 * https://developers.google.com/civic-information/docs/v2
 *
 * Only the endpoints that still exist are modeled here. Google turned down the
 * Representatives API on April 30, 2025 — officials themselves come from our
 * content collection, keyed by seatSlug, and are joined to these divisions in
 * `src/lib/civic/divisions.ts`.
 */

export interface CivicAddress {
	locationName?: string;
	line1?: string;
	line2?: string;
	line3?: string;
	city?: string;
	state?: string;
	zip?: string;
}

export interface CivicDivision {
	name: string;
	/** Other valid OCD IDs referring to the same division. */
	alsoKnownAs?: string[];
}

export interface DivisionsByAddressResponse {
	kind: string;
	normalizedInput?: CivicAddress;
	/** Keyed by OCD division ID, e.g. "ocd-division/country:us/state:mi/sldu:31". */
	divisions?: Record<string, CivicDivision>;
}

export interface CivicElection {
	id: string;
	name: string;
	/** ISO date, e.g. "2026-11-03". */
	electionDay: string;
	ocdDivisionId?: string;
}

export interface ElectionsResponse {
	kind: string;
	elections?: CivicElection[];
}

export interface CivicSource {
	name?: string;
	official?: boolean;
}

export interface PollingLocation {
	address?: CivicAddress;
	name?: string;
	notes?: string;
	pollingHours?: string;
	startDate?: string;
	endDate?: string;
	latitude?: number;
	longitude?: number;
	voterServices?: string;
	sources?: CivicSource[];
}

export interface CivicChannel {
	type?: string;
	id?: string;
}

export interface CivicCandidate {
	name?: string;
	party?: string;
	candidateUrl?: string;
	phone?: string;
	email?: string;
	photoUrl?: string;
	channels?: CivicChannel[];
}

export interface CivicContest {
	type?: string;
	ballotTitle?: string;
	office?: string;
	level?: string[];
	roles?: string[];
	district?: { name?: string; scope?: string; id?: string };
	numberElected?: string;
	ballotPlacement?: string;
	candidates?: CivicCandidate[];
	referendumTitle?: string;
	referendumSubtitle?: string;
	referendumUrl?: string;
	referendumBallotResponses?: string[];
}

export interface ElectionOfficial {
	name?: string;
	title?: string;
	officePhoneNumber?: string;
	faxNumber?: string;
	emailAddress?: string;
}

export interface ElectionAdministrationBody {
	name?: string;
	electionInfoUrl?: string;
	electionRegistrationUrl?: string;
	electionRegistrationConfirmationUrl?: string;
	absenteeVotingInfoUrl?: string;
	votingLocationFinderUrl?: string;
	ballotInfoUrl?: string;
	hoursOfOperation?: string;
	correspondenceAddress?: CivicAddress;
	physicalAddress?: CivicAddress;
	electionOfficials?: ElectionOfficial[];
}

export interface AdministrationRegion {
	name?: string;
	electionAdministrationBody?: ElectionAdministrationBody;
	local_jurisdiction?: AdministrationRegion;
	sources?: CivicSource[];
}

export interface VoterInfoResponse {
	kind: string;
	election?: CivicElection;
	otherElections?: CivicElection[];
	normalizedInput?: CivicAddress;
	/** True when the precinct votes entirely by mail. */
	mailOnly?: boolean;
	pollingLocations?: PollingLocation[];
	earlyVoteSites?: PollingLocation[];
	dropOffLocations?: PollingLocation[];
	contests?: CivicContest[];
	state?: AdministrationRegion[];
}

export function formatCivicAddress(address?: CivicAddress): string {
	if (!address) return '';
	const street = [address.line1, address.line2, address.line3].filter(Boolean).join(', ');
	const locality = [address.city, address.state].filter(Boolean).join(', ');
	return [address.locationName, street, [locality, address.zip].filter(Boolean).join(' ')]
		.filter(Boolean)
		.join(', ');
}
