import type { NoteIndex } from "../lib/music"
import type { Note } from "../models"
import { IONIAN } from "../lib/music"
import { renderNote } from "./NoteLabel"
import Strikethrough from "./Strikethrough"
import { hueBand } from "../lib/colors"
import { RAINBOW_SCALE, MUTED_TEXT } from "../lib/theme"
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
 * Handles intervals beyond the octave (e.g. 14 → degree index 8 = "9th").
 */
function intervalToDegreeIdx(interval: number): number {
  if (interval >= 0 && interval <= 11) return SEMITONE_TO_DEGREE[interval]!
  if (interval === 12) return 7 // octave
  // Extended: reduce by octave, map within 0-11, then offset past the octave
  const reduced = interval - 12
  if (reduced >= 0 && reduced <= 11) return 7 + SEMITONE_TO_DEGREE[reduced]!
  return 0
}

/**
 * The natural major-scale interval (in semitones) for a degree index.
 * Extends past the octave: index 8 = 9th = 14 semitones, etc.
 */
function naturalInterval(degreeIdx: number): number {
  if (degreeIdx <= 6) return IONIAN[degreeIdx]!
  if (degreeIdx === 7) return 12
  return 12 + IONIAN[degreeIdx - 7]!
}

/** Human-readable base label for a degree index: "1"–"7", "8", "9", … */
function baseDegreeLabel(degreeIdx: number): string {
  return String(degreeIdx + 1)
}

type DegreeChordTone = {
  actualNote: NoteIndex,
  isAltered: boolean,
  isFlat: boolean,
  /** e.g. "1", "♭3", "♯5", "9" */
  degreeLabel: string,
}

type DegreeMapResult = {
  map: Map<number, DegreeChordTone>,
  /** Highest degree index needed (at least 7 for the octave). */
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
    if (degreeIdx > maxDegreeIdx) maxDegreeIdx = degreeIdx
  }

  return { map, maxDegreeIdx }
}

/** Build the major scale as absolute NoteIndex values up to maxDegreeIdx. */
function buildMajorScale(root: NoteIndex, maxDegreeIdx: number): NoteIndex[] {
  return Array.from({ length: maxDegreeIdx + 1 }, (_, i) => root + naturalInterval(i))
}

export type ChordScaleContextProps = {
  chordNotes: NoteIndex[],
  notes: Note[],
}

/**
 * Shows the chord root's major scale with chord tones overlaid.
 *
 * - Unaltered chord tones: bold/bright with a blue highlight
 * - Altered chord tones: major scale note struck-through, actual note below
 * - Non-chord-tone degrees: dimmed
 */
export default function ChordScaleContext({ chordNotes, notes }: ChordScaleContextProps) {
  const isEmpty = chordNotes.length === 0

  const root = isEmpty ? 0 : chordNotes[0]!
  const { map: degreeMap, maxDegreeIdx } = isEmpty
    ? { map: new Map<number, DegreeChordTone>(), maxDegreeIdx: 7 }
    : buildDegreeMap(chordNotes, root)

  // Build scale up to the highest needed degree (extends past octave for 9ths, etc.)
  const majorScale = buildMajorScale(root, maxDegreeIdx)

  // Caption: e.g. "D Major Scale", or a static placeholder when idle
  const rootNote = isEmpty ? undefined : notes[root]
  const caption = rootNote ? `${rootNote.label()} Major Scale` : "Root Major Scale"

  // Generate a subtle gradient band for chord tone cells
  const chordToneCount = degreeMap.size
  const chordToneBand = hueBand(RAINBOW_SCALE, chordToneCount, 0.10, 0.45)
  // Map each degree index that is a chord tone to its band color (in insertion order)
  const chordToneDegrees = [...degreeMap.keys()]
  const chordToneStyle = (degreeIdx: number) => {
    const bandIdx = chordToneDegrees.indexOf(degreeIdx)
    const bg = bandIdx >= 0 ? chordToneBand[bandIdx]! : chordToneBand[0]!
    return { background: bg.formatHex() }
  }

  return (
    <div
      style={{
        opacity: isEmpty ? 0.4 : 1,
      }}
    >
      <NotesArray
        size={majorScale.length}
        caption={caption}
        captionSubtitle={isEmpty ? "Hover a chord to see its scale context" : undefined}
        clipContent={false}
      >
        {majorScale.map((scaleNoteIdx, idx) => {
          const scaleNote = notes[scaleNoteIdx]
          const info = degreeMap.get(idx)

          if (isEmpty) {
            return (
              <NoteCell
                key={idx}
                idx={idx}
                className="text-gray-300 font-normal"
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
                className="text-gray-900 font-semibold"
                style={chordToneStyle(idx)}
                optCaption={info.degreeLabel}
              >
                {scaleNote && renderNote(scaleNote)}
              </NoteCell>
            )
          }

          const alteredNote = notes[info.actualNote]
          const arrow = info.isFlat ? "←" : "→"
          const actual = <span className="text-sm font-semibold text-gray-900">{alteredNote?.label()}</span>
          const natural = (
            <span className={`relative inline-block text-sm ${MUTED_TEXT} font-normal`}>
              {scaleNote?.label()}
              <Strikethrough />
            </span>
          )
          const sep = <span className={`text-[9px] ${MUTED_TEXT}`}>{arrow}</span>
          return (
            <NoteCell key={idx} idx={idx} style={chordToneStyle(idx)} optCaption={info.degreeLabel}>
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
