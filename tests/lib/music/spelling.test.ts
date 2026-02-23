import { describe, it, expect } from "vitest"
import { spellModeNotes } from "../../../src/lib/music/spelling"
import { MODES } from "../../../src/lib/music/modes"
import { generateOctaves } from "../../../src/lib/notes"
import {
  buildModeNotesWithOverflow,
  getModeLeftOverflowSize,
} from "../../../src/lib/music/scale"
import { Note } from "../../../src/lib/note"

describe("spellModeNotes", () => {
  const notes = generateOctaves(6)
  const IONIAN = MODES["Ionian (major)"]
  const C1 = new Note("C", "natural", 1)
  const D1 = new Note("D", "natural", 1)

  it("returns [] for empty input", () => {
    expect(spellModeNotes([], 0, notes)).toEqual([])
  })

  it("result length matches input length", () => {
    const modeNotes = buildModeNotesWithOverflow(C1, IONIAN, notes)
    const leftOverflow = getModeLeftOverflowSize(IONIAN)
    const result = spellModeNotes(modeNotes, leftOverflow, notes)
    expect(result).toHaveLength(modeNotes.length)
  })

  it("C Ionian has no accidentals in the core notes", () => {
    const modeNotes = buildModeNotesWithOverflow(C1, IONIAN, notes)
    const leftOverflow = getModeLeftOverflowSize(IONIAN)
    const result = spellModeNotes(modeNotes, leftOverflow, notes)
    // The core notes (after trimming overflow) should be C D E F G A B C
    const coreNotes = result.slice(leftOverflow, leftOverflow + IONIAN.length)
    for (const note of coreNotes) {
      expect(note).not.toBeNull()
      expect(note!.accidental).toBe("natural")
    }
  })

  it("returns [] for null/undefined-like input", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(spellModeNotes(null as any, 0, notes)).toEqual([])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(spellModeNotes(undefined as any, 0, notes)).toEqual([])
  })

  it("spells D Dorian without accidentals (same notes as C major)", () => {
    const DORIAN = MODES["Dorian"]
    const modeNotes = buildModeNotesWithOverflow(D1, DORIAN, notes)
    const leftOverflow = getModeLeftOverflowSize(DORIAN)
    const result = spellModeNotes(modeNotes, leftOverflow, notes)
    const coreNotes = result.slice(leftOverflow, leftOverflow + DORIAN.length)
    for (const note of coreNotes) {
      expect(note).not.toBeNull()
      expect(note!.accidental).toBe("natural")
    }
  })
})
