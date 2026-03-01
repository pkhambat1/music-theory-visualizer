import { useCallback, useMemo, useRef, useState } from "react"
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"
import type { ExtensionOption, Interval } from "../lib/music"
import { Note } from "../models"
import {
  NATURAL, MODES, Mode,
  BASE_SCALE_LEFT_OVERFLOW, BASE_SCALE_WITH_OVERFLOW_SIZE,
} from "../lib/music"
import { notes } from "../lib/notes"
import { playNote } from "../lib/audio"
import { useModeTones, useChordExtensions, useChordHover } from "../hooks"

import ControlsBar from "./ControlsBar"
import FixedLines from "./FixedLines"
import HoverLines from "./HoverLines"
import DiatonicScaleDegreesRow from "./DiatonicScaleDegreesRow"
import ChordScaleContext from "./ChordScaleContext"
import ChromaticScaleRow from "./ChromaticScaleRow"
import ModeScaleRow from "./ModeScaleRow"

const DEFAULT_ROOT_NOTE = new Note("C", NATURAL, 3)

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

export default function VisualizerPanel() {
  const [selectedMode, setSelectedMode] = useState<Mode>(MODES[0]!)
  const [rootNote, setRootNote] = useState<Note>(DEFAULT_ROOT_NOTE)
  const [arpeggiate, setArpeggiate] = useState(false)

  const modeIntervals = useMemo((): Interval[] => selectedMode.intervals, [selectedMode])

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

  const handlePlayNote = useCallback((note: Note) => playNote(note), [])

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

  const diagramRef = useRef<HTMLDivElement>(null)

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

      <ControlsBar
        rootNote={rootNote}
        selectedMode={selectedMode}
        arpeggiate={arpeggiate}
        onModeChange={setSelectedMode}
        onArpeggiateToggle={() => setArpeggiate((v) => !v)}
      />

      {/* Visualization rows */}
      <div
        ref={diagramRef}
        className="relative w-full flex flex-col items-center gap-8 overflow-x-auto pb-2 mt-4"
      >
        <FixedLines
          containerRef={diagramRef}
          connections={modeConnections}
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
