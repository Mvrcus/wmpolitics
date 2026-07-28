// Seat-by-seat election cheat sheet for the Holland area (/learn/elections/).
// One entry per seat: who holds it, how long a term runs, when it's next on
// the ballot, and any term-limit rule. Grouped by level of government.

export interface Seat {
	seat: string;
	official: string;
	/** Party letter shown as a stamp next to the name; omit for non-partisan or appointed roles. */
	party?: 'R' | 'D';
	/** Site profile slug, when the officeholder has one (links to /legislators/<slug>/). */
	slug?: string;
	term: string;
	nextElection: string;
	termLimits: string;
	/** Extra context worth a line under the seat name. */
	note?: string;
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
				term: '2 years',
				nextElection: 'Nov 2026',
				termLimits: 'None',
				note: 'On the ballot every even year.',
			},
			{
				seat: 'U.S. Senate — senior seat',
				official: 'Gary Peters',
				party: 'D',
				term: '6 years',
				nextElection: 'Nov 2026',
				termLimits: 'None',
				note: 'Class 2 seat.',
			},
			{
				seat: 'U.S. Senate — junior seat',
				official: 'Elissa Slotkin',
				party: 'D',
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
				term: '4 years',
				nextElection: 'Nov 2026',
				termLimits: '2 terms (8 years)',
				note: 'Term-limited — Nov 2026 elects a new governor.',
			},
			{
				seat: 'State House — District 86 (Holland City / Park Twp)',
				official: 'Nancy DeBoer',
				party: 'R',
				slug: 'nancy-deboer',
				term: '2 years',
				nextElection: 'Nov 2026',
				termLimits: '12 years total in the Legislature',
				note: 'On the ballot every even year.',
			},
			{
				seat: 'State House — District 85 (Holland Twp / Zeeland)',
				official: 'Bradley Slagh',
				party: 'R',
				term: '2 years',
				nextElection: 'Nov 2026',
				termLimits: '12 years total in the Legislature',
				note: 'On the ballot every even year.',
			},
			{
				seat: 'State Senate — District 31 (Ottawa County)',
				official: 'Roger Victory',
				party: 'R',
				term: '4 years',
				nextElection: 'Nov 2026',
				termLimits: '12 years total in the Legislature',
				note: 'Runs in the same years as the governor.',
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
				term: '4 years',
				nextElection: 'Nov 2028',
				termLimits: 'None',
			},
			{
				seat: 'Prosecuting Attorney',
				official: 'Sarah F. Matwiejczyk',
				party: 'R',
				term: '4 years',
				nextElection: 'Nov 2028',
				termLimits: 'None',
			},
			{
				seat: 'County Clerk / Register of Deeds',
				official: 'Justin F. Roebuck',
				party: 'R',
				term: '4 years',
				nextElection: 'Nov 2028',
				termLimits: 'None',
			},
			{
				seat: 'County Treasurer',
				official: 'Cheryl Clark',
				party: 'R',
				term: '4 years',
				nextElection: 'Nov 2028',
				termLimits: 'None',
			},
			{
				seat: 'County Commission — District 1',
				official: 'Jim Barry',
				party: 'R',
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
