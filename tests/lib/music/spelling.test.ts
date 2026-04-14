import { describe, it, expect } from "vitest"
import { spellModeNotes } from "../../../src/lib/music/spelling"
import { MODES, IONIAN } from "../../../src/lib/music/modes"
import { generateOctaves } from "../../../src/lib/notes"
import {
  buildModeNotesWithOverflow,
  getModeLeftOverflowSize,
} from "../../../src/lib/music/scale"
import { Note } from "../../../src/models/Note"
import { NATURAL } from "../../../src/lib/music/accidentals"

describe("spellModeNotes", () => {
  const notes = generateOctaves(6)
  const C3 = new Note("C", NATURAL, 3)
  const D3 = new Note("D", NATURAL, 3)

  it("returns [] for empty input", () => {
    expect(spellModeNotes([], 0, notes)).toEqual([])
  })

  it("result length matches input length", () => {
    const modeNotes = buildModeNotesWithOverflow(C3, IONIAN, notes)
    const leftOverflow = getModeLeftOverflowSize(IONIAN)
    const result = spellModeNotes(modeNotes, leftOverflow, notes)
    expect(result).toHaveLength(modeNotes.length)
  })

  it("C Ionian has no accidentals in the core notes", () => {
    const modeNotes = buildModeNotesWithOverflow(C3, IONIAN, notes)
    const leftOverflow = getModeLeftOverflowSize(IONIAN)
    const result = spellModeNotes(modeNotes, leftOverflow, notes)
    // The core notes (after trimming overflow) should be C D E F G A B C
    const coreNotes = result.slice(leftOverflow, leftOverflow + IONIAN.length)
    for (const note of coreNotes) {
      expect(note.accidental).toBe(NATURAL)
    }
  })

  it("spells D Dorian without accidentals (same notes as C major)", () => {
    const DORIAN = MODES.find(m => m.name === "Dorian")!.intervals
    const modeNotes = buildModeNotesWithOverflow(D3, DORIAN, notes)
    const leftOverflow = getModeLeftOverflowSize(DORIAN)
    const result = spellModeNotes(modeNotes, leftOverflow, notes)
    const coreNotes = result.slice(leftOverflow, leftOverflow + DORIAN.length)
    for (const note of coreNotes) {
      expect(note.accidental).toBe(NATURAL)
    }
  })
})
