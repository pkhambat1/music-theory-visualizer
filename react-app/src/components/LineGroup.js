import React from "react";
import { baseScaleWithOverflowSize } from "../App";

const LineGroup = ({
  aboveRowIntervals,
  aboveRowSquareSidePx,
  borderWidth,
  belowRow,
  aboveRowIndex,
  belowRowSquareSidePx,
  isBelowRowModeInterval = true,
}) => {
  const maxRowWidth = baseScaleWithOverflowSize; // 23
  const scaleUpFactor = belowRowSquareSidePx / aboveRowSquareSidePx; // 1 or 2
  const numCellsInAboveRow =
    aboveRowIntervals[aboveRowIntervals.length - 1] + 1;
  const aboveRowLeftOverflow = (maxRowWidth - numCellsInAboveRow) / 2;
  const unitSizedCellSpacesLeftOfBottomRow =
    (maxRowWidth -
      belowRow.length * (belowRowSquareSidePx / aboveRowSquareSidePx)) /
    2;
  const topY = (1 + aboveRowIndex * 2) * (aboveRowSquareSidePx + borderWidth);
  const bottomY =
    (2 + aboveRowIndex * 2) * (aboveRowSquareSidePx + borderWidth) + borderWidth;

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
        const topX =
          aboveRowSquareSidePx *
            (aboveRowLeftOverflow + aboveRowIntervals[idx] + 0.5) +
          borderWidth;

        const topPos = {
          x: topX,
          y: topY,
        };

        const bottomPos = {
          x:
            aboveRowSquareSidePx *
              (unitSizedCellSpacesLeftOfBottomRow + 0.5 * scaleUpFactor) + // base position
            idx * scaleUpFactor * aboveRowSquareSidePx,
          y: bottomY,
        };

        return (
          <line
            key={idx}
            x1={topPos.x}
            y1={topPos.y}
            x2={bottomPos.x}
            y2={bottomPos.y}
            stroke="black"
            strokeWidth=".5"
          />
        );
      })}
    </svg>
  );
};

export default LineGroup; 