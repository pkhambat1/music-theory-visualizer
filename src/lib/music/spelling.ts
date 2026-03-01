import type { Letter, NoteIndex, PitchClass } from "./types"
import { SHARP, FLAT, NATURAL } from "./accidentals"
import { Note } from "../../models"

const LETTER_ORDER: Letter[] = ["C", "D", "E", "F", "G", "A", "B"]
const LETTER_TO_PC: Record<Letter, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
}

export function noteNameToPitchClass(
  note: Note | null | undefined,
): PitchClass | null {
  if (!note) return null
  const basePc = LETTER_TO_PC[note.letter]
  return (basePc + note.accidental.semitoneOffset + 12) % 12
}

export type SpellingCandidate = {
  spelled: (Note | null)[],
  maxAbs: number,
  totalAbs: number,
}

/**
 * Choose an enharmonic spelling for every note in the mode that
 * minimises accidentals and avoids double-sharps / double-flats.
 */
export function spellModeNotes(
  modeNotesWithOverflow: NoteIndex[],
  modeLeftOverflowSize: number,
  notes: Note[],
): (Note | null)[] {
  if (
    !Array.isArray(modeNotesWithOverflow) ||
    modeNotesWithOverflow.length === 0 ||
    !Array.isArray(notes)
  ) {
    return []
  }

  const actualPcs = modeNotesWithOverflow.map((noteIdx) =>
    noteNameToPitchClass(notes[noteIdx]),
  )

  const rootIdx = modeLeftOverflowSize
  const rootNote: Note | undefined = notes[modeNotesWithOverflow[rootIdx]!]
  const rootLetter: Letter = rootNote?.letter ?? "C"
  const rootLetterIndex = LETTER_ORDER.indexOf(rootLetter)

  const candidateLetters = new Set<Letter>()
  if (rootLetterIndex !== -1) candidateLetters.add(rootLetter)
  if (rootNote?.isSharp()) {
    const nextLetter = LETTER_ORDER[(rootLetterIndex + 1) % LETTER_ORDER.length]
    if (nextLetter) candidateLetters.add(nextLetter)
  } else if (rootNote?.isFlat()) {
    const prevLetter = LETTER_ORDER[
      (rootLetterIndex - 1 + LETTER_ORDER.length) % LETTER_ORDER.length
    ]
    if (prevLetter) candidateLetters.add(prevLetter)
  }

  // Number of unique scale degrees (e.g. 7 for diatonic, 6 for whole tone).
  // Letters cycle at this rate so the octave note gets the root letter again.
  const modeDegreesCount =
    modeNotesWithOverflow.length - 2 * modeLeftOverflowSize - 1

  const candidates: SpellingCandidate[] = Array.from(candidateLetters).map(
    (rootLetterCandidate) => {
      const candidateRootIndex = LETTER_ORDER.indexOf(rootLetterCandidate)
      const spelled: (Note | null)[] = []
      let maxAbs = 0
      let totalAbs = 0

      for (let i = 0; i < modeNotesWithOverflow.length; i++) {
        // Map each note to a letter by cycling through degrees at the mode's
        // own period (6 for whole tone, 7 for diatonic, etc.)
        const degreeInMode =
          (((i - rootIdx) % modeDegreesCount) + modeDegreesCount) %
          modeDegreesCount
        const letterIndex =
          (candidateRootIndex + degreeInMode) % LETTER_ORDER.length
        const letter = LETTER_ORDER[letterIndex]!
        const naturalPc = LETTER_TO_PC[letter]
        const desiredPc = actualPcs[i]

        if (desiredPc === null || desiredPc === undefined) {
          spelled.push(null)
          continue
        }

        const diff = ((desiredPc - naturalPc + 6) % 12) - 6
        const absDiff = Math.abs(diff)
        maxAbs = Math.max(maxAbs, absDiff)
        totalAbs += absDiff

        if (absDiff > 2) {
          maxAbs = Math.max(maxAbs, 10)
          totalAbs += 10
        }

        const accidental = diff > 0 ? SHARP : diff < 0 ? FLAT : NATURAL

        const noteOctave = Math.floor(modeNotesWithOverflow[i]! / 12) + 1
        spelled.push(new Note(letter, accidental, noteOctave))
      }

      return { spelled, maxAbs, totalAbs }
    },
  )

  const sorted = candidates.sort((a, b) => {
    if (a.maxAbs !== b.maxAbs) return a.maxAbs - b.maxAbs
    return a.totalAbs - b.totalAbs
  })

  return sorted[0]?.spelled ?? []
}
