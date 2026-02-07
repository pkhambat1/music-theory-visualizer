import type { ChordQuality, ChordType, Extension, NoteIndex } from "../../types";
import { IONIAN, OCTAVE } from "./modes";

// ─── Interval helpers (relative to the Ionian/major scale) ────────

function getSecond(root: NoteIndex): NoteIndex {
  return (IONIAN[1]! + root) as NoteIndex;
}
function getThird(root: NoteIndex): NoteIndex {
  return (IONIAN[2]! + root) as NoteIndex;
}
function getFourth(root: NoteIndex): NoteIndex {
  return (IONIAN[3]! + root) as NoteIndex;
}
function getFifth(root: NoteIndex): NoteIndex {
  return (IONIAN[4]! + root) as NoteIndex;
}
function getSeventh(root: NoteIndex): NoteIndex {
  return (IONIAN[6]! + root) as NoteIndex;
}
function getNinth(root: NoteIndex): NoteIndex {
  return (IONIAN[1]! + root + OCTAVE) as NoteIndex;
}
function flatten(note: NoteIndex): NoteIndex {
  return (note - 1) as NoteIndex;
}
function sharpen(note: NoteIndex): NoteIndex {
  return (note + 1) as NoteIndex;
}

// ─── Public API ────────────────────────────────────────────────────

/**
 * Determine the chord quality from absolute note indices.
 * Compares the 3rd and 5th against the major-scale reference.
 */
export function getChordDescriptor(chordNotes: NoteIndex[]): ChordQuality {
  const root = chordNotes[0]!;
  const thirdDev = chordNotes[1]! - getThird(root);
  const fifthDev = chordNotes[2]! - getFifth(root);

  if (thirdDev === 0 && fifthDev === 0) return "";
  if (thirdDev === -1 && fifthDev === 0) return "m";
  if (thirdDev === -1 && fifthDev === -1) return "\u00b0";
  if (thirdDev === 0 && fifthDev === 1) return "+";
  if (thirdDev === 1 && fifthDev === 0) return "sus4";
  if (thirdDev === -2 && fifthDev === 0) return "sus2";
  return "?";
}

/**
 * Extract chord tones from a mode's note array using stacked-thirds offsets.
 */
export function getChordNotes(
  modeNotes: NoteIndex[],
  degreeIdx: number,
  chordType: ChordType = "triads",
): NoteIndex[] {
  const offsets = chordType === "triads" ? [0, 2, 4] : [0, 2, 4, 6];
  return offsets.map((o) => modeNotes[degreeIdx + o]!);
}

/**
 * Map absolute chord notes into a chromatic-scale-length array
 * (null for positions that aren't part of the chord).
 */
export function getChordNotesInChromaticScale(
  chordNotes: NoteIndex[],
  chromaticLength: number = 13,
): (NoteIndex | null)[] {
  const result: (NoteIndex | null)[] = Array(chromaticLength).fill(null);
  const root = chordNotes[0]!;
  for (const note of chordNotes) {
    const pos = note - root;
    if (pos >= 0 && pos < chromaticLength) {
      result[pos] = note;
    }
  }
  return result;
}

/**
 * Apply chord extensions/alterations to a copy of the chord notes.
 * Extensions modify or add notes relative to the major-scale intervals.
 */
export function applyExtensions(
  chordNotes: NoteIndex[],
  extensions: Extension[],
): NoteIndex[] {
  const root = chordNotes[0]!;
  const result = [...chordNotes];

  if (extensions.includes("sus2"))  result[1] = getSecond(root);
  if (extensions.includes("sus4"))  result[1] = getFourth(root);
  if (extensions.includes("maj7"))  result.push(getSeventh(root));
  if (extensions.includes("7"))     result.push(flatten(getSeventh(root)));
  if (extensions.includes("aug"))   result[2] = sharpen(getFifth(root));
  if (extensions.includes("dim")) {
    result[1] = flatten(getThird(root));
    result[2] = flatten(getFifth(root));
  }
  if (extensions.includes("m"))     result[1] = flatten(getThird(root));
  if (extensions.includes("maj"))   result[1] = getThird(root);
  if (extensions.includes("add9"))  result.push(getNinth(root));
  if (extensions.includes("9")) {
    result.push(getSeventh(root));
    result.push(getNinth(root));
  }

  return result;
}
