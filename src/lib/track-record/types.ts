export type TrackRecordSource = 'congress' | 'openstates';

export type BillRow = {
	bill_id: string;
	legislator_slug: string;
	source: TrackRecordSource;
	role: 'sponsor' | 'cosponsor';
	number: string;
	title: string;
	introduced_date: string | null;
	latest_action: string | null;
	latest_action_date: string | null;
	url: string;
};

export type RollCallRow = {
	vote_id: string;
	legislator_slug: string;
	source: TrackRecordSource;
	chamber: 'us-house' | 'mi-house' | 'mi-senate';
	bill_number: string | null;
	question: string;
	description: string | null;
	position: 'yea' | 'nay' | 'present' | 'not-voting';
	result: string | null;
	vote_date: string;
	url: string;
};

export type SyncResult = {
	source: TrackRecordSource;
	status: 'ok' | 'error' | 'rate-limited' | 'dry-run' | 'skipped';
	itemsUpserted: number;
	detail?: string;
};

export type TrackRecordPayload = {
	updatedAt: string | null;
	stats: {
		totalVotes: number;
		missedVotes: number;
		missedPct: number | null;
		trackedSince: string | null;
	};
	votes: Array<{
		voteId: string;
		billNumber: string | null;
		question: string;
		description: string | null;
		position: string;
		result: string | null;
		date: string;
		url: string;
	}>;
	bills: {
		sponsored: Array<{
			number: string;
			title: string;
			latestAction: string | null;
			latestActionDate: string | null;
			url: string;
		}>;
		cosponsoredCount: number;
	};
};
