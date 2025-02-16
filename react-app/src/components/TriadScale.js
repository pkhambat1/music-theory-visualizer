import React from "react";
import NoteCell from "./NoteCell";
import NotesArray from "./NotesArray";
import { renderNote } from "../utils/helpers";
import NotesUtils from "../utils/NotesUtils";

const TriadScale = ({ baseScale, SQUARE_SIDE, triadNotes, notes }) => {
  console.log("triadNotes", triadNotes);
  return (
    <NotesArray SQUARE_SIDE={SQUARE_SIDE} size={baseScale.length}>
      {Array.from({ length: baseScale.length }).map((_, idx) => (
        <NoteCell
          SQUARE_SIDE={SQUARE_SIDE}
          key={idx}
          idx={idx}
          opt_caption={
            [0, 2, 4, 6].includes(
              NotesUtils.modes["Ionian (major)"].indexOf(idx)
            )
              ? NotesUtils.modes["Ionian (major)"].indexOf(idx) + 1
              : null
          }
        >
          {triadNotes[idx] && renderNote(notes[triadNotes[idx]])}
        </NoteCell>
      ))}
    </NotesArray>
  );
};

export default TriadScale;
