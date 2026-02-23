import type { Interval, ModeName } from "../../types"

/** Semitone intervals for every supported mode (including the octave wrap). */
export const MODES: Record<ModeName, Interval[]> = {
  "Ionian (major)":            [0, 2, 4, 5, 7, 9, 11, 12],
  "Dorian":                    [0, 2, 3, 5, 7, 9, 10, 12],
  "Phrygian":                  [0, 1, 3, 5, 7, 8, 10, 12],
  "Lydian":                    [0, 2, 4, 6, 7, 9, 11, 12],
  "Mixolydian":                [0, 2, 4, 5, 7, 9, 10, 12],
  "Aeolian (natural minor)":   [0, 2, 3, 5, 7, 8, 10, 12],
  "Locrian":                   [0, 1, 3, 5, 6, 8, 10, 12],
  "Harmonic Minor":            [0, 2, 3, 5, 7, 8, 11, 12],
  "Melodic Minor":             [0, 2, 3, 5, 7, 9, 11, 12],
  "Whole Tone":                [0, 2, 4, 6, 8, 10, 12],
}

/** The Ionian (major) intervals, used as the reference for chord construction. */
export const IONIAN = MODES["Ionian (major)"]

/** Number of semitones in an octave (also chromaticScale.length - 1). */
export const OCTAVE = 12
