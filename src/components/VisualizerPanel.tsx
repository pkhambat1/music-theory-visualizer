import { useCallback, useMemo, useRef, useState } from "react"
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"
import type { ExtensionOption, Interval } from "../types"
import { Note } from "../models/Note"
import { NATURAL } from "../lib/music/accidentals"
import { generateOctaves, renderNote } from "../lib/notes"
import { playNote } from "../lib/audio"
import { MODES, Mode } from "../lib/music/modes"
import {
  BASE_SCALE_LEFT_OVERFLOW,
  BASE_SCALE_WITH_OVERFLOW_SIZE,
} from "../lib/music/scale"

import { useModeTones } from "../hooks/useModeTones"
import { useChordExtensions } from "../hooks/useChordExtensions"
import { useChordHover } from "../hooks/useChordHover"

import Tag from "./ui/Tag"
import Dropdown from "./ui/Dropdown"
import LineGroup from "./LineGroup"
import HoverLines from "./HoverLines"
import DiatonicScaleDegreesRow from "./DiatonicScaleDegreesRow"
import ChordScaleContext from "./ChordScaleContext"
import ChromaticScaleRow from "./ChromaticScaleRow"
import ModeScaleRow from "./ModeScaleRow"

// ─── Constants ─────────────────────────────────────────────────────

const DEFAULT_ROOT_NOTE = new Note("C", NATURAL, 3)
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

const MODE_ITEMS = MODES.map((mode) => ({
  key: mode.name,
  label: mode.name,
}))

// ─── Component ─────────────────────────────────────────────────────

export default function VisualizerPanel() {
  const [selectedMode, setSelectedMode] = useState<Mode>(MODES[0]!)
  const [rootNote, setRootNote] = useState<Note>(DEFAULT_ROOT_NOTE)
  const [arpeggiate, setArpeggiate] = useState(false)
  const [showKeyHint, setShowKeyHint] = useState(false)

  const modeIntervals = useMemo((): Interval[] => selectedMode.intervals, [selectedMode])

  // ── Custom hooks ────────────────────────────────────────────────

  const { modeNotesWithOverflow, modeLeftOverflowSize, spelledModeNotes, modeConnections } =
    useModeTones(modeIntervals, rootNote, notes)

  const {
    selectedExtensions,
    slashBasses,
    hasAnyExtensionsOrSlash,
    handleExtensionChange,
    handleSlashBassChange,
    clearAll,
  } = useChordExtensions(modeIntervals.length)

  const {
    hoveredTriadIndex,
    modifiedHoverNotes,
    voicedOriginal,
    voicedModified,
    slashBassNoteIndex,
    chordHighlightPairs,
    highlightedModeIdxs,
    highlightedBaseIdxs,
    setHoveredTriadIndex,
    handleChordHoverChange,
  } = useChordHover(modeNotesWithOverflow, modeLeftOverflowSize, slashBasses, notes.length)

  // ── Callbacks ───────────────────────────────────────────────────

  const handlePlayNote = useCallback((note: Note) => playNote(note), [])

  // ── Keen Slider ─────────────────────────────────────────────────

  const [sliderRef, sliderInstanceRef] = useKeenSlider({
    slides: {
      perView: BASE_SCALE_WITH_OVERFLOW_SIZE,
    },
    defaultAnimation: { duration: 125 },
    initial: notes.findIndex((n) => n.equals(DEFAULT_ROOT_NOTE)) - BASE_SCALE_LEFT_OVERFLOW,
    slideChanged(s) {
      const rootIndex = s.track.details.abs + BASE_SCALE_LEFT_OVERFLOW
      setRootNote(notes[rootIndex]!)
    },
  })

  const handlePrev = useCallback(() => sliderInstanceRef.current?.prev(), [sliderInstanceRef])
  const handleNext = useCallback(() => sliderInstanceRef.current?.next(), [sliderInstanceRef])

  // ── Diagram ref ─────────────────────────────────────────────────

  const diagramRef = useRef<HTMLDivElement>(null)

  // ── Render ──────────────────────────────────────────────────────

  return (
    <div className="max-w-[1600px] w-full mx-auto flex flex-col gap-4">
      {/* Title + subtitle */}
      <div>
        <h1 className="text-3xl font-normal tracking-tight text-gray-900">
          Music Theory Visualizer
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Pick a key and mode, then trace how scales produce chords and why each chord sounds the
          way it does.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-5">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Key</span>
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
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Mode</span>
          <Dropdown
            label={selectedMode.name}
            items={MODE_ITEMS}
            onSelect={(key) => {
              const mode = MODES.find((m) => m.name === key)
              if (mode) setSelectedMode(mode)
            }}
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
      {selectedMode.description && (
        <p className="text-sm text-gray-500">{selectedMode.description}</p>
      )}

      {/* Visualization rows */}
      <div
        ref={diagramRef}
        className="relative w-full flex flex-col items-center gap-8 overflow-x-auto pb-2 mt-4"
      >
        <LineGroup
          containerRef={diagramRef}
          connections={modeConnections}
          depKey={`${rootNote.toDisplay()}-${selectedMode.name}`}
        />

        <HoverLines
          hoveredIndex={hoveredTriadIndex}
          containerRef={diagramRef}
          modeNotesWithOverflow={modeNotesWithOverflow}
          modeLeftOverflowSize={modeLeftOverflowSize}
          chordHighlightPairs={chordHighlightPairs}
          originalChordNotes={voicedOriginal}
          modifiedChordNotes={voicedModified}
          slashBassNoteIndex={slashBassNoteIndex}
        />

        {/* Chord root's major scale — content appears on chord hover */}
        <ChordScaleContext chordNotes={modifiedHoverNotes} notes={notes} />

        <ChromaticScaleRow
          sliderRef={sliderRef}
          notes={notes}
          modeIntervals={modeIntervals}
          highlightedBaseIdxs={highlightedBaseIdxs}
          onPlayNote={handlePlayNote}
          onPrev={handlePrev}
          onNext={handleNext}
        />

        <ModeScaleRow
          selectedModeName={selectedMode.name}
          modeNotesWithOverflow={modeNotesWithOverflow}
          modeIntervals={modeIntervals}
          modeLeftOverflowSize={modeLeftOverflowSize}
          spelledModeNotes={spelledModeNotes}
          highlightedModeIdxs={highlightedModeIdxs}
          notes={notes}
          onPlayNote={handlePlayNote}
        />

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
                onClick={clearAll}
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
