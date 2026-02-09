import { describe, it, expect } from "vitest";
import { CHROMATIC_SCALE, generateOctaves } from "../notes";

describe("CHROMATIC_SCALE", () => {
  it("has length 13", () => {
    expect(CHROMATIC_SCALE).toHaveLength(13);
  });

  it("starts with C", () => {
    expect(CHROMATIC_SCALE[0]).toBe("C");
  });

  it("ends with C (octave wrap)", () => {
    expect(CHROMATIC_SCALE[12]).toBe("C");
  });

  it("contains all 12 unique pitch classes plus the octave C", () => {
    const unique = new Set(CHROMATIC_SCALE);
    // 12 unique names (C appears twice but set deduplicates)
    expect(unique.size).toBe(12);
  });
});

describe("generateOctaves", () => {
  it("1 octave = 12 notes", () => {
    const notes = generateOctaves(1);
    expect(notes).toHaveLength(12);
  });

  it("6 octaves = 72 notes", () => {
    const notes = generateOctaves(6);
    expect(notes).toHaveLength(72);
  });

  it("first note is C1", () => {
    const notes = generateOctaves(1);
    expect(notes[0]).toBe("C1");
  });

  it("last note of 1 octave is B1", () => {
    const notes = generateOctaves(1);
    expect(notes[11]).toBe("B1");
  });

  it("last note of 6 octaves is B6", () => {
    const notes = generateOctaves(6);
    expect(notes[71]).toBe("B6");
  });

  it("0 octaves = empty array", () => {
    const notes = generateOctaves(0);
    expect(notes).toHaveLength(0);
  });

  it("notes within an octave follow chromatic order", () => {
    const notes = generateOctaves(1);
    const expected = [
      "C1", "C#1", "D1", "D#1", "E1", "F1",
      "F#1", "G1", "G#1", "A1", "A#1", "B1",
    ];
    expect(notes).toEqual(expected);
  });
});
