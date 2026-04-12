import React, { useCallback, useMemo } from "react"
import type { Note } from "../models"
import { renderNote } from "./NoteLabel"
import Strikethrough from "./Strikethrough"
import NoteCell from "./NoteCell"
import { MUTED_TEXT } from "../lib/theme"

export type ModeNoteCellProps = {
  idx: number,
  dataIdx: number,
  originalNote: Note | null,
  newValue: Note | null,
  onPlay: (note: Note) => void,
  isHighlighted: boolean,
  optCaption?: string | number | null,
}

const HIGHLIGHT_COLOR = "#000000"

const ModeNoteCell = React.memo(function ModeNoteCell({
  idx,
  dataIdx,
  originalNote,
  newValue,
  onPlay,
  isHighlighted,
  optCaption,
}: ModeNoteCellProps) {
  const noteLabel = useMemo(
    () => originalNote?.label() ?? "",
    [originalNote],
  )
  const newLabel = useMemo(
    () => newValue?.label() ?? "",
    [newValue],
  )

  const isSimple =
    noteLabel === newLabel &&
    originalNote?.isC() === true

  const isDifferent = noteLabel !== newLabel && newLabel !== ""

  const handleClick = useCallback(() => {
    if (originalNote) onPlay(originalNote)
  }, [originalNote, onPlay])

  return (
    <NoteCell
      idx={idx}
      dataRow="mode-row"
      dataIdx={dataIdx}
      onClick={handleClick}
      className="cursor-pointer"
      optCaption={optCaption}
      style={
        isHighlighted
          ? {
              border: `2px solid ${HIGHLIGHT_COLOR}`,
            }
          : {
              border: "2px solid transparent",
            }
      }
    >
      {isSimple && originalNote ? (
        renderNote(originalNote)
      ) : isDifferent && newValue ? (
        <div className="flex flex-col items-center gap-0 leading-none">
          <span className={`relative text-sm font-normal ${MUTED_TEXT}`}>
            {noteLabel}
            <Strikethrough />
          </span>
          <span className="text-[13px] font-semibold text-black">
            {newLabel}
          </span>
        </div>
      ) : (
        <span>{(newValue ?? originalNote) ? renderNote((newValue ?? originalNote)!) : ""}</span>
      )}
    </NoteCell>
  )
})

export default ModeNoteCell
