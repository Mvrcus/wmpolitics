CREATE UNIQUE INDEX IF NOT EXISTS idx_submission_voter ON submission_votes(submission_id, voter_hash);
