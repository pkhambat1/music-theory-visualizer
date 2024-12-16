import React from "react";
import { renderNote } from "../utils/helpers";
import NoteCell from "./NoteCell";
import NotesArray from "./NotesArray";

const MajorScaleRow = ({ majorScaleNotes, SQUARE_SIDE, showBorder = true }) => (
  <NotesArray
    SQUARE_SIDE={SQUARE_SIDE}
    size={majorScaleNotes.length}
    show_border={showBorder}
  >
    {majorScaleNotes.map((note, idx) => (
      <NoteCell
        SQUARE_SIDE={SQUARE_SIDE}
        idx={idx}
        key={idx}
        show_border={showBorder}
      >
        {renderNote(note)}
      </NoteCell>
    ))}
  </NotesArray>
);

export default MajorScaleRow;
