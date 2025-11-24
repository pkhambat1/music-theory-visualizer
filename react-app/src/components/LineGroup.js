import React, { useLayoutEffect, useState } from "react";

/**
 * Draws connector lines between specific cells (by row/id) measured in the DOM.
 */
const LineGroup = ({ containerRef, connections = [], depKey = "" }) => {
  const [lines, setLines] = useState([]);

  useLayoutEffect(() => {
    const container = containerRef?.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const nextLines = [];

    connections.forEach(({ fromRow, fromIdx, toRow, toIdx }) => {
      const fromEl = container.querySelector(
        `[data-row="${fromRow}"][data-idx="${fromIdx}"]`
      );
      const toEl = container.querySelector(
        `[data-row="${toRow}"][data-idx="${toIdx}"]`
      );
      if (!fromEl || !toEl) return;
      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();
      nextLines.push({
        x1: fromRect.left - containerRect.left + fromRect.width / 2,
        y1: fromRect.bottom - containerRect.top, // bottom center of from cell
        x2: toRect.left - containerRect.left + toRect.width / 2,
        y2: toRect.top - containerRect.top, // top center of to cell
      });
    });

    setLines(nextLines);
  }, [containerRef, depKey, connections]);

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
        zIndex: 1,
      }}
    >
      {lines.map((line, idx) => (
        <line
          key={idx}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="black"
          strokeWidth=".5"
        />
      ))}
    </svg>
  );
};

export default LineGroup;
