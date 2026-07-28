import type { BillRow, RollCallRow } from './types';

const API_BASE = 'https://api.congress.gov/v3';

export type CongressFetchOptions = {
	apiKey: string;
	throttleMs?: number;
};

export class RateLimitError extends Error {
	constructor(url: string) {
		super(`Rate limited: ${url}`);
		this.name = 'RateLimitError';
	}
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function apiGet(
	path: string,
	params: Record<string, string>,
	opts: CongressFetchOptions,
): Promise<any> {
	const url = new URL(`${API_BASE}${path}`);
	url.searchParams.set('format', 'json');
	url.searchParams.set('api_key', opts.apiKey);
	for (const [key, value] of Object.entries(params)) {
		url.searchParams.set(key, value);
	}

	if (opts.throttleMs) await sleep(opts.throttleMs);
	const res = await fetch(url, { headers: { Accept: 'application/json' } });
	if (res.status === 429) throw new RateLimitError(path);
	if (!res.ok) throw new Error(`congress.gov ${path} failed: ${res.status}`);
	return res.json();
}

/** Current congress/session for a given date (congress 119 = 2025-26). */
export function congressForDate(date = new Date()): { congress: number; session: number } {
	const year = date.getUTCFullYear();
	const congress = Math.floor((year - 1789) / 2) + 1;
	const session = year % 2 === 1 ? 1 : 2;
	return { congress, session };
}

function normalizeBillNumber(item: any): string | null {
	if (item?.type && item?.number != null) return `${item.type} ${item.number}`;
	if (item?.amendmentNumber != null) return `Amendment ${item.amendmentNumber}`;
	return null;
}

function publicBillUrl(item: any): string | null {
	// The API returns an api.congress.gov URL; swap to the public site when possible.
	if (typeof item?.url === 'string') {
		return item.url
			.replace('https://api.congress.gov/v3/bill/', 'https://www.congress.gov/bill/')
			.replace(/\?format=json$/, '');
	}
	return null;
}

export async function fetchSponsoredBills(
	bioguideId: string,
	slug: string,
	opts: CongressFetchOptions,
	limit = 20,
): Promise<BillRow[]> {
	const data = await apiGet(
		`/member/${bioguideId}/sponsored-legislation`,
		{ limit: String(limit) },
		opts,
	);
	const items: any[] = data?.sponsoredLegislation ?? [];
	const rows: BillRow[] = [];

	for (const item of items) {
		const number = normalizeBillNumber(item);
		if (!number || !item.title) continue;
		rows.push({
			bill_id: `congress:${item.congress}:${String(number).replace(/\s+/g, '-').toLowerCase()}`,
			legislator_slug: slug,
			source: 'congress',
			role: 'sponsor',
			number,
			title: item.title,
			introduced_date: item.introducedDate ?? null,
			latest_action: item.latestAction?.text ?? null,
			latest_action_date: item.latestAction?.actionDate ?? null,
			url: publicBillUrl(item) ?? `https://www.congress.gov/member/${bioguideId}`,
		});
	}
	return rows;
}

export async function fetchCosponsoredTotal(
	bioguideId: string,
	opts: CongressFetchOptions,
): Promise<number> {
	const data = await apiGet(
		`/member/${bioguideId}/cosponsored-legislation`,
		{ limit: '1' },
		opts,
	);
	return data?.pagination?.count ?? 0;
}

type HouseVoteListItem = {
	rollCallNumber: number;
	congress: number;
	sessionNumber: number;
	voteQuestion?: string;
	result?: string;
	startDate?: string;
	legislationType?: string;
	legislationNumber?: string;
};

export async function fetchHouseRollCallList(
	congress: number,
	session: number,
	opts: CongressFetchOptions,
): Promise<HouseVoteListItem[]> {
	const all: HouseVoteListItem[] = [];
	let offset = 0;
	const pageSize = 250;

	// Paginate defensively; the house-vote endpoint is beta.
	for (let page = 0; page < 6; page++) {
		const data = await apiGet(
			`/house-vote/${congress}/${session}`,
			{ limit: String(pageSize), offset: String(offset) },
			opts,
		);
		const items: any[] = data?.houseRollCallVotes ?? [];
		for (const item of items) {
			if (item?.rollCallNumber != null) all.push(item);
		}
		if (items.length < pageSize) break;
		offset += pageSize;
	}
	return all;
}

/** Extract this member's position from the beta member-votes payload. */
function findMemberPosition(data: any, bioguideId: string): string | null {
	const candidates: any[] = [];
	const scan = (node: any, depth: number) => {
		if (!node || depth > 4) return;
		if (Array.isArray(node)) {
			for (const el of node) {
				if (el && typeof el === 'object' && ('bioguideID' in el || 'bioguideId' in el)) {
					candidates.push(el);
				} else {
					scan(el, depth + 1);
				}
			}
		} else if (typeof node === 'object') {
			for (const value of Object.values(node)) scan(value, depth + 1);
		}
	};
	scan(data, 0);

	const match = candidates.find(
		(m) => (m.bioguideID ?? m.bioguideId) === bioguideId,
	);
	return match?.voteCast ?? match?.vote ?? null;
}

function normalizePosition(raw: string | null): RollCallRow['position'] | null {
	if (!raw) return null;
	const value = raw.toLowerCase();
	if (value === 'yea' || value === 'aye' || value === 'yes') return 'yea';
	if (value === 'nay' || value === 'no') return 'nay';
	if (value === 'present') return 'present';
	if (value === 'not voting') return 'not-voting';
	return null;
}

export async function fetchMemberVotePosition(
	congress: number,
	session: number,
	rollCallNumber: number,
	bioguideId: string,
	opts: CongressFetchOptions,
): Promise<string | null> {
	const data = await apiGet(
		`/house-vote/${congress}/${session}/${rollCallNumber}/members`,
		{ limit: '450' },
		opts,
	);
	return findMemberPosition(data, bioguideId);
}

export function buildRollCallRow(
	item: HouseVoteListItem,
	rawPosition: string | null,
	slug: string,
): RollCallRow | null {
	const position = normalizePosition(rawPosition);
	if (!position || !item.startDate) return null;

	const year = item.startDate.slice(0, 4);
	const billNumber =
		item.legislationType && item.legislationNumber
			? `${item.legislationType} ${item.legislationNumber}`
			: null;

	return {
		vote_id: `congress:${item.congress}:${item.sessionNumber}:${item.rollCallNumber}`,
		legislator_slug: slug,
		source: 'congress',
		chamber: 'us-house',
		bill_number: billNumber,
		question: item.voteQuestion ?? 'Recorded vote',
		description: null,
		position,
		result: item.result ?? null,
		vote_date: item.startDate.slice(0, 10),
		url: `https://clerk.house.gov/Votes/${year}${item.rollCallNumber}`,
	};
}
