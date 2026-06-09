import type { CollectionEntry } from 'astro:content';

const OFFICE_ORDER = ['us-house', 'us-senate', 'state-house', 'state-senate', 'local'] as const;

export const OFFICE_LABELS: Record<string, string> = {
	'us-house': 'U.S. House',
	'us-senate': 'U.S. Senate',
	'state-house': 'State House',
	'state-senate': 'State Senate',
	local: 'Local Government',
};

export type LegislatorStatus = 'current' | 'past';

export function legislatorStatus(entry: CollectionEntry<'legislators'>): LegislatorStatus {
	return entry.data.status ?? 'current';
}

export function isCurrentLegislator(entry: CollectionEntry<'legislators'>) {
	return legislatorStatus(entry) === 'current';
}

export function filterLegislatorsByStatus(
	legislators: CollectionEntry<'legislators'>[],
	status: LegislatorStatus,
) {
	return legislators.filter((entry) => legislatorStatus(entry) === status);
}

export function seatLabel(entry: CollectionEntry<'legislators'>) {
	return entry.data.seatLabel ?? entry.data.district;
}

export function formatTermRange(termStart?: number, termEnd?: number) {
	if (termStart && termEnd) return `${termStart}–${termEnd}`;
	if (termStart) return `from ${termStart}`;
	if (termEnd) return `until ${termEnd}`;
	return undefined;
}

export function sortLegislators(legislators: CollectionEntry<'legislators'>[]) {
	return [...legislators].sort((a, b) => {
		if (a.data.servesHolland !== b.data.servesHolland) {
			return a.data.servesHolland ? -1 : 1;
		}
		return a.data.proximityRank - b.data.proximityRank;
	});
}

export function sortPastLegislatorsByName(legislators: CollectionEntry<'legislators'>[]) {
	return [...legislators].sort((a, b) => a.data.name.localeCompare(b.data.name));
}

export function groupLegislatorsByOffice(legislators: CollectionEntry<'legislators'>[]) {
	const sorted = sortLegislators(legislators);
	const groups = new Map<string, CollectionEntry<'legislators'>[]>();

	for (const leg of sorted) {
		const key = leg.data.office;
		if (!groups.has(key)) groups.set(key, []);
		groups.get(key)!.push(leg);
	}

	return OFFICE_ORDER.filter((o) => groups.has(o)).map((office) => ({
		office,
		label: OFFICE_LABELS[office] ?? office,
		legislators: groups.get(office)!,
	}));
}

export function getCurrentHolderForSeat(
	legislators: CollectionEntry<'legislators'>[],
	seatSlug: string,
) {
	return legislators.find(
		(entry) => entry.data.seatSlug === seatSlug && isCurrentLegislator(entry),
	);
}

export function getPastHoldersForSeat(
	legislators: CollectionEntry<'legislators'>[],
	seatSlug: string,
) {
	return sortPastLegislatorsByName(
		legislators.filter(
			(entry) => entry.data.seatSlug === seatSlug && !isCurrentLegislator(entry),
		),
	);
}

export function groupPastLegislatorsBySeat(legislators: CollectionEntry<'legislators'>[]) {
	const past = filterLegislatorsByStatus(legislators, 'past');
	const groups = new Map<
		string,
		{ seatLabel: string; legislators: CollectionEntry<'legislators'>[] }
	>();

	for (const leg of past) {
		const key = leg.data.seatSlug;
		if (!groups.has(key)) {
			groups.set(key, { seatLabel: seatLabel(leg), legislators: [] });
		}
		groups.get(key)!.legislators.push(leg);
	}

	for (const group of groups.values()) {
		group.legislators = sortPastLegislatorsByName(group.legislators);
	}

	return [...groups.entries()]
		.sort((a, b) => a[1].seatLabel.localeCompare(b[1].seatLabel))
		.map(([seatSlug, group]) => ({ seatSlug, ...group }));
}
