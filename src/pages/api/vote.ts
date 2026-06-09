import type { APIRoute } from 'astro';
import { ensureVoteSchema, isDbBinding } from '../../lib/db';
import {
	checkRateLimit,
	getClientIp,
	isValidRating,
	isValidSlug,
	verifyTurnstile,
	voterHash,
	type VotePayload,
} from '../../lib/vote-server';

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
	if (!checkRateLimit(ip)) {
		return json({ error: 'Too many vote attempts. Try again later.' }, 429);
	}

	let body: VotePayload;
	try {
		body = (await request.json()) as VotePayload;
	} catch {
		return json({ error: 'Invalid request body.' }, 400);
	}

	if (body.website) {
		return json({ error: 'Invalid submission.' }, 400);
	}

	const slug = body.legislator_slug?.trim();
	if (!slug || !isValidSlug(slug)) {
		return json({ error: 'Invalid legislator.' }, 400);
	}

	if (!isValidRating(body.overall)) {
		return json({ error: 'Score must be between 1 and 5.' }, 400);
	}

	const skipTurnstile = env.DEV_SKIP_TURNSTILE === 'true';
	const votingConfigured = skipTurnstile || Boolean(env.TURNSTILE_SECRET_KEY);
	if (!votingConfigured) {
		return json({ error: 'Voting is not configured yet.' }, 503);
	}

	const turnstileOk = await verifyTurnstile(
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

	const hash = await voterHash(
		ip,
		request.headers.get('User-Agent') ?? '',
		slug,
		env.VOTE_HASH_SALT,
	);

	try {
		await ensureVoteSchema(env.DB);
		const score = body.overall;
		await env.DB.prepare(
			`INSERT INTO votes (
        legislator_slug, accessibility, policy_alignment, healthcare, environment, overall, voter_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
		)
			.bind(slug, score, score, score, score, score, hash)
			.run();
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		if (message.includes('UNIQUE') || message.includes('unique')) {
			return json({ error: 'You have already voted on this profile from this device or network.' }, 409);
		}
		console.error('vote insert failed', err);
		return json({ error: 'Could not record your vote.' }, 500);
	}

	return json({ ok: true, message: 'Thanks, your vote was recorded.' });
};
