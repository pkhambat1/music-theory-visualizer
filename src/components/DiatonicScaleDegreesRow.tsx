import { useMemo, useState } from "react"
import type { Extension, ExtensionOption, ModeDataProps, NoteIndex } from "../types"
import type { Note } from "../models/Note"
import NotesArray from "./NotesArray"
import { getChordDescriptor, getChordNotes, applyExtensions } from "../lib/music/chords"
import { leftTrimOverflowNotes } from "../lib/music/scale"
import ChordDegreeCell from "./ChordDegreeCell"

export type ChordHoverData = {
  original: NoteIndex[],
  modified: NoteIndex[],
}

export type DiatonicScaleDegreesRowProps = ModeDataProps & {
  setHoveredChordIndex: (idx: number | null) => void,
  notes: Note[],
  selectedExtensions: Extension[][],
  extensionOptions?: ExtensionOption[],
  onExtensionChange?: (degreeIdx: number, value: string[]) => void,
  slashBasses?: (number | null)[],
  onSlashBassChange?: (degreeIdx: number, bassDegree: number | null) => void,
  modeLength?: number,
  onChordHoverChange?: (data: ChordHoverData) => void,
  captionRight?: React.ReactNode,
  arpeggiate?: boolean,
  hoveredIndex?: number | null,
}

// ─── Constants ──────────────────────────────────────────────────────

const ROMAN_BASE = ["I", "II", "III", "IV", "V", "VI", "VII"]
const CAPTION = "Diatonic Chords"
const CAPTION_SUBTITLE = "Chords built from the mode"

// ─── Component ──────────────────────────────────────────────────────

export default function DiatonicScaleDegreesRow({
  modeNotesWithOverflow,
  setHoveredChordIndex,
  notes,
  selectedExtensions,
  extensionOptions = [],
  onExtensionChange,
  slashBasses = [],
  onSlashBassChange,
  modeLeftOverflowSize,
  modeLength = 0,
  onChordHoverChange,
  captionRight,
  arpeggiate = false,
  hoveredIndex = null,
}: DiatonicScaleDegreesRowProps) {
  const degreeCount = modeLength > 0 ? modeLength : ROMAN_BASE.length + 1
  const chordNumerals = Array.from({ length: degreeCount }, (_, idx) =>
    idx === degreeCount - 1 ? "I" : (ROMAN_BASE[idx] ?? "I"),
  )
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  const modeNotes = useMemo(
    () => leftTrimOverflowNotes(modeNotesWithOverflow, modeLeftOverflowSize),
    [modeNotesWithOverflow, modeLeftOverflowSize],
  )

  const chordData = useMemo(
    () =>
      chordNumerals.map((_, chordNumeralIdx) => {
        const originalNotes = getChordNotes(modeNotes, chordNumeralIdx)
        const activeExtensions = selectedExtensions[chordNumeralIdx] ?? []
        const chordNotesArr = applyExtensions(originalNotes, activeExtensions)
        const chordDescriptor = getChordDescriptor(chordNotesArr)
        const slashBass = slashBasses[chordNumeralIdx] ?? null
        return { originalNotes, chordNotesArr, chordDescriptor, activeExtensions, slashBass }
      }),
    [chordNumerals, modeNotes, selectedExtensions, slashBasses],
  )

  const emitHover = (
    chordNumeralIdx: number,
    originalNotes: NoteIndex[],
    modifiedNotes: NoteIndex[],
  ) => {
    setHoveredChordIndex(chordNumeralIdx)
    onChordHoverChange?.({ original: originalNotes, modified: modifiedNotes })
  }

  const clearHover = () => {
    setHoveredChordIndex(null)
    onChordHoverChange?.({ original: [], modified: [] })
  }

  return (
    <NotesArray
      size={chordNumerals.length}
      caption={CAPTION}
      captionSubtitle={CAPTION_SUBTITLE}
      captionRight={captionRight}
      zIndex={openIdx !== null ? 4 : undefined}
    >
      {chordNumerals.map((chordNumeral, chordNumeralIdx) => {
        const { originalNotes, chordNotesArr, chordDescriptor, activeExtensions, slashBass } =
          chordData[chordNumeralIdx]!
        return (
          <ChordDegreeCell
            key={chordNumeralIdx}
            chordNumeralIdx={chordNumeralIdx}
            chordNumeral={chordNumeral}
            originalNotes={originalNotes}
            chordNotesArr={chordNotesArr}
            chordDescriptor={chordDescriptor}
            activeExtensions={activeExtensions}
            slashBass={slashBass}
            modeNotes={modeNotes}
            notes={notes}
            arpeggiate={arpeggiate}
            hoveredIndex={hoveredIndex}
            isPopoverOpen={openIdx === chordNumeralIdx}
            onPopoverOpenChange={(open) => setOpenIdx(open ? chordNumeralIdx : null)}
            selectedExtensions={selectedExtensions[chordNumeralIdx] ?? []}
            extensionOptions={extensionOptions}
            onExtensionChange={onExtensionChange}
            onSlashBassChange={onSlashBassChange}
            onHover={emitHover}
            onHoverClear={clearHover}
          />
        )
      })}
    </NotesArray>
  )
}
