CREATE UNIQUE INDEX IF NOT EXISTS idx_voter_legislator ON votes(legislator_slug, voter_hash);
