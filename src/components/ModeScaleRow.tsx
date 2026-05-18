import type { Interval, NoteInMode } from "../lib/music"
import { SQUARE_SIDE } from "../lib/music"
import type { Note } from "../models"
import { BLACK } from "../lib/theme"
import NotesArray from "./NotesArray"
import NoteCell from "./NoteCell"
import ModeNoteCell from "./ModeNoteCell"

export type ModeScaleRowProps = {
  selectedModeName: string,
  modeNotesWithOverflow: NoteInMode[],
  modeIntervals: Interval[],
  modeLeftOverflowSize: number,
  highlightedModeIdxs: Set<number>,
  highlightedModeBackgrounds: Map<number, string> | null,
  onPlayNote: (note: Note) => void,
}

export default function ModeScaleRow({
  selectedModeName,
  modeNotesWithOverflow,
  modeIntervals,
  modeLeftOverflowSize,
  highlightedModeIdxs,
  highlightedModeBackgrounds,
  onPlayNote,
}: ModeScaleRowProps) {
  return (
    <NotesArray
      size={modeNotesWithOverflow.length}
      cellWidth={SQUARE_SIDE}
      clipContent
      zIndex={2}
      rowBackground="white"
      rowStrokeColor={BLACK}
      caption={`${selectedModeName} Scale`}
      captionSubtitle="Notes that fall within the selected mode"
    >
      <div
        className="absolute z-0 flex"
        style={{
          translate: `${(modeLeftOverflowSize * 100) / modeIntervals.length}%`,
        }}
      >
        {modeIntervals.map((_, idx) => (
          <NoteCell key={idx} idx={idx} />
        ))}
      </div>

      {modeNotesWithOverflow.map((noteInMode, idx) => {
        const isHighlighted = highlightedModeIdxs.has(idx)
        const scaleDegreeCaption =
          noteInMode.degree >= 0 && noteInMode.degree < modeIntervals.length - 1
            ? noteInMode.degree + 1
            : null
        return (
          <ModeNoteCell
            key={idx}
            idx={idx}
            dataIdx={idx}
            originalNote={noteInMode.note}
            newValue={noteInMode.spelled}
            onPlay={onPlayNote}
            isHighlighted={isHighlighted}
            highlightBackground={highlightedModeBackgrounds?.get(noteInMode.index) ?? null}
            optCaption={scaleDegreeCaption}
          />
        )
      })}
    </NotesArray>
  )
}
