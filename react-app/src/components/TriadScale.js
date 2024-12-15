import React from "react";
import NoteCell from "./NoteCell";

const TriadScale = ({ baseScale, majorIntervals, SQUARE_SIDE, triadNotes }) => {
  return (
    <div
      style={{
        width: `${SQUARE_SIDE * baseScale.length}px`,
        height: `${SQUARE_SIDE}px`,
        marginBottom: `${SQUARE_SIDE}px`,
        position: "relative",
        boxSizing: "content-box",
        border: "1px solid #333",
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
        {Array.from({ length: baseScale.length }).map((_, idx) => (
          <NoteCell
            squareSide={SQUARE_SIDE}
            idx={idx}
            opt_caption={
              [0, 2, 4, 6].includes(majorIntervals.indexOf(idx))
                ? majorIntervals.indexOf(idx) + 1
                : null
            }
          >
            {triadNotes[idx] || ""}
          </NoteCell>
        ))}
      </div>
    </div>
  );
};

export default TriadScale;
