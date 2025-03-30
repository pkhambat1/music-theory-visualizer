import React from "react";
import { baseScaleLeftOverflowSize } from "../App";

const HoverLines = ({
  hoveredIndex,
  SQUARE_SIDE,
  borderWidth,
  baseScale,
  majorIntervals,
  belowRowIndex,
}) => {
  if (hoveredIndex === null) return null; // No lines to render when no cell is hovered

  const sourceX =
    SQUARE_SIDE *
    (baseScaleLeftOverflowSize +
      hoveredIndex +
      0.5 +
      (baseScale.length - majorIntervals.length) / 2);
  const sourcePos = {
    x: sourceX,

    y: belowRowIndex * 2 * (SQUARE_SIDE + borderWidth), // Bottom edge of MajorTriads row
  };

  const targetOffsets = [0, 2, 4];

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
      {targetOffsets.map((targetIdx) => {
        const targetPos = {
          x: sourceX + SQUARE_SIDE * targetIdx,
          y: (belowRowIndex * 2 - 1) * (SQUARE_SIDE + borderWidth),
        };

        return (
          <line
            key={`hover-line-${hoveredIndex}-${targetIdx}`}
            x1={sourcePos.x}
            y1={sourcePos.y}
            x2={targetPos.x}
            y2={targetPos.y}
            stroke="black"
            strokeWidth=".5"
          />
        );
      })}
    </svg>
  );
};

export default HoverLines;
