import { useMemo, useState } from "react"
import type { Extension, ExtensionOption, ModeDataProps, NoteRef } from "../lib/music"
import type { Note } from "../models"
import { getChordDescriptor, getChordNotes, applyExtensions, toNoteRefs, CHORD_CELL_SIDE } from "../lib/music"
import NotesArray from "./NotesArray"
import ChordDegreeCell from "./ChordDegreeCell"

export type ChordHoverData = {
  original: NoteRef[],
  modified: NoteRef[],
}

export type DiatonicScaleDegreesRowProps = ModeDataProps & {
  setHoveredChordIndex: (idx: number | null) => void,
  notes: Note[],
  selectedExtensions: Extension[][],
  extensionOptions: ExtensionOption[],
  onExtensionChange?: (degreeIdx: number, value: string[]) => void,
  slashBasses: (number | null)[],
  onSlashBassChange?: (degreeIdx: number, bassDegree: number | null) => void,
  modeLength: number,
  onChordHoverChange?: (data: ChordHoverData) => void,
  captionRight?: React.ReactNode,
  arpeggiate: boolean,
  hoveredIndex: number | null,
}

const ROMAN_BASE = ["I", "II", "III", "IV", "V", "VI", "VII"]
const CAPTION = "Diatonic Chords"
const CAPTION_SUBTITLE = "Chords built from the mode"

export default function DiatonicScaleDegreesRow({
  modeNotesWithOverflow,
  setHoveredChordIndex,
  notes,
  selectedExtensions,
  extensionOptions,
  onExtensionChange,
  slashBasses,
  onSlashBassChange,
  modeLeftOverflowSize,
  modeLength,
  onChordHoverChange,
  captionRight,
  arpeggiate,
  hoveredIndex,
}: DiatonicScaleDegreesRowProps) {
  const degreeCount = modeLength > 0 ? modeLength : ROMAN_BASE.length + 1
  const chordNumerals = Array.from({ length: degreeCount }, (_, idx) =>
    idx === degreeCount - 1 ? "I" : (ROMAN_BASE[idx] ?? "I"),
  )
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  const modeNotes = useMemo(
    () => modeNotesWithOverflow.slice(modeLeftOverflowSize),
    [modeNotesWithOverflow, modeLeftOverflowSize],
  )

  const modeIndices = useMemo(
    () => modeNotes.map((r) => r.index),
    [modeNotes],
  )

  const chordData = useMemo(
    () =>
      chordNumerals.map((_, chordNumeralIdx) => {
        const originalIndices = getChordNotes(modeIndices, chordNumeralIdx, "triads")
        const activeExtensions = selectedExtensions[chordNumeralIdx] ?? []
        const chordIndices = applyExtensions(originalIndices, activeExtensions)
        const chordDescriptor = getChordDescriptor(chordIndices)
        const slashBass = slashBasses[chordNumeralIdx] ?? null
        const originalNotes = toNoteRefs(originalIndices, notes)
        const chordNotesArr = toNoteRefs(chordIndices, notes)
        return { originalNotes, chordNotesArr, chordDescriptor, activeExtensions, slashBass }
      }),
    [chordNumerals, modeIndices, selectedExtensions, slashBasses, notes],
  )

  const emitHover = (
    chordNumeralIdx: number,
    originalNotes: NoteRef[],
    modifiedNotes: NoteRef[],
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
      cellWidth={CHORD_CELL_SIDE}
      caption={CAPTION}
      captionSubtitle={CAPTION_SUBTITLE}
      captionRight={captionRight}
      clipContent={false}
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
