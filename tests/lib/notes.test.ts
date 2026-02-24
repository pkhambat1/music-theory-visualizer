import { describe, it, expect } from "vitest"
import { CHROMATIC_SCALE, generateOctaves } from "../../src/lib/notes"
import { Note } from "../../src/models/Note"
import { SHARP, NATURAL } from "../../src/lib/music/accidentals"

describe("CHROMATIC_SCALE", () => {
  it("has length 13", () => {
    expect(CHROMATIC_SCALE).toHaveLength(13)
  })

  it("starts with C", () => {
    expect(CHROMATIC_SCALE[0]!.letter).toBe("C")
    expect(CHROMATIC_SCALE[0]!.accidental).toBe(NATURAL)
  })

  it("ends with C (octave wrap)", () => {
    expect(CHROMATIC_SCALE[12]!.letter).toBe("C")
    expect(CHROMATIC_SCALE[12]!.accidental).toBe(NATURAL)
  })

  it("contains all 12 unique pitch classes plus the octave C", () => {
    const unique = new Set(CHROMATIC_SCALE.map((n) => n.label()))
    // 12 unique labels (C appears twice but set deduplicates)
    expect(unique.size).toBe(12)
  })
})

describe("generateOctaves", () => {
  it("1 octave = 12 notes", () => {
    const notes = generateOctaves(1)
    expect(notes).toHaveLength(12)
  })

  it("6 octaves = 72 notes", () => {
    const notes = generateOctaves(6)
    expect(notes).toHaveLength(72)
  })

  it("first note is C1", () => {
    const notes = generateOctaves(1)
    expect(notes[0]).toEqual(new Note("C", NATURAL, 1))
  })

  it("last note of 1 octave is B1", () => {
    const notes = generateOctaves(1)
    expect(notes[11]).toEqual(new Note("B", NATURAL, 1))
  })

  it("last note of 6 octaves is B6", () => {
    const notes = generateOctaves(6)
    expect(notes[71]).toEqual(new Note("B", NATURAL, 6))
  })

  it("0 octaves = empty array", () => {
    const notes = generateOctaves(0)
    expect(notes).toHaveLength(0)
  })

  it("notes within an octave follow chromatic order", () => {
    const notes = generateOctaves(1)
    const expected = [
      new Note("C", NATURAL, 1),
      new Note("C", SHARP, 1),
      new Note("D", NATURAL, 1),
      new Note("D", SHARP, 1),
      new Note("E", NATURAL, 1),
      new Note("F", NATURAL, 1),
      new Note("F", SHARP, 1),
      new Note("G", NATURAL, 1),
      new Note("G", SHARP, 1),
      new Note("A", NATURAL, 1),
      new Note("A", SHARP, 1),
      new Note("B", NATURAL, 1),
    ]
    expect(notes).toEqual(expected)
  })
})
