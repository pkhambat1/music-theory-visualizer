import { useLayoutEffect, useState } from "react";
import type { Connection } from "../types";
import { buildSplinePath, type LineCoords } from "../lib/linePath";

export interface LineGroupProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  connections?: Connection[];
  depKey?: string;
}

export default function LineGroup({
  containerRef,
  connections = [],
  depKey = "",
}: LineGroupProps) {
  const [lines, setLines] = useState<LineCoords[]>([]);

  useLayoutEffect(() => {
    const container = containerRef?.current;

    const measure = () => {
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const nextLines: LineCoords[] = [];

      connections.forEach(({ fromRow, fromIdx, toRow, toIdx }) => {
        const fromEl = container.querySelector(
          `[data-row="${fromRow}"][data-idx="${fromIdx}"]`,
        );
        const toEl = container.querySelector(
          `[data-row="${toRow}"][data-idx="${toIdx}"]`,
        );
        if (!fromEl || !toEl) return;

        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();
        const scrollLeft = container.scrollLeft;
        const scrollTop = container.scrollTop;

        nextLines.push({
          x1:
            fromRect.left -
            containerRect.left +
            fromRect.width / 2 +
            scrollLeft,
          y1: fromRect.bottom - containerRect.top + scrollTop,
          x2:
            toRect.left -
            containerRect.left +
            toRect.width / 2 +
            scrollLeft,
          y2: toRect.top - containerRect.top + scrollTop,
        });
      });

      setLines(nextLines);
    };

    measure();

    const ro = new ResizeObserver(() => measure());
    if (container) ro.observe(container);

    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (container) {
        ro.unobserve(container);
        ro.disconnect();
      }
    };
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
        overflow: "visible",
      }}
    >
      {lines.map((line, idx) => (
        <path
          key={idx}
          d={buildSplinePath(line)}
          stroke="#000"
          strokeWidth="1"
          fill="none"
        />
      ))}
    </svg>
  );
}
