import React from "react";
import { renderNote } from "../utils/helpers";
import NoteCell from "./NoteCell";
import NotesArray from "./NotesArray";

const MajorScaleRow = ({ majorScaleNotes, SQUARE_SIDE }) => (
  <NotesArray SQUARE_SIDE={SQUARE_SIDE} size={majorScaleNotes.length}>
    {majorScaleNotes.map((note, idx) => (
      <NoteCell SQUARE_SIDE={SQUARE_SIDE} idx={idx} key={idx}>
        {renderNote(note)}
      </NoteCell>
    ))}
  </NotesArray>
);

export default MajorScaleRow;
