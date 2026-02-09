import { useLayoutEffect, useState } from "react";
import colors from "tailwindcss/colors";
import type { ChordHighlightPair, Line, LineType, NoteIndex } from "../types";
import { leftTrimOverflowNotes } from "../lib/music/scale";
import { getChordNotes } from "../lib/music/chords";
import { buildSplinePath } from "../lib/linePath";

// ─── Interval → degree label mapping ────────────────────────────────

const INTERVAL_DEGREE_LABELS: Record<number, string> = {
  0: "1",
  1: "\u266d2",
  2: "2",
  3: "\u266d3",
  4: "3",
  5: "4",
  6: "\u266d5",
  7: "5",
  8: "\u266d6",
  9: "6",
  10: "\u266d7",
  11: "7",
  12: "8",
  13: "\u266d9",
  14: "9",
};

function getIntervalLabel(semitones: number): string {
  return INTERVAL_DEGREE_LABELS[semitones] ?? `${semitones}`;
}

// ─── Types ──────────────────────────────────────────────────────────

interface LineWithInterval extends Line {
  intervalSemitones?: number;
}

// ─── Component ──────────────────────────────────────────────────────

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
  const [lines, setLines] = useState<LineWithInterval[]>([]);

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

      // Determine the root note for interval calculation
      const modeNotes = leftTrimOverflowNotes(
        modeNotesWithOverflow,
        modeLeftOverflowSize,
      );
      const chordRoot = modeNotes[hoveredIndex];

      // Helper: build a line from source to a mode-row target
      const lineToModeTarget = (
        tIdx: number,
        type: LineType,
        noteIdx?: NoteIndex,
      ): LineWithInterval | null => {
        const targetEl = container.querySelector(
          `[data-row="mode-row"][data-idx="${tIdx}"]`,
        );
        if (!targetEl) return null;
        const targetRect = targetEl.getBoundingClientRect();
        const intervalSemitones =
          noteIdx !== undefined && chordRoot !== undefined
            ? noteIdx - chordRoot
            : undefined;
        return {
          x1: sourceX,
          y1: sourceY,
          x2:
            targetRect.left - containerRect.left + targetRect.width / 2,
          y2: targetRect.bottom - containerRect.top,
          type,
          intervalSemitones,
        };
      };

      // Helper: line to chromatic slider row (for extension-added notes)
      const lineToBaseTarget = (
        noteIdx: number,
        type: LineType,
      ): LineWithInterval | null => {
        const targetEl = container.querySelector(
          `[data-row="base-row"][data-idx="${noteIdx}"]`,
        );
        if (!targetEl) return null;
        const targetRect = targetEl.getBoundingClientRect();
        const intervalSemitones =
          chordRoot !== undefined
            ? noteIdx - chordRoot
            : undefined;
        return {
          x1: sourceX,
          y1: sourceY,
          x2:
            targetRect.left - containerRect.left + targetRect.width / 2,
          y2: targetRect.bottom - containerRect.top,
          type,
          intervalSemitones,
        };
      };

      // ── Diatonic → Mode lines (extension-aware) ──
      let diatonicLines: LineWithInterval[] = [];
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
        ): LineWithInterval[] =>
          noteList
            .map((note) => {
              const tIdx = modeNotesWithOverflow.indexOf(note);
              if (tIdx < 0) return null;
              return lineToModeTarget(tIdx, type, note);
            })
            .filter((l): l is LineWithInterval => l !== null);

        const resolveToBaseRow = (
          noteList: NoteIndex[],
          type: LineType,
        ): LineWithInterval[] =>
          noteList
            .map((note) => lineToBaseTarget(note, type))
            .filter((l): l is LineWithInterval => l !== null);

        diatonicLines = [
          ...resolveToModeRow(removedNotes, "removed"),
          ...resolveToModeRow(keptNotes, "kept"),
          ...resolveToBaseRow(addedNotes, "added"),
        ];
      } else {
        // Fallback: compute internally from unmodified triad
        const chordNotesArr = getChordNotes(
          modeNotes,
          hoveredIndex,
          "triads",
        );
        const targetIdxs = chordNotesArr
          .map((note) => modeNotesWithOverflow.indexOf(note))
          .filter((idx) => idx >= 0);

        diatonicLines = targetIdxs
          .map((tIdx) => {
            const noteIdx = modeNotesWithOverflow[tIdx];
            return lineToModeTarget(tIdx, "diatonic", noteIdx);
          })
          .filter((l): l is LineWithInterval => l !== null);
      }

      // ── Base → Mode lines (chromatic highlighting) ──
      const baseLines: LineWithInterval[] = chordHighlightPairs
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
        .filter((l): l is LineWithInterval => l !== null);

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
        const midX = (line.x1 + line.x2) / 2;
        const midY = (line.y1 + line.y2) / 2;
        const showLabel =
          line.intervalSemitones !== undefined &&
          line.type !== "base" &&
          line.type !== "removed";
        return (
          <g key={idx}>
            <path
              d={buildSplinePath(line)}
              stroke={
                isRemoved ? "rgba(100, 116, 139, 0.4)" : neonColor
              }
              strokeWidth={isRemoved ? "1" : "2"}
              strokeLinecap="round"
              strokeDasharray={isRemoved ? "4 3" : undefined}
              style={
                isRemoved
                  ? undefined
                  : {
                      filter: `drop-shadow(0 0 4px ${neonColor}) drop-shadow(0 0 8px ${neonColor})`,
                    }
              }
              fill="none"
            />
            {showLabel && (
              <>
                <rect
                  x={midX - 14}
                  y={midY - 8}
                  width="28"
                  height="16"
                  rx="4"
                  fill="rgba(8, 8, 24, 0.9)"
                  stroke="rgba(34, 211, 238, 0.3)"
                  strokeWidth="0.5"
                />
                <text
                  x={midX}
                  y={midY + 4}
                  textAnchor="middle"
                  fill="rgba(34, 211, 238, 0.9)"
                  fontSize="9"
                  fontWeight="600"
                  fontFamily="Inter, system-ui, sans-serif"
                >
                  {getIntervalLabel(line.intervalSemitones!)}
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
