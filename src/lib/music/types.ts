/** Pitch class 0–11 (C = 0, C# = 1, … B = 11). */
export type PitchClass = number

/** Absolute index into the global `notes` array. */
export type NoteIndex = number

/** Semitone offset from a root (e.g. mode intervals like 0, 2, 4, 5 …). */
export type Interval = number

/** One of the 7 natural note letters. */
export type Letter = "C" | "D" | "E" | "F" | "G" | "A" | "B"

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
  | "9"
  | "6"
  | "add2"
  | "add4"
  | "maj9"
  | "11"
  | "13"

export type ChordQuality = "" | "m" | "°" | "+" | "sus2" | "sus4" | "?"

export type ChordType = "triads" | "seventhChords"

export type ExtensionOption = {
  value: Extension,
  label: string,
}

export type ChordDegreeState = {
  extensions: Extension[],
  slashBass: number | null,
}

export type ModeDataProps = {
  modeNotesWithOverflow: NoteIndex[],
  modeLeftOverflowSize: number,
}
