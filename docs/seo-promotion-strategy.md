# SEO & promotion strategy — election pages

_Written Aug 2, 2026. The Aug 4 primary is in 2 days — the ordering below is by urgency._

## The one-sentence strategy

Own the searches your neighbors actually type — "who's running in 2026", "when is the
next election in Holland MI", "[candidate name]" — convert that traffic into ballot-reminder
subscribers, and let the election calendar itself bring people back.

---

## 1. Google Search Console (you're setting this up)

1. **Verify the domain** at [search.google.com/search-console](https://search.google.com/search-console).
   Use the *Domain* property type with the DNS TXT record (Cloudflare makes this a 2-minute
   add). That covers www/non-www and http/https in one property.
2. **Submit the sitemap**: `https://wmpolitics.com/sitemap-index.xml` (already generated and
   referenced in `robots.txt`).
3. **Request indexing manually** for the money pages — don't wait for the crawl:
   `/elections/2026/`, `/learn/elections/`, and the six candidate pages with photos.
   URL Inspection → Request indexing. Do this the day the PR ships.
4. **What to watch weekly** (Performance tab): queries containing `holland`, `ottawa`,
   `election`, `2026`, and every candidate name. Two things to act on:
   - Queries with impressions but position > 10 → that page needs more internal links or
     content depth for that phrase.
   - Queries we rank for but never wrote for → write that page.
5. **Enhancements tab**: confirm the FAQ (cheat sheet) and Event (2026 ballot) structured
   data get picked up. Rich results = more SERP real estate for free.

## 2. Next 48 hours (before the Aug 4 primary)

Search interest in "who's running / what's on my ballot" peaks the 72 hours before an
election. Zero-cost moves, highest leverage first:

- **Post the 2026 ballot page** in Holland-area Facebook groups (Holland Informed,
  Ottawa County community groups) and on Nextdoor, framed as a public service, not a site
  plug: *"Tuesday is the primary. Here's every race on the Holland-area ballot and who's
  running — no paywall, no party spin."* Non-partisan framing is what makes moderators
  leave it up.
- **Reddit**: r/grandrapids and r/Michigan allow local voter-info posts; same framing.
  Post the cheat sheet, not the homepage.
- **Email anyone already on the list** with the ballot link (this also makes good on the
  "one email before each election" promise the new signup block makes — see §5).
- **Tell the candidates.** Every candidate has a profile now. Email each campaign a link to
  their page with a one-line correction offer. Campaigns link scarce nonpartisan coverage
  from their own sites and socials — those are exactly the local backlinks Google weighs, and
  it seeds name-search traffic to pages we already rank #1-eligible for (nobody else has a
  page for Keagan Host or Kevin Maas).

## 3. Aug 4–7: the results window

"Who won" searches dwarf "who's running" searches. The site is positioned to catch them
only if it moves fast:

- **Primary night / next morning**: mark winners on `/elections/2026/` (the seat data makes
  this a small edit), update `raceNote`s ("Advances to November: …"), and note eliminated
  candidates on their profiles rather than deleting them — those pages keep collecting
  name searches.
- The ballot-reminder block already flips its countdown to "results are in — matchups set"
  automatically after Aug 4.
- Post the updated page back to the same groups: *"Results are in — here's who's on your
  November ballot."* Second touch, same audience, new reason to click.

## 4. Ongoing promotion (through Nov 3)

- **Local orgs**: League of Women Voters (Holland-area chapter), Herrick District Library,
  Hope College civic engagement office — all maintain voter-resource link lists and are the
  most natural backlinks a nonpartisan site can get. One short email each: who we are, no
  ads, no endorsements, here's the ballot page.
- **Local media**: Holland Sentinel / WGVU / WOOD reporters covering the SD-31 open seat
  or the Huizenga primary may cite a clean candidate-tracker. Offer it as a source, not a
  story.
- **Candidate debates/forums**: whoever hosts them (chambers, LWV) needs a "meet the
  candidates" link — we have the only complete one for these races.
- **City clerk / county clerk offices** sometimes link nonpartisan voter resources.
  Worth one polite ask.

## 5. The retention loop (what's now built, and what it commits us to)

What ships with this PR, and the psychology each piece uses — all honest, no dark patterns:

| Piece | Mechanism |
|---|---|
| Live countdown on the ballot-reminder block ("2 days away", "TODAY") | Urgency that's real, refreshed on every visit |
| "1 in 5 neighbors decide for you" turnout framing | Loss aversion — abstention has a cost, someone else picks |
| "One short email before each election. No daily noise, no fundraising asks, unsubscribe anytime." | A narrow, concrete promise lowers signup cost; the explicit exit builds trust |
| "This page keeps moving — candidates drop out, winners get marked. Worth a bookmark." | Open loop / Zeigarnik: unresolved races are a reason to return |
| Post-primary countdown copy flips to the general automatically | The calendar itself re-engages: every visit shows a new deadline |
| Seat anchors + heavy cross-linking (profile ↔ race ↔ candidate) | Each visit surfaces 2–3 adjacent things worth a click — session depth without clickbait |

**The commitment**: the signup block promises one email before each election. That means an
email must actually go out ~Aug 3 (already late — send on ship day) and ~Nov 1, built from
the subscriber table (`/api/subscribe` stores email + ZIP + signup source). Breaking this
promise once burns the list. The ZIP field also enables a future "your exact ballot" email —
the strongest retention upgrade available, since it converts a generic newsletter into a
personal utility.

## 6. Keyword map (what each page is for)

| Page | Target queries |
|---|---|
| `/elections/2026/` | who is running 2026 michigan · ottawa county 2026 ballot · holland mi primary august 2026 · michigan governor race 2026 candidates |
| `/learn/elections/` | when is the next election in holland michigan · michigan term limits · ottawa county sheriff election · how long is a state senate term |
| Candidate pages | every candidate name (near-zero competition for the local ones) · "[name] michigan" |
| Officeholder profiles | "[name]" · "who is my state rep holland" (already served by the ZIP lookup) |

Future content that wins searches with no local competition: "how to vote absentee in
Ottawa County", "what's a precinct delegate", per-city polling place explainers.

## 7. What NOT to do

- No engagement-bait or manufactured controversy — the site's whole differentiator is
  being the calm one. It's also what makes moderators and librarians link to it.
- No fake subscriber counts, fake scarcity, or exit-intent popups. One well-argued inline
  block converts better long-term than interruptions, and doesn't spend trust.
- Don't buy ads before organic is measured; local search for these queries is winnable
  for free.
