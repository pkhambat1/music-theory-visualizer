import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"
import type {
  ChordDegreeState,
  ChordHighlightPair,
  Extension,
  ExtensionOption,
  Interval,
  ModeName,
  NoteIndex,
} from "../types"
import { Note } from "../lib/note"
import { CHROMATIC_SCALE, generateOctaves, renderNote } from "../lib/notes"
import { playNote } from "../lib/audio"
import { MODES } from "../lib/music/modes"
import {
  addOverflowToModeIntervals,
  BASE_SCALE_LEFT_OVERFLOW,
  BASE_SCALE_WITH_OVERFLOW_SIZE,
  buildModeNotesWithOverflow,
  getModeLeftOverflowSize,
  leftTrimOverflowNotes,
  modeIntervalsToMode,
} from "../lib/music/scale"
import { getSlashBassNote, buildSlashChordVoicing } from "../lib/music/chords"
import { spellModeNotes } from "../lib/music/spelling"
import { colors, rainbowBand, BAND_SCALE } from "../lib/colors"

import Tag from "./ui/Tag"
import Dropdown from "./ui/Dropdown"
import NotesArray from "./NotesArray"
import NoteCell from "./NoteCell"
import ModeNoteCell from "./ModeNoteCell"
import LineGroup from "./LineGroup"
import HoverLines from "./HoverLines"
import DiatonicScaleDegreesRow from "./DiatonicScaleDegreesRow"
import type { ChordHoverData } from "./DiatonicScaleDegreesRow"
import ChordScaleContext from "./ChordScaleContext"


// ─── Constants ─────────────────────────────────────────────────────

const DEFAULT_ROOT_NOTE = new Note("C", "natural", 3)
export const notes: Note[] = generateOctaves(6)

const EXTENSION_OPTIONS: ExtensionOption[] = [
  { value: "maj", label: "maj" },
  { value: "m", label: "m" },
  { value: "dim", label: "dim" },
  { value: "aug", label: "aug" },
  { value: "sus2", label: "sus2" },
  { value: "sus4", label: "sus4" },
  { value: "6", label: "6" },
  { value: "7", label: "7" },
  { value: "maj7", label: "maj7" },
  { value: "add2", label: "add2" },
  { value: "add4", label: "add4" },
  { value: "add9", label: "add9" },
  { value: "9", label: "9" },
  { value: "maj9", label: "maj9" },
  { value: "11", label: "11" },
  { value: "13", label: "13" },
]

const EMPTY_DEGREE_STATE: ChordDegreeState = { extensions: [], slashBass: null }

const MODE_ITEMS = Object.keys(MODES).map((mode) => ({
  key: mode,
  label: mode,
}))

const HIGHLIGHTED_BASE_STYLE = (color: string) => ({
  border: `2px solid ${color}`,
})

const MODE_DESCRIPTIONS: Record<ModeName, string> = {
  "Ionian (major)": "The natural major scale — bright and resolved",
  "Dorian": "Minor with a raised 6th — jazzy and warm",
  "Phrygian": "Minor with a flat 2nd — dark and Spanish-flavored",
  "Lydian": "Major with a raised 4th — dreamy and floating",
  "Mixolydian": "Major with a flat 7th — bluesy and dominant",
  "Aeolian (natural minor)": "The natural minor scale — sad and introspective",
  "Locrian": "Diminished — unstable and dissonant",
  "Harmonic Minor": "Minor with a raised 7th — exotic and dramatic",
  "Melodic Minor": "Minor with raised 6th and 7th — smooth and jazzy",
  "Whole Tone": "All whole steps — symmetrical, dreamlike, and unresolved",
}

// ─── Component ─────────────────────────────────────────────────────

export default function VisualizerPanel() {
  // Three color roles — D3 categorical palette (imported from d3-scale-chromatic)



  const [selectedMode, setSelectedMode] = useState<ModeName>("Ionian (major)")
  const [rootNote, setRootNote] = useState<Note>(DEFAULT_ROOT_NOTE)
  const [arpeggiate, setArpeggiate] = useState(false)
  const [showKeyHint, setShowKeyHint] = useState(false)

  const modeIntervals = useMemo(
    (): Interval[] => MODES[selectedMode] ?? [],
    [selectedMode],
  )

  const modeWithOverflowIntervalsRef = useRef(
    addOverflowToModeIntervals(modeIntervals),
  )
  const modeLeftOverflowSize = getModeLeftOverflowSize(modeIntervals)

  useEffect(() => {
    modeWithOverflowIntervalsRef.current =
      addOverflowToModeIntervals(modeIntervals)
    setModeNotesWithOverflow(
      modeIntervalsToMode(
        rootNote,
        modeWithOverflowIntervalsRef.current,
        notes,
      ),
    )
  }, [rootNote, modeIntervals])

  const [modeNotesWithOverflow, setModeNotesWithOverflow] = useState<
    NoteIndex[]
  >(() => buildModeNotesWithOverflow(rootNote, modeIntervals, notes))

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
  })

  const hoveredTriadIndex = hoverState.index
  const originalHoverNotes = hoverState.original
  const modifiedHoverNotes = hoverState.modified

  const setHoveredTriadIndex = useCallback((idx: number | null) => {
    if (idx === null) {
      setHoverState({ index: null, original: [], modified: [] })
    } else {
      setHoverState((prev) => ({ ...prev, index: idx }))
    }
  }, [])

  const handlePlayNote = useCallback(
    (note: Note) => playNote(note),
    [],
  )

  const spelledModeNotes = useMemo(
    () => spellModeNotes(modeNotesWithOverflow, modeLeftOverflowSize, notes),
    [modeNotesWithOverflow, modeLeftOverflowSize],
  )

  const handleChordHoverChange = useCallback((data: ChordHoverData) => {
    if (data?.original) {
      setHoverState((prev) => ({
        ...prev,
        original: data.original,
        modified: data.modified,
      }))
    } else {
      setHoverState((prev) => ({
        ...prev,
        original: [],
        modified: [],
      }))
    }
  }, [])

  // ── Keen Slider ──────────────────────────────────────────────────

  const [sliderRef, sliderInstanceRef] = useKeenSlider({
    slides: {
      perView: BASE_SCALE_WITH_OVERFLOW_SIZE,
    },
    defaultAnimation: { duration: 125 },
    initial:
      notes.findIndex((n) => n.equals(DEFAULT_ROOT_NOTE)) - BASE_SCALE_LEFT_OVERFLOW,
    slideChanged(s) {
      const rootIndex =
        s.track.details.abs + BASE_SCALE_LEFT_OVERFLOW
      setRootNote(notes[rootIndex]!)
    },
  })

  // ── Extensions & slash bass ─────────────────────────────────────

  const [chordDegreeStates, setChordDegreeStates] = useState<ChordDegreeState[]>(
    Array.from({ length: modeIntervals.length }, () => ({ ...EMPTY_DEGREE_STATE })),
  )

  useEffect(() => {
    setChordDegreeStates((prev) =>
      Array.from(
        { length: modeIntervals.length },
        (_, idx) => prev[idx] ?? { ...EMPTY_DEGREE_STATE },
      ),
    )
  }, [modeIntervals.length])

  const selectedExtensions = useMemo(
    () => chordDegreeStates.map((s) => s.extensions),
    [chordDegreeStates],
  )

  const slashBasses = useMemo(
    () => chordDegreeStates.map((s) => s.slashBass),
    [chordDegreeStates],
  )

  const handleExtensionChange = useCallback((degreeIdx: number, value: string[]) => {
    setChordDegreeStates((prev) => {
      const next = [...prev]
      next[degreeIdx] = { ...next[degreeIdx]!, extensions: value as Extension[] }
      return next
    })
  }, [])

  const handleSlashBassChange = useCallback((degreeIdx: number, bassDegree: number | null) => {
    setChordDegreeStates((prev) => {
      const next = [...prev]
      next[degreeIdx] = { ...next[degreeIdx]!, slashBass: bassDegree }
      return next
    })
  }, [])

  const hasAnyExtensionsOrSlash = useMemo(
    () => chordDegreeStates.some((s) => s.extensions.length > 0 || s.slashBass !== null),
    [chordDegreeStates],
  )

  // ── Slash bass note for hover lines ──────────────────────────────

  const hoveredSlashBassNoteIndex = useMemo<NoteIndex | null>(() => {
    if (hoveredTriadIndex === null) return null
    const slashBass = slashBasses[hoveredTriadIndex]
    if (slashBass === null || slashBass === undefined) return null
    const modeNotes = leftTrimOverflowNotes(modeNotesWithOverflow, modeLeftOverflowSize)
    return getSlashBassNote(modeNotes, hoveredTriadIndex, slashBass)
  }, [hoveredTriadIndex, slashBasses, modeNotesWithOverflow, modeLeftOverflowSize])

  // ── Diagram refs & connections ───────────────────────────────────

  const diagramRef = useRef<HTMLDivElement>(null)

  const modeConnections = useMemo(
    () =>
      modeIntervals.map((interval, idx) => ({
        fromRow: "chromatic-row",
        fromIdx: interval as number,
        toRow: "mode-row",
        toIdx: modeLeftOverflowSize + idx,
      })),
    [modeIntervals, modeLeftOverflowSize],
  )

  // ── Voiced hover notes (slash chords rearrange octaves) ─────────

  const hoveredSlashBass = useMemo(() => {
    if (hoveredTriadIndex === null) return null
    return slashBasses[hoveredTriadIndex] ?? null
  }, [hoveredTriadIndex, slashBasses])

  const voiceForSlash = useCallback(
    (chordNotes: NoteIndex[]): NoteIndex[] => {
      if (hoveredSlashBass === null || hoveredTriadIndex === null || chordNotes.length === 0)
        return chordNotes
      const mn = leftTrimOverflowNotes(modeNotesWithOverflow, modeLeftOverflowSize)
      // Full voicing with bass first, then strip bass — remaining notes are
      // at their correct octave positions for display
      return buildSlashChordVoicing(chordNotes, mn, hoveredTriadIndex, hoveredSlashBass).slice(1)
    },
    [hoveredSlashBass, hoveredTriadIndex, modeNotesWithOverflow, modeLeftOverflowSize],
  )

  const voicedOriginal = useMemo(
    () => voiceForSlash(originalHoverNotes),
    [originalHoverNotes, voiceForSlash],
  )
  const voicedModified = useMemo(
    () => voiceForSlash(modifiedHoverNotes),
    [modifiedHoverNotes, voiceForSlash],
  )

  const chordHighlightPairs = useMemo<ChordHighlightPair[]>(() => {
    if (!voicedModified.length) return []

    const originalSet = new Set(voicedOriginal)
    const notesToHighlight =
      originalSet.size > 0
        ? voicedModified.filter((n) => originalSet.has(n))
        : voicedModified

    return notesToHighlight
      .map((noteIdx) => {
        if (typeof noteIdx !== "number") return null
        const modeIdx = modeNotesWithOverflow.indexOf(noteIdx)
        if (modeIdx < 0) return null
        return { modeIdx, baseIdx: noteIdx } as ChordHighlightPair
      })
      .filter((p): p is ChordHighlightPair => p !== null)
  }, [voicedModified, modeNotesWithOverflow, voicedOriginal])

  const highlightedModeIdxs = useMemo(
    () => new Set(chordHighlightPairs.map((p) => p.modeIdx)),
    [chordHighlightPairs],
  )

  const highlightedBaseIdxs = useMemo(() => {
    const idxs = new Set(
      voicedModified.filter(
        (idx): idx is NoteIndex =>
          typeof idx === "number" && idx >= 0 && idx < notes.length,
      ),
    )
    if (hoveredSlashBassNoteIndex !== null && hoveredSlashBassNoteIndex >= 0 && hoveredSlashBassNoteIndex < notes.length) {
      idxs.add(hoveredSlashBassNoteIndex)
    }
    return idxs
  }, [voicedModified, hoveredSlashBassNoteIndex])

  // ── Mode dropdown items ──────────────────────────────────────────

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div className="max-w-[1600px] w-full mx-auto flex flex-col gap-4">
      {/* Title + subtitle */}
      <div>
        <h1 className="text-3xl font-normal tracking-tight text-gray-900">
          Music Theory Visualizer
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Pick a key and mode, then trace how scales produce chords and why each chord sounds the way it does.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-5">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Key
          </span>
          <div
            className="relative cursor-pointer"
            onClick={() => {
              setShowKeyHint(true)
              setTimeout(() => setShowKeyHint(false), 2500)
            }}
          >
            <Tag>{renderNote(rootNote)}</Tag>
            {showKeyHint && (
              <div className="absolute left-0 top-full z-30 mt-2 whitespace-nowrap rounded-md bg-[var(--d3-grayText)] px-2.5 py-1.5 text-xs font-medium text-white">
                Drag the chromatic row to change key
              </div>
            )}
          </div>
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
              ? "border-[var(--d3-primary)] bg-[var(--d3-primaryFill)] text-[var(--d3-primary)]"
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
            depKey={`${rootNote.toDisplay()}-${selectedMode}`}
          />

          <HoverLines
            hoveredIndex={hoveredTriadIndex}
            containerRef={diagramRef}
            modeNotesWithOverflow={modeNotesWithOverflow}
            modeLeftOverflowSize={modeLeftOverflowSize}
            chordHighlightPairs={chordHighlightPairs}
            originalChordNotes={voicedOriginal}
            modifiedChordNotes={voicedModified}
            slashBassNoteIndex={hoveredSlashBassNoteIndex}
          />

          {/* Chord root's major scale — content appears on chord hover */}
          <ChordScaleContext
            chordNotes={modifiedHoverNotes}
            notes={notes}
                      />

          {/* Chromatic scale + slider */}
          <NotesArray
            size={BASE_SCALE_WITH_OVERFLOW_SIZE}
            clipContent
            zIndex={1}
            caption="Chromatic Scale"
            captionSubtitle="All 12 notes — drag to change key"
          >
            <div
              className="absolute z-10 flex"
              style={{
                translate: `${
                  (BASE_SCALE_LEFT_OVERFLOW * 100) /
                  CHROMATIC_SCALE.length
                }%`,
              }}
            >
              {(() => {
                const scaleIdxs = CHROMATIC_SCALE
                  .map((_, i) => i)
                  .filter((i) => i > 0 && modeIntervals.includes(i))
                const scaleBand = rainbowBand(BAND_SCALE, scaleIdxs.length)
                const scaleBandMap = new Map(scaleIdxs.map((si, bi) => [si, scaleBand[bi]!]))

                return CHROMATIC_SCALE.map((_, idx) => {
                  let background: string | null = null
                  if (idx === 0) {
                    background = colors.rootFill
                  } else {
                    background = scaleBandMap.get(idx) ?? null
                  }
                  return (
                    <NoteCell
                      key={idx}
                                            dataRow="chromatic-row"
                      dataIdx={idx}
                      optBackground={background}
                    />
                  )
                })
              })()}
            </div>

            <div
              ref={sliderRef}
              className="keen-slider relative z-20 flex h-full cursor-grab active:cursor-grabbing items-center"
            >
              {notes.map((note, idx) => (
                <NoteCell
                  key={idx}
                  idx={idx}
                                    dataRow="base-row"
                  dataIdx={idx}
                  className="keen-slider__slide cursor-pointer hover:bg-black/[0.08]"
                  style={
                    highlightedBaseIdxs.has(idx)
                      ? HIGHLIGHTED_BASE_STYLE("#000000")
                      : { border: "2px solid transparent" }
                  }
                  onClick={() => handlePlayNote(note)}
                >
                  {renderNote(note)}
                </NoteCell>
              ))}
            </div>

            {/* Arrow buttons */}
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
                <NoteCell key={idx} idx={idx} />
              ))}
            </div>

            {modeNotesWithOverflow.map((noteIdx, idx) => {
              const noteObj = notes[noteIdx] ?? null
              const isHighlighted = highlightedModeIdxs.has(idx)
              // Show scale degree numbers (1-7) for visible mode notes, skip overflow
              const visibleDegree = idx - modeLeftOverflowSize
              const scaleDegreeCaption =
                visibleDegree >= 0 && visibleDegree < modeIntervals.length - 1
                  ? visibleDegree + 1
                  : null
              return (
                <ModeNoteCell
                  key={idx}
                                    idx={idx}
                  dataIdx={idx}
                  noteString={noteObj}
                  newValue={spelledModeNotes[idx] ?? null}
                  onPlay={handlePlayNote}
                  isHighlighted={isHighlighted}

                  optCaption={scaleDegreeCaption}
                />
              )
            })}
          </NotesArray>

          {/* Diatonic chord degrees */}
          <DiatonicScaleDegreesRow
                        modeNotesWithOverflow={modeNotesWithOverflow}
            setHoveredChordIndex={setHoveredTriadIndex}
            notes={notes}
            selectedExtensions={selectedExtensions}
            extensionOptions={EXTENSION_OPTIONS}
            onExtensionChange={handleExtensionChange}
            slashBasses={slashBasses}
            onSlashBassChange={handleSlashBassChange}
            modeLeftOverflowSize={modeLeftOverflowSize}
            modeLength={modeIntervals.length}
            onChordHoverChange={handleChordHoverChange}
            arpeggiate={arpeggiate}
            hoveredIndex={hoveredTriadIndex}
            captionRight={
              hasAnyExtensionsOrSlash ? (
                <button
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() =>
                    setChordDegreeStates(
                      Array.from({ length: modeIntervals.length }, () => ({ ...EMPTY_DEGREE_STATE })),
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
  )
}
