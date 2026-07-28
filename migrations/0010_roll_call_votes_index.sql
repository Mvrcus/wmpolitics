CREATE INDEX IF NOT EXISTS idx_rcv_slug_date ON roll_call_votes(legislator_slug, vote_date DESC);
