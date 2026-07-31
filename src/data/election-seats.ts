// Seat-by-seat election cheat sheet for the Holland area (/learn/elections/).
// One entry per seat: who holds it, how long a term runs, when it's next on
// the ballot, and any term-limit rule. Grouped by level of government.
// Candidate lists reflect the Aug 4, 2026 primary field (verified July 2026).

export interface Candidate {
	name: string;
	/** Party letter; omit for non-partisan races. */
	party?: 'R' | 'D' | 'I';
	/** True when this candidate currently holds the seat. */
	incumbent?: boolean;
	/** One-line context: who they are, endorsements, campaign status. */
	note?: string;
}

export interface Seat {
	seat: string;
	official: string;
	/** Party letter shown as a stamp next to the name; omit for non-partisan or appointed roles. */
	party?: 'R' | 'D';
	/** Site profile slug, when the officeholder has one (links to /legislators/<slug>/). */
	slug?: string;
	/** Matches `seatSlug` in legislator frontmatter — joins this seat to officeholder profiles. */
	seatSlug?: string;
	term: string;
	nextElection: string;
	termLimits: string;
	/** Extra context worth a line under the seat name. */
	note?: string;
	/** One-line framing of the next race (open seat, term limits, matchup already set). */
	raceNote?: string;
	/** Declared candidates for the next election, once the field is known. */
	candidates?: Candidate[];
}

export interface Level {
	id: string;
	label: string;
	place: string;
	seats: Seat[];
	/** The "one thing to remember" about how this level's elections work. */
	cycleNote: string;
}

export const LEVELS: Level[] = [
	{
		id: 'federal',
		label: 'Federal',
		place: 'Washington, D.C.',
		seats: [
			{
				seat: 'U.S. House — 4th District',
				official: 'Bill Huizenga',
				party: 'R',
				slug: 'bill-huizenga',
				seatSlug: 'mi-us-house-04',
				term: '2 years',
				nextElection: 'Nov 2026',
				termLimits: 'None',
				note: 'On the ballot every even year.',
				raceNote: 'Huizenga faces a primary challenge from a former Holland mayor.',
				candidates: [
					{ name: 'Bill Huizenga', party: 'R', incumbent: true, note: 'Seeking a 9th term.' },
					{ name: 'Phil Tanis', party: 'R', note: 'Former Holland mayor.' },
					{ name: 'Sean McCann', party: 'D', note: 'Term-limited state senator from Kalamazoo; endorsed by Gov. Whitmer.' },
					{ name: 'Richard Aaron', party: 'D' },
					{ name: 'Diop Harris', party: 'D' },
				],
			},
			{
				seat: 'U.S. Senate — senior seat',
				official: 'Gary Peters',
				party: 'D',
				slug: 'gary-peters',
				seatSlug: 'mi-us-senate-class-2',
				term: '6 years',
				nextElection: 'Nov 2026',
				termLimits: 'None',
				note: 'Class 2 seat.',
				raceNote: 'Open seat — Peters is retiring.',
				candidates: [
					{ name: 'Haley Stevens', party: 'D', note: 'U.S. representative from Oakland County.' },
					{ name: 'Abdul El-Sayed', party: 'D', note: 'Physician, former Wayne County health director.' },
					{ name: 'Mike Rogers', party: 'R', note: 'Former U.S. representative; unopposed in the primary.' },
				],
			},
			{
				seat: 'U.S. Senate — junior seat',
				official: 'Elissa Slotkin',
				party: 'D',
				slug: 'elissa-slotkin',
				seatSlug: 'mi-us-senate-class-1',
				term: '6 years',
				nextElection: 'Nov 2030',
				termLimits: 'None',
				note: 'Class 1 seat.',
			},
		],
		cycleNote:
			'Senate terms are staggered on purpose: Michigan’s two seats are never up for election in the same year, so the state never risks replacing both senators at once.',
	},
	{
		id: 'state',
		label: 'State',
		place: 'Lansing, MI',
		seats: [
			{
				seat: 'Governor',
				official: 'Gretchen Whitmer',
				party: 'D',
				slug: 'gretchen-whitmer',
				seatSlug: 'mi-governor',
				term: '4 years',
				nextElection: 'Nov 2026',
				termLimits: '2 terms (8 years)',
				note: 'Term-limited — Nov 2026 elects a new governor.',
				raceNote: 'Open seat — Whitmer is term-limited.',
				candidates: [
					{ name: 'Jocelyn Benson', party: 'D', note: 'Michigan Secretary of State.' },
					{ name: 'Chris Swanson', party: 'D', note: 'Genesee County sheriff.' },
					{ name: 'John James', party: 'R', note: 'U.S. representative; endorsed by President Trump.' },
					{ name: 'Perry Johnson', party: 'R', note: 'Businessman.' },
				],
			},
			{
				seat: 'State House — District 86 (Holland City / Park Twp)',
				official: 'Nancy DeBoer',
				party: 'R',
				slug: 'nancy-deboer',
				seatSlug: 'mi-state-house-86',
				term: '2 years',
				nextElection: 'Nov 2026',
				termLimits: '12 years total in the Legislature',
				note: 'On the ballot every even year.',
				raceNote: 'Both candidates are unopposed in the primary — the November matchup is set.',
				candidates: [
					{ name: 'Nancy DeBoer', party: 'R', incumbent: true, note: 'Seeking a 3rd term.' },
					{ name: 'Joseph McClusky', party: 'D', note: 'Managed the 2022 campaign against DeBoer.' },
				],
			},
			{
				seat: 'State House — District 85 (Holland Twp / Zeeland)',
				official: 'Bradley Slagh',
				party: 'R',
				slug: 'bradley-slagh',
				seatSlug: 'mi-state-house-85',
				term: '2 years',
				nextElection: 'Nov 2026',
				termLimits: '12 years total in the Legislature',
				note: 'On the ballot every even year.',
				candidates: [
					{ name: 'Bradley Slagh', party: 'R', incumbent: true, note: 'Seeking a 4th term; no confirmed November challenger yet.' },
				],
			},
			{
				seat: 'State Senate — District 31 (Ottawa County)',
				official: 'Roger Victory',
				party: 'R',
				slug: 'roger-victory',
				seatSlug: 'mi-state-senate-31',
				term: '4 years',
				nextElection: 'Nov 2026',
				termLimits: '12 years total in the Legislature',
				note: 'Runs in the same years as the governor.',
				raceNote: 'Open seat — Victory is term-limited.',
				candidates: [
					{ name: 'Kevin Maas', party: 'R' },
					{ name: 'Michael Markey Jr.', party: 'R' },
					{ name: 'John Wetzel', party: 'R' },
					{ name: 'Chris Kleinjans', party: 'D' },
					{ name: 'Keagan Host', party: 'D' },
				],
			},
		],
		cycleNote:
			'Under Michigan’s Proposal 1 (2022), lawmakers can serve a combined maximum of 12 years in the Legislature — split however they like between the State House and State Senate.',
	},
	{
		id: 'county',
		label: 'County',
		place: 'Ottawa County',
		seats: [
			{
				seat: 'Sheriff',
				official: 'Eric DeBoer',
				party: 'R',
				slug: 'eric-deboer',
				seatSlug: 'ottawa-county-sheriff',
				term: '4 years',
				nextElection: 'Nov 2028',
				termLimits: 'None',
			},
			{
				seat: 'Prosecuting Attorney',
				official: 'Sarah F. Matwiejczyk',
				party: 'R',
				slug: 'sarah-matwiejczyk',
				seatSlug: 'ottawa-county-prosecutor',
				term: '4 years',
				nextElection: 'Nov 2028',
				termLimits: 'None',
			},
			{
				seat: 'County Clerk / Register of Deeds',
				official: 'Justin F. Roebuck',
				party: 'R',
				slug: 'justin-roebuck',
				seatSlug: 'ottawa-county-clerk',
				term: '4 years',
				nextElection: 'Nov 2028',
				termLimits: 'None',
			},
			{
				seat: 'County Treasurer',
				official: 'Cheryl Clark',
				party: 'R',
				slug: 'cheryl-clark',
				seatSlug: 'ottawa-county-treasurer',
				term: '4 years',
				nextElection: 'Nov 2028',
				termLimits: 'None',
			},
			{
				seat: 'County Commission — District 1',
				official: 'Jim Barry',
				party: 'R',
				slug: 'jim-barry',
				seatSlug: 'ottawa-county-district-1',
				term: '4 years',
				nextElection: 'Nov 2028',
				termLimits: 'None',
				note: 'Holland-area district.',
			},
			{
				seat: 'County Commission — District 2',
				official: 'Jordan Jorritsma',
				party: 'R',
				slug: 'jordan-jorritsma',
				seatSlug: 'ottawa-county-district-2',
				term: '4 years',
				nextElection: 'Nov 2028',
				termLimits: 'None',
				note: 'Holland-area district.',
			},
			{
				seat: 'County Commission — District 3',
				official: 'Doug Zylstra',
				party: 'D',
				slug: 'doug-zylstra',
				seatSlug: 'ottawa-county-district-3',
				term: '4 years',
				nextElection: 'Nov 2028',
				termLimits: 'None',
				note: 'Holland-area district.',
			},
			{
				seat: 'County Commission — District 4',
				official: 'Jacob Bonnema',
				party: 'R',
				slug: 'jacob-bonnema',
				seatSlug: 'ottawa-county-district-4',
				term: '4 years',
				nextElection: 'Nov 2028',
				termLimits: 'None',
				note: 'Holland-area district.',
			},
		],
		cycleNote:
			'Most key Ottawa County offices run on 4-year cycles aligned with presidential election years — so the county ballot is longest in years like 2028.',
	},
	{
		id: 'city',
		label: 'City',
		place: 'City of Holland',
		seats: [
			{
				seat: 'Mayor',
				official: 'Nathan Bocks',
				slug: 'nathan-bocks',
				seatSlug: 'holland-mayor',
				term: '2 years',
				nextElection: 'Nov 2027',
				termLimits: 'None',
				note: 'Elected in odd-numbered years.',
			},
			{
				seat: 'City Council',
				official: '6 ward + 2 at-large members',
				term: '4 years',
				nextElection: 'Nov 2027 / Nov 2029',
				termLimits: 'None',
				note: 'Terms are staggered across odd years.',
			},
			{
				seat: 'City Manager',
				official: 'Keith Van Beek',
				slug: 'keith-van-beek',
				seatSlug: 'holland-city-manager',
				term: 'Appointed',
				nextElection: '—',
				termLimits: '—',
				note: 'Hired (and fired) by the City Council, not by voters.',
			},
		],
		cycleNote:
			'Holland city elections are non-partisan: candidates appear on the ballot without an R or D next to their name.',
	},
];
