import type { APIRoute } from 'astro';
import { ensureVoteSchema, isDbBinding } from '../../lib/db';
import { checkRateLimit, getClientIp } from '../../lib/vote-server';

export const prerender = false;

const EMAIL_MAX = 254;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ZIP_RE = /^[0-9]{5}(-[0-9]{4})?$/;

type SubscribePayload = {
	email?: string;
	zip?: string;
	source?: string;
	website?: string;
};

function json(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

export const POST: APIRoute = async ({ request, locals }) => {
	const env = locals.runtime?.env;
	if (!isDbBinding(env?.DB)) {
		return json({ error: 'Signups are temporarily unavailable.' }, 503);
	}

	const ip = getClientIp(request);
	if (!checkRateLimit(`newsletter:${ip}`)) {
		return json({ error: 'Too many attempts. Try again later.' }, 429);
	}

	let body: SubscribePayload;
	try {
		body = (await request.json()) as SubscribePayload;
	} catch {
		return json({ error: 'Invalid request body.' }, 400);
	}

	if (body.website) {
		return json({ error: 'Invalid submission.' }, 400);
	}

	const email = typeof body.email === 'string' ? body.email.trim() : '';
	if (!email || email.length > EMAIL_MAX || !EMAIL_RE.test(email)) {
		return json({ error: 'Enter a valid email address.' }, 400);
	}

	let zip: string | null = null;
	if (typeof body.zip === 'string' && body.zip.trim()) {
		const trimmed = body.zip.trim();
		if (!ZIP_RE.test(trimmed)) {
			return json({ error: 'Enter a valid ZIP code (or leave it blank).' }, 400);
		}
		zip = trimmed;
	}

	const source =
		typeof body.source === 'string' && body.source.trim()
			? body.source.trim().slice(0, 100)
			: null;

	try {
		await ensureVoteSchema(env.DB);
		// INSERT OR IGNORE + unconditional success: never reveal whether an email
		// is already subscribed.
		await env.DB.prepare(
			`INSERT OR IGNORE INTO subscribers (email, zip, source) VALUES (?, ?, ?)`,
		)
			.bind(email, zip, source)
			.run();
	} catch (err) {
		console.error('subscribe insert failed', err);
		return json({ error: 'Could not save your signup. Please try again.' }, 500);
	}

	return json({
		ok: true,
		message: "You're on the list — we send when something changes, not on a schedule.",
	});
};
