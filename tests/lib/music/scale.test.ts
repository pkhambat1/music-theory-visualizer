import { describe, it, expect } from "vitest"
import {
  addOverflowToModeIntervals,
  getModeLeftOverflowSize,
  modeIntervalsToMode,
  buildModeNotesWithOverflow,
  leftTrimOverflowNotes,
} from "../../../src/lib/music/scale"
import { MODES, OCTAVE } from "../../../src/lib/music/modes"
import { generateOctaves } from "../../../src/lib/notes"
import { Note } from "../../../src/lib/note"

const IONIAN = MODES["Ionian (major)"]

describe("addOverflowToModeIntervals", () => {
  it("output length = input length + 10", () => {
    const result = addOverflowToModeIntervals(IONIAN)
    // 8 base + 5 left + 5 right = 18
    expect(result).toHaveLength(IONIAN.length + 10)
  })

  it("left overflow has negative intervals", () => {
    const result = addOverflowToModeIntervals(IONIAN)
    // First 5 elements should be negative (below the root)
    for (let i = 0; i < 5; i++) {
      expect(result[i]).toBeLessThan(0)
    }
  })

  it("right overflow has intervals greater than 12", () => {
    const result = addOverflowToModeIntervals(IONIAN)
    // Last 5 elements should be > OCTAVE
    for (let i = result.length - 5; i < result.length; i++) {
      expect(result[i]).toBeGreaterThan(OCTAVE)
    }
  })

  it("middle portion matches the original intervals", () => {
    const result = addOverflowToModeIntervals(IONIAN)
    const leftOverflow = 5
    for (let i = 0; i < IONIAN.length; i++) {
      expect(result[leftOverflow + i]).toBe(IONIAN[i])
    }
  })

  it("works for all modes", () => {
    for (const [, intervals] of Object.entries(MODES)) {
      const result = addOverflowToModeIntervals(intervals)
      expect(result).toHaveLength(intervals.length + 10)
    }
  })
})

describe("getModeLeftOverflowSize", () => {
  it("returns 5 for standard 8-note modes", () => {
    expect(getModeLeftOverflowSize(IONIAN)).toBe(5)
  })

  it("returns the same value for all standard modes", () => {
    for (const [, intervals] of Object.entries(MODES)) {
      expect(getModeLeftOverflowSize(intervals)).toBe(5)
    }
  })
})

describe("modeIntervalsToMode", () => {
  const notes = generateOctaves(6)
  const C1 = new Note("C", "natural", 1)
  const D1 = new Note("D", "natural", 1)

  it("converts root + Ionian intervals to correct absolute NoteIndex array", () => {
    const result = modeIntervalsToMode(C1, IONIAN, notes)
    expect(result).toHaveLength(IONIAN.length)
    // C Ionian from C1: [0, 2, 4, 5, 7, 9, 11, 12]
    expect(result).toEqual(IONIAN.map((i) => i + 0))
  })

  it("returns [] when root is not found in notes", () => {
    const bogus = new Note("C", "natural", 9)
    const result = modeIntervalsToMode(bogus, IONIAN, notes)
    expect(result).toEqual([])
  })

  it("offsets correctly for non-C root", () => {
    // D1 is at index 2 in generateOctaves
    const result = modeIntervalsToMode(D1, IONIAN, notes)
    expect(result).toHaveLength(IONIAN.length)
    expect(result[0]).toBe(2) // D1 is at index 2
  })
})

describe("buildModeNotesWithOverflow", () => {
  const notes = generateOctaves(6)
  const C1 = new Note("C", "natural", 1)

  it("returns a full array with overflow", () => {
    const result = buildModeNotesWithOverflow(C1, IONIAN, notes)
    // 8 base + 10 overflow = 18
    expect(result).toHaveLength(IONIAN.length + 10)
  })

  it("contains the base mode notes in the middle portion", () => {
    const result = buildModeNotesWithOverflow(C1, IONIAN, notes)
    const baseMode = modeIntervalsToMode(C1, IONIAN, notes)
    const leftOverflow = getModeLeftOverflowSize(IONIAN)
    for (let i = 0; i < baseMode.length; i++) {
      expect(result[leftOverflow + i]).toBe(baseMode[i])
    }
  })

  it("returns [] when root is not found", () => {
    const bogus = new Note("C", "natural", 9)
    const result = buildModeNotesWithOverflow(bogus, IONIAN, notes)
    expect(result).toEqual([])
  })
})

describe("leftTrimOverflowNotes", () => {
  it("slices off the correct number of left elements", () => {
    const arr = [10, 20, 30, 40, 50, 60, 70, 80]
    const result = leftTrimOverflowNotes(arr, 3)
    expect(result).toEqual([40, 50, 60, 70, 80])
  })

  it("returns the full array when trim size is 0", () => {
    const arr = [1, 2, 3]
    expect(leftTrimOverflowNotes(arr, 0)).toEqual(arr)
  })

  it("returns empty array when trim size equals array length", () => {
    const arr = [1, 2, 3]
    expect(leftTrimOverflowNotes(arr, 3)).toEqual([])
  })
})
