CREATE TABLE IF NOT EXISTS roll_call_votes (
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
);
