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

Legislator profiles include editorial scorecards, **Tar & Feather Score** community ratings (high = feathered by constituents, low = tarred by the town), and user-submitted concerns/highlights backed by Cloudflare D1.

1. Create a D1 database and set `database_id` in `wrangler.json`:
   ```bash
   npx wrangler d1 create wmpolitics-votes
   npx wrangler d1 execute wmpolitics-votes --file=./migrations/0001_votes.sql
   npx wrangler d1 execute wmpolitics-votes --file=./migrations/0002_votes_index.sql
   npx wrangler d1 execute wmpolitics-votes --file=./migrations/0003_submissions.sql
   npx wrangler d1 execute wmpolitics-votes --file=./migrations/0004_submission_votes.sql
   npx wrangler d1 execute wmpolitics-votes --file=./migrations/0005_submission_votes_index.sql
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

Submissions are stored with `status = 'pending'` and shown in **Unfiltered community** until you approve them in D1. Approved rows (`status = 'approved'`) appear in **Verified community**. The HTTP approve/reject routes are disabled; use Wrangler or the Cloudflare dashboard.

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

### Future API hook

Congress.gov and Michigan's legislature publish member data, but neither offers a lightweight drop-in for “current vs past by seat” without extra mapping work. When/if you add sync, keep `seatSlug` as the join key and write `status` from the API into these same frontmatter fields (or generate the Markdown at build time).

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
