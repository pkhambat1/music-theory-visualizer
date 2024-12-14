import React from "react";

const MajorTriads = ({
  SQUARE_SIDE,
  majorScaleNotes,
  setHoveredTriadIndex,
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
              border: "1px solid #333",
              background: "#fff",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={() => {
              setHoveredTriadIndex(idx);

              // Log the triad notes based on `majorScaleNotes` and intervals
              const triadNotes = [0, 2, 4]
                .map((offset) => majorScaleNotes[idx + offset]) // Fetch notes from majorScaleNotes
                .filter(Boolean); // Ignore out-of-bounds indices
              console.log(
                `Hovered on ${triad} (index ${idx}): Notes = ${triadNotes.join(
                  ", "
                )}`
              );
            }}
          >
            {triad}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MajorTriads;
