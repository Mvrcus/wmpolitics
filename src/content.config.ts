import { glob } from "astro/loaders";
import { defineCollection, reference } from "astro:content";
import { z } from "astro/zod";

const pointSchema = z.object({
	title: z.string(),
	body: z.string(),
	source: z.string().optional(),
});

const sourceSchema = z.object({
	label: z.string(),
	url: z.string(),
});

const editorialScoresSchema = z.object({
	accessibility: z.number().min(0).max(100),
	policyAlignment: z.number().min(0).max(100),
	healthcare: z.number().min(0).max(100),
	environment: z.number().min(0).max(100),
	overall: z.number().min(0).max(100),
});

const legislators = defineCollection({
	loader: glob({ base: "./src/content/legislators", pattern: "**/*.{md,mdx}" }),
	schema: z.object({
		name: z.string(),
		slug: z.string(),
		office: z.enum(["us-house", "us-senate", "state-house", "state-senate", "local"]),
		district: z.string(),
		/** Groups current and past holders of the same elected seat. */
		seatSlug: z.string(),
		/** Short label for seat history sections (defaults to district). */
		seatLabel: z.string().optional(),
		status: z.enum(["current", "past"]).default("current"),
		termStart: z.number().optional(),
		termEnd: z.number().optional(),
		party: z.string().optional(),
		photo: z.string().optional(),
		servesHolland: z.boolean(),
		proximityRank: z.number(),
		summary: z.string(),
		goodPoints: z.array(pointSchema),
		concerns: z.array(pointSchema),
		sources: z.array(sourceSchema).optional(),
		editorialScores: editorialScoresSchema.optional(),
	}),
});

const articles = defineCollection({
	loader: glob({ base: "./src/content/articles", pattern: "**/*.{md,mdx}" }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
		category: z.string().optional(),
		relatedLegislators: z.array(reference("legislators")).optional(),
		featured: z.boolean().optional(),
	}),
});

export const collections = { legislators, articles };
