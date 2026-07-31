import type { APIRoute } from 'astro';
import { CivicApiError, fetchVoterInfo } from '../../../lib/civic/client';
import {
	formatCivicAddress,
	type ElectionAdministrationBody,
	type PollingLocation,
} from '../../../lib/civic/types';

export const prerender = false;

/**
 * GET /api/civic/voterinfo?address=...[&electionId=...]
 *
 * Election-day data for an address during elections Google supports: polling
 * place, early-vote sites, drop boxes, ballot contests with candidates, and
 * election-official contacts. Outside a supported election window this returns
 * `{ available: false }` — that's normal, not an error. Addresses are forwarded
 * to Google and never stored.
 */

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'private, no-store',
		},
	});

function trimLocation(location: PollingLocation) {
	return {
		name: location.name ?? location.address?.locationName ?? null,
		address: formatCivicAddress(location.address),
		hours: location.pollingHours ?? null,
		notes: location.notes ?? null,
		startDate: location.startDate ?? null,
		endDate: location.endDate ?? null,
		latitude: location.latitude ?? null,
		longitude: location.longitude ?? null,
	};
}

function trimAdminBody(name: string | undefined, body: ElectionAdministrationBody | undefined) {
	if (!body) return null;
	return {
		name: body.name ?? name ?? null,
		electionInfoUrl: body.electionInfoUrl ?? null,
		registrationUrl: body.electionRegistrationUrl ?? null,
		registrationConfirmationUrl: body.electionRegistrationConfirmationUrl ?? null,
		absenteeVotingInfoUrl: body.absenteeVotingInfoUrl ?? null,
		ballotInfoUrl: body.ballotInfoUrl ?? null,
		votingLocationFinderUrl: body.votingLocationFinderUrl ?? null,
		officials: (body.electionOfficials ?? []).map((official) => ({
			name: official.name ?? null,
			title: official.title ?? null,
			phone: official.officePhoneNumber ?? null,
			email: official.emailAddress ?? null,
		})),
	};
}

export const GET: APIRoute = async ({ url, locals }) => {
	const address = url.searchParams.get('address')?.trim() ?? '';
	if (address.length < 4 || address.length > 200) {
		return json({ error: 'Enter a street address, city, and ZIP.' }, 400);
	}
	const electionId = url.searchParams.get('electionId')?.trim() || undefined;

	const apiKey = locals.runtime?.env?.GOOGLE_CIVIC_API_KEY;
	if (!apiKey) {
		return json({ error: 'Voter info lookup is not configured on this deployment.' }, 503);
	}

	let response;
	try {
		response = await fetchVoterInfo(address, apiKey, electionId);
	} catch (err) {
		if (err instanceof CivicApiError && err.status >= 400 && err.status < 500) {
			// Most commonly "Election unknown": no supported election covers this
			// address right now.
			return json({ available: false });
		}
		console.error('civic voterinfo failed:', err);
		return json({ error: 'Voter info is temporarily unavailable.' }, 502);
	}

	const state = response.state?.[0];
	const local = state?.local_jurisdiction;

	return json({
		available: true,
		election: response.election ?? null,
		otherElections: response.otherElections ?? [],
		mailOnly: response.mailOnly ?? false,
		pollingLocations: (response.pollingLocations ?? []).map(trimLocation),
		earlyVoteSites: (response.earlyVoteSites ?? []).map(trimLocation),
		dropOffLocations: (response.dropOffLocations ?? []).map(trimLocation),
		contests: (response.contests ?? []).map((contest) => ({
			type: contest.type ?? null,
			ballotTitle: contest.ballotTitle ?? contest.office ?? null,
			office: contest.office ?? null,
			districtName: contest.district?.name ?? null,
			candidates: (contest.candidates ?? []).map((candidate) => ({
				name: candidate.name ?? null,
				party: candidate.party ?? null,
				url: candidate.candidateUrl ?? null,
			})),
			referendumTitle: contest.referendumTitle ?? null,
			referendumSubtitle: contest.referendumSubtitle ?? null,
			referendumUrl: contest.referendumUrl ?? null,
		})),
		stateAdmin: trimAdminBody(state?.name, state?.electionAdministrationBody),
		localAdmin: trimAdminBody(local?.name, local?.electionAdministrationBody),
	});
};
