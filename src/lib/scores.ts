import type { CollectionEntry } from 'astro:content';

export type EditorialScores = {
	accessibility: number;
	policyAlignment: number;
	healthcare: number;
	environment: number;
	overall: number;
};

export const SCORE_DIMENSIONS = [
	{ key: 'accessibility' as const, label: 'Accessibility' },
	{ key: 'policyAlignment' as const, label: 'Policy alignment' },
	{ key: 'healthcare' as const, label: 'Healthcare' },
	{ key: 'environment' as const, label: 'Environment' },
	{ key: 'overall' as const, label: 'Overall' },
];

/**
 * Only hand-set scores are shown to readers. Profiles without an explicit
 * `editorialScores` frontmatter block are unscored (null), never auto-computed.
 */
export function resolveEditorialScores(
	entry: CollectionEntry<'legislators'>,
): EditorialScores | null {
	return entry.data.editorialScores ?? null;
}

/** Map 1–5 community rating to 0–100 for display beside editorial meters. */
export function ratingToDisplay(score: number): number {
	return Math.round((score / 5) * 100);
}
