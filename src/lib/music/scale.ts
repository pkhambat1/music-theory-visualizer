import type { Interval, NoteIndex } from "../../types"
import { Note } from "../../models/Note"
import { CHROMATIC_SCALE } from "../notes"
import { OCTAVE } from "./modes"

// ─── Layout constants ──────────────────────────────────────────────

export const BASE_SCALE_LEFT_OVERFLOW = 5
export const BASE_SCALE_WITH_OVERFLOW_SIZE =
  CHROMATIC_SCALE.length + 2 * BASE_SCALE_LEFT_OVERFLOW

export const SQUARE_SIDE = 60

// ─── Overflow helpers ──────────────────────────────────────────────

/** Extend mode intervals with overflow on both sides for line-drawing. */
export function addOverflowToModeIntervals(
  modeIntervals: Interval[],
): Interval[] {
  // Left overflow: take the 5 highest non-octave degrees from the previous octave.
  // For 8-element modes (7 notes) this is indices [2..6]; for 7-element (6 notes) [1..5].
  const lastNonOctave = modeIntervals.length - 2
  const leftIndices = Array.from({ length: 5 }, (_, i) => lastNonOctave - 4 + i)
  return [
    ...leftIndices.map((i) => modeIntervals[i]! - OCTAVE),
    ...modeIntervals,
    ...[1, 2, 3, 4, 5].map((i) => modeIntervals[i]! + OCTAVE),
  ]
}

/** Number of overflow notes prepended to the left of the mode array. */
export function getModeLeftOverflowSize(modeIntervals: Interval[]): number {
  return (
    (addOverflowToModeIntervals(modeIntervals).length -
      modeIntervals.length) /
    2
  )
}

// ─── Mode building ─────────────────────────────────────────────────

/** Convert root + intervals into absolute NoteIndex values. */
export function modeIntervalsToMode(
  rootNote: Note,
  intervals: Interval[],
  notes: Note[],
): NoteIndex[] {
  const rootIndex = notes.findIndex((n) => n.equals(rootNote))
  if (rootIndex < 0) return []
  return intervals.map((interval) => interval + rootIndex)
}

/** Build the full mode notes array (with overflow) from root + mode intervals. */
export function buildModeNotesWithOverflow(
  rootNote: Note,
  modeIntervals: Interval[],
  notes: Note[],
): NoteIndex[] {
  const withOverflow = addOverflowToModeIntervals(modeIntervals)
  return modeIntervalsToMode(rootNote, withOverflow, notes)
}

/** Trim overflow notes from the left of a mode array. */
export function leftTrimOverflowNotes(
  modeNotesWithOverflow: NoteIndex[],
  leftOverflowSize: number,
): NoteIndex[] {
  return modeNotesWithOverflow.slice(leftOverflowSize)
}
