import React from "react";
import NoteCell from "./NoteCell";
import NotesArray from "./NotesArray";
import { renderNote } from "../utils/helpers";
import NotesUtils from "../utils/NotesUtils";

const TriadScale = ({ baseScale, squareSidePx, triadNotes, notes }) => {
  return (
    <NotesArray
      squareSidePx={squareSidePx}
      size={baseScale.length}
      marginPx={squareSidePx}
    >
      {[...Array(baseScale.length)].map((_, idx) => (
        <NoteCell
          squareSidePx={squareSidePx}
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
