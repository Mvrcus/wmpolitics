# Google Civic Information API integration

Researched and integrated July 2026. This replaces the hand-maintained ZIP →
representation guesswork (`src/data/zip-districts.json`) with street-address
district resolution, and adds election-season features (polling places, early
vote sites, drop boxes, ballot contests, election-official contacts).

## What the API can and can't do (as of mid-2026)

**Google turned down the Representatives API on April 30, 2025.** The API no
longer returns *who* represents an address — only *which political divisions*
(districts) contain it, plus election data. That drives the architecture:

| Endpoint | What it gives us | Used by |
| --- | --- | --- |
| `GET /civicinfo/v2/divisionsByAddress?address=` | OCD division IDs for an address (state, CD, state house/senate, county, city, school district, …) | `/api/civic/lookup` |
| `GET /civicinfo/v2/elections` | Elections Google currently has data for (id, name, date, division) | `/api/civic/elections` |
| `GET /civicinfo/v2/voterinfo?address=&electionId=` | During supported elections: polling place, early-vote sites, drop boxes, contests + candidates, election-administration contacts | `/api/civic/voterinfo` |
| ~~`representatives*`~~ | **Gone.** Officials stay in `src/content/legislators/` | — |

Auth is a plain API key (`GOOGLE_CIVIC_API_KEY`, server-side only). Free tier
is 25,000 queries/day per project — far above this site's traffic; no billing
account needed.

## Architecture

```
address ──▶ /api/civic/lookup ──▶ Google divisionsByAddress
                    │                     │
                    │            OCD division IDs
                    ▼                     ▼
        legislators collection ◀── SEAT_DIVISIONS map
        (seatSlug is the join key: src/lib/civic/divisions.ts)
```

- `src/lib/civic/client.ts` — typed fetch client + `CivicApiError`.
- `src/lib/civic/types.ts` — response shapes for the three live endpoints.
- `src/lib/civic/divisions.ts` — `SEAT_DIVISIONS`: seatSlug → OCD IDs.
  **When adding a legislator with a new seatSlug, add its OCD ID here** or
  address lookup won't surface the profile.
- `src/pages/api/civic/*.ts` — server routes (Cloudflare Workers, key from
  `locals.runtime.env`). Address-bearing responses are `private, no-store`;
  addresses are forwarded to Google and never logged or stored.
- `src/components/CivicLookup.astro` — the lookup UI, mounted on
  `/legislators/` and `/learn/elections/`.

## OCD ID reference for our seats

```
ocd-division/country:us/state:mi                      governor, both U.S. senators
ocd-division/country:us/state:mi/cd:4                 mi-us-house-04
ocd-division/country:us/state:mi/sldu:30|31           state senate 30/31
ocd-division/country:us/state:mi/sldl:85|86           state house 85/86
ocd-division/country:us/state:mi/county:ottawa        county-wide officers
ocd-division/country:us/state:mi/county:ottawa/council_district:1–4
                                                      county commissioners
ocd-division/country:us/state:mi/place:holland        mayor, city manager
```

Google doesn't always return county `council_district` divisions. When an
Ottawa County address comes back without one, `/api/civic/lookup` includes all
profiled commissioners flagged `approximate: true`, and the UI says the exact
district couldn't be confirmed for that street.

## What this supersedes

- `src/data/zip-districts.json` + the orphaned `WhoRepresentsMe.astro` /
  `ZipCommandCenter.astro` ZIP flow: 8 hand-mapped ZIPs, every one flagged
  "split" because ZIPs cross district lines. The address lookup has no such
  ambiguity. The files are left in place (nothing renders them); delete when
  ready.
- `src/data/civic-pins.json` clerk-office pins: during supported elections,
  `voterinfo` returns real polling places, early-vote sites, and drop boxes
  with addresses and hours.

Still static, deliberately: officeholder profiles (Google no longer provides
officials), the `election-seats.ts` "who runs when" cheat sheet (the API only
lists imminent elections, not full cycle calendars), and certified past
results in `vote-history.json` (the API has no historical results).

## Election-season behavior

Most of the year, `voterinfo` returns "Election unknown" — the UI shows a
quiet fallback linking to the [Michigan Voter Information Center](https://mvic.sos.state.mi.us/).
As a supported election approaches (typically ~2–4 weeks out, when states
publish feeds), polling places, ballots, and drop boxes appear automatically —
no deploy needed. Watch dates: Aug 4, 2026 primary; Nov 3, 2026 general.

## Verifying after deploy

1. `GET /api/civic/lookup?address=270 S River Ave, Holland, MI 49423` — expect
   Whitmer/Slotkin/Peters (statewide), Bill Huizenga (cd:4), Victory (sldu:31),
   DeBoer (sldl:86), Ottawa officers, Holland mayor + city manager. Notably
   **not** Mark Huizenga (sldu:30) — a good regression check for the SD-31 fix.
2. A Zeeland/Hudsonville address should swap in Slagh (sldl:85) and drop the
   Holland city seats.
3. A non-Michigan address should return only the outside-coverage note.
