export const VOTE_SCALE_MIN = 1;
export const VOTE_SCALE_MAX = 5;

export type VotePayload = {
	legislator_slug: string;
	overall: number;
	turnstile_token?: string;
	website?: string;
};

export type VoteAggregates = {
	averages: {
		overall: number;
	};
	count: number;
};

export function emptyVoteAggregates(): VoteAggregates {
	return {
		averages: {
			overall: 0,
		},
		count: 0,
	};
}

export function ratingToPercent(avg: number): number {
	return Math.round(avg * 20);
}

export function tarFeatherLabel(pct: number): 'Feathered' | 'Mixed' | 'Tarred' {
	if (pct >= 60) return 'Feathered';
	if (pct >= 40) return 'Mixed';
	return 'Tarred';
}

export function tarFeatherClass(pct: number): 'feathered' | 'mixed' | 'tarred' {
	if (pct >= 60) return 'feathered';
	if (pct >= 40) return 'mixed';
	return 'tarred';
}

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export function isValidSlug(slug: string): boolean {
	return /^[a-z0-9-]+$/.test(slug) && slug.length <= 64;
}

export function isValidRating(value: unknown): value is number {
	return typeof value === 'number' && Number.isInteger(value) && value >= VOTE_SCALE_MIN && value <= VOTE_SCALE_MAX;
}

export function checkRateLimit(ip: string): boolean {
	const now = Date.now();
	const entry = rateLimitStore.get(ip);
	if (!entry || now > entry.resetAt) {
		rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
		return true;
	}
	if (entry.count >= RATE_LIMIT_MAX) return false;
	entry.count += 1;
	return true;
}

export async function verifyTurnstile(
	token: string | undefined,
	secret: string | undefined,
	ip: string,
	skip: boolean,
): Promise<boolean> {
	if (skip) return true;
	if (!secret || !token) return false;

	const body = new URLSearchParams({
		secret,
		response: token,
		remoteip: ip,
	});

	const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body,
	});

	if (!res.ok) return false;
	const data = (await res.json()) as { success?: boolean };
	return Boolean(data.success);
}

export async function voterHash(
	ip: string,
	userAgent: string,
	legislatorSlug: string,
	salt: string | undefined,
): Promise<string> {
	const input = `${ip}|${userAgent}|${legislatorSlug}|${salt ?? ''}`;
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
	return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function getClientIp(request: Request): string {
	return (
		request.headers.get('CF-Connecting-IP') ??
		request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ??
		'0.0.0.0'
	);
}
