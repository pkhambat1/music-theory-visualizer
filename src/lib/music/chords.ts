import type { ChordQuality, Extension, NoteIndex } from "../../types"
import { IONIAN, OCTAVE } from "./modes"

// ─── Interval helpers (relative to the Ionian/major scale) ────────

function getSecond(root: NoteIndex): NoteIndex {
  return IONIAN[1]! + root
}
function getThird(root: NoteIndex): NoteIndex {
  return IONIAN[2]! + root
}
function getFourth(root: NoteIndex): NoteIndex {
  return IONIAN[3]! + root
}
function getFifth(root: NoteIndex): NoteIndex {
  return IONIAN[4]! + root
}
function getSeventh(root: NoteIndex): NoteIndex {
  return IONIAN[6]! + root
}
function getSixth(root: NoteIndex): NoteIndex {
  return IONIAN[5]! + root
}
function getNinth(root: NoteIndex): NoteIndex {
  return IONIAN[1]! + root + OCTAVE
}
function getEleventh(root: NoteIndex): NoteIndex {
  return IONIAN[3]! + root + OCTAVE
}
function getThirteenth(root: NoteIndex): NoteIndex {
  return IONIAN[5]! + root + OCTAVE
}
function flatten(note: NoteIndex): NoteIndex {
  return note - 1
}
function sharpen(note: NoteIndex): NoteIndex {
  return note + 1
}

// ─── Public API ────────────────────────────────────────────────────

/**
 * Determine the chord quality from absolute note indices.
 * Compares the 3rd and 5th against the major-scale reference.
 */
export function getChordDescriptor(chordNotes: NoteIndex[]): ChordQuality {
  const root = chordNotes[0]!
  const thirdDev = chordNotes[1]! - getThird(root)
  const fifthDev = chordNotes[2]! - getFifth(root)

  if (thirdDev === 0 && fifthDev === 0) return ""
  if (thirdDev === -1 && fifthDev === 0) return "m"
  if (thirdDev === -1 && fifthDev === -1) return "°"
  if (thirdDev === 0 && fifthDev === 1) return "+"
  if (thirdDev === 1 && fifthDev === 0) return "sus4"
  if (thirdDev === -2 && fifthDev === 0) return "sus2"
  return "?"
}

/**
 * Extract chord tones from a mode's note array using stacked-thirds offsets.
 */
export function getChordNotes(
  modeNotes: NoteIndex[],
  degreeIdx: number,
  chordType: "triads" | "seventhChords" = "triads",
): NoteIndex[] {
  const offsets = chordType === "seventhChords" ? [0, 2, 4, 6] : [0, 2, 4]
  return offsets.map((o) => modeNotes[degreeIdx + o]!)
}

// ─── Extension conflict rules ───────────────────────────────────────

/**
 * Mutual exclusion groups: selecting any member disables the rest of its group.
 * An extension can appear in multiple groups (e.g. dim spans 3rd + 5th).
 *
 * - 3rd quality:  maj, m, sus2, sus4, dim — all write to the 3rd slot
 * - 5th quality:  aug, dim — both write to the 5th slot
 * - 7th type:     7, maj7, 9, maj9, 11, 13 — compound chords imply a 7th
 * - 9th type:     add9, 9, maj9, 11, 13 — compound chords imply a 9th
 * - 4th vs sus4:  add4, sus4 — both target the 4th
 * - 2nd vs sus2:  add2, sus2 — both target the 2nd
 * - 6th vs 13th:  6, 13 — 13 implies the 6th
 */
const EXCLUSION_GROUPS: Extension[][] = [
  ["maj", "m", "sus2", "sus4", "dim"],
  ["aug", "dim"],
  ["7", "maj7", "9", "maj9", "11", "13"],
  ["add9", "9", "maj9", "11", "13"],
  ["add4", "sus4"],
  ["add2", "sus2"],
  ["6", "13"],
]

/**
 * Given the currently selected extensions, return the set of extensions
 * that should be disabled (greyed out) because they conflict.
 */
export function getDisabledExtensions(
  selected: Extension[],
): Set<Extension> {
  const disabled = new Set<Extension>()
  for (const group of EXCLUSION_GROUPS) {
    const active = group.filter((ext) => selected.includes(ext))
    if (active.length > 0) {
      for (const ext of group) {
        if (!active.includes(ext)) disabled.add(ext)
      }
    }
  }
  return disabled
}

/**
 * Apply chord extensions/alterations to a copy of the chord notes.
 * Extensions modify or add notes relative to the major-scale intervals.
 */
export function applyExtensions(
  chordNotes: NoteIndex[],
  extensions: Extension[],
): NoteIndex[] {
  const root = chordNotes[0]!

  // Collect per-index replacements from all extensions
  const replacements = new Map<number, NoteIndex>()
  for (const ext of extensions) {
    switch (ext) {
      case "sus2":  replacements.set(1, getSecond(root)); break
      case "sus4":  replacements.set(1, getFourth(root)); break
      case "m":     replacements.set(1, flatten(getThird(root))); break
      case "maj":   replacements.set(1, getThird(root)); break
      case "dim":
        replacements.set(1, flatten(getThird(root)))
        replacements.set(2, flatten(getFifth(root)))
        break
      case "aug":   replacements.set(2, sharpen(getFifth(root))); break
    }
  }

  // Apply replacements via map
  const base = chordNotes.map((note, i) => replacements.get(i) ?? note)

  // Collect added tones from all extensions
  const added = extensions.flatMap((ext): NoteIndex[] => {
    switch (ext) {
      case "7":     return [flatten(getSeventh(root))]
      case "maj7":  return [getSeventh(root)]
      case "6":     return [getSixth(root)]
      case "add2":  return [getSecond(root)]
      case "add4":  return [getFourth(root)]
      case "add9":  return [getNinth(root)]
      case "9":     return [flatten(getSeventh(root)), getNinth(root)]
      case "maj9":  return [getSeventh(root), getNinth(root)]
      case "11":    return [flatten(getSeventh(root)), getNinth(root), getEleventh(root)]
      case "13":    return [flatten(getSeventh(root)), getNinth(root), getEleventh(root), getThirteenth(root)]
      default:      return []
    }
  })

  return [...base, ...added]
}

/**
 * Get the bass note for a slash chord.
 * Finds the note at `bassDegreeIdx` in the mode and walks it down
 * until it's below the chord root.
 */
export function getSlashBassNote(
  modeNotes: NoteIndex[],
  chordDegreeIdx: number,
  bassDegreeIdx: number,
): NoteIndex | null {
  const chordRoot = modeNotes[chordDegreeIdx]
  const bassNote = modeNotes[bassDegreeIdx]
  if (chordRoot === undefined || bassNote === undefined) return null
  let bass = bassNote
  while (bass >= chordRoot) {
    bass -= OCTAVE
  }
  return bass
}

/**
 * Build a slash chord voicing: bass note at the bottom, remaining chord
 * tones above it (removing the duplicate pitch class if the bass note
 * is already in the chord).
 */
export function buildSlashChordVoicing(
  chordNotes: NoteIndex[],
  modeNotes: NoteIndex[],
  chordDegreeIdx: number,
  bassDegreeIdx: number,
): NoteIndex[] {
  const chordRoot = modeNotes[chordDegreeIdx]
  const bassRaw = modeNotes[bassDegreeIdx]
  if (chordRoot === undefined || bassRaw === undefined) return chordNotes

  let bass = bassRaw
  while (bass >= chordRoot) bass -= OCTAVE

  const bassPc = ((bass % OCTAVE) + OCTAVE) % OCTAVE

  // Place each remaining note in the octave directly above the bass
  // for close voicing (e.g. C/E → E3, G3, C4 not E3, C4, G4)
  const remaining = chordNotes
    .filter((n) => ((n % OCTAVE) + OCTAVE) % OCTAVE !== bassPc)
    .map((n) => {
      let adj = n
      while (adj <= bass) adj += OCTAVE
      while (adj > bass + OCTAVE) adj -= OCTAVE
      return adj
    })
    .sort((a, b) => a - b)

  return [bass, ...remaining]
}
