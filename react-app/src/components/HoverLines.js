import React, { useLayoutEffect, useState } from "react";
import NotesUtils from "../utils/NotesUtils";
import { buildSplinePath } from "../utils/linePath";

/**
 * Draw tapered lines from the hovered diatonic (Roman numeral) cell
 * to its triad notes in the mode row.
 */
const HoverLines = ({
  containerRef,
  hoveredIndex,
  modeNotesWithOverflow,
  modeLeftOverflowSize,
}) => {
  const [lines, setLines] = useState([]);

  useLayoutEffect(() => {
    if (hoveredIndex === null) {
      setLines([]);
      return;
    }

    const container = containerRef?.current;
    const measure = () => {
      if (!container) return;
      const containerRect = container.getBoundingClientRect();

      const modeNotes = NotesUtils.leftTrimOverflowNotes(
        modeNotesWithOverflow,
        modeLeftOverflowSize
      );
      const chordNotes = NotesUtils.getChordNotes(
        modeNotes,
        hoveredIndex,
        "triads"
      );
      const targetIdxs = chordNotes
        .map((note) => modeNotesWithOverflow.indexOf(note))
        .filter((idx) => idx >= 0);

      const sourceEl = container.querySelector(
        `[data-row="diatonic-row"][data-idx="${hoveredIndex}"]`
      );
      if (!sourceEl || !targetIdxs.length) {
        setLines([]);
        return;
      }
      const sourceRect = sourceEl.getBoundingClientRect();
      const sourceX =
        sourceRect.left - containerRect.left + sourceRect.width / 2;
      const sourceY = sourceRect.top - containerRect.top; // top center of source

      const nextLines = targetIdxs
        .map((tIdx) => {
          const targetEl = container.querySelector(
            `[data-row="mode-row"][data-idx="${tIdx}"]`
          );
          if (!targetEl) return null;
          const targetRect = targetEl.getBoundingClientRect();
          return {
            x1: sourceX,
            y1: sourceY,
            x2: targetRect.left - containerRect.left + targetRect.width / 2,
            y2: targetRect.bottom - containerRect.top, // bottom center of target
          };
        })
        .filter(Boolean);

      setLines(nextLines);
    };

    measure();

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => measure())
        : null;
    if (ro && container) {
      ro.observe(container);
    }
    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (ro && container) {
        ro.unobserve(container);
        ro.disconnect();
      }
    };
  }, [containerRef, hoveredIndex, modeNotesWithOverflow, modeLeftOverflowSize]);

  if (!lines.length) return null;

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      {lines.map((line, idx) => (
        <path
          key={idx}
          d={buildSplinePath(line)}
          stroke="black"
          strokeWidth=".5"
          fill="none"
        />
      ))}
    </svg>
  );
};

export default HoverLines;
