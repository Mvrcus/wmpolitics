import type { APIRoute } from 'astro';
import { ensureVoteSchema, isDbBinding } from '../../lib/db';

export const prerender = false;

type ActivityItem = {
	type: 'submission' | 'votes';
	legislator_slug: string;
	title?: string;
	submission_type?: string;
	count?: number;
	created_at?: string;
};

function json(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'public, max-age=300',
		},
	});
}

export const GET: APIRoute = async ({ locals }) => {
	const env = locals.runtime?.env;
	if (!isDbBinding(env?.DB)) {
		return json({ items: [] });
	}

	try {
		await ensureVoteSchema(env.DB);

		const submissions = await env.DB.prepare(
			`SELECT legislator_slug, submission_type, title, created_at
      FROM submissions
      WHERE status = 'approved' AND datetime(created_at) > datetime('now', '-7 days')
      ORDER BY datetime(created_at) DESC
      LIMIT 5`,
		).all<{
			legislator_slug: string;
			submission_type: string;
			title: string;
			created_at: string;
		}>();

		const votes = await env.DB.prepare(
			`SELECT legislator_slug, COUNT(*) AS count
      FROM votes
      WHERE datetime(created_at) > datetime('now', '-7 days')
      GROUP BY legislator_slug
      ORDER BY count DESC
      LIMIT 5`,
		).all<{ legislator_slug: string; count: number }>();

		const items: ActivityItem[] = [
			...(submissions.results ?? []).map((row) => ({
				type: 'submission' as const,
				legislator_slug: row.legislator_slug,
				submission_type: row.submission_type,
				title: row.title,
				created_at: row.created_at,
			})),
			...(votes.results ?? []).map((row) => ({
				type: 'votes' as const,
				legislator_slug: row.legislator_slug,
				count: row.count,
			})),
		];

		return json({ items });
	} catch (err) {
		console.warn('recent activity unavailable', err);
		return json({ items: [] });
	}
};
