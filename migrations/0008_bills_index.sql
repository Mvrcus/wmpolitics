CREATE INDEX IF NOT EXISTS idx_bills_slug_date ON bills(legislator_slug, latest_action_date DESC);
