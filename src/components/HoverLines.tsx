import { useLayoutEffect, useState } from "react";
import colors from "tailwindcss/colors";
import type { ChordHighlightPair, Line, LineType, NoteIndex } from "../types";
import { leftTrimOverflowNotes } from "../lib/music/scale";
import { getChordNotes } from "../lib/music/chords";
import { buildSplinePath } from "../lib/linePath";

export interface HoverLinesProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  hoveredIndex: number | null;
  modeNotesWithOverflow: NoteIndex[];
  modeLeftOverflowSize: number;
  chordHighlightPairs?: ChordHighlightPair[];
  neonColor?: string;
  originalChordNotes?: NoteIndex[];
  modifiedChordNotes?: NoteIndex[];
}

export default function HoverLines({
  containerRef,
  hoveredIndex,
  modeNotesWithOverflow,
  modeLeftOverflowSize,
  chordHighlightPairs = [],
  neonColor = colors.cyan["400"],
  originalChordNotes = [],
  modifiedChordNotes = [],
}: HoverLinesProps) {
  const [lines, setLines] = useState<Line[]>([]);

  useLayoutEffect(() => {
    if (hoveredIndex === null) {
      setLines([]);
      return;
    }

    const container = containerRef?.current;

    const measure = () => {
      if (!container) return;
      const containerRect = container.getBoundingClientRect();

      // Source element (the hovered diatonic cell)
      const sourceEl = container.querySelector(
        `[data-row="diatonic-row"][data-idx="${hoveredIndex}"]`,
      );
      if (!sourceEl) {
        setLines([]);
        return;
      }
      const sourceRect = sourceEl.getBoundingClientRect();
      const sourceX =
        sourceRect.left - containerRect.left + sourceRect.width / 2;
      const sourceY = sourceRect.top - containerRect.top;

      // Helper: build a line from source to a mode-row target
      const lineToModeTarget = (
        tIdx: number,
        type: LineType,
      ): Line | null => {
        const targetEl = container.querySelector(
          `[data-row="mode-row"][data-idx="${tIdx}"]`,
        );
        if (!targetEl) return null;
        const targetRect = targetEl.getBoundingClientRect();
        return {
          x1: sourceX,
          y1: sourceY,
          x2:
            targetRect.left - containerRect.left + targetRect.width / 2,
          y2: targetRect.bottom - containerRect.top,
          type,
        };
      };

      // Helper: line to chromatic slider row (for extension-added notes)
      const lineToBaseTarget = (
        noteIdx: number,
        type: LineType,
      ): Line | null => {
        const targetEl = container.querySelector(
          `[data-row="base-row"][data-idx="${noteIdx}"]`,
        );
        if (!targetEl) return null;
        const targetRect = targetEl.getBoundingClientRect();
        return {
          x1: sourceX,
          y1: sourceY,
          x2:
            targetRect.left - containerRect.left + targetRect.width / 2,
          y2: targetRect.bottom - containerRect.top,
          type,
        };
      };

      // ── Diatonic → Mode lines (extension-aware) ──
      let diatonicLines: Line[] = [];
      const hasExtensionData =
        originalChordNotes.length > 0 && modifiedChordNotes.length > 0;

      if (hasExtensionData) {
        const originalSet = new Set(originalChordNotes);
        const modifiedSet = new Set(modifiedChordNotes);

        const keptNotes = originalChordNotes.filter((n) =>
          modifiedSet.has(n),
        );
        const removedNotes = originalChordNotes.filter(
          (n) => !modifiedSet.has(n),
        );
        const addedNotes = modifiedChordNotes.filter(
          (n) => !originalSet.has(n),
        );

        const resolveToModeRow = (
          noteList: NoteIndex[],
          type: LineType,
        ): Line[] =>
          noteList
            .map((note) => {
              const tIdx = modeNotesWithOverflow.indexOf(note);
              if (tIdx < 0) return null;
              return lineToModeTarget(tIdx, type);
            })
            .filter((l): l is Line => l !== null);

        const resolveToBaseRow = (
          noteList: NoteIndex[],
          type: LineType,
        ): Line[] =>
          noteList
            .map((note) => lineToBaseTarget(note, type))
            .filter((l): l is Line => l !== null);

        diatonicLines = [
          ...resolveToModeRow(removedNotes, "removed"),
          ...resolveToModeRow(keptNotes, "kept"),
          ...resolveToBaseRow(addedNotes, "added"),
        ];
      } else {
        // Fallback: compute internally from unmodified triad
        const modeNotes = leftTrimOverflowNotes(
          modeNotesWithOverflow,
          modeLeftOverflowSize,
        );
        const chordNotesArr = getChordNotes(
          modeNotes,
          hoveredIndex,
          "triads",
        );
        const targetIdxs = chordNotesArr
          .map((note) => modeNotesWithOverflow.indexOf(note))
          .filter((idx) => idx >= 0);

        diatonicLines = targetIdxs
          .map((tIdx) => lineToModeTarget(tIdx, "diatonic"))
          .filter((l): l is Line => l !== null);
      }

      // ── Base → Mode lines (chromatic highlighting) ──
      const baseLines: Line[] = chordHighlightPairs
        .map(({ baseIdx, modeIdx }) => {
          const fromEl = container.querySelector(
            `[data-row="base-row"][data-idx="${baseIdx}"]`,
          );
          const toEl = container.querySelector(
            `[data-row="mode-row"][data-idx="${modeIdx}"]`,
          );
          if (!fromEl || !toEl) return null;
          const fromRect = fromEl.getBoundingClientRect();
          const toRect = toEl.getBoundingClientRect();
          return {
            x1:
              fromRect.left - containerRect.left + fromRect.width / 2,
            y1: fromRect.bottom - containerRect.top,
            x2:
              toRect.left - containerRect.left + toRect.width / 2,
            y2: toRect.top - containerRect.top,
            type: "base" as LineType,
          };
        })
        .filter((l): l is Line => l !== null);

      setLines([...diatonicLines, ...baseLines]);
    };

    measure();

    const ro = new ResizeObserver(() => measure());
    const container2 = containerRef?.current;
    if (container2) ro.observe(container2);

    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (container2) {
        ro.unobserve(container2);
        ro.disconnect();
      }
    };
  }, [
    containerRef,
    hoveredIndex,
    modeNotesWithOverflow,
    modeLeftOverflowSize,
    chordHighlightPairs,
    originalChordNotes,
    modifiedChordNotes,
  ]);

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
      {lines.map((line, idx) => {
        const isRemoved = line.type === "removed";
        return (
          <path
            key={idx}
            d={buildSplinePath(line)}
            stroke={
              isRemoved ? "rgba(100, 116, 139, 0.4)" : neonColor
            }
            strokeWidth={isRemoved ? "1" : "1.5"}
            strokeLinecap="round"
            strokeDasharray={isRemoved ? "4 3" : undefined}
            style={
              isRemoved
                ? undefined
                : {
                    filter: `drop-shadow(0 0 6px ${neonColor})`,
                  }
            }
            fill="none"
          />
        );
      })}
    </svg>
  );
}
