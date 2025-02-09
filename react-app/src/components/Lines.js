import React from "react";
import { baseScaleLeftOverflowSize } from "../App";

const Lines = ({
  modeIntervals,
  SQUARE_SIDE,
  borderWidth,
  baseScale,
  hackYOffset = 0,
}) => {
  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {Array.from({ length: 7 }).map((_, idx) => {
        const topPos = {
          x:
            baseScaleLeftOverflowSize * SQUARE_SIDE +
            modeIntervals[idx] * SQUARE_SIDE +
            SQUARE_SIDE / 2 +
            borderWidth, // Center of the top square horizontally
          y: (-1 + hackYOffset) * (SQUARE_SIDE + borderWidth), // Bottom edge of the top square, adjusted for border
        };

        const bottomGridOffsetX =
          ((baseScale.length - modeIntervals.length) * SQUARE_SIDE) / 2; // Adjust based on alignment
        const bottomPos = {
          x:
            baseScaleLeftOverflowSize * SQUARE_SIDE +
            idx * SQUARE_SIDE +
            SQUARE_SIDE / 2 +
            bottomGridOffsetX +
            borderWidth, // Center of the bottom square horizontally
          y: (0 + hackYOffset) * (SQUARE_SIDE + borderWidth) + borderWidth, // Top edge of the bottom square, adjusted for border
        };

        // Assertion: Ensure the vertical distance between y2 and y1 equals SQUARE_SIDE
        const verticalDistance = bottomPos.y - topPos.y;
        console.assert(
          verticalDistance === SQUARE_SIDE + 2 * borderWidth,
          `Assertion failed: y2 - y1 = ${verticalDistance}, expected ${
            SQUARE_SIDE + 2 * borderWidth
          }`
        );

        return (
          <line
            key={idx}
            x1={topPos.x}
            y1={topPos.y}
            x2={bottomPos.x}
            y2={bottomPos.y}
            stroke="black"
            strokeWidth="1"
          />
        );
      })}
    </svg>
  );
};

export default Lines;
