import React from "react";
import NoteCell from "./NoteCell";

const MajorTriadsRow = ({
  SQUARE_SIDE,
  majorScaleNotes,
  setHoveredTriadIndex,
  setTriadNotes,
  notes,
  baseScale,
}) => {
  const triads = ["I", "II", "III", "IV", "V", "VI", "VII"];

  return (
    <div
      style={{
        width: `${SQUARE_SIDE * triads.length}px`,
        height: `${SQUARE_SIDE}px`,
        margin: `${SQUARE_SIDE}px auto`,
        position: "relative",
        boxSizing: "content-box",
        background: "#fff",
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
        {triads.map((triad, idx) => (
          <NoteCell
            idx={idx}
            SQUARE_SIDE={SQUARE_SIDE}
            onMouseEnter={() => {
              setHoveredTriadIndex(idx);

              // Fetch triad notes
              const triadNotes = [0, 2, 4].map(
                (offset) => majorScaleNotes[idx + offset]
              );

              // Calculate the relative indices in the top row
              const rootNoteIndex = notes.indexOf(majorScaleNotes[idx]);
              const triadIndices = triadNotes.map((note) => {
                const relativeIndex = notes.indexOf(note) - rootNoteIndex;
                return (relativeIndex + baseScale.length) % baseScale.length; // Ensure positive index with wrap-around
              });

              console.log("triadIndices", triadIndices);

              // Update `TriadScale` with notes at calculated indices
              const triadScale = Array(baseScale.length).fill(null); // Empty array for the top row
              triadIndices.forEach((relativeIndex, i) => {
                if (relativeIndex >= 0 && relativeIndex < baseScale.length) {
                  triadScale[relativeIndex] = triadNotes[i];
                }
              });

              setTriadNotes(triadScale); // Pass calculated triad notes to `TriadScale`
            }}
            onMouseOut={() => {
              setHoveredTriadIndex(null);
              setTriadNotes([]);
            }}
          >
            {triad}
          </NoteCell>
        ))}
      </div>
    </div>
  );
};

export default MajorTriadsRow;
