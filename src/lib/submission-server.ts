import {
	checkRateLimit,
	getClientIp,
	isValidSlug,
	verifyTurnstile,
	voterHash,
} from './vote-server';

export type SubmissionType = 'concern' | 'highlight';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export type SubmissionPayload = {
	legislator_slug: string;
	submission_type: SubmissionType;
	title: string;
	body: string;
	source?: string;
	turnstile_token?: string;
	website?: string;
};

export type SubmissionRecord = {
	id: number;
	legislator_slug: string;
	submission_type: SubmissionType;
	title: string;
	body: string;
	source: string | null;
	status: SubmissionStatus;
	agree_count: number;
	created_at: string;
};

const TITLE_MAX = 120;
const BODY_MAX = 2000;
const SOURCE_MAX = 500;
const SUBMISSION_RATE_MAX = 5;
const SUBMISSION_COOLDOWN_DAYS = 7;

export function isValidSubmissionType(value: unknown): value is SubmissionType {
	return value === 'concern' || value === 'highlight';
}

export function sanitizeSubmissionText(value: unknown, max: number): string | null {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	if (!trimmed || trimmed.length > max) return null;
	return trimmed;
}

export function checkSubmissionRateLimit(ip: string): boolean {
	return checkRateLimit(`sub:${ip}`);
}

export async function submitterHash(
	ip: string,
	userAgent: string,
	legislatorSlug: string,
	submissionType: SubmissionType,
	salt: string | undefined,
): Promise<string> {
	return voterHash(ip, userAgent, `${legislatorSlug}:${submissionType}`, salt);
}

export async function submissionVoterHash(
	ip: string,
	userAgent: string,
	submissionId: number,
	salt: string | undefined,
): Promise<string> {
	return voterHash(ip, userAgent, `submission:${submissionId}`, salt);
}

export async function verifySubmissionTurnstile(
	token: string | undefined,
	secret: string | undefined,
	ip: string,
	skip: boolean,
): Promise<boolean> {
	return verifyTurnstile(token, secret, ip, skip);
}

export function getAdminSecret(request: Request, envSecret: string | undefined): string | null {
	const auth = request.headers.get('Authorization');
	if (auth?.startsWith('Bearer ')) {
		return auth.slice(7).trim() || null;
	}
	const url = new URL(request.url);
	const query = url.searchParams.get('secret')?.trim();
	return query || null;
}

export function isAdminAuthorized(provided: string | null, envSecret: string | undefined): boolean {
	if (!envSecret || !provided) return false;
	return provided === envSecret;
}

export async function hasRecentSubmission(
	db: D1Database,
	slug: string,
	submissionType: SubmissionType,
	hash: string,
): Promise<boolean> {
	const row = await db
		.prepare(
			`SELECT id FROM submissions
      WHERE legislator_slug = ? AND submission_type = ? AND submitter_hash = ?
        AND datetime(created_at) > datetime('now', ?)`,
		)
		.bind(slug, submissionType, hash, `-${SUBMISSION_COOLDOWN_DAYS} days`)
		.first<{ id: number }>();
	return Boolean(row?.id);
}

export { getClientIp, isValidSlug, SUBMISSION_RATE_MAX };
