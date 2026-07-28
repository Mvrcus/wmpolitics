// Flashcard decks for the "Start Here" learning game (/learn/flashcards/).
// Front = prompt shown first; back = the answer; hook = optional "why you care" line.

export interface Flashcard {
	front: string;
	back: string;
	hook?: string;
}

export interface Deck {
	id: string;
	label: string;
	blurb: string;
	cards: Flashcard[];
}

export const DECKS: Deck[] = [
	{
		id: 'terms',
		label: 'The words',
		blurb: 'The vocabulary you keep seeing in headlines, decoded into plain English.',
		cards: [
			{
				front: 'Legislator',
				back: 'A person you and your neighbors hire — by voting — to write, debate, and vote on the rules everyone lives under. City council members, state representatives, and members of Congress are all legislators.',
				hook: 'This whole site is about checking whether yours are doing that job well.',
			},
			{
				front: 'Constituent',
				back: 'You. Anyone who lives in the area an elected official represents. Their office exists to answer to constituents — including ones who never voted for them.',
				hook: 'When you call a legislator’s office, staff ask for your address to confirm you’re a constituent. If you are, they have to listen.',
			},
			{
				front: 'Bill',
				back: 'A proposed law. It’s just an idea on paper until both chambers of a legislature pass it and the governor (or president) signs it.',
				hook: 'Most bills never become law — they die quietly in committee.',
			},
			{
				front: 'Committee',
				back: 'A small group of legislators that examines bills on one topic — like schools, roads, or health — before the full chamber ever votes. Committees decide which bills move forward and which quietly die.',
				hook: 'If you want to know where a bill really stands, check which committee is sitting on it.',
			},
			{
				front: 'Roll call vote',
				back: 'A vote where every legislator’s yes or no is recorded by name, forever. The alternative is a voice vote, where nobody’s position is written down.',
				hook: 'Roll calls are the receipts. They’re how this site tracks what your legislators actually did, not what they said.',
			},
			{
				front: 'Incumbent',
				back: 'The person currently holding a seat. Incumbents usually win re-election — better name recognition, easier fundraising — so unseating one is hard.',
			},
			{
				front: 'Veto',
				back: 'When a governor or president refuses to sign a bill, killing it. The legislature can override a veto, but it takes a two-thirds supermajority in both chambers — which is rare.',
				hook: 'A governor’s veto pen is why "which party holds the governorship" matters as much as who controls the legislature.',
			},
			{
				front: 'Appropriation',
				back: 'The money vote. An appropriation is a law that decides how much public money gets spent, and on what. Budgets are where promises become real — or don’t.',
				hook: 'A legislator can vote for a program and then vote against funding it. Watch the appropriations.',
			},
			{
				front: 'Gerrymandering',
				back: 'Drawing voting district lines to favor one party — packing the other side’s voters into a few districts or spreading them too thin to win any.',
				hook: 'Michigan voters banned partisan line-drawing in 2018; an independent citizens’ commission now draws the maps.',
			},
			{
				front: 'Primary vs. general election',
				back: 'The primary is round one: each party’s voters pick their candidate. The general is round two: everyone picks the officeholder. In districts that lean heavily one way, the primary is often the whole ballgame.',
				hook: 'Primaries have tiny turnout — so one primary vote can matter more than one general-election vote.',
			},
			{
				front: 'Town hall',
				back: 'A public meeting where an elected official takes questions from anyone who shows up. No appointment, no invitation needed.',
				hook: 'Legislators count the people in the room. Twenty constituents at a town hall is a signal they talk about for weeks.',
			},
			{
				front: 'Ordinance vs. statute',
				back: 'An ordinance is a local law passed by a city or county. A statute is a state or federal law. When they conflict, state law usually wins — that’s called preemption.',
				hook: 'This is why Lansing can overrule a decision Holland makes about its own streets.',
			},
			{
				front: 'Term',
				back: 'How long an official serves before facing voters again. U.S. and Michigan House: 2 years. Michigan Senate and governor: 4 years. U.S. Senate: 6 years.',
				hook: 'Short terms mean House members are basically always campaigning — and always listening.',
			},
			{
				front: 'Caucus',
				back: 'A group of legislators who organize around a party or shared cause — the House Democratic Caucus, a Farm Caucus, a Great Lakes Caucus. Caucuses pool votes to gain leverage.',
			},
			{
				front: 'Lobbying',
				back: 'Trying to persuade legislators to vote a certain way. Companies pay professionals to do it — but a constituent calling their representative’s office is lobbying too, and it’s free.',
				hook: 'Staff tally every call. A dozen calls from real constituents on one bill gets noticed.',
			},
			{
				front: 'Filibuster',
				back: 'A U.S. Senate tactic: talk (or threaten to talk) endlessly so a bill can’t come to a vote. It takes 60 of 100 senators to shut one down, which is why most big bills need more than a bare majority.',
			},
		],
	},
	{
		id: 'history',
		label: 'History in a flash',
		blurb: 'Moments when a law — or the people demanding one — changed everyday life.',
		cards: [
			{
				front: '1920 — the 19th Amendment',
				back: 'Guaranteed women the right to vote nationwide, after a 72-year fight. Michigan was one of the first states to ratify it, in June 1919.',
				hook: 'It took a constitutional amendment because legislatures wouldn’t act on their own — pressure from outside made them.',
			},
			{
				front: '1935 — the Social Security Act',
				back: 'Created retirement checks funded by payroll taxes. Before it, growing old was the single biggest cause of poverty in America.',
				hook: 'One vote in Congress, ninety years ago, is why a payroll deduction appears on every paycheck you’ve ever earned.',
			},
			{
				front: '1944 — the GI Bill',
				back: 'Paid college tuition and backed home loans for returning WWII veterans. It put millions through school and built the modern middle class — including much of suburban Michigan.',
			},
			{
				front: '1964 — the Civil Rights Act',
				back: 'Outlawed discrimination by race, sex, religion, or national origin in workplaces and public places. It passed only because members of both parties crossed over to break a 60-day filibuster.',
				hook: 'Proof that the biggest laws need votes from both sides of the aisle.',
			},
			{
				front: '1965 — the Voting Rights Act',
				back: 'Banned literacy tests and other tricks used to stop Black Americans from voting. Passed months after marchers were beaten in Selma, Alabama — public outrage moved Congress in weeks.',
			},
			{
				front: '1971 — the 26th Amendment',
				back: 'Lowered the voting age from 21 to 18 — ratified in about three months, faster than any amendment ever. The argument that won: if you’re old enough to be drafted for Vietnam, you’re old enough to vote.',
			},
			{
				front: '1972 — the Clean Water Act',
				back: 'Set national limits on dumping into rivers and lakes — passed after rivers like the Cuyahoga literally caught fire. President Nixon vetoed it; Congress overrode him by a two-thirds vote in both chambers.',
				hook: 'It’s a big part of why you can swim in Lake Michigan today.',
			},
			{
				front: '1976 — Michigan’s bottle deposit law',
				back: 'Michigan voters — not the legislature — passed the 10-cent bottle deposit by ballot initiative. Michigan’s return rate has been among the highest in the nation ever since.',
				hook: 'That dime you get back at Meijer? Voters put it there directly when lawmakers wouldn’t.',
			},
			{
				front: '1990 — the Americans with Disabilities Act',
				back: 'Required ramps, curb cuts, accessible buses, and closed captions, and banned firing people for a disability. Passed with big majorities from both parties.',
				hook: 'Every curb cut you roll a stroller over is this law, still working.',
			},
			{
				front: '2018 — Voters Not Politicians',
				back: 'A Michigan ballot initiative, started by one volunteer’s Facebook post, that took redistricting away from the legislature and gave it to a randomly selected citizens’ commission. It passed 61–39.',
				hook: 'The most recent proof that in Michigan, regular people can rewrite the rules themselves.',
			},
		],
	},
	{
		id: 'impacts',
		label: 'People who delivered',
		blurb: 'Legislators — several from West Michigan — remembered for actually representing people.',
		cards: [
			{
				front: 'Arthur Vandenberg — U.S. Senator from Grand Rapids',
				back: 'A West Michigan newspaper editor turned senator who helped create the United Nations and pass the Marshall Plan after WWII, working across party lines with a president he’d opposed.',
				hook: 'His famous line — "politics stops at the water’s edge" — was coined a short drive from Holland.',
			},
			{
				front: 'Gerald Ford — U.S. House, Grand Rapids',
				back: 'Represented Grand Rapids for 25 years before becoming the only president from Michigan. Locally he was known less for speeches than for relentless constituent service — answering letters, untangling federal problems for regular people.',
				hook: 'His House career is the template this site scores legislators against: did they show up for the district?',
			},
			{
				front: 'John Dingell — U.S. House, Michigan',
				back: 'Served 59 years, the longest in congressional history. His fingerprints are on Medicare, the Clean Water Act, the Endangered Species Act, and the ADA.',
				hook: 'One Michigan seat, held well, shaped a half-century of American law.',
			},
			{
				front: 'Everett Dirksen — U.S. Senate, Illinois',
				back: 'The Republican minority leader who delivered the votes to break the filibuster against the 1964 Civil Rights Act — a bill his party didn’t have to save. "No army can withstand the strength of an idea whose time has come."',
				hook: 'A reminder that the decisive vote often comes from the side you didn’t expect.',
			},
			{
				front: 'Margaret Chase Smith — U.S. Senate, Maine',
				back: 'In 1950, as a freshman senator, she was the first in her own party to publicly condemn Senator Joseph McCarthy’s smear campaigns — her "Declaration of Conscience," delivered when it was politically dangerous.',
				hook: 'Representing people well sometimes means standing up to your own side.',
			},
			{
				front: 'John Lewis — U.S. House, Georgia',
				back: 'Beaten leading the Selma march for voting rights at 25; elected to Congress at 46. He spent 33 years in the House pushing to protect the vote he’d bled for.',
			},
			{
				front: 'Justin Smith Morrill — U.S. House, Vermont',
				back: 'Wrote the 1862 Land-Grant College Act, giving states land to fund public colleges for ordinary families — farmers’ and workers’ kids, not just the wealthy. Michigan State became the national model.',
				hook: 'A congressman from tiny Vermont is part of why in-state tuition exists in Michigan.',
			},
			{
				front: 'Jeannette Rankin — U.S. House, Montana',
				back: 'The first woman ever elected to Congress — in 1916, four years before most American women could legally vote for her.',
			},
			{
				front: 'Carl Levin — U.S. Senate, Michigan',
				back: 'Michigan’s longest-serving U.S. senator, known for methodical oversight investigations — grilling banks, auditing the Pentagon — and for steering federal money into Great Lakes cleanup.',
				hook: 'Oversight rarely makes headlines, but it’s a core part of the job description.',
			},
			{
				front: 'Hazen Pingree — Mayor of Detroit, then Governor',
				back: 'In the 1890s depression he turned vacant Detroit lots into potato gardens for hungry families and fought streetcar monopolies over fares. Voters made him governor.',
				hook: 'Proof that "local office" is where some of the most direct help for people happens.',
			},
		],
	},
];
