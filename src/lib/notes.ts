import { SHARP, NATURAL } from "./music"
import { Note } from "../models"

const BASE_NOTES: Note[] = [
  new Note("C", NATURAL, 0),
  new Note("C", SHARP, 0),
  new Note("D", NATURAL, 0),
  new Note("D", SHARP, 0),
  new Note("E", NATURAL, 0),
  new Note("F", NATURAL, 0),
  new Note("F", SHARP, 0),
  new Note("G", NATURAL, 0),
  new Note("G", SHARP, 0),
  new Note("A", NATURAL, 0),
  new Note("A", SHARP, 0),
  new Note("B", NATURAL, 0),
]

/** The 13-element chromatic scale (C through C, inclusive of octave wrap). */
export const CHROMATIC_SCALE: Note[] = [
  ...BASE_NOTES,
  new Note("C", NATURAL, 0),
]

/**
 * Generate Note objects across `octaveCount` octaves (starting at octave 1).
 */
export function generateOctaves(octaveCount: number): Note[] {
  return Array.from({ length: octaveCount }, (_, i) => i + 1).flatMap(
    (octave) => BASE_NOTES.map((n) => new Note(n.letter, n.accidental, octave)),
  )
}

/** Pre-built array of notes spanning 6 octaves (used throughout the app). */
export const notes: Note[] = generateOctaves(6)