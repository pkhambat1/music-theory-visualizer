import type { Letter, Accidental } from "../types"
import { Note } from "./note"

const BASE_NOTES: { letter: Letter; accidental: Accidental }[] = [
  { letter: "C", accidental: "natural" },
  { letter: "C", accidental: "sharp" },
  { letter: "D", accidental: "natural" },
  { letter: "D", accidental: "sharp" },
  { letter: "E", accidental: "natural" },
  { letter: "F", accidental: "natural" },
  { letter: "F", accidental: "sharp" },
  { letter: "G", accidental: "natural" },
  { letter: "G", accidental: "sharp" },
  { letter: "A", accidental: "natural" },
  { letter: "A", accidental: "sharp" },
  { letter: "B", accidental: "natural" },
]

/** The 13-element chromatic scale (C through C, inclusive of octave wrap). */
export const CHROMATIC_SCALE: Note[] = [
  ...BASE_NOTES.map((n) => new Note(n.letter, n.accidental, 0)),
  new Note("C", "natural", 0),
]

/**
 * Generate Note objects across `octaveCount` octaves (starting at octave 1).
 */
export function generateOctaves(octaveCount: number): Note[] {
  return Array.from({ length: octaveCount }, (_, i) => i + 1).flatMap(
    (octave) => BASE_NOTES.map((n) => new Note(n.letter, n.accidental, octave)),
  )
}

/**
 * Render a Note. For "C" notes the octave is shown as a subscript;
 * other notes just show the label (no octave).
 */
export function renderNote(note: Note): React.ReactNode {
  return (
    <>
      {note.label()}
      {note.isC() && <sub>{note.octave}</sub>}
    </>
  )
}
