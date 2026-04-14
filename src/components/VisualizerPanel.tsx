import { useCallback, useMemo, useRef, useState } from "react"
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"
import type { Interval } from "../lib/music"
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
import ChordMajorScaleRow from "./ChordMajorScaleRow"
import ChromaticScaleRow from "./ChromaticScaleRow"
import ModeScaleRow from "./ModeScaleRow"

const DEFAULT_ROOT_NOTE = new Note("C", NATURAL, 3)

export default function VisualizerPanel() {
  const [selectedMode, setSelectedMode] = useState<Mode>(MODES[0]!)
  const [rootNote, setRootNote] = useState<Note>(DEFAULT_ROOT_NOTE)
  const [arpeggiate, setArpeggiate] = useState(false)

  const modeIntervals = useMemo((): Interval[] => selectedMode.intervals, [selectedMode])

  const { modeNotesWithOverflow, modeLeftOverflowSize, visibleModeNotes, modeConnections } =
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
    fullVoicedModified,
    chordRootIndex,
    voicedOriginal,
    voicedModified,
    slashBassNoteIndex,
    chordHighlightPairs,
    highlightedModeIdxs,
    highlightedBaseIdxs,
    setHoveredTriadIndex,
    handleChordHoverChange,
  } = useChordHover(modeNotesWithOverflow, visibleModeNotes, slashBasses, notes)

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
        <h1 className="text-3xl font-normal tracking-tight text-black">
          Music Theory Visualizer
        </h1>
        <p className="mt-1.5 text-sm text-black">
          Explore the building blocks of music composition in this interactive visualization  
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
        className="relative w-full flex flex-col items-center gap-8 pb-2 mt-4"
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
        <ChordMajorScaleRow chordNotes={fullVoicedModified} chordRootIndex={chordRootIndex} />

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
          highlightedModeIdxs={highlightedModeIdxs}
          onPlayNote={handlePlayNote}
        />

        {/* Diatonic chord degrees */}
        <DiatonicScaleDegreesRow
          visibleModeNotes={visibleModeNotes}
          setHoveredChordIndex={setHoveredTriadIndex}
          selectedExtensions={selectedExtensions}
          onExtensionChange={handleExtensionChange}
          slashBasses={slashBasses}
          onSlashBassChange={handleSlashBassChange}
          modeLength={modeIntervals.length}
          onChordHoverChange={handleChordHoverChange}
          arpeggiate={arpeggiate}
          hoveredIndex={hoveredTriadIndex}
          captionRight={
            hasAnyExtensionsOrSlash ? (
              <button
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium border border-[var(--app-border)] bg-white text-black"
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
