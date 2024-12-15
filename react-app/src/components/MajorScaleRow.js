import React from "react";
import { renderNote } from "../utils/helpers";
import NoteCell from "./NoteCell";

const MajorScaleRow = ({ majorScaleNotes, SQUARE_SIDE, lineBorder }) => (
  <div
    style={{
      width: `${SQUARE_SIDE * 7}px`,
      height: `${SQUARE_SIDE}px`,
      margin: `${SQUARE_SIDE}px auto`,
      position: "relative",
      boxSizing: "content-box",
      background: "#fff",
      border: lineBorder,
    }}
  >
    <div
      style={{
        position: "relative",
        zIndex: 2,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
      }}
    >
      {majorScaleNotes.map((note, idx) => (
        <NoteCell SQUARE_SIDE={SQUARE_SIDE} idx={idx}>
          {renderNote(note)}
        </NoteCell>
      ))}
    </div>
  </div>
);

export default MajorScaleRow;
