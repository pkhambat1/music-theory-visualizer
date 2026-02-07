import type { NoteIndex, NoteName } from "../types";
import NoteCell from "./NoteCell";
import NotesArray from "./NotesArray";
import { renderNote } from "../lib/notes";
import { IONIAN } from "../lib/music/modes";

export interface TriadScaleProps {
  baseScale: readonly string[];
  squareSidePx: number;
  triadNotes: (NoteIndex | null)[];
  notes: NoteName[];
  dataRow?: string;
  caption?: string;
}

export default function TriadScale({
  baseScale,
  squareSidePx,
  triadNotes,
  notes,
  dataRow = "triad-row",
  caption,
}: TriadScaleProps) {
  return (
    <NotesArray
      squareSidePx={squareSidePx}
      size={baseScale.length}
      caption={caption}
    >
      {[...Array(baseScale.length)].map((_, idx) => {
        const modePos = IONIAN.indexOf(idx as any);
        const optCaption =
          [0, 2, 4, 6].includes(modePos) ? modePos + 1 : null;
        const noteIdx = triadNotes[idx];
        return (
          <NoteCell
            squareSidePx={squareSidePx}
            key={idx}
            idx={idx}
            dataRow={dataRow}
            dataIdx={idx}
            optCaption={optCaption}
          >
            {noteIdx != null && notes[noteIdx]
              ? renderNote(notes[noteIdx]!)
              : null}
          </NoteCell>
        );
      })}
    </NotesArray>
  );
}
