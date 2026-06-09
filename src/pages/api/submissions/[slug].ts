import type { APIRoute } from 'astro';
import { ensureVoteSchema, isDbBinding } from '../../../lib/db';
import { isValidSlug, type SubmissionRecord } from '../../../lib/submission-server';

export const prerender = false;

function json(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'public, max-age=30',
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
		return json({ approved: [], unfiltered: [] });
	}

	try {
		await ensureVoteSchema(env.DB);
		const { results } = await env.DB.prepare(
			`SELECT id, legislator_slug, submission_type, title, body, source, status, agree_count, created_at
      FROM submissions
      WHERE legislator_slug = ? AND status IN ('approved', 'pending')
      ORDER BY agree_count DESC, datetime(created_at) DESC`,
		)
			.bind(slug)
			.all<SubmissionRecord>();

		const rows = results ?? [];
		const approved = rows.filter((r) => r.status === 'approved');
		const unfiltered = rows.filter((r) => r.status === 'pending');

		return json({ approved, unfiltered });
	} catch (err) {
		console.warn('submissions list unavailable', err);
		return json({ approved: [], unfiltered: [] });
	}
};
