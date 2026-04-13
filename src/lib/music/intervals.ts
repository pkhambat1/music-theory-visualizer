import { IONIAN } from "./modes"

// Maps a semitone (0-11) to its scale degree (0-indexed).
// Ambiguous semitones map to the lower degree so the label is a sharp,
// matching chord-theory convention (e.g. 8 semitones → #5, not b6).
const DEGREE_MAP = [0, 1, 1, 2, 2, 3, 4, 4, 4, 5, 6, 6] as const

// Compound intervals (above the octave) group around extension degrees
// 9 (degree 1), 11 (degree 3), 13 (degree 5) — so the mapping differs.
const COMPOUND_DEGREE_MAP = [0, 1, 1, 1, 3, 3, 3, 4, 5, 5, 5, 6] as const

/**
 * Compute an interval label from raw semitones by mapping to a scale degree
 * and checking the accidental, same principle as spellNoteSequence.
 */
export function getIntervalLabel(semitones: number): string {
  const normalized =
    semitones < 0 ? ((semitones % 12) + 12) % 12 : semitones

  const withinOctave = normalized % 12
  const isCompound = normalized > 12
  const degree = (isCompound ? COMPOUND_DEGREE_MAP : DEGREE_MAP)[withinOctave]!
  const natural = IONIAN[degree]!
  const diff = withinOctave - natural

  const prefix = diff > 0 ? "♯" : diff < 0 ? "♭" : ""
  const degreeNumber = degree + 1 + (isCompound ? 7 : 0)
  return `${prefix}${degreeNumber}`
}
