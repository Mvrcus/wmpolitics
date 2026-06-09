CREATE TABLE IF NOT EXISTS submissions (
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
);
