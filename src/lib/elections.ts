import { LEVELS } from "../data/election-seats";
import type { Candidate, Level, Seat } from "../data/election-seats";

export interface RaceRef {
	level: Level;
	seat: Seat;
}

/** Find the seat (and its level) a seatSlug belongs to. */
export function findRace(seatSlug: string): RaceRef | undefined {
	for (const level of LEVELS) {
		const seat = level.seats.find((s) => s.seatSlug === seatSlug);
		if (seat) return { level, seat };
	}
	return undefined;
}

/**
 * Where a candidate's name should link: their candidate page, or — for
 * incumbents — the officeholder profile for the seat they hold.
 */
export function candidateHref(cand: Candidate, seat: Seat): string | undefined {
	if (cand.slug) return `/candidates/${cand.slug}/`;
	if (cand.incumbent && seat.slug) return `/legislators/${seat.slug}/`;
	return undefined;
}

/** A seat's declared 2026 field, or undefined when no race is tracked. */
export function raceFieldForSeat(seatSlug: string | undefined): RaceRef | undefined {
	if (!seatSlug) return undefined;
	const race = findRace(seatSlug);
	return race && (race.seat.candidates?.length ?? 0) > 0 ? race : undefined;
}
