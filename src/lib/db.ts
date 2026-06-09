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
];

let schemaReady: Promise<void> | null = null;

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
