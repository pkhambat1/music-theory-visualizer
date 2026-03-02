import type { Extension, ExtensionOption, NoteRef } from "../lib/music"
import type { Note } from "../models"
import { buildSlashChordVoicing, CHORD_CELL_SIDE } from "../lib/music"
import { playChord, arpeggiateChord } from "../lib/audio"
import { degreeColor } from "../lib/theme"
import NoteCell from "./NoteCell"
import ExtensionPanel from "./ExtensionPanel"
import { Popover, PopoverTrigger, Pill } from "./ui"

const ROMAN_BASE = ["I", "II", "III", "IV", "V", "VI", "VII"]
const DATA_ROW = "diatonic-row"
const HOVER_COLOR = "#000000"

export type ChordDegreeCellProps = {
  chordNumeralIdx: number,
  chordNumeral: string,
  originalNotes: NoteRef[],
  chordNotesArr: NoteRef[],
  chordDescriptor: string,
  activeExtensions: Extension[],
  slashBass: number | null,
  modeNotes: NoteRef[],
  notes: Note[],
  arpeggiate: boolean,
  hoveredIndex: number | null,
  isPopoverOpen: boolean,
  onPopoverOpenChange: (open: boolean) => void,
  selectedExtensions: Extension[],
  extensionOptions: ExtensionOption[],
  onExtensionChange?: (degreeIdx: number, value: string[]) => void,
  onSlashBassChange?: (degreeIdx: number, bassDegree: number | null) => void,
  onHover: (idx: number, original: NoteRef[], modified: NoteRef[]) => void,
  onHoverClear: () => void,
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
  notes,
  arpeggiate,
  hoveredIndex,
  isPopoverOpen,
  onPopoverOpenChange,
  selectedExtensions,
  extensionOptions,
  onExtensionChange,
  onSlashBassChange,
  onHover,
  onHoverClear,
}: ChordDegreeCellProps) {
  const degreeBg = degreeColor(chordNumeralIdx)

  return (
    <div
      className="relative"
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
        className="group cursor-pointer hover:bg-black/[0.08] transition-colors"
        style={{
          width: `${CHORD_CELL_SIDE}px`,
          height: `${CHORD_CELL_SIDE}px`,
          ...(hoveredIndex === chordNumeralIdx
            ? { border: `2px solid ${HOVER_COLOR}` }
            : {}),
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
          console.log("hoveredNotes", chordNoteObjs)
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
            <span className="text-[9px]">/{ROMAN_BASE[slashBass] ?? ""}</span>
          )}
        </span>

        {(activeExtensions.length > 0 || slashBass !== null) && (
          <div className="absolute bottom-0.5 inset-x-0 flex flex-wrap justify-center gap-[2px] px-0.5">
            {activeExtensions.map((ext) => (
              <Pill key={ext} label={ext} />
            ))}
            {slashBass !== null && (
              <Pill label={`/${ROMAN_BASE[slashBass]}`} />
            )}
          </div>
        )}

        {/* Controls */}
        <div
          className="absolute right-1 bottom-1 z-10 opacity-30 transition-opacity pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={(e) => {
            e.stopPropagation()
            onHoverClear()
          }}
          onMouseLeave={(e) => {
            e.stopPropagation()
            const related = e.relatedTarget as Element | null
            if (related?.closest?.("[data-popover-panel]")) return
            onHover(chordNumeralIdx, originalNotes, chordNotesArr)
          }}
        >
          <Popover
            open={isPopoverOpen}
            onOpenChange={onPopoverOpenChange}
            trigger={<PopoverTrigger />}
            position="top"
          >
            <ExtensionPanel
              chordNumeralIdx={chordNumeralIdx}
              extensionOptions={extensionOptions}
              selectedExtensions={selectedExtensions}
              activeExtensions={activeExtensions}
              slashBass={slashBass}
              onExtensionChange={onExtensionChange}
              onSlashBassChange={onSlashBassChange}
            />
          </Popover>
        </div>
      </NoteCell>
    </div>
  )
}
