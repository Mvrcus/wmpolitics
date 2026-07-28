const SCHEMA_STATEMENTS = [
	`CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  legislator_slug TEXT NOT NULL,
  accessibility INTEGER NOT NULL,
  policy_alignment INTEGER NOT NULL,
  healthcare INTEGER NOT NULL,
  environment INTEGER NOT NULL,
  overall INTEGER NOT NULL,
  voter_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`,
	`CREATE UNIQUE INDEX IF NOT EXISTS idx_voter_legislator ON votes(legislator_slug, voter_hash)`,
	`CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  legislator_slug TEXT NOT NULL,
  submission_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  submitter_hash TEXT NOT NULL,
  agree_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`,
	`CREATE TABLE IF NOT EXISTS submission_votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id INTEGER NOT NULL,
  voter_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`,
	`CREATE UNIQUE INDEX IF NOT EXISTS idx_submission_voter ON submission_votes(submission_id, voter_hash)`,
	`CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  zip TEXT,
  source TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`,
];

const TRACK_RECORD_STATEMENTS = [
	`CREATE TABLE IF NOT EXISTS bills (
  bill_id TEXT NOT NULL,
  legislator_slug TEXT NOT NULL,
  source TEXT NOT NULL,
  role TEXT NOT NULL,
  number TEXT NOT NULL,
  title TEXT NOT NULL,
  introduced_date TEXT,
  latest_action TEXT,
  latest_action_date TEXT,
  url TEXT NOT NULL,
  synced_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (bill_id, legislator_slug)
)`,
	`CREATE INDEX IF NOT EXISTS idx_bills_slug_date ON bills(legislator_slug, latest_action_date DESC)`,
	`CREATE TABLE IF NOT EXISTS roll_call_votes (
  vote_id TEXT NOT NULL,
  legislator_slug TEXT NOT NULL,
  source TEXT NOT NULL,
  chamber TEXT NOT NULL,
  bill_number TEXT,
  question TEXT NOT NULL,
  description TEXT,
  position TEXT NOT NULL,
  result TEXT,
  vote_date TEXT NOT NULL,
  url TEXT NOT NULL,
  synced_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (vote_id, legislator_slug)
)`,
	`CREATE INDEX IF NOT EXISTS idx_rcv_slug_date ON roll_call_votes(legislator_slug, vote_date DESC)`,
	`CREATE TABLE IF NOT EXISTS sync_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  items_upserted INTEGER NOT NULL DEFAULT 0,
  detail TEXT,
  started_at TEXT NOT NULL,
  finished_at TEXT NOT NULL DEFAULT (datetime('now'))
)`,
];

let schemaReady: Promise<void> | null = null;
let trackRecordSchemaReady: Promise<void> | null = null;

export function isDbBinding(db: unknown): db is D1Database {
	return (
		typeof db === 'object' &&
		db !== null &&
		'prepare' in db &&
		typeof (db as D1Database).prepare === 'function'
	);
}

export async function ensureVoteSchema(db: D1Database): Promise<void> {
	if (!schemaReady) {
		const init = async () => {
			for (const sql of SCHEMA_STATEMENTS) {
				await db.prepare(sql).run();
			}
		};
		schemaReady = init().catch((err) => {
			schemaReady = null;
			throw err;
		});
	}
	await schemaReady;
}

export async function ensureTrackRecordSchema(db: D1Database): Promise<void> {
	if (!trackRecordSchemaReady) {
		const init = async () => {
			for (const sql of TRACK_RECORD_STATEMENTS) {
				await db.prepare(sql).run();
			}
		};
		trackRecordSchemaReady = init().catch((err) => {
			trackRecordSchemaReady = null;
			throw err;
		});
	}
	await trackRecordSchemaReady;
}
