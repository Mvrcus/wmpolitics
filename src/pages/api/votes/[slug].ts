import type { APIRoute } from 'astro';
import { ensureVoteSchema, isDbBinding } from '../../../lib/db';
import { emptyVoteAggregates, isValidSlug, type VoteAggregates } from '../../../lib/vote-server';

export const prerender = false;

function json(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'public, max-age=60',
		},
	});
}

export const GET: APIRoute = async ({ params, locals }) => {
	const slug = params.slug?.trim();
	if (!slug || !isValidSlug(slug)) {
		return json({ error: 'Invalid legislator.' }, 400);
	}

	const env = locals.runtime?.env;
	if (!isDbBinding(env?.DB)) {
		return json(emptyVoteAggregates());
	}

	try {
		await ensureVoteSchema(env.DB);
		const row = await env.DB.prepare(
			`SELECT COUNT(*) AS count, AVG(overall) AS overall
      FROM votes WHERE legislator_slug = ?`,
		)
			.bind(slug)
			.first<{
				count: number;
				overall: number | null;
			}>();

		const count = Number(row?.count ?? 0);
		if (count === 0) {
			return json(emptyVoteAggregates());
		}

		const result: VoteAggregates = {
			count,
			averages: {
				overall: roundAvg(row?.overall),
			},
		};
		return json(result);
	} catch (err) {
		console.warn('vote aggregate unavailable', err);
		return json(emptyVoteAggregates());
	}
};

function roundAvg(value: number | null | undefined): number {
	if (value == null || Number.isNaN(value)) return 0;
	return Math.round(value * 10) / 10;
}
