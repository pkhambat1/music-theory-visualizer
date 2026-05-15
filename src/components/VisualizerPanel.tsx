import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"
import type { Interval } from "../lib/music"
import { Note } from "../models"
import {
  NATURAL, MODES, Mode,
  BASE_SCALE_LEFT_OVERFLOW, BASE_SCALE_WITH_OVERFLOW_SIZE,
  getChordNotes,
  applyExtensions,
  toNoteRefs,
  ROMAN_NUMERALS,
} from "../lib/music"
import { notes } from "../lib/notes"
import { playNote } from "../lib/audio"
import { useModeTones, useChordExtensions, useChordHover, computeChordHoverLayer } from "../hooks"
import type { HoverLinesLayer } from "./HoverLines"
import { scaleToneBand } from "../lib/theme"

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
  const [pinnedChordIndex, setPinnedChordIndex] = useState<number | null>(null)

  useEffect(() => {
    setPinnedChordIndex(null)
  }, [selectedMode])

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

  const degreeCount =
    modeIntervals.length > 0 ? modeIntervals.length : ROMAN_NUMERALS.length + 1
  const chordNumerals = useMemo(
    () =>
      Array.from({ length: degreeCount }, (_, idx) =>
        idx === degreeCount - 1 ? "I" : (ROMAN_NUMERALS[idx] ?? "I"),
      ),
    [degreeCount],
  )

  const chordRefsByDegree = useMemo(() => {
    const modeIndices = visibleModeNotes.map((r) => r.index)
    return chordNumerals.map((_, chordNumeralIdx) => {
      const originalIndices = getChordNotes(modeIndices, chordNumeralIdx, "triads")
      const activeExtensions = selectedExtensions[chordNumeralIdx] ?? []
      const chordIndices = applyExtensions(originalIndices, activeExtensions)
      const slashBass = slashBasses[chordNumeralIdx] ?? null
      const originalNotes = toNoteRefs(originalIndices, notes)
      const chordNotesArr = toNoteRefs(chordIndices, notes)
      return { originalNotes, chordNotesArr, slashBass }
    })
  }, [chordNumerals, visibleModeNotes, selectedExtensions, slashBasses])

  const pinnedChordLayer = useMemo(() => {
    if (pinnedChordIndex === null) return null
    const row = chordRefsByDegree[pinnedChordIndex]
    if (!row) return null
    return computeChordHoverLayer(
      pinnedChordIndex,
      row.originalNotes,
      row.chordNotesArr,
      modeNotesWithOverflow,
      visibleModeNotes,
      slashBasses,
      notes,
    )
  }, [
    pinnedChordIndex,
    chordRefsByDegree,
    modeNotesWithOverflow,
    visibleModeNotes,
    slashBasses,
  ])

  const mergedHighlightedBaseIdxs = useMemo(() => {
    const s = new Set(highlightedBaseIdxs)
    if (pinnedChordLayer) {
      pinnedChordLayer.highlightedBaseIdxs.forEach((i) => {
        s.add(i)
      })
    }
    return s
  }, [highlightedBaseIdxs, pinnedChordLayer])

  const mergedHighlightedModeIdxs = useMemo(() => {
    const s = new Set(highlightedModeIdxs)
    if (pinnedChordLayer) {
      pinnedChordLayer.highlightedModeIdxs.forEach((i) => {
        s.add(i)
      })
    }
    return s
  }, [highlightedModeIdxs, pinnedChordLayer])

  const hoverLineLayers = useMemo((): HoverLinesLayer[] => {
    const out: HoverLinesLayer[] = []
    const mIdx = hoveredTriadIndex
    const pIdx = pinnedChordIndex
    if (
      pIdx !== null &&
      pinnedChordLayer !== null &&
      mIdx !== pIdx &&
      pinnedChordLayer.voicedModified.length > 0
    ) {
      out.push({
        hoveredIndex: pIdx,
        chordHighlightPairs: pinnedChordLayer.chordHighlightPairs,
        originalChordNotes: pinnedChordLayer.voicedOriginal,
        modifiedChordNotes: pinnedChordLayer.voicedModified,
        slashBassNoteIndex: pinnedChordLayer.slashBassNoteIndex,
      })
    }
    if (mIdx !== null && voicedModified.length > 0) {
      out.push({
        hoveredIndex: mIdx,
        chordHighlightPairs,
        originalChordNotes: voicedOriginal,
        modifiedChordNotes: voicedModified,
        slashBassNoteIndex,
      })
    } else if (
      pIdx !== null &&
      pinnedChordLayer !== null &&
      pinnedChordLayer.voicedModified.length > 0
    ) {
      out.push({
        hoveredIndex: pIdx,
        chordHighlightPairs: pinnedChordLayer.chordHighlightPairs,
        originalChordNotes: pinnedChordLayer.voicedOriginal,
        modifiedChordNotes: pinnedChordLayer.voicedModified,
        slashBassNoteIndex: pinnedChordLayer.slashBassNoteIndex,
      })
    }
    return out
  }, [
    hoveredTriadIndex,
    pinnedChordIndex,
    pinnedChordLayer,
    chordHighlightPairs,
    voicedOriginal,
    voicedModified,
    slashBassNoteIndex,
  ])

  const majorScaleChordNotes = useMemo(
    () =>
      hoveredTriadIndex !== null
        ? fullVoicedModified
        : (pinnedChordLayer?.fullVoicedModified ?? []),
    [hoveredTriadIndex, fullVoicedModified, pinnedChordLayer],
  )
  const majorScaleChordRoot = useMemo(
    () =>
      hoveredTriadIndex !== null ? chordRootIndex : (pinnedChordLayer?.chordRootIndex ?? null),
    [hoveredTriadIndex, chordRootIndex, pinnedChordLayer],
  )

  const selectedNoteBackgrounds = useMemo((): Map<number, string> | null => {
    if (majorScaleChordRoot === null || majorScaleChordNotes.length === 0) return null

    // Copy the same degree-mapping + band coloring used by `ChordMajorScaleRow`
    const SEMITONE_TO_DEGREE = [0, 1, 1, 2, 2, 3, 4, 4, 4, 5, 6, 6] as const
    const intervalToDegreeIdx = (interval: number): number => {
      if (interval >= 0 && interval <= 11) return SEMITONE_TO_DEGREE[interval]!
      if (interval === 12) return 7
      const reduced = interval - 12
      if (reduced >= 0 && reduced <= 11) return 7 + SEMITONE_TO_DEGREE[reduced]!
      if (interval < 0) {
        const positive = interval + 12
        if (positive >= 0 && positive <= 11) return SEMITONE_TO_DEGREE[positive]! - 7
      }
      return 0
    }
    const degreeToNote = new Map<number, number>()
    for (const ref of majorScaleChordNotes) {
      const interval = ref.index - majorScaleChordRoot
      const degreeIdx = intervalToDegreeIdx(interval)
      degreeToNote.set(degreeIdx, ref.index)
    }

    const degrees = [...degreeToNote.keys()]
    if (degrees.length === 0) return null
    const band = scaleToneBand(degrees.length)

    const noteToColor = new Map<number, string>()
    degrees.forEach((deg, i) => {
      const noteIdx = degreeToNote.get(deg)
      if (noteIdx === undefined) return
      noteToColor.set(noteIdx, band[i] ?? band[0]!)
    })
    return noteToColor
  }, [majorScaleChordRoot, majorScaleChordNotes])

  const handlePlayNote = useCallback((note: Note) => playNote(note), [])

  const [isSlidingChromatic, setIsSlidingChromatic] = useState(false)

  const [sliderRef, sliderInstanceRef] = useKeenSlider({
    slides: {
      perView: BASE_SCALE_WITH_OVERFLOW_SIZE,
    },
    defaultAnimation: { duration: 125 },
    initial: notes.findIndex((n) => n.equals(DEFAULT_ROOT_NOTE)) - BASE_SCALE_LEFT_OVERFLOW,
    dragStarted() {
      setIsSlidingChromatic(true)
    },
    dragEnded() {
      setIsSlidingChromatic(false)
    },
    animationStarted() {
      setIsSlidingChromatic(true)
    },
    animationEnded() {
      setIsSlidingChromatic(false)
    },
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
          containerRef={diagramRef}
          modeNotesWithOverflow={modeNotesWithOverflow}
          modeLeftOverflowSize={modeLeftOverflowSize}
          layers={hoverLineLayers}
          freeze={isSlidingChromatic}
        />

        {/* Chord root's major scale — mouse hover wins when both pinned and hovered */}
        <ChordMajorScaleRow
          chordNotes={majorScaleChordNotes}
          chordRootIndex={majorScaleChordRoot}
        />

        <ChromaticScaleRow
          sliderRef={sliderRef}
          notes={notes}
          modeIntervals={modeIntervals}
          highlightedBaseIdxs={mergedHighlightedBaseIdxs}
          highlightedBaseBackgrounds={selectedNoteBackgrounds}
          onPlayNote={handlePlayNote}
          onPrev={handlePrev}
          onNext={handleNext}
        />

        <ModeScaleRow
          selectedModeName={selectedMode.name}
          modeNotesWithOverflow={modeNotesWithOverflow}
          modeIntervals={modeIntervals}
          modeLeftOverflowSize={modeLeftOverflowSize}
          highlightedModeIdxs={mergedHighlightedModeIdxs}
          highlightedModeBackgrounds={selectedNoteBackgrounds}
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
          pinnedChordIndex={pinnedChordIndex}
          onPinnedChordChange={setPinnedChordIndex}
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
