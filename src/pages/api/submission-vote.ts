import type { APIRoute } from 'astro';
import { ensureVoteSchema, isDbBinding } from '../../lib/db';
import {
	checkSubmissionRateLimit,
	getClientIp,
	submissionVoterHash,
	verifySubmissionTurnstile,
} from '../../lib/submission-server';

export const prerender = false;

function json(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

export const POST: APIRoute = async ({ request, locals }) => {
	const env = locals.runtime?.env;
	if (!isDbBinding(env?.DB)) {
		return json({ error: 'Voting is temporarily unavailable.' }, 503);
	}

	const ip = getClientIp(request);
	if (!checkSubmissionRateLimit(ip)) {
		return json({ error: 'Too many requests. Try again later.' }, 429);
	}

	let body: { submission_id?: number; turnstile_token?: string; website?: string };
	try {
		body = (await request.json()) as typeof body;
	} catch {
		return json({ error: 'Invalid request body.' }, 400);
	}

	if (body.website) {
		return json({ error: 'Invalid submission.' }, 400);
	}

	const submissionId = Number(body.submission_id);
	if (!Number.isInteger(submissionId) || submissionId < 1) {
		return json({ error: 'Invalid submission.' }, 400);
	}

	const skipTurnstile = env.DEV_SKIP_TURNSTILE === 'true';
	const turnstileOk = await verifySubmissionTurnstile(
		body.turnstile_token,
		env.TURNSTILE_SECRET_KEY,
		ip,
		skipTurnstile,
	);
	if (!turnstileOk) {
		return json({ error: 'Security check failed. Please try again.' }, 403);
	}

	if (!env.VOTE_HASH_SALT && !skipTurnstile) {
		return json({ error: 'Voting is not configured yet.' }, 503);
	}

	const hash = await submissionVoterHash(
		ip,
		request.headers.get('User-Agent') ?? '',
		submissionId,
		env.VOTE_HASH_SALT,
	);

	try {
		await ensureVoteSchema(env.DB);

		const row = await env.DB.prepare(`SELECT id, status FROM submissions WHERE id = ?`)
			.bind(submissionId)
			.first<{ id: number; status: string }>();

		if (!row || row.status === 'rejected') {
			return json({ error: 'Submission not found.' }, 404);
		}

		await env.DB.prepare(`INSERT INTO submission_votes (submission_id, voter_hash) VALUES (?, ?)`)
			.bind(submissionId, hash)
			.run();

		await env.DB.prepare(
			`UPDATE submissions SET agree_count = agree_count + 1 WHERE id = ?`,
		)
			.bind(submissionId)
			.run();

		const updated = await env.DB.prepare(`SELECT agree_count FROM submissions WHERE id = ?`)
			.bind(submissionId)
			.first<{ agree_count: number }>();

		return json({ ok: true, agree_count: updated?.agree_count ?? 0 });
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		if (message.includes('UNIQUE') || message.includes('unique')) {
			return json({ error: 'You already marked this as helpful.' }, 409);
		}
		console.error('submission vote failed', err);
		return json({ error: 'Could not record your vote.' }, 500);
	}
};
