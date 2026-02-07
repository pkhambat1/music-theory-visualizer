import type { Interval, NoteIndex, NoteName } from "../../types";
import { CHROMATIC_SCALE } from "../notes";
import { OCTAVE } from "./modes";

// ─── Layout constants ──────────────────────────────────────────────

export const BASE_SCALE_LEFT_OVERFLOW = 5;
export const BASE_SCALE_WITH_OVERFLOW_SIZE =
  CHROMATIC_SCALE.length + 2 * BASE_SCALE_LEFT_OVERFLOW;
export const BASE_SCALE_LEFT_OVERFLOW_SIZE =
  (BASE_SCALE_WITH_OVERFLOW_SIZE - CHROMATIC_SCALE.length) / 2;

export const BORDER_PX = 1;

export function getLineBorder(borderWidth: number): string {
  return `${borderWidth}px solid rgba(255, 255, 255, 0.1)`;
}

// ─── Overflow helpers ──────────────────────────────────────────────

/** Extend mode intervals with overflow on both sides for line-drawing. */
export function addOverflowToModeIntervals(
  modeIntervals: Interval[],
): Interval[] {
  return [
    ...[2, 3, 4, 5, 6].map((i) => (modeIntervals[i]! - OCTAVE) as Interval),
    ...modeIntervals,
    ...[1, 2, 3, 4, 5].map((i) => (modeIntervals[i]! + OCTAVE) as Interval),
  ];
}

/** Number of overflow notes prepended to the left of the mode array. */
export function getModeLeftOverflowSize(modeIntervals: Interval[]): number {
  return (
    (addOverflowToModeIntervals(modeIntervals).length -
      modeIntervals.length) /
    2
  );
}

// ─── Mode building ─────────────────────────────────────────────────

/** Convert root + intervals into absolute NoteIndex values. */
export function modeIntervalsToMode(
  rootNote: NoteName,
  intervals: Interval[],
  notes: NoteName[],
): NoteIndex[] {
  const rootIndex = notes.indexOf(rootNote);
  if (rootIndex < 0) return [];
  return intervals.map((interval) => (interval + rootIndex) as NoteIndex);
}

/** Build the full mode notes array (with overflow) from root + mode intervals. */
export function buildModeNotesWithOverflow(
  rootNote: NoteName,
  modeIntervals: Interval[],
  notes: NoteName[],
): NoteIndex[] {
  const withOverflow = addOverflowToModeIntervals(modeIntervals);
  return modeIntervalsToMode(rootNote, withOverflow, notes);
}

/** Trim overflow notes from the left of a mode array. */
export function leftTrimOverflowNotes(
  modeNotesWithOverflow: NoteIndex[],
  leftOverflowSize: number,
): NoteIndex[] {
  return modeNotesWithOverflow.slice(leftOverflowSize);
}
