import type { APIRoute } from 'astro';
import { ensureVoteSchema, isDbBinding } from '../../lib/db';
import {
	checkSubmissionRateLimit,
	getClientIp,
	hasRecentSubmission,
	isValidSlug,
	isValidSubmissionType,
	sanitizeSubmissionText,
	submitterHash,
	verifySubmissionTurnstile,
	type SubmissionPayload,
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
		return json({ error: 'Submissions are temporarily unavailable.' }, 503);
	}

	const ip = getClientIp(request);
	if (!checkSubmissionRateLimit(ip)) {
		return json({ error: 'Too many submission attempts. Try again later.' }, 429);
	}

	let body: SubmissionPayload;
	try {
		body = (await request.json()) as SubmissionPayload;
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

	if (!isValidSubmissionType(body.submission_type)) {
		return json({ error: 'Type must be concern or highlight.' }, 400);
	}

	const title = sanitizeSubmissionText(body.title, 120);
	const textBody = sanitizeSubmissionText(body.body, 2000);
	if (!title || !textBody) {
		return json({ error: 'Title and body are required (within length limits).' }, 400);
	}

	let source: string | null = null;
	if (body.source) {
		const src = sanitizeSubmissionText(body.source, 500);
		if (!src) {
			return json({ error: 'Source URL is too long.' }, 400);
		}
		try {
			const url = new URL(src);
			if (!['http:', 'https:'].includes(url.protocol)) {
				return json({ error: 'Source must be an http or https URL.' }, 400);
			}
			source = url.href;
		} catch {
			return json({ error: 'Source must be a valid URL.' }, 400);
		}
	}

	const skipTurnstile = env.DEV_SKIP_TURNSTILE === 'true';
	const configured = skipTurnstile || Boolean(env.TURNSTILE_SECRET_KEY);
	if (!configured) {
		return json({ error: 'Submissions are not configured yet.' }, 503);
	}

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
		return json({ error: 'Submissions are not configured yet.' }, 503);
	}

	const hash = await submitterHash(
		ip,
		request.headers.get('User-Agent') ?? '',
		slug,
		body.submission_type,
		env.VOTE_HASH_SALT,
	);

	try {
		await ensureVoteSchema(env.DB);

		if (await hasRecentSubmission(env.DB, slug, body.submission_type, hash)) {
			return json(
				{
					error: `You already submitted a ${body.submission_type} for this profile this week.`,
				},
				409,
			);
		}

		await env.DB.prepare(
			`INSERT INTO submissions (legislator_slug, submission_type, title, body, source, submitter_hash)
      VALUES (?, ?, ?, ?, ?, ?)`,
		)
			.bind(slug, body.submission_type, title, textBody, source, hash)
			.run();
	} catch (err) {
		console.error('submission insert failed', err);
		return json({ error: 'Could not record your submission.' }, 500);
	}

	return json({
		ok: true,
		message: 'Thanks — your submission is live in the unfiltered community section.',
	});
};
