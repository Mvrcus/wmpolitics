import type { CollectionEntry } from 'astro:content';

export type PublicOpinionBasis = 'polling' | 'election' | 'blend' | 'insufficient';

export type PublicOpinion = {
	score: number | null;
	basis: PublicOpinionBasis;
	confidence: 'high' | 'medium' | 'low';
	asOf: string;
	detail: string;
	sources: Array<{ label: string; url: string }>;
};

/**
 * Public-standing scores are compiled by hand from verifiable public signals
 * only — published approval polling where it exists, and the official's vote
 * share in their most recent contested general election where it doesn't.
 * Appointed officials and those who ran unopposed have no defensible signal
 * and get `score: null` (basis "insufficient") rather than an invented number.
 * Never auto-computed; profiles without the frontmatter block are unscored.
 */
export function resolvePublicOpinion(
	entry: CollectionEntry<'legislators'>,
): PublicOpinion | null {
	return entry.data.publicOpinion ?? null;
}

export const BASIS_LABELS: Record<PublicOpinionBasis, string> = {
	polling: 'Approval polling',
	election: 'Last contested election',
	blend: 'Polling + last election',
	insufficient: 'No public measure exists',
};

/** Band a 0–100 standing score into the site's signal classes. */
export function publicStandingSignal(po: PublicOpinion | null): {
	cls: 'good' | 'mixed' | 'poor' | 'unscored';
	label: string;
} {
	if (!po || po.score === null) return { cls: 'unscored', label: 'Public: no data' };
	const score = Math.round(po.score);
	if (score >= 60) return { cls: 'good', label: `Public · ${score}/100` };
	if (score >= 40) return { cls: 'mixed', label: `Public · ${score}/100` };
	return { cls: 'poor', label: `Public · ${score}/100` };
}
