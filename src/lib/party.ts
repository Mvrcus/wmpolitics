export type PartyKey = 'republican' | 'democrat' | 'nonpartisan' | 'other';

export type PartyInfo = {
	key: PartyKey;
	/** Short stamp text, e.g. REP / DEM / NP. */
	abbrev: string;
	label: string;
};

/**
 * Visual identity for party affiliation — powers the photo stamp and card
 * accents so affiliation reads at a glance without reading the text.
 */
export function partyInfo(party?: string): PartyInfo | null {
	if (!party) return null;
	const value = party.toLowerCase();
	if (value.includes('republican')) {
		return { key: 'republican', abbrev: 'REP', label: party };
	}
	if (value.includes('democrat')) {
		return { key: 'democrat', abbrev: 'DEM', label: party };
	}
	if (value.includes('nonpartisan') || value.includes('independent')) {
		return { key: 'nonpartisan', abbrev: 'NP', label: party };
	}
	return { key: 'other', abbrev: party.slice(0, 3).toUpperCase(), label: party };
}
