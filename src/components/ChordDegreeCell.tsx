import { useRef, type MouseEvent } from "react"
import type { Extension, NoteRef } from "../lib/music"
import { buildSlashChordVoicing, CHORD_CELL_SIDE, ROMAN_NUMERALS } from "../lib/music"
import { notes } from "../lib/notes"
import { playChord, arpeggiateChord } from "../lib/audio"
import { degreeColor, neonHoverCellOutline } from "../lib/theme"
import { Pin } from "lucide-react"
import NoteCell from "./NoteCell"
import ExtensionPanel from "./ExtensionPanel"
import { Popover, PopoverTrigger, Pill } from "./ui"

import type { RowId } from "../lib/geometry"

const DATA_ROW: RowId = "diatonic-row"

export type ChordDegreeCellProps = {
  chordNumeralIdx: number,
  chordNumeral: string,
  originalNotes: NoteRef[],
  chordNotesArr: NoteRef[],
  chordDescriptor: string,
  activeExtensions: Extension[],
  slashBass: number | null,
  modeNotes: NoteRef[],
  arpeggiate: boolean,
  hoveredIndex: number | null,
  pinnedChordIndex: number | null,
  isPopoverOpen: boolean,
  onPopoverOpenChange: (open: boolean) => void,
  selectedExtensions: Extension[],
  onExtensionChange?: (degreeIdx: number, value: Extension[]) => void,
  onSlashBassChange?: (degreeIdx: number, bassDegree: number | null) => void,
  onHover: (idx: number, original: NoteRef[], modified: NoteRef[]) => void,
  onHoverClear: () => void,
  isPinned: boolean,
  onPinnedChordChange: (index: number | null) => void,
}

export default function ChordDegreeCell({
  chordNumeralIdx,
  chordNumeral,
  originalNotes,
  chordNotesArr,
  chordDescriptor,
  activeExtensions,
  slashBass,
  modeNotes,
  arpeggiate,
  hoveredIndex,
  pinnedChordIndex,
  isPopoverOpen,
  onPopoverOpenChange,
  selectedExtensions,
  onExtensionChange,
  onSlashBassChange,
  onHover,
  onHoverClear,
  isPinned,
  onPinnedChordChange,
}: ChordDegreeCellProps) {
  const cellGroupRef = useRef<HTMLDivElement>(null)

  const handlePinClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()
    if (isPinned) {
      onPinnedChordChange(null)
      onHoverClear()
      requestAnimationFrame(() => {
        if (cellGroupRef.current?.matches(":hover")) {
          onHover(chordNumeralIdx, originalNotes, chordNotesArr)
        }
      })
    } else {
      onPinnedChordChange(chordNumeralIdx)
      onHover(chordNumeralIdx, originalNotes, chordNotesArr)
    }
  }

  const isHoverOrPinBorder =
    hoveredIndex === chordNumeralIdx || pinnedChordIndex === chordNumeralIdx

  const degreeBg = isHoverOrPinBorder ? degreeColor(chordNumeralIdx) : null

  return (
    <div
      ref={cellGroupRef}
      className="relative group"
      style={{
        width: `${CHORD_CELL_SIDE}px`,
        height: `${CHORD_CELL_SIDE}px`,
        overflow: "visible",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <NoteCell
        idx={chordNumeralIdx}
        dataRow={DATA_ROW}
        dataIdx={chordNumeralIdx}
        optBackground={degreeBg}
        className="cursor-pointer"
        style={{
          width: `${CHORD_CELL_SIDE}px`,
          height: `${CHORD_CELL_SIDE}px`,
          ...(isHoverOrPinBorder ? { ...neonHoverCellOutline } : {}),
        }}
        onMouseEnter={() => onHover(chordNumeralIdx, originalNotes, chordNotesArr)}
        onMouseLeave={() => onHoverClear()}
        onClick={() => {
          const chordIndices = chordNotesArr.map((r) => r.index)
          const modeIndices = modeNotes.map((r) => r.index)
          const voicing =
            slashBass !== null
              ? buildSlashChordVoicing(chordIndices, modeIndices, chordNumeralIdx, slashBass)
              : chordIndices
          const chordNoteObjs = voicing.map((idx) => notes[idx]!)
          if (arpeggiate) {
            arpeggiateChord(chordNoteObjs)
          } else {
            playChord(chordNoteObjs)
          }
        }}
      >
        <span
          className={activeExtensions.length > 0 || slashBass !== null ? "-translate-y-1" : ""}
          style={{ color: "#000000" }}
        >
          {chordNumeral}
          {chordDescriptor}
          {slashBass !== null && (
            <span className="text-[9px]">/{ROMAN_NUMERALS[slashBass] ?? ""}</span>
          )}
        </span>

        {(activeExtensions.length > 0 || slashBass !== null) && (
          <div className="absolute bottom-0.5 inset-x-0 flex flex-wrap justify-center gap-[2px] px-0.5">
            {activeExtensions.map((ext) => (
              <Pill key={ext} label={ext} />
            ))}
            {slashBass !== null && (
              <Pill label={`/${ROMAN_NUMERALS[slashBass]}`} />
            )}
          </div>
        )}

      </NoteCell>

      {/* Pin + Extensions — below the cell */}
      <div
        className="absolute -bottom-7 inset-x-0 z-10 flex justify-center items-center gap-1"
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={(e) => {
          if (isPopoverOpen) return
          e.stopPropagation()
          onHoverClear()
        }}
        onMouseLeave={(e) => {
          if (isPopoverOpen) return
          e.stopPropagation()
          onHoverClear()
        }}
      >
        <button
          type="button"
          className={
            isPinned
              ? "inline-flex h-6 min-w-[2.25rem] shrink-0 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-primaryFill)] px-2 text-[10px] font-medium text-[var(--app-primary)]"
              : "inline-flex h-6 min-w-[2.25rem] shrink-0 items-center justify-center rounded-full border border-[var(--app-border)] bg-white px-2 text-[10px] font-medium text-black hover:bg-black/[0.08]"
          }
          aria-label={isPinned ? "Unpin chord" : "Pin chord"}
          aria-pressed={isPinned}
          onClick={handlePinClick}
        >
          <Pin className="h-3 w-3" strokeWidth={2} />
        </button>
        <Popover
          open={isPopoverOpen}
          onOpenChange={onPopoverOpenChange}
          trigger={<PopoverTrigger />}
          position="top"
        >
          <ExtensionPanel
            chordNumeralIdx={chordNumeralIdx}
            selectedExtensions={selectedExtensions}
            activeExtensions={activeExtensions}
            slashBass={slashBass}
            onExtensionChange={onExtensionChange}
            onSlashBassChange={onSlashBassChange}
          />
        </Popover>
      </div>
    </div>
  )
}
