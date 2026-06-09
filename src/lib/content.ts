import {
	getCollection,
	getEntries,
	type CollectionEntry,
	type CollectionReference,
} from "astro:content";
import {
	filterLegislatorsByStatus,
	groupLegislatorsByOffice,
	groupPastLegislatorsBySeat,
	isCurrentLegislator,
	sortLegislators,
} from "./legislators";

export type ArticleEntry = CollectionEntry<"articles">;
export type LegislatorEntry = CollectionEntry<"legislators">;

export type { CollectionEntry };

function sortArticlesByDate(a: ArticleEntry, b: ArticleEntry) {
	return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
}

export function legislatorRefId(ref: CollectionReference<"legislators">): string {
	const id = ref.id;
	return id.includes("/") ? (id.split("/").pop() ?? id) : id;
}

async function getAllArticlesSorted(): Promise<ArticleEntry[]> {
	return [...(await getCollection("articles"))].sort(sortArticlesByDate);
}

export async function getFeaturedArticles(): Promise<ArticleEntry[]> {
	return (await getAllArticlesSorted()).filter((a) => a.data.featured);
}

export async function getLatestArticles(limit?: number): Promise<ArticleEntry[]> {
	const sorted = await getAllArticlesSorted();
	return limit ? sorted.slice(0, limit) : sorted;
}

export async function getLegislatorBySlug(slug: string): Promise<LegislatorEntry | undefined> {
	const legislators = await getCollection("legislators");
	return legislators.find((l) => l.data.slug === slug);
}

export async function getArticlesForLegislator(slug: string): Promise<ArticleEntry[]> {
	const sorted = await getAllArticlesSorted();
	return sorted.filter((article) =>
		article.data.relatedLegislators?.some((ref) => legislatorRefId(ref) === slug),
	);
}

export async function getHollandLegislators(): Promise<LegislatorEntry[]> {
	const legislators = await getCollection("legislators");
	return sortLegislators(
		legislators.filter((l) => l.data.servesHolland && isCurrentLegislator(l)),
	);
}

export async function getCurrentLegislators(): Promise<LegislatorEntry[]> {
	const legislators = await getCollection("legislators");
	return sortLegislators(filterLegislatorsByStatus(legislators, "current"));
}

export async function getPastLegislatorsBySeat() {
	const legislators = await getCollection("legislators");
	return groupPastLegislatorsBySeat(legislators);
}

export async function getLegislatorsByOffice(status: "current" | "past" = "current") {
	const legislators = await getCollection("legislators");
	return groupLegislatorsByOffice(filterLegislatorsByStatus(legislators, status));
}

export async function resolveArticleLegislators(
	article: ArticleEntry,
): Promise<LegislatorEntry[]> {
	const refs = article.data.relatedLegislators;
	if (!refs?.length) return [];
	return getEntries(refs);
}

export async function getRelatedArticles(
	currentSlug: string,
	limit = 3,
): Promise<ArticleEntry[]> {
	const sorted = await getAllArticlesSorted();
	const current = sorted.find((a) => a.id === currentSlug);
	if (!current) return sorted.filter((a) => a.id !== currentSlug).slice(0, limit);

	const currentLegIds = new Set(
		(current.data.relatedLegislators ?? []).map(legislatorRefId),
	);
	const currentCategory = current.data.category?.toLowerCase();

	const scored = sorted
		.filter((a) => a.id !== currentSlug)
		.map((article) => {
			let score = 0;
			const sharesLegislator = article.data.relatedLegislators?.some((ref) =>
				currentLegIds.has(legislatorRefId(ref)),
			);
			if (sharesLegislator) score += 2;
			if (
				currentCategory &&
				article.data.category?.toLowerCase() === currentCategory
			) {
				score += 1;
			}
			return { article, score };
		})
		.filter(({ score }) => score > 0)
		.sort(
			(a, b) =>
				b.score - a.score ||
				sortArticlesByDate(a.article, b.article),
		);

	const picked = scored.slice(0, limit).map(({ article }) => article);
	if (picked.length >= limit) return picked;

	const pickedIds = new Set([currentSlug, ...picked.map((a) => a.id)]);
	const filler = sorted.filter((a) => !pickedIds.has(a.id));
	return [...picked, ...filler].slice(0, limit);
}
