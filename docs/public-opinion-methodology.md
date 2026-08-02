# Public standing score — methodology

The home-page "Public" chip is a 0–100 standing score built **only from verifiable public
signals**. It is compiled by hand, with every input cited in the official's
`publicOpinion.sources` frontmatter, and is never auto-computed or estimated.

## Inputs, in order of preference

1. **Approval polling** (`basis: polling`) — used when a credible published poll from the
   last ~12 months measures the official's job approval with the relevant electorate
   (e.g. Morning Consult trackers, EPIC-MRA, Glengariff for statewide officials).

   `score = round(approve / (approve + disapprove) × 100)` — approval among respondents
   who expressed an opinion, averaged across recent credible polls when more than one
   exists. This keeps officials with high "no opinion" shares comparable.

2. **Most recent contested general election** (`basis: election`) — for offices nobody
   polls (mayor, county board, county row offices, state legislature), the official's
   vote share in their last *contested* general election is the only genuine measurement
   of public opinion available.

   `score = round(vote share %)`

3. **Blend** (`basis: blend`) — when both exist and both are recent, polling is weighted
   60% and the last contested election 40% (polling is more current; elections are
   higher-turnout). Noted in `detail`.

4. **Insufficient** (`basis: insufficient`, `score: null`) — appointed officials and
   officials whose last election was unopposed. An unopposed vote share is not public
   opinion, and no serious publication would print an approval number nobody measured.
   The chip shows "Public: no data".

## Confidence

- `high` — multiple corroborating sources; polling from a named, methodology-publishing
  pollster or certified election results.
- `medium` — a single credible source, or data older than ~18 months.
- `low` — the best available figure has known caveats (small samples, partial results).

Every number was independently fact-checked against a second source before publication
(researcher/verifier pairs; discrepancies over 2 points were re-resolved against
certified results).

## Freshness

`asOf` records the month the data was last checked. Polling-based scores should be
refreshed roughly quarterly; election-based scores after each relevant election.
