import React, { useCallback, useMemo } from "react";
import NoteCell from "./NoteCell";
import { renderNote } from "../lib/notes";


// ─── Helpers ───────────────────────────────────────────────────────

function getCOctave(note: string): string | null {
  if (!note || !/\d$/.test(note)) return null;
  const base = note.slice(0, -1);
  return base === "C" ? note.slice(-1) : null;
}

function formatNoteForDiff(note: string, cOctave: string | null = null): string {
  if (!note) return "";
  const hasOctave = /\d$/.test(note);
  if (hasOctave) {
    const base = note.slice(0, -1);
    return base === "C" ? note : base;
  }
  if (cOctave && note[0]?.toUpperCase() === "C") {
    return `${note}${cOctave}`;
  }
  return note;
}

// ─── Component ─────────────────────────────────────────────────────

export interface ModeNoteCellProps {
  squareSidePx: number;
  idx: number;
  dataIdx: number;
  noteString: string;
  newValue: string;
  onPlay: (note: string) => void;
  isHighlighted?: boolean;
  highlightColor?: string;
  optCaption?: string | number | null;
}

const ModeNoteCell = React.memo(function ModeNoteCell({
  squareSidePx,
  idx,
  dataIdx,
  noteString,
  newValue,
  onPlay,
  isHighlighted = false,
  highlightColor = "#000000",
  optCaption,
}: ModeNoteCellProps) {
  const cOctave = useMemo(() => getCOctave(noteString || ""), [noteString]);
  const displayNote = useMemo(
    () => formatNoteForDiff(noteString || "", cOctave),
    [noteString, cOctave],
  );
  const displayNewValue = useMemo(
    () => formatNoteForDiff(newValue || "", cOctave),
    [newValue, cOctave],
  );

  const isSimple =
    displayNote === displayNewValue &&
    displayNote?.startsWith("C") &&
    /\d$/.test(displayNote);

  const isDifferent = displayNote !== displayNewValue && !!displayNewValue;

  const handleClick = useCallback(() => {
    if (noteString) onPlay(noteString);
  }, [noteString, onPlay]);

  return (
    <NoteCell
      squareSidePx={squareSidePx}
      idx={idx}
      dataRow="mode-row"
      dataIdx={dataIdx}
      showBorder={false}
      onClick={handleClick}
      className="cursor-pointer hover:bg-black/[0.08]"
      optCaption={optCaption}
      style={
        isHighlighted
          ? {
              border: `2px solid ${highlightColor}`,
            }
          : {
              border: "2px solid transparent",
            }
      }
    >
      {isSimple ? (
        renderNote(displayNote)
      ) : isDifferent ? (
        <div className="flex flex-col items-center gap-0 leading-none">
          <span className="relative text-[9px] text-gray-400">
            {displayNote}
            <span className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
              <span className="block h-px w-[140%] bg-gray-400 rotate-[-45deg]" />
            </span>
          </span>
          <span className="text-[13px] font-semibold text-black">
            {displayNewValue}
          </span>
        </div>
      ) : (
        <span>{renderNote(displayNewValue || displayNote)}</span>
      )}
    </NoteCell>
  );
});

export default ModeNoteCell;
