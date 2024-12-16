import React from "react";
import NoteCell from "./NoteCell";
import NotesArray from "./NotesArray";
import { renderNote } from "../utils/helpers";

const TriadScale = ({ baseScale, majorIntervals, SQUARE_SIDE, triadNotes }) => {
  return (
    <NotesArray SQUARE_SIDE={SQUARE_SIDE} size={baseScale.length}>
      {Array.from({ length: baseScale.length }).map((_, idx) => (
        <NoteCell
          SQUARE_SIDE={SQUARE_SIDE}
          key={idx}
          idx={idx}
          opt_caption={
            [0, 2, 4, 6].includes(majorIntervals.indexOf(idx))
              ? majorIntervals.indexOf(idx) + 1
              : null
          }
        >
          {triadNotes[idx] && renderNote(triadNotes[idx])}
        </NoteCell>
      ))}
    </NotesArray>
  );
};

export default TriadScale;
