// ─── Branded type helper ───────────────────────────────────────────
type Brand<T, B extends string> = T & { readonly __brand: B };

/** Pitch class 0–11 (C = 0, C# = 1, … B = 11). */
export type PitchClass = Brand<number, "PitchClass">;

/** Absolute index into the global `notes` string array. */
export type NoteIndex = Brand<number, "NoteIndex">;

/** Semitone offset from a root (e.g. mode intervals like 0, 2, 4, 5 …). */
export type Interval = Brand<number, "Interval">;

/** Note name with octave, e.g. "C4", "D#3". */
export type NoteName = Brand<string, "NoteName">;

/** Display-only note label without octave, e.g. "C", "Eb". */
export type NoteLabel = string;

// ─── Unions / Enums ────────────────────────────────────────────────

export type ModeName =
  | "Ionian (major)"
  | "Dorian"
  | "Phrygian"
  | "Lydian"
  | "Mixolydian"
  | "Aeolian (natural minor)"
  | "Locrian"
  | "Harmonic Minor"
  | "Melodic Minor";

export type Extension =
  | "maj"
  | "m"
  | "dim"
  | "aug"
  | "sus2"
  | "sus4"
  | "7"
  | "maj7"
  | "add9"
  | "9";

export type ChordQuality = "" | "m" | "\u00b0" | "+" | "sus2" | "sus4" | "?";

export type ChordType = "triads" | "seventhChords";

// ─── Data structures ───────────────────────────────────────────────

export interface ExtensionOption {
  value: Extension;
  label: string;
}

export interface ChordDegree {
  degree: number;
  extensions: Extension[];
}
