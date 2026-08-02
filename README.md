# Astro Starter Kit: Blog

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/astro-blog-starter-template)

![Astro Template Preview](https://github.com/withastro/astro/assets/2244813/ff10799f-a816-4703-b967-c78997e8323d)

<!-- dash-content-start -->

Create a blog with Astro and deploy it on Cloudflare Workers as a [static website](https://developers.cloudflare.com/workers/static-assets/).

Features:

- ✅ Minimal styling (make it your own!)
- ✅ 100/100 Lighthouse performance
- ✅ SEO-friendly with canonical URLs and OpenGraph data
- ✅ Sitemap support
- ✅ RSS Feed support
- ✅ Markdown & MDX support
- ✅ Built-in Observability logging

<!-- dash-content-end -->

## Getting Started

Outside of this repo, you can start a new project with this template using [C3](https://developers.cloudflare.com/pages/get-started/c3/) (the `create-cloudflare` CLI):

```bash
npm create cloudflare@latest -- --template=cloudflare/templates/astro-blog-starter-template
```

A live public deployment of this template is available at [https://astro-blog-starter-template.templates.workers.dev](https://astro-blog-starter-template.templates.workers.dev)

## 🚀 Project Structure

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

The `src/content/` directory contains "collections" of related Markdown and MDX documents. Use `getCollection()` to retrieve posts from `src/content/blog/`, and type-check your frontmatter using an optional schema. See [Astro's Content Collections docs](https://docs.astro.build/en/guides/content-collections/) to learn more.

Any static assets, like images, can be placed in the `public/` directory.

## Community voting & submissions (D1 + Turnstile)

Legislator profiles include editorial scorecards, **Constituent Pulse** community ratings (how well is this officeholder serving constituents), and user-submitted concerns/highlights backed by Cloudflare D1.

1. Create a D1 database and set `database_id` in `wrangler.json`, then apply every file in `migrations/` in order:
   ```bash
   npx wrangler d1 create wmpolitics-votes
   for f in migrations/*.sql; do npx wrangler d1 execute wmpolitics-votes --file="$f"; done
   ```
   (Each migration file must contain a single SQL statement; add `--local` for the dev database.)
2. Copy `.dev.vars.example` → `.dev.vars` and `.env.example` → `.env` for local dev.
3. Set production secrets:
   - `TURNSTILE_SECRET_KEY` — Cloudflare Turnstile secret (use test keys only in dev)
   - `VOTE_HASH_SALT` — random string for voter/submitter fingerprint hashing
   - `PUBLIC_TURNSTILE_SITE_KEY` — public site key (build-time / `.env`)
4. Optional: `DEV_SKIP_TURNSTILE=true` to bypass Turnstile in local API testing.

Test Turnstile keys (always pass): site `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`.

### Manual moderation (community submissions)

Submissions are stored with `status = 'pending'` and are **not shown publicly** until approved. Only rows with `status = 'approved'` appear on profiles (as "Community submissions — Reviewed"). The HTTP approve/reject routes are disabled; use Wrangler or the Cloudflare dashboard.

List pending submissions:

```bash
npx wrangler d1 execute wmpolitics-votes --command "SELECT id, legislator_slug, submission_type, title, status, created_at FROM submissions WHERE status = 'pending' ORDER BY created_at DESC"
```

Approve one submission (replace `N` with the row id):

```bash
npx wrangler d1 execute wmpolitics-votes --command "UPDATE submissions SET status = 'approved' WHERE id = N"
```

Reject or hide a submission:

```bash
npx wrangler d1 execute wmpolitics-votes --command "UPDATE submissions SET status = 'rejected' WHERE id = N"
```

Add `--local` to target the dev database. After updating status, refresh the legislator profile to see the change.

## Legislator profiles (current vs past)

Officeholders are managed as Markdown files in `src/content/legislators/`. **Current vs past** is set manually in frontmatter — there is no live API sync yet.

### Frontmatter fields

| Field | Required | Notes |
| :---- | :------- | :---- |
| `status` | No (defaults to `current`) | `current` or `past` |
| `seatSlug` | Yes | Stable id shared by everyone who held the same seat (e.g. `mi-state-house-86`) |
| `seatLabel` | No | Short label for seat history sections |
| `termStart` / `termEnd` | No | Display-only years on cards and profile headers |

### Adding a past officeholder

1. Copy an existing profile or use `example-past-hd86.md` as a template.
2. Set `status: past`, the same `seatSlug` as the current holder, and optional term years.
3. Rebuild — the past index is at `/legislators/past/` and current profiles link to previous holders automatically.

## Track-record sync (Congress.gov + OpenStates)

Profiles for legislators listed in `src/lib/track-record/roster.ts` get a **Track record** section: official roll-call votes, sponsored bills, and missed-vote %, synced weekly into D1 by a Cloudflare cron trigger (`0 11 * * 1`, Monday morning ET) and served from `/api/track-record/<slug>`. Legislators without an API feed (county board, mayor) get an honest empty state.

Setup:

1. Get free API keys: [Congress.gov](https://api.congress.gov/sign-up/) and [OpenStates](https://openstates.org/accounts/profile/).
2. Apply migrations `0007`–`0011` (covered by the loop above) — or rely on the runtime `ensureTrackRecordSchema` bootstrap in dev.
3. Set secrets: `wrangler secret put CONGRESS_GOV_API_KEY`, `OPENSTATES_API_KEY`, and `SYNC_TRIGGER_TOKEN` (any long random string, guards the manual trigger).
4. Deploy, then backfill manually:
   ```bash
   curl -X POST https://wmpolitics.com/api/admin/sync \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $SYNC_TRIGGER_TOKEN" -d '{}'
   ```
   (The `Content-Type: application/json` header is required — Astro's CSRF check rejects form-typed cross-site POSTs.)
5. Local test: fill keys in `.dev.vars`, set `SYNC_DRY_RUN=true`, then
   ```bash
   npm run build && npx wrangler dev --test-scheduled
   curl "http://127.0.0.1:8787/__scheduled?cron=0+11+*+*+1"
   npx wrangler d1 execute wmpolitics-votes --local --command "SELECT source, status, items_upserted FROM sync_runs ORDER BY id DESC LIMIT 5"
   ```
   Set `SYNC_DRY_RUN=false` (or remove it) to write rows for real. Sync runs are audited in the `sync_runs` table; each run is idempotent (upserts) and stops politely on HTTP 429.

Editorial **key votes**: add a `keyVotes` list to a legislator's frontmatter (`voteId` matching a synced `roll_call_votes.vote_id`, plus `title` and `note`) to pin framed votes above the raw feed. The mapping of profile slugs to bioguide / OpenStates identities lives in `src/lib/track-record/roster.ts` — when a new state legislator is profiled, add one roster line; state members are resolved by name at sync time, so no UUID copying.

### Current vs past

When extending the sync to seat history, keep `seatSlug` as the join key and write `status` from the API into the same frontmatter fields (or generate the Markdown at build time).

## Address lookup & voter info (Google Civic Information API)

`/legislators/` and `/learn/elections/` include a street-address lookup that resolves a visitor's exact districts (not a ZIP approximation) and, during supported elections, their polling place, early-vote sites, drop boxes, and ballot. Full design notes: [docs/google-civic-api.md](docs/google-civic-api.md).

Google's Representatives API was turned down in April 2025, so officials still come from `src/content/legislators/` — the Civic API only maps an address to OCD division IDs, which `src/lib/civic/divisions.ts` joins to `seatSlug`. **When profiling a legislator with a new seatSlug, add its OCD ID to `SEAT_DIVISIONS`.**

Setup:

1. In the [Google Cloud Console](https://console.cloud.google.com/), create a project, enable **Google Civic Information API**, and create an API key (free, 25,000 queries/day).
2. Local: set `GOOGLE_CIVIC_API_KEY` in `.dev.vars`. Production: `wrangler secret put GOOGLE_CIVIC_API_KEY`.
3. Without the key, the site still builds and the lookup shows a "not configured" fallback.

Server routes (all keep the key server-side; address-bearing responses are `private, no-store` and addresses are never stored):

- `GET /api/civic/lookup?address=...` — profiled officials for an address.
- `GET /api/civic/elections` — upcoming Michigan/national elections in Google's feed.
- `GET /api/civic/voterinfo?address=...` — polling place, ballot, and election officials; `{ available: false }` outside supported election windows.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                           | Action                                           |
| :-------------------------------- | :----------------------------------------------- |
| `npm install`                     | Installs dependencies                            |
| `npm run dev`                     | Starts local dev server at `localhost:4321`      |
| `npm run build`                   | Build your production site to `./dist/`          |
| `npm run preview`                 | Preview your build locally, before deploying     |
| `npm run astro ...`               | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help`         | Get help using the Astro CLI                     |
| `npm run build && npm run deploy` | Deploy your production site to Cloudflare        |
| `npm wrangler tail`               | View real-time logs for all Workers              |

## 👀 Want to learn more?

Check out [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Credit

This theme is based off of the lovely [Bear Blog](https://github.com/HermanMartinus/bearblog/).
