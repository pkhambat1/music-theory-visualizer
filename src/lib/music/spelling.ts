import type { Letter, NoteIndex } from "./types"
import { SHARP, FLAT, NATURAL } from "./accidentals"
import { Note } from "../../models"

const LETTER_ORDER: Letter[] = ["C", "D", "E", "F", "G", "A", "B"]
const LETTER_TO_PC: Record<Letter, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
}

function pitchClass(noteIdx: NoteIndex, notes: Note[]): number {
  const n = notes[noteIdx]!
  return (LETTER_TO_PC[n.letter] + n.accidental.semitoneOffset + 12) % 12
}

function accidentalFromDiff(diff: number) {
  return diff > 0 ? SHARP : diff < 0 ? FLAT : NATURAL
}

/**
 * Try spelling every note starting from a given letter index.
 * Returns null if any note would need a double accidental (|diff| > 1).
 */
function spellWithStartLetter(
  startIdx: number,
  noteIndices: NoteIndex[],
  rootPosition: number,
  degreesPerOctave: number,
  notes: Note[],
): Note[] | null {
  const result: Note[] = []
  for (let i = 0; i < noteIndices.length; i++) {
    const noteIdx = noteIndices[i]!
    const degreeInMode =
      (((i - rootPosition) % degreesPerOctave) + degreesPerOctave) %
      degreesPerOctave
    const letterIndex = (startIdx + degreeInMode) % LETTER_ORDER.length
    const letter = LETTER_ORDER[letterIndex]!
    const naturalPc = LETTER_TO_PC[letter]
    const desiredPc = pitchClass(noteIdx, notes)
    const diff = ((desiredPc - naturalPc + 6) % 12) - 6
    if (Math.abs(diff) > 1) return null
    const noteOctave = Math.floor(noteIdx / 12) + 1
    result.push(new Note(letter, accidentalFromDiff(diff), noteOctave))
  }
  return result
}

/**
 * Spell a sequence of note indices by assigning one letter per degree.
 * For sharp roots, tries the root letter first; if that produces a
 * double accidental, falls back to the enharmonic flat letter
 * (e.g. A# → try A-based, bail → use Bb-based).
 */
export function spellNoteSequence(
  noteIndices: NoteIndex[],
  rootPosition: number,
  degreesPerOctave: number,
  notes: Note[],
): Note[] {
  if (noteIndices.length === 0) return []

  const rootNote = notes[noteIndices[rootPosition]!]!
  const rootLetterIndex = LETTER_ORDER.indexOf(rootNote.letter)

  const result = spellWithStartLetter(rootLetterIndex, noteIndices, rootPosition, degreesPerOctave, notes)
  if (result !== null) return result

  if (rootNote.isSharp()) {
    const fallback = spellWithStartLetter(
      (rootLetterIndex + 1) % LETTER_ORDER.length, noteIndices, rootPosition, degreesPerOctave, notes,
    )
    if (fallback !== null) return fallback
  }

  throw new Error(`Cannot spell notes without double accidentals: root=${rootNote.label()}`)
}

/**
 * Spell a single note index using a given letter, adding the
 * appropriate accidental. Useful for altered chord tones that share
 * a degree letter with their parent scale note.
 */
export function spellNote(noteIdx: NoteIndex, letter: Letter, notes: Note[]): Note {
  const naturalPc = LETTER_TO_PC[letter]
  const desiredPc = pitchClass(noteIdx, notes)
  const diff = ((desiredPc - naturalPc + 6) % 12) - 6
  const accidental = accidentalFromDiff(diff)
  const noteOctave = Math.floor(noteIdx / 12) + 1
  return new Note(letter, accidental, noteOctave)
}

/**
 * Spell all notes in a mode (with overflow), assigning one letter per
 * scale degree. Thin wrapper around spellNoteSequence.
 */
export function spellModeNotes(
  modeNotesWithOverflow: NoteIndex[],
  modeLeftOverflowSize: number,
  notes: Note[],
): Note[] {
  if (modeNotesWithOverflow.length === 0) return []
  const degreesCount =
    modeNotesWithOverflow.length - 2 * modeLeftOverflowSize - 1
  return spellNoteSequence(modeNotesWithOverflow, modeLeftOverflowSize, degreesCount, notes)
}
