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
): NoteIndex[] {
  return [0, 2, 4].map((o) => modeNotes[degreeIdx + o]!)
}

// ─── Extension conflict rules ───────────────────────────────────────

/**
 * Mutual exclusion groups: selecting any member disables the rest of its group.
 * - 3rd quality: maj, m, sus2, sus4, dim (all write to the 3rd slot)
 * - 5th quality: aug, dim (both write to the 5th slot; dim spans both groups)
 * - 7th type:    7, maj7, 9 (9 implies a 7th)
 * - 9th type:    add9, 9 (9 implies a 9th)
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
  const result = [...chordNotes]

  for (const ext of extensions) {
    switch (ext) {
      case "sus2":  result[1] = getSecond(root); break
      case "sus4":  result[1] = getFourth(root); break
      case "m":     result[1] = flatten(getThird(root)); break
      case "maj":   result[1] = getThird(root); break
      case "dim":
        result[1] = flatten(getThird(root))
        result[2] = flatten(getFifth(root))
        break
      case "aug":   result[2] = sharpen(getFifth(root)); break
      case "7":     result.push(flatten(getSeventh(root))); break
      case "maj7":  result.push(getSeventh(root)); break
      case "6":     result.push(getSixth(root)); break
      case "add2":  result.push(getSecond(root)); break
      case "add4":  result.push(getFourth(root)); break
      case "add9":  result.push(getNinth(root)); break
      case "9":
        result.push(flatten(getSeventh(root)))
        result.push(getNinth(root))
        break
      case "maj9":
        result.push(getSeventh(root))
        result.push(getNinth(root))
        break
      case "11":
        result.push(flatten(getSeventh(root)))
        result.push(getNinth(root))
        result.push(getEleventh(root))
        break
      case "13":
        result.push(flatten(getSeventh(root)))
        result.push(getNinth(root))
        result.push(getEleventh(root))
        result.push(getThirteenth(root))
        break
    }
  }

  return result
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
