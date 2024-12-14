import React from "react";
import { renderNote } from "../utils/helpers";

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
        <div
          key={idx}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: `${SQUARE_SIDE}px`,
            height: `${SQUARE_SIDE}px`,
            fontSize: "16px",
            fontWeight: "bold",
            boxSizing: "border-box",
            border: lineBorder,
          }}
        >
          {renderNote(note)}
        </div>
      ))}
    </div>
  </div>
);

export default MajorScaleRow;
