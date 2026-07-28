import { ensureTrackRecordSchema, ensureVoteSchema, isDbBinding } from '../db';
import { TRACK_RECORD_ROSTER } from './roster';
import type { BillRow, RollCallRow, SyncResult } from './types';
import {
	RateLimitError,
	buildRollCallRow,
	congressForDate,
	fetchCosponsoredTotal,
	fetchHouseRollCallList,
	fetchMemberVotePosition,
	fetchSponsoredBills as fetchCongressSponsored,
} from './congress';
import {
	fetchSponsoredBills as fetchOpenstatesSponsored,
	resolvePersonId,
} from './openstates';

const THROTTLE_MS = 300;
/** Cap member-position lookups per run so backfill stays polite. */
const MAX_NEW_ROLLCALLS = 30;

type SyncDetail = {
	houseRollWatermarks?: Record<string, number>;
	cosponsoredTotals?: Record<string, number>;
	errors?: string[];
	note?: string;
};

async function upsertBill(db: D1Database, row: BillRow): Promise<void> {
	await db
		.prepare(
			`INSERT INTO bills (bill_id, legislator_slug, source, role, number, title, introduced_date, latest_action, latest_action_date, url, synced_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(bill_id, legislator_slug) DO UPDATE SET
        latest_action = excluded.latest_action,
        latest_action_date = excluded.latest_action_date,
        title = excluded.title,
        synced_at = excluded.synced_at`,
		)
		.bind(
			row.bill_id,
			row.legislator_slug,
			row.source,
			row.role,
			row.number,
			row.title,
			row.introduced_date,
			row.latest_action,
			row.latest_action_date,
			row.url,
		)
		.run();
}

async function upsertRollCall(db: D1Database, row: RollCallRow): Promise<void> {
	await db
		.prepare(
			`INSERT INTO roll_call_votes (vote_id, legislator_slug, source, chamber, bill_number, question, description, position, result, vote_date, url, synced_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(vote_id, legislator_slug) DO UPDATE SET
        result = excluded.result,
        synced_at = excluded.synced_at`,
		)
		.bind(
			row.vote_id,
			row.legislator_slug,
			row.source,
			row.chamber,
			row.bill_number,
			row.question,
			row.description,
			row.position,
			row.result,
			row.vote_date,
			row.url,
		)
		.run();
}

async function recordRun(
	db: D1Database,
	result: SyncResult,
	startedAt: string,
	detail: SyncDetail,
): Promise<void> {
	await db
		.prepare(
			`INSERT INTO sync_runs (source, status, items_upserted, detail, started_at)
      VALUES (?, ?, ?, ?, ?)`,
		)
		.bind(result.source, result.status, result.itemsUpserted, JSON.stringify(detail), startedAt)
		.run();
}

async function loadLastDetail(
	db: D1Database,
	source: string,
): Promise<SyncDetail> {
	try {
		const row = await db
			.prepare(
				`SELECT detail FROM sync_runs WHERE source = ? AND status = 'ok' ORDER BY id DESC LIMIT 1`,
			)
			.bind(source)
			.first<{ detail: string | null }>();
		return row?.detail ? (JSON.parse(row.detail) as SyncDetail) : {};
	} catch {
		return {};
	}
}

async function syncCongress(db: D1Database, apiKey: string, dryRun: boolean): Promise<SyncResult> {
	const startedAt = new Date().toISOString();
	const opts = { apiKey, throttleMs: THROTTLE_MS };
	const previous = await loadLastDetail(db, 'congress');
	const detail: SyncDetail = {
		houseRollWatermarks: { ...previous.houseRollWatermarks },
		cosponsoredTotals: { ...previous.cosponsoredTotals },
		errors: [],
	};
	let upserted = 0;

	const entries = TRACK_RECORD_ROSTER.filter((e) => e.source === 'congress' && e.bioguideId);
	try {
		for (const entry of entries) {
			const bioguideId = entry.bioguideId!;

			const sponsored = await fetchCongressSponsored(bioguideId, entry.slug, opts);
			if (!dryRun) {
				for (const row of sponsored) await upsertBill(db, row);
			}
			upserted += sponsored.length;

			detail.cosponsoredTotals![entry.slug] = await fetchCosponsoredTotal(bioguideId, opts);

			const { congress, session } = congressForDate();
			const sessionKey = `${congress}:${session}`;
			const watermark = detail.houseRollWatermarks![sessionKey] ?? 0;

			const rollCalls = await fetchHouseRollCallList(congress, session, opts);
			const fresh = rollCalls
				.filter((item) => item.rollCallNumber > watermark)
				.sort((a, b) => b.rollCallNumber - a.rollCallNumber)
				.slice(0, MAX_NEW_ROLLCALLS);

			let maxSynced = watermark;
			for (const item of fresh) {
				const position = await fetchMemberVotePosition(
					congress,
					session,
					item.rollCallNumber,
					bioguideId,
					opts,
				);
				const row = buildRollCallRow(item, position, entry.slug);
				if (row) {
					if (!dryRun) await upsertRollCall(db, row);
					upserted += 1;
				}
				maxSynced = Math.max(maxSynced, item.rollCallNumber);
			}
			detail.houseRollWatermarks![sessionKey] = maxSynced;
		}
	} catch (err) {
		const status = err instanceof RateLimitError ? 'rate-limited' : 'error';
		detail.errors!.push(String(err));
		const result: SyncResult = { source: 'congress', status, itemsUpserted: upserted };
		await recordRun(db, result, startedAt, detail);
		return result;
	}

	const result: SyncResult = {
		source: 'congress',
		status: dryRun ? 'dry-run' : 'ok',
		itemsUpserted: upserted,
	};
	await recordRun(db, result, startedAt, detail);
	return result;
}

async function syncOpenstates(
	db: D1Database,
	apiKey: string,
	dryRun: boolean,
): Promise<SyncResult> {
	const startedAt = new Date().toISOString();
	const opts = { apiKey, throttleMs: THROTTLE_MS };
	const detail: SyncDetail = { errors: [] };
	let upserted = 0;

	const entries = TRACK_RECORD_ROSTER.filter(
		(e) => e.source === 'openstates' && e.openstatesName,
	);
	try {
		for (const entry of entries) {
			const chamber = entry.chamber as 'mi-house' | 'mi-senate';
			const personId = await resolvePersonId(entry.openstatesName!, chamber, opts);
			if (!personId) {
				detail.errors!.push(`No OpenStates person match for ${entry.openstatesName}`);
				continue;
			}

			const sponsored = await fetchOpenstatesSponsored(personId, entry.slug, opts);
			if (!dryRun) {
				for (const row of sponsored) await upsertBill(db, row);
			}
			upserted += sponsored.length;
		}
	} catch (err) {
		const status = err instanceof RateLimitError ? 'rate-limited' : 'error';
		detail.errors!.push(String(err));
		const result: SyncResult = { source: 'openstates', status, itemsUpserted: upserted };
		await recordRun(db, result, startedAt, detail);
		return result;
	}

	const result: SyncResult = {
		source: 'openstates',
		status: dryRun ? 'dry-run' : 'ok',
		itemsUpserted: upserted,
	};
	await recordRun(db, result, startedAt, detail);
	return result;
}

export async function runTrackRecordSync(env: Env): Promise<SyncResult[]> {
	if (!isDbBinding(env.DB)) {
		return [{ source: 'congress', status: 'skipped', itemsUpserted: 0, detail: 'No DB binding' }];
	}

	await ensureVoteSchema(env.DB);
	await ensureTrackRecordSchema(env.DB);
	const dryRun = env.SYNC_DRY_RUN === 'true';
	const results: SyncResult[] = [];

	// Sources run independently so one failing doesn't block the other.
	if (env.CONGRESS_GOV_API_KEY) {
		results.push(await syncCongress(env.DB, env.CONGRESS_GOV_API_KEY, dryRun));
	} else {
		results.push({
			source: 'congress',
			status: 'skipped',
			itemsUpserted: 0,
			detail: 'CONGRESS_GOV_API_KEY not set',
		});
	}

	if (env.OPENSTATES_API_KEY) {
		results.push(await syncOpenstates(env.DB, env.OPENSTATES_API_KEY, dryRun));
	} else {
		results.push({
			source: 'openstates',
			status: 'skipped',
			itemsUpserted: 0,
			detail: 'OPENSTATES_API_KEY not set',
		});
	}

	console.log('track-record sync', JSON.stringify(results));
	return results;
}
