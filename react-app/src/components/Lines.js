import React from "react";
import {
  addOverflowToModeIntervals,
  baseScaleLeftOverflow,
  baseScaleWithOverflowSize,
} from "../App";

const LineGroup = ({
  aboveRowIntervals,
  square_side_px,
  borderWidth,
  belowRow,
  aboveRowIndex,
  belowRowSquareSidePx,
}) => {
  const maxRowWidth = baseScaleWithOverflowSize;

  const numCellsInAboveRow =
    aboveRowIntervals[aboveRowIntervals.length - 1] + 1;

  const aboveRowLeftOverflow = (maxRowWidth - numCellsInAboveRow) / 2;

  console.log("aboveRowLeftOverflow", aboveRowLeftOverflow);

  const belowRowLeftOverflow =
    (addOverflowToModeIntervals(belowRow).length - belowRow.length) / 2;

  console.log(
    "aboveRowIndex",
    aboveRowIndex,
    "maxRowWidth",
    maxRowWidth,
    "numCellsInAboveRow",
    numCellsInAboveRow,
    "aboveRowLeftOverflow",
    aboveRowLeftOverflow,
    "belowRowLeftOverflow",
    belowRowLeftOverflow
  );

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
      {[...Array(aboveRowIntervals.length)].map((_, idx) => {
        const topPos = {
          x:
            aboveRowLeftOverflow * square_side_px +
            aboveRowIntervals[idx] * square_side_px +
            square_side_px / 2 +
            borderWidth, // Center of the top square horizontally
          y: (1 + aboveRowIndex * 2) * (square_side_px + borderWidth), // Bottom edge of the top square, adjusted for border
        };

        const bottomGridOffsetX =
          ((belowRow.length - aboveRowIntervals.length) *
            belowRowSquareSidePx) /
          2; // Adjust based on alignment
        const bottomPos = {
          x:
            belowRowLeftOverflow * belowRowSquareSidePx +
            idx * belowRowSquareSidePx +
            belowRowSquareSidePx / 2 +
            bottomGridOffsetX +
            borderWidth, // Center of the bottom square horizontally
          y:
            (2 + aboveRowIndex * 2) * (square_side_px + borderWidth) +
            borderWidth, // Top edge of the bottom square, adjusted for border
        };

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

export default LineGroup;
