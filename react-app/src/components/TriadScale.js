import React from "react";

const TriadScale = ({ baseScale, majorIntervals, SQUARE_SIDE }) => {
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
              position: "relative", // Needed for caption positioning
            }}
          >
            {/* Add captions for 1, 3, 5, 7th of major scale */}
            {[0, 2, 4, 6].includes(majorIntervals.indexOf(idx)) && (
              <div
                style={{
                  position: "absolute",
                  bottom: "5px",
                  fontSize: "12px",
                  color: "#666",
                }}
              >
                {majorIntervals.indexOf(idx) + 1}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TriadScale;
