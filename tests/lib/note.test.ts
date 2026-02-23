import { describe, it, expect } from "vitest"
import { Note } from "../../src/lib/note"

describe("Note", () => {
  describe("constructor", () => {
    it("stores letter, accidental, and octave", () => {
      const n = new Note("C", "sharp", 4)
      expect(n.letter).toBe("C")
      expect(n.accidental).toBe("sharp")
      expect(n.octave).toBe(4)
    })
  })

  describe("label()", () => {
    it("returns letter for natural notes", () => {
      expect(new Note("C", "natural", 4).label()).toBe("C")
      expect(new Note("D", "natural", 3).label()).toBe("D")
    })

    it("returns letter + # for sharp notes", () => {
      expect(new Note("F", "sharp", 3).label()).toBe("F#")
    })

    it("returns letter + ♭ for flat notes", () => {
      expect(new Note("B", "flat", 2).label()).toBe("B♭")
    })
  })

  describe("toDisplay()", () => {
    it("includes octave with unicode flat", () => {
      expect(new Note("E", "flat", 3).toDisplay()).toBe("E♭3")
      expect(new Note("C", "natural", 4).toDisplay()).toBe("C4")
      expect(new Note("F", "sharp", 5).toDisplay()).toBe("F#5")
    })
  })

  describe("toToneString()", () => {
    it("uses ASCII b for flats", () => {
      expect(new Note("E", "flat", 3).toToneString()).toBe("Eb3")
      expect(new Note("B", "flat", 2).toToneString()).toBe("Bb2")
    })

    it("uses # for sharps", () => {
      expect(new Note("C", "sharp", 4).toToneString()).toBe("C#4")
    })

    it("has no accidental symbol for natural notes", () => {
      expect(new Note("C", "natural", 4).toToneString()).toBe("C4")
    })
  })

  describe("equals()", () => {
    it("returns true for identical notes", () => {
      const a = new Note("C", "sharp", 4)
      const b = new Note("C", "sharp", 4)
      expect(a.equals(b)).toBe(true)
    })

    it("returns false for different letter", () => {
      expect(new Note("C", "natural", 4).equals(new Note("D", "natural", 4))).toBe(false)
    })

    it("returns false for different accidental", () => {
      expect(new Note("C", "sharp", 4).equals(new Note("C", "flat", 4))).toBe(false)
    })

    it("returns false for different octave", () => {
      expect(new Note("C", "natural", 4).equals(new Note("C", "natural", 5))).toBe(false)
    })
  })

  describe("isC(), isSharp(), isFlat()", () => {
    it("isC returns true only for C", () => {
      expect(new Note("C", "natural", 4).isC()).toBe(true)
      expect(new Note("D", "natural", 4).isC()).toBe(false)
    })

    it("isSharp returns true only for sharp", () => {
      expect(new Note("C", "sharp", 4).isSharp()).toBe(true)
      expect(new Note("C", "natural", 4).isSharp()).toBe(false)
    })

    it("isFlat returns true only for flat", () => {
      expect(new Note("E", "flat", 3).isFlat()).toBe(true)
      expect(new Note("E", "natural", 3).isFlat()).toBe(false)
    })
  })

})
