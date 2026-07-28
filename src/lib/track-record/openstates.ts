import type { BillRow } from './types';
import { RateLimitError } from './congress';

const API_BASE = 'https://v3.openstates.org';

export type OpenStatesFetchOptions = {
	apiKey: string;
	throttleMs?: number;
};

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function apiGet(
	path: string,
	params: Record<string, string>,
	opts: OpenStatesFetchOptions,
): Promise<any> {
	const url = new URL(`${API_BASE}${path}`);
	for (const [key, value] of Object.entries(params)) {
		url.searchParams.set(key, value);
	}

	if (opts.throttleMs) await sleep(opts.throttleMs);
	const res = await fetch(url, {
		headers: { Accept: 'application/json', 'X-API-KEY': opts.apiKey },
	});
	if (res.status === 429) throw new RateLimitError(path);
	if (!res.ok) throw new Error(`openstates ${path} failed: ${res.status}`);
	return res.json();
}

/**
 * Resolve an ocd-person ID by name + chamber at runtime — one small request
 * per person per sync, instead of hand-copied UUIDs that can silently rot.
 */
export async function resolvePersonId(
	name: string,
	chamber: 'mi-house' | 'mi-senate',
	opts: OpenStatesFetchOptions,
): Promise<string | null> {
	const data = await apiGet(
		'/people',
		{ jurisdiction: 'Michigan', name, per_page: '5' },
		opts,
	);
	const wanted = chamber === 'mi-house' ? 'lower' : 'upper';
	const results: any[] = data?.results ?? [];
	const match =
		results.find((p) => p?.current_role?.org_classification === wanted) ?? results[0];
	return match?.id ?? null;
}

export async function fetchSponsoredBills(
	personId: string,
	slug: string,
	opts: OpenStatesFetchOptions,
	limit = 20,
): Promise<BillRow[]> {
	const data = await apiGet(
		'/bills',
		{
			jurisdiction: 'Michigan',
			sponsor: personId,
			sort: 'updated_desc',
			per_page: String(limit),
		},
		opts,
	);
	const items: any[] = data?.results ?? [];
	const rows: BillRow[] = [];

	for (const item of items) {
		if (!item?.id || !item?.identifier || !item?.title) continue;
		rows.push({
			bill_id: `openstates:${item.id}`,
			legislator_slug: slug,
			source: 'openstates',
			role: 'sponsor',
			number: item.identifier,
			title: item.title,
			introduced_date: item.first_action_date ?? null,
			latest_action: item.latest_action_description ?? null,
			latest_action_date: item.latest_action_date ?? null,
			url: item.openstates_url ?? `https://openstates.org/mi/bills/`,
		});
	}
	return rows;
}
