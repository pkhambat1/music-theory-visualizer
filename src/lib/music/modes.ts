import { Mode } from "../../models/Mode"

export { Mode } from "../../models/Mode"

/** All supported modes with their intervals (including the octave wrap) and descriptions. */
export const MODES: Mode[] = [
  new Mode("Ionian (major)", [0, 2, 4, 5, 7, 9, 11, 12], "The natural major scale — bright and resolved"),
  new Mode("Dorian", [0, 2, 3, 5, 7, 9, 10, 12], "Minor with a raised 6th — jazzy and warm"),
  new Mode("Phrygian", [0, 1, 3, 5, 7, 8, 10, 12], "Minor with a flat 2nd — dark and Spanish-flavored"),
  new Mode("Lydian", [0, 2, 4, 6, 7, 9, 11, 12], "Major with a raised 4th — dreamy and floating"),
  new Mode("Mixolydian", [0, 2, 4, 5, 7, 9, 10, 12], "Major with a flat 7th — bluesy and dominant"),
  new Mode("Aeolian (natural minor)", [0, 2, 3, 5, 7, 8, 10, 12], "The natural minor scale — sad and introspective"),
  new Mode("Locrian", [0, 1, 3, 5, 6, 8, 10, 12], "Diminished — unstable and dissonant"),
  new Mode("Harmonic Minor", [0, 2, 3, 5, 7, 8, 11, 12], "Minor with a raised 7th — exotic and dramatic"),
  new Mode("Melodic Minor", [0, 2, 3, 5, 7, 9, 11, 12], "Minor with raised 6th and 7th — smooth and jazzy"),
  new Mode("Whole Tone", [0, 2, 4, 6, 8, 10, 12], "All whole steps — symmetrical, dreamlike, and unresolved"),
]

/** The Ionian (major) intervals, used as the reference for chord construction. */
export const IONIAN = MODES.find(m => m.name === "Ionian (major)")!.intervals

/** Number of semitones in an octave (also chromaticScale.length - 1). */
export const OCTAVE = 12
