import type { NoteIndex, NoteName } from "../types";
import { IONIAN } from "../lib/music/modes";
import { renderNote } from "../lib/notes";
import NoteCell from "./NoteCell";
import NotesArray from "./NotesArray";
import { rainbowBand, BAND_SCALE } from "../lib/colors";

// ─── Helpers ────────────────────────────────────────────────────────

/** Strip the trailing octave digit from a note name, e.g. "F#3" → "F#". */
function stripOctave(name: string): string {
  return /\d$/.test(name) ? name.slice(0, -1) : name;
}

/**
 * Maps a semitone interval (0-11) to its major-scale degree index (0-6).
 *
 *   0→0  1→1  2→1  3→2  4→2  5→3  6→4  7→4  8→4  9→5  10→6  11→6
 *
 * This correctly assigns chromatic intervals to their parent scale degree,
 * e.g. a minor 3rd (3 semitones) maps to degree 2 (the "3rd"), not the 2nd.
 */
const SEMITONE_TO_DEGREE = [0, 1, 1, 2, 2, 3, 4, 4, 4, 5, 6, 6] as const;

/**
 * Map a semitone interval from the root to its degree index.
 * Handles intervals beyond the octave (e.g. 14 → degree index 8 = "9th").
 */
function intervalToDegreeIdx(interval: number): number {
  if (interval >= 0 && interval <= 11) return SEMITONE_TO_DEGREE[interval]!;
  if (interval === 12) return 7; // octave
  // Extended: reduce by octave, map within 0-11, then offset past the octave
  const reduced = interval - 12;
  if (reduced >= 0 && reduced <= 11) return 7 + SEMITONE_TO_DEGREE[reduced]!;
  return 0;
}

/**
 * The natural major-scale interval (in semitones) for a degree index.
 * Extends past the octave: index 8 = 9th = 14 semitones, etc.
 */
function naturalInterval(degreeIdx: number): number {
  if (degreeIdx <= 6) return IONIAN[degreeIdx]! as number;
  if (degreeIdx === 7) return 12;
  return 12 + (IONIAN[degreeIdx - 7]! as number);
}

/** Human-readable base label for a degree index: "1"–"7", "8", "9", … */
function baseDegreeLabel(degreeIdx: number): string {
  return String(degreeIdx + 1);
}

interface DegreeChordTone {
  actualNote: NoteIndex;
  isAltered: boolean;
  isFlat: boolean;
  /** e.g. "1", "♭3", "♯5", "9" */
  degreeLabel: string;
}

interface DegreeMapResult {
  map: Map<number, DegreeChordTone>;
  /** Highest degree index needed (at least 7 for the octave). */
  maxDegreeIdx: number;
}

/**
 * Build a map from scale-degree index → chord tone info.
 * Each chord note is assigned to its correct degree based on its raw interval
 * from the root — intervals beyond the octave get their own extended degree
 * (e.g. the 9th at index 8) rather than being folded back via modulo.
 */
function buildDegreeMap(
  chordNotes: NoteIndex[],
  root: NoteIndex,
): DegreeMapResult {
  const map = new Map<number, DegreeChordTone>();
  let maxDegreeIdx = 7; // always show at least through the octave

  for (const chordNote of chordNotes) {
    const interval = chordNote - root;
    const degreeIdx = intervalToDegreeIdx(interval);
    const natural = naturalInterval(degreeIdx);
    const isAltered = interval !== natural;
    const isFlat = interval < natural;

    let degreeLabel = baseDegreeLabel(degreeIdx);
    if (isAltered) {
      const prefix = isFlat ? "♭" : "♯";
      degreeLabel = `${prefix}${degreeLabel}`;
    }

    map.set(degreeIdx, { actualNote: chordNote, isAltered, isFlat, degreeLabel });
    if (degreeIdx > maxDegreeIdx) maxDegreeIdx = degreeIdx;
  }

  return { map, maxDegreeIdx };
}

/** Build the major scale as absolute NoteIndex values up to maxDegreeIdx. */
function buildMajorScale(root: NoteIndex, maxDegreeIdx: number): NoteIndex[] {
  return Array.from({ length: maxDegreeIdx + 1 }, (_, i) =>
    (root + naturalInterval(i)) as NoteIndex,
  );
}

// ─── Component ──────────────────────────────────────────────────────

export interface ChordScaleContextProps {
  chordNotes: NoteIndex[];
  notes: NoteName[];
  squareSidePx: number;
}

/**
 * Shows the chord root's major scale with chord tones overlaid.
 *
 * - Unaltered chord tones: bold/bright with a blue highlight
 * - Altered chord tones: major scale note struck-through, actual note below
 * - Non-chord-tone degrees: dimmed
 */
export default function ChordScaleContext({
  chordNotes,
  notes,
  squareSidePx,
}: ChordScaleContextProps) {
  const isEmpty = chordNotes.length === 0;

  const root = isEmpty ? (0 as NoteIndex) : chordNotes[0]!;
  const { map: degreeMap, maxDegreeIdx } = isEmpty
    ? { map: new Map<number, DegreeChordTone>(), maxDegreeIdx: 7 }
    : buildDegreeMap(chordNotes, root);

  // Build scale up to the highest needed degree (extends past octave for 9ths, etc.)
  const majorScale = buildMajorScale(root, maxDegreeIdx);

  // Caption: e.g. "D Major Scale", or a static placeholder when idle
  const rootName = isEmpty ? undefined : notes[root];
  const caption = rootName
    ? `${stripOctave(rootName)} Major Scale`
    : "Root Major Scale";

  // Generate a subtle gradient band for chord tone cells
  const chordToneCount = degreeMap.size;
  const chordToneBand = rainbowBand(BAND_SCALE, chordToneCount);
  // Map each degree index that is a chord tone to its band color (in insertion order)
  const chordToneDegrees = [...degreeMap.keys()];
  const chordToneStyle = (degreeIdx: number) => {
    const bandIdx = chordToneDegrees.indexOf(degreeIdx);
    const bg = bandIdx >= 0 ? chordToneBand[bandIdx]! : chordToneBand[0]!;
    return { background: bg };
  };

  return (
    <div
      style={{
        opacity: isEmpty ? 0.4 : 1,
      }}
    >
      <NotesArray
        squareSidePx={squareSidePx}
        size={majorScale.length}
        caption={caption}
        captionSubtitle={isEmpty ? "Hover a chord to see its scale context" : undefined}
      >
        {majorScale.map((scaleNote, idx) => {
          const scaleNoteName = notes[scaleNote] ?? "";
          const info = degreeMap.get(idx);

          // ── Empty state: ghost cells ──
          if (isEmpty) {
            return (
              <NoteCell
                key={idx}
                idx={idx}
                squareSidePx={squareSidePx}
                className="text-gray-300 font-normal"
                style={{
                  background: "transparent",
                }}
              />
            );
          }

          // ── Non-chord-tone scale degree ──
          if (!info) {
            return (
              <NoteCell
                key={idx}
                idx={idx}
                squareSidePx={squareSidePx}
                className="text-gray-400 font-normal"
              >
                {renderNote(scaleNoteName)}
              </NoteCell>
            );
          }

          // ── Unaltered chord tone ──
          if (!info.isAltered) {
            return (
              <NoteCell
                key={idx}
                idx={idx}
                squareSidePx={squareSidePx}
                className="text-gray-900 font-semibold"
                style={chordToneStyle(idx)}
                optCaption={info.degreeLabel}
              >
                {renderNote(scaleNoteName)}
              </NoteCell>
            );
          }

          // ── Altered chord tone ──
          const alteredNoteName = notes[info.actualNote] ?? "";
          const arrow = info.isFlat ? "←" : "→";
          return (
            <NoteCell
              key={idx}
              idx={idx}
              squareSidePx={squareSidePx}
              style={chordToneStyle(idx)}
              optCaption={info.degreeLabel}
            >
              <div className="flex items-center gap-[2px] leading-none">
                {info.isFlat ? (
                  <>
                    <span className="text-[12px] font-semibold text-gray-900">
                      {stripOctave(alteredNoteName)}
                    </span>
                    <span className="text-[9px] text-gray-400">{arrow}</span>
                    <span className="text-[10px] text-gray-400 line-through">
                      {stripOctave(scaleNoteName)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] text-gray-400 line-through">
                      {stripOctave(scaleNoteName)}
                    </span>
                    <span className="text-[9px] text-gray-400">{arrow}</span>
                    <span className="text-[12px] font-semibold text-gray-900">
                      {stripOctave(alteredNoteName)}
                    </span>
                  </>
                )}
              </div>
            </NoteCell>
          );
        })}
      </NotesArray>
    </div>
  );
}
