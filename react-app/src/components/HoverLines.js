import React from "react";

const HoverLines = ({
  hoveredIndex,
  SQUARE_SIDE,
  borderWidth,
  baseScale,
  majorIntervals,
}) => {
  if (hoveredIndex === null) return null; // No lines to render when no cell is hovered

  // Generate the positions of the lines for the hovered cell
  const sourcePos = {
    x:
      hoveredIndex * SQUARE_SIDE +
      SQUARE_SIDE / 2 +
      borderWidth +
      ((baseScale.length - majorIntervals.length) / 2) * SQUARE_SIDE,
    y: 6 * (SQUARE_SIDE + borderWidth) + borderWidth, // Bottom edge of MajorTriads row
  };

  const targetIndices = [hoveredIndex, hoveredIndex + 2, hoveredIndex + 4];
  const bottomGridOffsetX = ((baseScale.length - 7) * SQUARE_SIDE) / 2;

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 2, // Ensure these lines are above the regular ones
      }}
    >
      {targetIndices.map((targetIdx) => {
        const targetPos = {
          x:
            targetIdx * SQUARE_SIDE +
            SQUARE_SIDE / 2 +
            bottomGridOffsetX +
            borderWidth,
          y: 5 * (SQUARE_SIDE + borderWidth), // Top edge of MajorScaleRow
        };

        return (
          <line
            key={`hover-line-${hoveredIndex}-${targetIdx}`}
            x1={sourcePos.x}
            y1={sourcePos.y}
            x2={targetPos.x}
            y2={targetPos.y}
            stroke="black"
            strokeWidth="1"
          />
        );
      })}
    </svg>
  );
};

export default HoverLines;
