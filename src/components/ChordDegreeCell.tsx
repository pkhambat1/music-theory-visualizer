import type { Extension, ExtensionOption, NoteIndex } from "../lib/music"
import type { Note } from "../models"
import { buildSlashChordVoicing, SQUARE_SIDE, CHORD_CELL_WIDTH } from "../lib/music"
import { playChord, arpeggiateChord } from "../lib/audio"
import { degreeColor } from "../lib/theme"
import NoteCell from "./NoteCell"
import ExtensionPanel from "./ExtensionPanel"
import { Popover, Pill } from "./ui"
import { DEFAULT_TRIGGER } from "./ui/Popover"

const ROMAN_BASE = ["I", "II", "III", "IV", "V", "VI", "VII"]
const DATA_ROW = "diatonic-row"
const HOVER_COLOR = "#000000"

export type ChordDegreeCellProps = {
  chordNumeralIdx: number,
  chordNumeral: string,
  originalNotes: NoteIndex[],
  chordNotesArr: NoteIndex[],
  chordDescriptor: string,
  activeExtensions: Extension[],
  slashBass: number | null,
  modeNotes: NoteIndex[],
  notes: Note[],
  arpeggiate: boolean,
  hoveredIndex: number | null,
  isPopoverOpen: boolean,
  onPopoverOpenChange: (open: boolean) => void,
  selectedExtensions: Extension[],
  extensionOptions: ExtensionOption[],
  onExtensionChange?: (degreeIdx: number, value: string[]) => void,
  onSlashBassChange?: (degreeIdx: number, bassDegree: number | null) => void,
  onHover: (idx: number, original: NoteIndex[], modified: NoteIndex[]) => void,
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
        width: `${CHORD_CELL_WIDTH}px`,
        height: `${SQUARE_SIDE}px`,
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
          width: `${CHORD_CELL_WIDTH}px`,
          ...(hoveredIndex === chordNumeralIdx
            ? { border: `2px solid ${HOVER_COLOR}` }
            : { border: "2px solid transparent" }),
        }}
        onMouseEnter={() => onHover(chordNumeralIdx, originalNotes, chordNotesArr)}
        onMouseLeave={() => onHoverClear()}
        onClick={() => {
          const voicing =
            slashBass !== null
              ? buildSlashChordVoicing(chordNotesArr, modeNotes, chordNumeralIdx, slashBass)
              : chordNotesArr
          const chordNotes = voicing.map((idx) => notes[idx]!)
          if (arpeggiate) {
            arpeggiateChord(chordNotes)
          } else {
            playChord(chordNotes)
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
            trigger={DEFAULT_TRIGGER}
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
