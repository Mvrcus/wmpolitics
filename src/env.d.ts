type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
	interface Locals extends Runtime {}
}

interface Env {
	ASSETS: Fetcher;
	DB: D1Database;
	TURNSTILE_SECRET_KEY?: string;
	TURNSTILE_SITE_KEY?: string;
	VOTE_HASH_SALT?: string;
	DEV_SKIP_TURNSTILE?: string;
	ADMIN_SECRET?: string;
	CONGRESS_GOV_API_KEY?: string;
	OPENSTATES_API_KEY?: string;
	SYNC_TRIGGER_TOKEN?: string;
	SYNC_DRY_RUN?: string;
}
