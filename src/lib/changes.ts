import { getCollection } from "astro:content";
import { getLatestArticles } from "./content";
import { isCurrentLegislator } from "./legislators";

export type ChangeType =
	| "article"
	| "article-update"
	| "profile-review"
	| "vote"
	| "community";

export type ChangeItem = {
	type: ChangeType;
	date: Date;
	title: string;
	href: string;
	legislatorSlug?: string;
};

export const CHANGE_TYPE_LABELS: Record<ChangeType, string> = {
	article: "New article",
	"article-update": "Article updated",
	"profile-review": "Profile reviewed",
	vote: "Roll-call vote",
	community: "Community",
};

/**
 * Build-time change feed: article publish/update dates plus profile review
 * dates. Votes and community activity are hydrated client-side from
 * /api/recent-activity — the page is fully useful without them.
 */
export async function getRecentChanges(days = 14, limit = 8): Promise<ChangeItem[]> {
	const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
	const items: ChangeItem[] = [];

	for (const article of await getLatestArticles()) {
		items.push({
			type: "article",
			date: article.data.pubDate,
			title: article.data.title,
			href: `/updates/${article.id}/`,
		});
		if (article.data.updatedDate) {
			items.push({
				type: "article-update",
				date: article.data.updatedDate,
				title: article.data.title,
				href: `/updates/${article.id}/`,
			});
		}
	}

	for (const entry of await getCollection("legislators")) {
		if (!isCurrentLegislator(entry) || !entry.data.lastReviewed) continue;
		items.push({
			type: "profile-review",
			date: entry.data.lastReviewed,
			title: `${entry.data.name} profile re-reviewed`,
			href: `/legislators/${entry.data.slug}/`,
			legislatorSlug: entry.data.slug,
		});
	}

	const recent = items.filter((item) => item.date.valueOf() >= cutoff);
	const pool = recent.length > 0 ? recent : items;
	return pool.sort((a, b) => b.date.valueOf() - a.date.valueOf()).slice(0, limit);
}

/** Most recent change date across all content, for the quiet-week empty state. */
export async function getLastChangeDate(): Promise<Date | null> {
	const all = await getRecentChanges(365 * 10, 1);
	return all[0]?.date ?? null;
}
