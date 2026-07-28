import type { APIRoute } from 'astro';
import { runTrackRecordSync } from '../../../lib/track-record/sync';

export const prerender = false;

function json(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

export const POST: APIRoute = async ({ request, locals }) => {
	const env = locals.runtime?.env;
	const expected = env?.SYNC_TRIGGER_TOKEN;
	if (!expected) {
		return json({ error: 'Sync trigger is not configured.' }, 503);
	}

	const auth = request.headers.get('Authorization') ?? '';
	const provided = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
	if (!provided || provided !== expected) {
		return json({ error: 'Unauthorized.' }, 401);
	}

	try {
		const results = await runTrackRecordSync(env);
		return json({ ok: true, results });
	} catch (err) {
		console.error('manual sync failed', err);
		return json({ error: 'Sync failed — see worker logs.' }, 500);
	}
};
