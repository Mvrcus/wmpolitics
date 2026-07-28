import type { APIRoute } from 'astro';
import { ensureTrackRecordSchema, isDbBinding } from '../../../lib/db';
import { isValidSlug } from '../../../lib/submission-server';
import { rosterEntryForSlug } from '../../../lib/track-record/roster';
import type { TrackRecordPayload } from '../../../lib/track-record/types';

export const prerender = false;

function json(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'public, max-age=3600',
		},
	});
}

function emptyPayload(): TrackRecordPayload {
	return {
		updatedAt: null,
		stats: { totalVotes: 0, missedVotes: 0, missedPct: null, trackedSince: null },
		votes: [],
		bills: { sponsored: [], cosponsoredCount: 0 },
	};
}

export const GET: APIRoute = async ({ params, locals }) => {
	const slug = params.slug?.trim();
	if (!slug || !isValidSlug(slug)) {
		return json({ error: 'Invalid legislator.' }, 400);
	}

	if (!rosterEntryForSlug(slug)) {
		return json(emptyPayload());
	}

	const env = locals.runtime?.env;
	if (!isDbBinding(env?.DB)) {
		return json(emptyPayload());
	}

	try {
		await ensureTrackRecordSchema(env.DB);

		const votes = await env.DB.prepare(
			`SELECT vote_id, bill_number, question, description, position, result, vote_date, url
      FROM roll_call_votes
      WHERE legislator_slug = ?
      ORDER BY vote_date DESC
      LIMIT 10`,
		)
			.bind(slug)
			.all<{
				vote_id: string;
				bill_number: string | null;
				question: string;
				description: string | null;
				position: string;
				result: string | null;
				vote_date: string;
				url: string;
			}>();

		const stats = await env.DB.prepare(
			`SELECT COUNT(*) AS total,
        SUM(CASE WHEN position = 'not-voting' THEN 1 ELSE 0 END) AS missed,
        MIN(vote_date) AS tracked_since,
        MAX(synced_at) AS updated_at
      FROM roll_call_votes
      WHERE legislator_slug = ?`,
		)
			.bind(slug)
			.first<{
				total: number;
				missed: number | null;
				tracked_since: string | null;
				updated_at: string | null;
			}>();

		const sponsored = await env.DB.prepare(
			`SELECT number, title, latest_action, latest_action_date, url
      FROM bills
      WHERE legislator_slug = ? AND role = 'sponsor'
      ORDER BY latest_action_date DESC
      LIMIT 10`,
		)
			.bind(slug)
			.all<{
				number: string;
				title: string;
				latest_action: string | null;
				latest_action_date: string | null;
				url: string;
			}>();

		const cosponsoredRow = await env.DB.prepare(
			`SELECT detail FROM sync_runs
      WHERE source = 'congress' AND status = 'ok'
      ORDER BY id DESC LIMIT 1`,
		).first<{ detail: string | null }>();

		let cosponsoredCount = 0;
		if (cosponsoredRow?.detail) {
			try {
				const detail = JSON.parse(cosponsoredRow.detail) as {
					cosponsoredTotals?: Record<string, number>;
				};
				cosponsoredCount = detail.cosponsoredTotals?.[slug] ?? 0;
			} catch {
				/* malformed detail — treat as none */
			}
		}

		const total = stats?.total ?? 0;
		const missed = stats?.missed ?? 0;
		const payload: TrackRecordPayload = {
			updatedAt: stats?.updated_at ?? null,
			stats: {
				totalVotes: total,
				missedVotes: missed,
				missedPct: total > 0 ? Math.round((missed / total) * 1000) / 10 : null,
				trackedSince: stats?.tracked_since ?? null,
			},
			votes: (votes.results ?? []).map((row) => ({
				voteId: row.vote_id,
				billNumber: row.bill_number,
				question: row.question,
				description: row.description,
				position: row.position,
				result: row.result,
				date: row.vote_date,
				url: row.url,
			})),
			bills: {
				sponsored: (sponsored.results ?? []).map((row) => ({
					number: row.number,
					title: row.title,
					latestAction: row.latest_action,
					latestActionDate: row.latest_action_date,
					url: row.url,
				})),
				cosponsoredCount,
			},
		};

		return json(payload);
	} catch (err) {
		console.warn('track record unavailable', err);
		return json(emptyPayload());
	}
};
