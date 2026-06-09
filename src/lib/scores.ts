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

const DIMENSION_KEYWORDS: Record<keyof EditorialScores, string[]> = {
	accessibility: [
		'town hall',
		'voicemail',
		'phone',
		'office',
		'appointment',
		'access',
		'constituent',
		'casework',
		'contact',
		'virtual',
		'in-person',
	],
	policyAlignment: [
		'party',
		'vote',
		'caucus',
		'alignment',
		'gop',
		'democrat',
		'republican',
		'bipartisan',
		'budget',
		'majority',
		'minority',
		'election',
		'amicus',
	],
	healthcare: [
		'health',
		'medicaid',
		'aca',
		'affordable care',
		'hospital',
		'provider',
		'nutrition',
		'public health',
		'health department',
	],
	environment: [
		'environment',
		'climate',
		'epa',
		'great lakes',
		'glri',
		'lakes',
		'habitat',
		'invasive',
		'pollution',
		'conservation',
		'energy',
		'parks',
	],
	overall: [],
};

function pointText(point: { title: string; body: string }) {
	return `${point.title} ${point.body}`.toLowerCase();
}

function scoreDimension(
	goodPoints: CollectionEntry<'legislators'>['data']['goodPoints'],
	concerns: CollectionEntry<'legislators'>['data']['concerns'],
	keywords: string[],
): number {
	let good = 0;
	let concern = 0;

	for (const point of goodPoints) {
		const text = pointText(point);
		if (keywords.length === 0 || keywords.some((k) => text.includes(k))) good += 1;
	}
	for (const point of concerns) {
		const text = pointText(point);
		if (keywords.length === 0 || keywords.some((k) => text.includes(k))) concern += 1;
	}

	const total = good + concern;
	if (total === 0) return 50;
	return Math.round(Math.min(100, Math.max(0, 50 + ((good - concern) / total) * 50)));
}

export function computeEditorialScores(
	entry: CollectionEntry<'legislators'>,
): EditorialScores {
	const { goodPoints, concerns } = entry.data;
	const accessibility = scoreDimension(goodPoints, concerns, DIMENSION_KEYWORDS.accessibility);
	const policyAlignment = scoreDimension(goodPoints, concerns, DIMENSION_KEYWORDS.policyAlignment);
	const healthcare = scoreDimension(goodPoints, concerns, DIMENSION_KEYWORDS.healthcare);
	const environment = scoreDimension(goodPoints, concerns, DIMENSION_KEYWORDS.environment);
	const overall = Math.round(
		(accessibility + policyAlignment + healthcare + environment) / 4,
	);
	return { accessibility, policyAlignment, healthcare, environment, overall };
}

export function resolveEditorialScores(
	entry: CollectionEntry<'legislators'>,
): EditorialScores {
	return entry.data.editorialScores ?? computeEditorialScores(entry);
}

/** Map 1–5 community rating to 0–100 for display beside editorial meters. */
export function ratingToDisplay(score: number): number {
	return Math.round((score / 5) * 100);
}
