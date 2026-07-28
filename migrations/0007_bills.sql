CREATE TABLE IF NOT EXISTS bills (
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
);
