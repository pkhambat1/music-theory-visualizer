import React, { useLayoutEffect, useState } from "react";

/**
 * Draws connector lines between specific cells (by row/id) measured in the DOM.
 */
const LineGroup = ({ containerRef, connections = [], depKey = "" }) => {
  const [lines, setLines] = useState([]);

  useLayoutEffect(() => {
    const container = containerRef?.current;
    const measure = () => {
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
  }, [containerRef, depKey, connections]);

  if (!lines.length) return null;

  const buildPath = (line) => {
    const dx = line.x2 - line.x1;
    const dy = line.y2 - line.y1;
    const c1x = line.x1 + dx * 0.25;
    const c1y = line.y1 + dy * 0.35;
    const c2x = line.x1 + dx * 0.75;
    const c2y = line.y2 - dy * 0.35;
    return `M ${line.x1} ${line.y1} C ${c1x} ${c1y} ${c2x} ${c2y} ${line.x2} ${line.y2}`;
  };

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
        <path
          key={idx}
          d={buildPath(line)}
          stroke="black"
          strokeWidth=".5"
          fill="none"
        />
      ))}
    </svg>
  );
};

export default LineGroup;
