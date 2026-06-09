CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  legislator_slug TEXT NOT NULL,
  accessibility INTEGER NOT NULL,
  policy_alignment INTEGER NOT NULL,
  healthcare INTEGER NOT NULL,
  environment INTEGER NOT NULL,
  overall INTEGER NOT NULL,
  voter_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
