import type { NoteIndex, NoteRef } from "../lib/music"
import type { Note } from "../models"
import { IONIAN, SQUARE_SIDE } from "../lib/music"
import { renderNote } from "./NoteLabel"
import Strikethrough from "./Strikethrough"
import { scaleToneBand, MUTED_TEXT } from "../lib/theme"
import NoteCell from "./NoteCell"
import NotesArray from "./NotesArray"

/**
 * Maps a semitone interval (0-11) to its major-scale degree index (0-6).
 *
 *   0→0  1→1  2→1  3→2  4→2  5→3  6→4  7→4  8→4  9→5  10→6  11→6
 *
 * This correctly assigns chromatic intervals to their parent scale degree,
 * e.g. a minor 3rd (3 semitones) maps to degree 2 (the "3rd"), not the 2nd.
 */
const SEMITONE_TO_DEGREE = [0, 1, 1, 2, 2, 3, 4, 4, 4, 5, 6, 6] as const

/**
 * Map a semitone interval from the root to its degree index.
 * Handles intervals beyond the octave (e.g. 14 → degree index 8 = "9th")
 * and negative intervals (bass notes below the root, e.g. -5 → degree -3 = "5th below").
 */
function intervalToDegreeIdx(interval: number): number {
  if (interval >= 0 && interval <= 11) return SEMITONE_TO_DEGREE[interval]!
  if (interval === 12) return 7 // octave
  // Extended above octave
  const reduced = interval - 12
  if (reduced >= 0 && reduced <= 11) return 7 + SEMITONE_TO_DEGREE[reduced]!
  // Below root (negative interval) — map into previous octave
  if (interval < 0) {
    const positive = interval + 12
    if (positive >= 0 && positive <= 11) return SEMITONE_TO_DEGREE[positive]! - 7
  }
  return 0
}

/**
 * The natural major-scale interval (in semitones) for a degree index.
 * Extends past the octave: index 8 = 9th = 14 semitones, etc.
 * Extends below root: index -3 = 5th below = -5 semitones, etc.
 */
function naturalInterval(degreeIdx: number): number {
  if (degreeIdx >= 0 && degreeIdx <= 6) return IONIAN[degreeIdx]!
  if (degreeIdx === 7) return 12
  if (degreeIdx > 7) return 12 + IONIAN[degreeIdx - 7]!
  // Negative degrees (below root)
  return IONIAN[degreeIdx + 7]! - 12
}

/** Human-readable base label for a degree index: "1"–"7", "8", "9", …; negative wraps: -3 → "5" */
function baseDegreeLabel(degreeIdx: number): string {
  if (degreeIdx >= 0) return String(degreeIdx + 1)
  return String(degreeIdx + 8)
}

/**
 * A single chord tone positioned within the major scale.
 * Describes how a chord note relates to the natural major-scale degree it
 * occupies — whether it matches exactly or is chromatically altered.
 */
type DegreeChordTone = {
  /** Absolute index into the global `notes` array for the sounding pitch. */
  actualNote: NoteIndex,
  /** True when the chord tone differs from the natural major-scale interval (e.g. ♭3 in a minor chord). */
  isAltered: boolean,
  /** When altered, true if the tone is lowered (♭), false if raised (♯). */
  isFlat: boolean,
  /** Human-readable label with accidental prefix when altered. e.g. "1", "♭3", "♯5", "9". */
  degreeLabel: string,
}

/**
 * Result of mapping a set of chord tones onto major-scale degrees.
 * Only degrees that are present in the chord have entries — absent degrees
 * render as muted/uncolored cells in the UI.
 */
type DegreeMapResult = {
  /** Degree index (0-based) → chord tone info. Only populated for degrees present in the chord. */
  map: Map<number, DegreeChordTone>,
  /** Lowest degree index (0 when no bass notes below root, negative otherwise). */
  minDegreeIdx: number,
  /** Highest degree index needed (at least 7 for the octave). Drives how many cells to render. */
  maxDegreeIdx: number,
}

/**
 * Build a map from scale-degree index → chord tone info.
 * Each chord note is assigned to its correct degree based on its raw interval
 * from the root — intervals beyond the octave get their own extended degree
 * (e.g. the 9th at index 8) rather than being folded back via modulo.
 */
function buildDegreeMap(chordNotes: NoteIndex[], root: NoteIndex): DegreeMapResult {
  const map = new Map<number, DegreeChordTone>()
  let minDegreeIdx = 0
  let maxDegreeIdx = 7 // always show at least through the octave

  for (const chordNote of chordNotes) {
    const interval = chordNote - root
    const degreeIdx = intervalToDegreeIdx(interval)
    const natural = naturalInterval(degreeIdx)
    const isAltered = interval !== natural
    const isFlat = interval < natural

    let degreeLabel = baseDegreeLabel(degreeIdx)
    if (isAltered) {
      const prefix = isFlat ? "♭" : "♯"
      degreeLabel = `${prefix}${degreeLabel}`
    }

    map.set(degreeIdx, { actualNote: chordNote, isAltered, isFlat, degreeLabel })
    if (degreeIdx < minDegreeIdx) minDegreeIdx = degreeIdx
    if (degreeIdx > maxDegreeIdx) maxDegreeIdx = degreeIdx
  }

  return { map, minDegreeIdx, maxDegreeIdx }
}

/** Build the major scale as absolute NoteIndex values from minDegreeIdx to maxDegreeIdx. */
function buildMajorScale(root: NoteIndex, minDegreeIdx: number, maxDegreeIdx: number): NoteIndex[] {
  return Array.from(
    { length: maxDegreeIdx - minDegreeIdx + 1 },
    (_, i) => root + naturalInterval(minDegreeIdx + i),
  )
}

export type ChordMajorScaleRowProps = {
  chordNotes: NoteRef[],
  chordRootIndex: NoteIndex | null,
  notes: Note[],
}

/**
 * Shows the chord root's major scale with chord tones overlaid.
 *
 * - Unaltered chord tones: bold/bright with a blue highlight
 * - Altered chord tones: major scale note struck-through, actual note below
 * - Non-chord-tone degrees: dimmed
 */
export default function ChordMajorScaleRow({ chordNotes, chordRootIndex, notes }: ChordMajorScaleRowProps) {
  const isEmpty = chordNotes.length === 0

  const chordIndices = isEmpty ? [] : chordNotes.map((r) => r.index)
  const root = chordRootIndex ?? (isEmpty ? 0 : chordIndices[0]!)
  const { map: degreeMap, minDegreeIdx, maxDegreeIdx } = isEmpty
    ? { map: new Map<number, DegreeChordTone>(), minDegreeIdx: 0, maxDegreeIdx: 7 }
    : buildDegreeMap(chordIndices, root)

  // Build scale from lowest needed degree to highest (extends left for bass, right for 9ths, etc.)
  const majorScale = buildMajorScale(root, minDegreeIdx, maxDegreeIdx)

  // Caption: e.g. "D Major Scale", or a static placeholder when idle
  const rootNote = isEmpty ? undefined : notes[root]
  const caption = rootNote ? `${rootNote.label()} Major Scale` : "Root Major Scale"

  // Generate a subtle gradient band for chord tone cells
  const chordToneCount = degreeMap.size
  const chordToneBand = scaleToneBand(chordToneCount)
  const chordToneDegrees = [...degreeMap.keys()]
  const chordToneBg = (degreeIdx: number): string => {
    const bandIdx = chordToneDegrees.indexOf(degreeIdx)
    return bandIdx >= 0 ? chordToneBand[bandIdx]! : chordToneBand[0]!
  }

  return (
    <div
      style={{
        opacity: isEmpty ? 0.4 : 1,
      }}
    >
      <NotesArray
        size={majorScale.length}
        cellWidth={SQUARE_SIDE}
        caption={caption}
        captionSubtitle={isEmpty ? "Hover a chord to see its scale context" : undefined}
        clipContent={false}
      >
        {majorScale.map((scaleNoteIdx, idx) => {
          const degreeIdx = minDegreeIdx + idx
          const scaleNote = notes[scaleNoteIdx]
          const info = degreeMap.get(degreeIdx)

          if (isEmpty) {
            return (
              <NoteCell
                key={idx}
                idx={idx}
                className="text-[var(--app-textDisabled)] font-normal"
                style={{
                  background: "transparent",
                }}
              />
            )
          }

          if (!info) {
            return (
              <NoteCell key={idx} idx={idx} className={`${MUTED_TEXT} font-normal`}>
                {scaleNote && renderNote(scaleNote)}
              </NoteCell>
            )
          }

          if (!info.isAltered) {
            return (
              <NoteCell
                key={idx}
                idx={idx}
                className="font-semibold"
                optBackground={chordToneBg(degreeIdx)}
                optCaption={info.degreeLabel}
              >
                {scaleNote && renderNote(scaleNote)}
              </NoteCell>
            )
          }

          const alteredNote = notes[info.actualNote]
          const arrow = info.isFlat ? "←" : "→"
          const actual = <span className="text-sm font-semibold">{alteredNote?.label()}</span>
          const natural = (
            <span className={`relative inline-block text-sm ${MUTED_TEXT} font-normal`}>
              {scaleNote?.label()}
              <Strikethrough />
            </span>
          )
          const sep = <span className={`text-[9px] ${MUTED_TEXT}`}>{arrow}</span>
          return (
            <NoteCell key={idx} idx={idx} optBackground={chordToneBg(degreeIdx)} optCaption={info.degreeLabel}>
              <div className="flex items-center gap-[2px] leading-none">
                {info.isFlat ? <>{actual}{sep}{natural}</> : <>{natural}{sep}{actual}</>}
              </div>
            </NoteCell>
          )
        })}
      </NotesArray>
    </div>
  )
}
