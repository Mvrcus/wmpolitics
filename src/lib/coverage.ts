import type { ArticleEntry, LegislatorEntry } from "./content";

export type CoverageTier = "documented" | "partial" | "stub";

export type CoverageStats = {
	highlights: number;
	concerns: number;
	sources: number;
	articles: number;
	hasScores: boolean;
	lastReviewed: Date | null;
	tier: CoverageTier;
};

/**
 * Coverage bar: "documented" needs at least two sourced points on each side
 * plus a sources list; anything with some reporting is "partial"; otherwise
 * the profile is an honest stub.
 */
export function getCoverageStats(
	entry: LegislatorEntry,
	articles: ArticleEntry[],
): CoverageStats {
	const d = entry.data;
	const highlights = d.goodPoints.length;
	const concerns = d.concerns.length;
	const sources = d.sources?.length ?? 0;

	let tier: CoverageTier = "stub";
	if (highlights >= 2 && concerns >= 2 && sources > 0) {
		tier = "documented";
	} else if (highlights + concerns + sources + articles.length > 0) {
		tier = "partial";
	}

	return {
		highlights,
		concerns,
		sources,
		articles: articles.length,
		hasScores: Boolean(d.editorialScores),
		lastReviewed: d.lastReviewed ?? null,
		tier,
	};
}

export const COVERAGE_TIER_LABELS: Record<CoverageTier, string> = {
	documented: "Documented",
	partial: "Partial",
	stub: "Stub",
};
