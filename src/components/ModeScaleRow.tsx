import type { Interval, NoteIndex } from "../lib/music"
import type { Note } from "../models"
import { colors } from "../lib/theme"
import NotesArray from "./NotesArray"
import NoteCell from "./NoteCell"
import ModeNoteCell from "./ModeNoteCell"

export type ModeScaleRowProps = {
  selectedModeName: string,
  modeNotesWithOverflow: NoteIndex[],
  modeIntervals: Interval[],
  modeLeftOverflowSize: number,
  spelledModeNotes: (Note | null)[],
  highlightedModeIdxs: Set<number>,
  notes: Note[],
  onPlayNote: (note: Note) => void,
}

export default function ModeScaleRow({
  selectedModeName,
  modeNotesWithOverflow,
  modeIntervals,
  modeLeftOverflowSize,
  spelledModeNotes,
  highlightedModeIdxs,
  notes,
  onPlayNote,
}: ModeScaleRowProps) {
  return (
    <NotesArray
      size={modeNotesWithOverflow.length}
      clipContent
      zIndex={2}
      rowBackground={colors.rowBg}
      caption={`${selectedModeName} Scale`}
      captionSubtitle="Notes in the selected mode"
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

      {modeNotesWithOverflow.map((noteIdx, idx) => {
        const noteObj = notes[noteIdx] ?? null
        const isHighlighted = highlightedModeIdxs.has(idx)
        const visibleDegree = idx - modeLeftOverflowSize
        const scaleDegreeCaption =
          visibleDegree >= 0 && visibleDegree < modeIntervals.length - 1
            ? visibleDegree + 1
            : null
        return (
          <ModeNoteCell
            key={idx}
            idx={idx}
            dataIdx={idx}
            noteString={noteObj}
            newValue={spelledModeNotes[idx] ?? null}
            onPlay={onPlayNote}
            isHighlighted={isHighlighted}
            optCaption={scaleDegreeCaption}
          />
        )
      })}
    </NotesArray>
  )
}
