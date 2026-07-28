import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * Cloudflare's edge geolocates every request — no third-party lookup, no
 * storage. Used only to prefill the ZIP field client-side; never auto-searches.
 */
export const GET: APIRoute = async ({ locals }) => {
	const cf = (locals.runtime?.cf ?? {}) as Record<string, unknown>;

	const postalCode = typeof cf.postalCode === 'string' ? cf.postalCode : null;
	const city = typeof cf.city === 'string' ? cf.city : null;
	const region = typeof cf.regionCode === 'string' ? cf.regionCode : null;

	return new Response(
		JSON.stringify({
			postalCode: postalCode && /^\d{5}$/.test(postalCode) ? postalCode : null,
			city,
			region,
		}),
		{
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'private, no-store',
			},
		},
	);
};
