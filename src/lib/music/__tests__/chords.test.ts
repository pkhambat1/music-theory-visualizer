import { describe, it, expect } from "vitest";
import type { Extension, NoteIndex } from "../../../types";
import {
  getChordDescriptor,
  getChordNotes,
  getChordNotesInChromaticScale,
  applyExtensions,
  getDisabledExtensions,
} from "../chords";
import { MODES } from "../modes";

// Helper: cast number array to NoteIndex[]
const ni = (...ns: number[]) => ns as NoteIndex[];

// ─── IONIAN intervals for reference ──────────────────────────────
// [0, 2, 4, 5, 7, 9, 11, 12]
const IONIAN = MODES["Ionian (major)"];

describe("getChordDescriptor", () => {
  it("returns '' for a major triad (root, major 3rd, perfect 5th)", () => {
    // C major: C=0, E=4, G=7
    expect(getChordDescriptor(ni(0, 4, 7))).toBe("");
  });

  it("returns 'm' for a minor triad (root, minor 3rd, perfect 5th)", () => {
    // C minor: C=0, Eb=3, G=7
    expect(getChordDescriptor(ni(0, 3, 7))).toBe("m");
  });

  it("returns '°' for a diminished triad (root, minor 3rd, dim 5th)", () => {
    // C dim: C=0, Eb=3, Gb=6
    expect(getChordDescriptor(ni(0, 3, 6))).toBe("°");
  });

  it("returns '+' for an augmented triad (root, major 3rd, aug 5th)", () => {
    // C aug: C=0, E=4, G#=8
    expect(getChordDescriptor(ni(0, 4, 8))).toBe("+");
  });

  it("returns 'sus4' for a sus4 chord (root, perfect 4th, perfect 5th)", () => {
    // C sus4: C=0, F=5, G=7
    expect(getChordDescriptor(ni(0, 5, 7))).toBe("sus4");
  });

  it("returns 'sus2' for a sus2 chord (root, major 2nd, perfect 5th)", () => {
    // C sus2: C=0, D=2, G=7
    expect(getChordDescriptor(ni(0, 2, 7))).toBe("sus2");
  });

  it("returns '?' for an unknown quality", () => {
    // Some unusual voicing
    expect(getChordDescriptor(ni(0, 1, 7))).toBe("?");
  });

  it("works with non-zero root", () => {
    // D major: D=2, F#=6, A=9
    expect(getChordDescriptor(ni(2, 6, 9))).toBe("");
    // D minor: D=2, F=5, A=9
    expect(getChordDescriptor(ni(2, 5, 9))).toBe("m");
  });
});

describe("getChordNotes", () => {
  // Build C Ionian mode notes: [0, 2, 4, 5, 7, 9, 11, 12, 14, ...]
  // We need enough notes for 7th chord extraction (degreeIdx + 6)
  const modeNotes = IONIAN.map((interval) => interval as unknown as NoteIndex);

  it("returns 3 notes for a triad", () => {
    const triad = getChordNotes(modeNotes, 0, "triads");
    expect(triad).toHaveLength(3);
    // C E G → indices 0, 2, 4 → values 0, 4, 7
    expect(triad).toEqual(ni(0, 4, 7));
  });

  it("returns 4 notes for a seventh chord", () => {
    const seventh = getChordNotes(modeNotes, 0, "seventhChords");
    expect(seventh).toHaveLength(4);
    // C E G B → indices 0, 2, 4, 6 → values 0, 4, 7, 11
    expect(seventh).toEqual(ni(0, 4, 7, 11));
  });

  it("defaults to triads when chordType is not specified", () => {
    const triad = getChordNotes(modeNotes, 0);
    expect(triad).toHaveLength(3);
  });

  it("extracts from different degree indices", () => {
    // ii chord (D minor): indices 1, 3, 5 → values 2, 5, 9
    const ii = getChordNotes(modeNotes, 1, "triads");
    expect(ii).toEqual(ni(2, 5, 9));
    expect(getChordDescriptor(ii)).toBe("m");
  });
});

describe("getChordNotesInChromaticScale", () => {
  it("maps chord notes to a sparse array with nulls", () => {
    // C major: root=0, 3rd=4, 5th=7
    const result = getChordNotesInChromaticScale(ni(0, 4, 7));
    expect(result).toHaveLength(13);
    expect(result[0]).toBe(0);
    expect(result[4]).toBe(4);
    expect(result[7]).toBe(7);
    // Non-chord positions should be null
    expect(result[1]).toBeNull();
    expect(result[2]).toBeNull();
    expect(result[3]).toBeNull();
    expect(result[5]).toBeNull();
    expect(result[6]).toBeNull();
  });

  it("handles custom chromatic length", () => {
    const result = getChordNotesInChromaticScale(ni(0, 4, 7), 8);
    expect(result).toHaveLength(8);
    expect(result[0]).toBe(0);
    expect(result[4]).toBe(4);
    expect(result[7]).toBe(7);
  });

  it("ignores notes outside the chromatic range", () => {
    // root=10, positions: 0→10, 4→14, 7→17. pos 7 is within range 13.
    // Use a smaller range where some notes fall outside.
    const result = getChordNotesInChromaticScale(ni(10, 14, 17), 5);
    // pos 0→10 (in range), pos 4→14 (in range), pos 7→17 (out of range)
    expect(result[0]).toBe(10);
    expect(result[4]).toBe(14);
    // pos 7 is out of range (array length 5)
    expect(result).toHaveLength(5);
    // 17 at pos 7 is beyond length 5, so no slot for it
  });
});

describe("applyExtensions", () => {
  // Base C major triad: C=0, E=4, G=7
  const cMajor = ni(0, 4, 7);

  it("sus2 replaces the 3rd with the 2nd", () => {
    const result = applyExtensions(cMajor, ["sus2"]);
    expect(result[1]).toBe(2); // D
  });

  it("sus4 replaces the 3rd with the 4th", () => {
    const result = applyExtensions(cMajor, ["sus4"]);
    expect(result[1]).toBe(5); // F
  });

  it("m flattens the 3rd", () => {
    const result = applyExtensions(cMajor, ["m"]);
    expect(result[1]).toBe(3); // Eb
  });

  it("maj restores the major 3rd", () => {
    // Start with a minor-like chord
    const result = applyExtensions(ni(0, 3, 7), ["maj"]);
    expect(result[1]).toBe(4); // E (major 3rd)
  });

  it("dim flattens both 3rd and 5th", () => {
    const result = applyExtensions(cMajor, ["dim"]);
    expect(result[1]).toBe(3); // Eb
    expect(result[2]).toBe(6); // Gb
  });

  it("aug sharpens the 5th", () => {
    const result = applyExtensions(cMajor, ["aug"]);
    expect(result[2]).toBe(8); // G#
  });

  it("7 adds a flat 7th", () => {
    const result = applyExtensions(cMajor, ["7"]);
    expect(result).toHaveLength(4);
    expect(result[3]).toBe(10); // Bb
  });

  it("maj7 adds a major 7th", () => {
    const result = applyExtensions(cMajor, ["maj7"]);
    expect(result).toHaveLength(4);
    expect(result[3]).toBe(11); // B
  });

  it("add9 adds a 9th (=2nd + octave)", () => {
    const result = applyExtensions(cMajor, ["add9"]);
    expect(result).toHaveLength(4);
    expect(result[3]).toBe(14); // D an octave up
  });

  it("9 adds both a major 7th and a 9th", () => {
    const result = applyExtensions(cMajor, ["9"]);
    expect(result).toHaveLength(5);
    expect(result[3]).toBe(11); // B (major 7th)
    expect(result[4]).toBe(14); // D (9th)
  });

  it("does not mutate the original array", () => {
    const original = [...cMajor];
    applyExtensions(cMajor, ["m", "7"]);
    expect(cMajor).toEqual(original);
  });
});

describe("getDisabledExtensions", () => {
  it("returns empty set when nothing is selected", () => {
    const disabled = getDisabledExtensions([]);
    expect(disabled.size).toBe(0);
  });

  it("selecting 'm' disables other 3rd-quality extensions", () => {
    const disabled = getDisabledExtensions(["m"]);
    expect(disabled.has("maj")).toBe(true);
    expect(disabled.has("sus2")).toBe(true);
    expect(disabled.has("sus4")).toBe(true);
    expect(disabled.has("dim")).toBe(true);
    // "m" itself should NOT be disabled
    expect(disabled.has("m" as Extension)).toBe(false);
  });

  it("selecting 'dim' disables both 3rd-group and 5th-group members", () => {
    const disabled = getDisabledExtensions(["dim"]);
    // 3rd group: maj, m, sus2, sus4
    expect(disabled.has("maj")).toBe(true);
    expect(disabled.has("m")).toBe(true);
    expect(disabled.has("sus2")).toBe(true);
    expect(disabled.has("sus4")).toBe(true);
    // 5th group: aug
    expect(disabled.has("aug")).toBe(true);
  });

  it("selecting '7' disables 'maj7' and '9'", () => {
    const disabled = getDisabledExtensions(["7"]);
    expect(disabled.has("maj7")).toBe(true);
    expect(disabled.has("9")).toBe(true);
    expect(disabled.has("7" as Extension)).toBe(false);
  });

  it("selecting 'add9' disables '9'", () => {
    const disabled = getDisabledExtensions(["add9"]);
    expect(disabled.has("9")).toBe(true);
  });

  it("selecting '9' disables '7', 'maj7', and 'add9'", () => {
    const disabled = getDisabledExtensions(["9"]);
    expect(disabled.has("7")).toBe(true);
    expect(disabled.has("maj7")).toBe(true);
    expect(disabled.has("add9")).toBe(true);
  });
});
