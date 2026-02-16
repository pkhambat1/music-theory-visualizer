import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import type {
  ChordHighlightPair,
  Extension,
  ExtensionOption,
  Interval,
  ModeName,
  NoteIndex,
  NoteName,
} from "../types";
import { CHROMATIC_SCALE, generateOctaves, renderNote } from "../lib/notes";
import { playNote } from "../lib/audio";
import { MODES } from "../lib/music/modes";
import {
  addOverflowToModeIntervals,
  BASE_SCALE_LEFT_OVERFLOW_SIZE,
  BASE_SCALE_WITH_OVERFLOW_SIZE,
  buildModeNotesWithOverflow,
  getModeLeftOverflowSize,
  modeIntervalsToMode,
} from "../lib/music/scale";
import { spellModeNotes } from "../lib/music/spelling";
import { colors } from "../lib/colors";

import Tag from "./ui/Tag";
import Dropdown from "./ui/Dropdown";
import NotesArray from "./NotesArray";
import NoteCell from "./NoteCell";
import ModeNoteCell from "./ModeNoteCell";
import LineGroup from "./LineGroup";
import HoverLines from "./HoverLines";
import DiatonicScaleDegreesRow from "./DiatonicScaleDegreesRow";
import type { ChordHoverData } from "./DiatonicScaleDegreesRow";
import ChordScaleContext from "./ChordScaleContext";

// ─── Constants ─────────────────────────────────────────────────────

const SQUARE_SIDE = 60;
const DEFAULT_ROOT_NOTE = "C3" as NoteName;
export const notes: NoteName[] = generateOctaves(6);

const EXTENSION_OPTIONS: ExtensionOption[] = [
  { value: "maj", label: "maj" },
  { value: "m", label: "m" },
  { value: "dim", label: "dim" },
  { value: "aug", label: "aug" },
  { value: "sus2", label: "sus2" },
  { value: "sus4", label: "sus4" },
  { value: "7", label: "7" },
  { value: "maj7", label: "maj7" },
  { value: "add9", label: "add9" },
  { value: "9", label: "9" },
];

const MODE_ITEMS = Object.keys(MODES).map((mode) => ({
  key: mode,
  label: mode,
}));

const HIGHLIGHTED_BASE_STYLE = (color: string) => ({
  border: `2px solid ${color}`,
});

const MODE_DESCRIPTIONS: Record<ModeName, string> = {
  "Ionian (major)": "The natural major scale \u2014 bright and resolved",
  "Dorian": "Minor with a raised 6th \u2014 jazzy and warm",
  "Phrygian": "Minor with a flat 2nd \u2014 dark and Spanish-flavored",
  "Lydian": "Major with a raised 4th \u2014 dreamy and floating",
  "Mixolydian": "Major with a flat 7th \u2014 bluesy and dominant",
  "Aeolian (natural minor)": "The natural minor scale \u2014 sad and introspective",
  "Locrian": "Diminished \u2014 unstable and dissonant",
  "Harmonic Minor": "Minor with a raised 7th \u2014 exotic and dramatic",
  "Melodic Minor": "Minor with raised 6th and 7th \u2014 smooth and jazzy",
};

// ─── Component ─────────────────────────────────────────────────────

export default function VisualizerPanel() {
  // Three color roles — D3 categorical palette (imported from d3-scale-chromatic)



  const [selectedMode, setSelectedMode] = useState<ModeName>("Ionian (major)");
  const [rootNote, setRootNote] = useState<NoteName>(DEFAULT_ROOT_NOTE);
  const [arpeggiate, setArpeggiate] = useState(false);

  const modeIntervals = useMemo(
    () => MODES[selectedMode] ?? ([] as Interval[]),
    [selectedMode],
  );

  const modeWithOverflowIntervalsRef = useRef(
    addOverflowToModeIntervals(modeIntervals),
  );
  const modeLeftOverflowSize = getModeLeftOverflowSize(modeIntervals);

  useEffect(() => {
    modeWithOverflowIntervalsRef.current =
      addOverflowToModeIntervals(modeIntervals);
    setModeNotesWithOverflow(
      modeIntervalsToMode(
        rootNote,
        modeWithOverflowIntervalsRef.current,
        notes,
      ),
    );
  }, [rootNote, modeIntervals]);

  const [modeNotesWithOverflow, setModeNotesWithOverflow] = useState<
    NoteIndex[]
  >(() => buildModeNotesWithOverflow(rootNote, modeIntervals, notes));

  // ── Hover / chord state ──────────────────────────────────────────

  interface HoverState {
    index: number | null;
    original: NoteIndex[];
    modified: NoteIndex[];
  }

  const [hoverState, setHoverState] = useState<HoverState>({
    index: null,
    original: [],
    modified: [],
  });

  const hoveredTriadIndex = hoverState.index;
  const originalHoverNotes = hoverState.original;
  const modifiedHoverNotes = hoverState.modified;
  const hoveredChordNotes = hoverState.modified;

  const setHoveredTriadIndex = useCallback((idx: number | null) => {
    if (idx === null) {
      setHoverState({ index: null, original: [], modified: [] });
    } else {
      setHoverState((prev) => ({ ...prev, index: idx }));
    }
  }, []);

  const handlePlayNote = useCallback(
    (val: string) => playNote(val),
    [],
  );

  const spelledModeNotes = useMemo(
    () => spellModeNotes(modeNotesWithOverflow, modeLeftOverflowSize, notes),
    [modeNotesWithOverflow, modeLeftOverflowSize],
  );

  const handleChordHoverChange = useCallback((data: ChordHoverData) => {
    if (data?.original) {
      setHoverState((prev) => ({
        ...prev,
        original: data.original,
        modified: data.modified,
      }));
    } else {
      setHoverState((prev) => ({
        ...prev,
        original: [],
        modified: [],
      }));
    }
  }, []);

  // ── Keen Slider ──────────────────────────────────────────────────

  const [sliderRef, sliderInstanceRef] = useKeenSlider({
    slides: {
      perView: BASE_SCALE_WITH_OVERFLOW_SIZE,
    },
    defaultAnimation: { duration: 125 },
    initial:
      notes.indexOf(DEFAULT_ROOT_NOTE) - BASE_SCALE_LEFT_OVERFLOW_SIZE,
    slideChanged(s) {
      const rootIndex =
        s.track.details.abs + BASE_SCALE_LEFT_OVERFLOW_SIZE;
      setRootNote(notes[rootIndex]!);
    },
  });

  // ── Extensions ───────────────────────────────────────────────────

  const [selectedExtensions, setSelectedExtensions] = useState<Extension[][]>(
    Array.from({ length: modeIntervals.length }, () => []),
  );

  useEffect(() => {
    setSelectedExtensions((prev) =>
      Array.from(
        { length: modeIntervals.length },
        (_, idx) => prev[idx] ?? [],
      ),
    );
  }, [modeIntervals.length]);

  // ── Diagram refs & connections ───────────────────────────────────

  const diagramRef = useRef<HTMLDivElement>(null);

  const modeConnections = useMemo(
    () =>
      modeIntervals.map((interval, idx) => ({
        fromRow: "chromatic-row",
        fromIdx: interval as number,
        toRow: "mode-row",
        toIdx: modeLeftOverflowSize + idx,
      })),
    [modeIntervals, modeLeftOverflowSize],
  );

  const chordHighlightPairs = useMemo<ChordHighlightPair[]>(() => {
    if (!Array.isArray(hoveredChordNotes) || !hoveredChordNotes.length)
      return [];

    // Only highlight notes in the mode row that existed in the original chord.
    // Extension-added notes (e.g. sus4) bypass the mode row and only appear
    // in the chromatic row via highlightedBaseIdxs.
    const originalSet = new Set(originalHoverNotes);
    const notesToHighlight =
      originalSet.size > 0
        ? hoveredChordNotes.filter((n) => originalSet.has(n))
        : hoveredChordNotes;

    return notesToHighlight
      .map((noteIdx) => {
        if (typeof noteIdx !== "number") return null;
        const modeIdx = modeNotesWithOverflow.indexOf(noteIdx);
        if (modeIdx < 0) return null;
        return { modeIdx, baseIdx: noteIdx } as ChordHighlightPair;
      })
      .filter((p): p is ChordHighlightPair => p !== null);
  }, [hoveredChordNotes, modeNotesWithOverflow, originalHoverNotes]);

  const highlightedModeIdxs = useMemo(
    () => new Set(chordHighlightPairs.map((p) => p.modeIdx)),
    [chordHighlightPairs],
  );

  const highlightedBaseIdxs = useMemo(
    () =>
      new Set(
        (hoveredChordNotes ?? []).filter(
          (idx): idx is NoteIndex =>
            typeof idx === "number" && idx >= 0 && idx < notes.length,
        ),
      ),
    [hoveredChordNotes],
  );

  // ── Mode dropdown items ──────────────────────────────────────────

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div className="max-w-[1600px] w-full mx-auto flex flex-col gap-4">
      {/* Title + subtitle */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Music Theory Visualizer
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Explore modes, intervals, and diatonic chords with quick audio
          playback.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-5">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Key
          </span>
          <Tag>{renderNote(rootNote)}</Tag>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Mode
          </span>
          <Dropdown
            label={selectedMode}
            items={MODE_ITEMS}
            onSelect={(key) => setSelectedMode(key as ModeName)}
          />
        </div>
        <button
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors border ${
            arpeggiate
              ? "border-[var(--d3-primary)] bg-[var(--d3-scaleFill)] text-[var(--d3-primary)]"
              : "border-[var(--d3-border)] bg-white text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setArpeggiate((v) => !v)}
        >
          Arpeggiate
        </button>
      </div>
      {MODE_DESCRIPTIONS[selectedMode] && (
        <p className="text-sm text-gray-500">
          {MODE_DESCRIPTIONS[selectedMode]}
        </p>
      )}

      {/* Visualization rows */}
      <div
        ref={diagramRef}
        className="relative w-full flex flex-col items-center gap-8 overflow-x-auto pb-2 mt-4"
      >
          <LineGroup
            containerRef={diagramRef}
            connections={modeConnections}
            depKey={`${rootNote}-${selectedMode}`}
          />

          <HoverLines
            hoveredIndex={hoveredTriadIndex}
            containerRef={diagramRef}
            modeNotesWithOverflow={modeNotesWithOverflow}
            modeLeftOverflowSize={modeLeftOverflowSize}
            chordHighlightPairs={chordHighlightPairs}

            originalChordNotes={originalHoverNotes}
            modifiedChordNotes={modifiedHoverNotes}
          />

          {/* Chord root's major scale — content appears on chord hover */}
          <ChordScaleContext
            chordNotes={modifiedHoverNotes}
            notes={notes}
            squareSidePx={SQUARE_SIDE}
          />

          {/* Chromatic scale + slider */}
          <NotesArray
            squareSidePx={SQUARE_SIDE}
            size={BASE_SCALE_WITH_OVERFLOW_SIZE}
            clipContent
            caption="Chromatic Scale"
            captionSubtitle="All 12 notes — drag to change key"
          >
            <div
              className="absolute z-10 flex"
              style={{
                translate: `${
                  (BASE_SCALE_LEFT_OVERFLOW_SIZE * 100) /
                  CHROMATIC_SCALE.length
                }%`,
              }}
            >
              {CHROMATIC_SCALE.map((_, idx) => {
                let background: string | null = null;
                if (idx === 0) {
                  background = colors.rootFill;
                } else if (modeIntervals.includes(idx as Interval)) {
                  background = colors.scaleFill;
                }
                return (
                  <NoteCell
                    key={idx}
                    squareSidePx={SQUARE_SIDE}
                    dataRow="chromatic-row"
                    dataIdx={idx}
                    optBackground={background}
                  />
                );
              })}
            </div>

            <div
              ref={sliderRef}
              className="keen-slider relative z-20 flex h-full cursor-grab active:cursor-grabbing items-center"
            >
              {notes.map((note, idx) => (
                <NoteCell
                  key={idx}
                  idx={idx}
                  squareSidePx={SQUARE_SIDE}
                  dataRow="base-row"
                  dataIdx={idx}
                  className="keen-slider__slide cursor-pointer hover:bg-black/[0.08]"
                  showBorder={false}
                  style={
                    highlightedBaseIdxs.has(idx as NoteIndex)
                      ? HIGHLIGHTED_BASE_STYLE("#000000")
                      : { border: "2px solid transparent" }
                  }
                  onClick={() => handlePlayNote(note)}
                >
                  {renderNote(note)}
                </NoteCell>
              ))}
            </div>

            {/* Edge fades + arrow buttons */}
            <div className="pointer-events-none absolute left-0 top-0 z-30 h-full w-10 bg-gradient-to-r from-[var(--d3-rowBg)] to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 z-30 h-full w-10 bg-gradient-to-l from-[var(--d3-rowBg)] to-transparent" />
            <button
              onClick={() => sliderInstanceRef.current?.prev()}
              className="absolute left-1 top-1/2 z-40 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-white hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors border border-[var(--d3-border)]"
              aria-label="Scroll left"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button
              onClick={() => sliderInstanceRef.current?.next()}
              className="absolute right-1 top-1/2 z-40 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-white hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors border border-[var(--d3-border)]"
              aria-label="Scroll right"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </NotesArray>

          {/* Mode row */}
          <NotesArray
            squareSidePx={SQUARE_SIDE}
            size={modeNotesWithOverflow.length}
            clipContent
            zIndex={2}
            rowBackground={colors.rowBg}
            caption={`${selectedMode} Scale`}
            captionSubtitle="Notes in the selected mode"
          >
            <div
              className="absolute z-0 flex"
              style={{
                translate: `${
                  (modeLeftOverflowSize * 100) / modeIntervals.length
                }%`,
              }}
            >
              {modeIntervals.map((_, idx) => (
                <NoteCell key={idx} squareSidePx={SQUARE_SIDE} idx={idx} />
              ))}
            </div>

            {modeNotesWithOverflow.map((note, idx) => {
              const noteString = notes[note] ?? "";
              const isHighlighted = highlightedModeIdxs.has(idx);
              // Show scale degree numbers (1-7) for visible mode notes, skip overflow
              const visibleDegree = idx - modeLeftOverflowSize;
              const scaleDegreeCaption =
                visibleDegree >= 0 && visibleDegree < modeIntervals.length - 1
                  ? visibleDegree + 1
                  : null;
              return (
                <ModeNoteCell
                  key={idx}
                  squareSidePx={SQUARE_SIDE}
                  idx={idx}
                  dataIdx={idx}
                  noteString={noteString}
                  newValue={spelledModeNotes[idx] ?? ""}
                  onPlay={handlePlayNote}
                  isHighlighted={isHighlighted}

                  optCaption={scaleDegreeCaption}
                />
              );
            })}
          </NotesArray>

          {/* Diatonic chord degrees */}
          <DiatonicScaleDegreesRow
            caption="Diatonic Chords"
            captionSubtitle="Chords built from the mode"
            squareSide={SQUARE_SIDE}
            modeNotesWithOverflow={modeNotesWithOverflow}
            setHoveredChordIndex={setHoveredTriadIndex}
            notes={notes}
            chordType="triads"
            selectedExtensions={selectedExtensions}
            extensionOptions={EXTENSION_OPTIONS}
            onExtensionChange={(degreeIdx, value) => {
              setSelectedExtensions((prev) => {
                const next = [...prev];
                next[degreeIdx] = value as Extension[];
                return next;
              });
            }}
            modeLeftOverflowSize={modeLeftOverflowSize}
            modeLength={modeIntervals.length}
            onChordHoverChange={handleChordHoverChange}
            arpeggiate={arpeggiate}
            hoveredIndex={hoveredTriadIndex}

            captionRight={
              selectedExtensions.some((exts) => exts.length > 0) ? (
                <button
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() =>
                    setSelectedExtensions(
                      Array.from({ length: modeIntervals.length }, () => []),
                    )
                  }
                >
                  Clear all extensions
                </button>
              ) : undefined
            }
          />
        </div>
    </div>
  );
}
