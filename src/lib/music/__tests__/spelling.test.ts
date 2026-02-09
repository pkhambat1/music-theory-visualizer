import { describe, it, expect } from "vitest";
import type { NoteIndex, NoteName, PitchClass } from "../../../types";
import { noteNameToPitchClass, spellModeNotes } from "../spelling";
import { MODES } from "../modes";
import { generateOctaves } from "../../notes";
import {
  buildModeNotesWithOverflow,
  getModeLeftOverflowSize,
} from "../scale";

describe("noteNameToPitchClass", () => {
  it("maps natural notes correctly", () => {
    expect(noteNameToPitchClass("C")).toBe(0 as PitchClass);
    expect(noteNameToPitchClass("D")).toBe(2 as PitchClass);
    expect(noteNameToPitchClass("E")).toBe(4 as PitchClass);
    expect(noteNameToPitchClass("F")).toBe(5 as PitchClass);
    expect(noteNameToPitchClass("G")).toBe(7 as PitchClass);
    expect(noteNameToPitchClass("A")).toBe(9 as PitchClass);
    expect(noteNameToPitchClass("B")).toBe(11 as PitchClass);
  });

  it("handles sharps", () => {
    expect(noteNameToPitchClass("C#")).toBe(1 as PitchClass);
    expect(noteNameToPitchClass("F#")).toBe(6 as PitchClass);
  });

  it("handles flats", () => {
    expect(noteNameToPitchClass("Db")).toBe(1 as PitchClass);
    expect(noteNameToPitchClass("Gb")).toBe(6 as PitchClass);
    expect(noteNameToPitchClass("Bb")).toBe(10 as PitchClass);
  });

  it("returns null for null/undefined/empty", () => {
    expect(noteNameToPitchClass(null)).toBeNull();
    expect(noteNameToPitchClass(undefined)).toBeNull();
    expect(noteNameToPitchClass("")).toBeNull();
  });

  it("returns null for invalid note names", () => {
    expect(noteNameToPitchClass("X")).toBeNull();
    expect(noteNameToPitchClass("Z#")).toBeNull();
  });

  it("handles note names with octave numbers", () => {
    // "C4" → letter is C, has no # or b, so pitch class 0
    expect(noteNameToPitchClass("C4")).toBe(0 as PitchClass);
    // "F#3" → letter F, has #, so 5+1=6
    expect(noteNameToPitchClass("F#3")).toBe(6 as PitchClass);
  });
});

describe("spellModeNotes", () => {
  const notes = generateOctaves(6);
  const IONIAN = MODES["Ionian (major)"];

  it("returns [] for empty input", () => {
    expect(spellModeNotes([], 0, notes)).toEqual([]);
  });

  it("result length matches input length", () => {
    const modeNotes = buildModeNotesWithOverflow(
      "C1" as NoteName,
      IONIAN,
      notes,
    );
    const leftOverflow = getModeLeftOverflowSize(IONIAN);
    const result = spellModeNotes(modeNotes, leftOverflow, notes);
    expect(result).toHaveLength(modeNotes.length);
  });

  it("C Ionian has no accidentals in the core notes", () => {
    const modeNotes = buildModeNotesWithOverflow(
      "C1" as NoteName,
      IONIAN,
      notes,
    );
    const leftOverflow = getModeLeftOverflowSize(IONIAN);
    const result = spellModeNotes(modeNotes, leftOverflow, notes);
    // The core notes (after trimming overflow) should be C D E F G A B C
    const coreNotes = result.slice(leftOverflow, leftOverflow + IONIAN.length);
    for (const note of coreNotes) {
      expect(note).not.toContain("#");
      expect(note).not.toContain("♭");
    }
  });

  it("returns [] for null/undefined-like input", () => {
    expect(spellModeNotes(null as unknown as NoteIndex[], 0, notes)).toEqual([]);
    expect(spellModeNotes(undefined as unknown as NoteIndex[], 0, notes)).toEqual([]);
  });

  it("spells D Dorian without accidentals (same notes as C major)", () => {
    const DORIAN = MODES["Dorian"];
    const modeNotes = buildModeNotesWithOverflow(
      "D1" as NoteName,
      DORIAN,
      notes,
    );
    const leftOverflow = getModeLeftOverflowSize(DORIAN);
    const result = spellModeNotes(modeNotes, leftOverflow, notes);
    const coreNotes = result.slice(leftOverflow, leftOverflow + DORIAN.length);
    for (const note of coreNotes) {
      expect(note).not.toContain("#");
      expect(note).not.toContain("♭");
    }
  });
});
