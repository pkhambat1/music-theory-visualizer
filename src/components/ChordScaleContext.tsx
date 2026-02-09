import type { NoteIndex, NoteName } from "../types";
import { IONIAN } from "../lib/music/modes";
import { renderNote } from "../lib/notes";
import NoteCell from "./NoteCell";
import NotesArray from "./NotesArray";

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

    let degreeLabel = baseDegreeLabel(degreeIdx);
    if (isAltered) {
      const prefix = interval < natural ? "♭" : "♯";
      degreeLabel = `${prefix}${degreeLabel}`;
    }

    map.set(degreeIdx, { actualNote: chordNote, isAltered, degreeLabel });
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
 * - Unaltered chord tones: bold/bright with a cyan highlight
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

  const CHORD_TONE_STYLE = {
    background: "rgba(34, 211, 238, 0.1)",
    border: "1px solid rgba(34, 211, 238, 0.3)",
  };

  return (
    <div
      style={{
        transition: "opacity 200ms ease, transform 200ms ease",
        opacity: isEmpty ? 0.4 : 1,
        transform: isEmpty ? "translateY(4px)" : "translateY(0)",
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
                className="text-slate-700 font-normal"
                style={{
                  border: "1px dashed rgba(255, 255, 255, 0.06)",
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
                className="text-slate-600 font-normal"
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
                className="text-slate-100 font-semibold"
                style={CHORD_TONE_STYLE}
                optCaption={info.degreeLabel}
              >
                {renderNote(scaleNoteName)}
              </NoteCell>
            );
          }

          // ── Altered chord tone ──
          const alteredNoteName = notes[info.actualNote] ?? "";
          return (
            <NoteCell
              key={idx}
              idx={idx}
              squareSidePx={squareSidePx}
              style={CHORD_TONE_STYLE}
              optCaption={info.degreeLabel}
            >
              <div className="flex flex-col items-center gap-0 leading-none">
                <span className="relative text-[9px] text-slate-500">
                  {stripOctave(scaleNoteName)}
                  <span className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
                    <span className="block h-px w-[140%] bg-slate-300 rotate-[-45deg]" />
                  </span>
                </span>
                <span className="text-[13px] font-semibold text-emerald-400">
                  {stripOctave(alteredNoteName)}
                </span>
              </div>
            </NoteCell>
          );
        })}
      </NotesArray>
    </div>
  );
}
