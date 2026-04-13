import { Mode } from "../../models"

export { Mode } from "../../models"

/** All supported modes with their intervals (including the octave wrap). */
export const MODES: Mode[] = [
  new Mode("Ionian (major)", [0, 2, 4, 5, 7, 9, 11, 12]),
  new Mode("Dorian", [0, 2, 3, 5, 7, 9, 10, 12]),
  new Mode("Phrygian", [0, 1, 3, 5, 7, 8, 10, 12]),
  new Mode("Lydian", [0, 2, 4, 6, 7, 9, 11, 12]),
  new Mode("Mixolydian", [0, 2, 4, 5, 7, 9, 10, 12]),
  new Mode("Aeolian (natural minor)", [0, 2, 3, 5, 7, 8, 10, 12]),
  new Mode("Locrian", [0, 1, 3, 5, 6, 8, 10, 12]),
  new Mode("Harmonic Minor", [0, 2, 3, 5, 7, 8, 11, 12]),
  new Mode("Melodic Minor", [0, 2, 3, 5, 7, 9, 11, 12]),
  new Mode("Whole Tone", [0, 2, 4, 6, 8, 10, 12]),
]

/** The Ionian (major) intervals, used as the reference for chord construction. */
export const IONIAN = [0, 2, 4, 5, 7, 9, 11, 12] as const

/** Number of semitones in an octave (also chromaticScale.length - 1). */
export const OCTAVE = 12

/** Roman numerals for the 7 diatonic scale degrees. */
export const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII"] as const
