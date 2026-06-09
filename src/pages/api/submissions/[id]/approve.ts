import type { APIRoute } from 'astro';

export const prerender = false;

function json(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

/** Moderation is done via D1 SQL — see README. */
export const POST: APIRoute = async () => {
	return json(
		{
			error: 'Approve API is disabled. Moderate submissions with D1 SQL (see README).',
			example: "UPDATE submissions SET status = 'approved' WHERE id = ?",
		},
		410,
	);
};
