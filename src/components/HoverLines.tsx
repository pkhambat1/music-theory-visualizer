import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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

  originalChordNotes?: NoteIndex[];
  modifiedChordNotes?: NoteIndex[];
}

export default function HoverLines({
  containerRef,
  hoveredIndex,
  modeNotesWithOverflow,
  modeLeftOverflowSize,
  chordHighlightPairs = [],

  originalChordNotes = [],
  modifiedChordNotes = [],
}: HoverLinesProps) {
  const [lines, setLines] = useState<LineWithInterval[]>([]);
  const measureRef = useRef<(() => void) | null>(null);

  const measure = useCallback(() => {
    const container = containerRef?.current;
    if (!container || hoveredIndex === null) {
      setLines([]);
      return;
    }
    const containerRect = container.getBoundingClientRect();

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

    const modeNotes = leftTrimOverflowNotes(
      modeNotesWithOverflow,
      modeLeftOverflowSize,
    );
    const chordRoot = modeNotes[hoveredIndex];

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
        x2: targetRect.left - containerRect.left + targetRect.width / 2,
        y2: targetRect.bottom - containerRect.top,
        type,
        intervalSemitones,
      };
    };

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
        chordRoot !== undefined ? noteIdx - chordRoot : undefined;
      return {
        x1: sourceX,
        y1: sourceY,
        x2: targetRect.left - containerRect.left + targetRect.width / 2,
        y2: targetRect.bottom - containerRect.top,
        type,
        intervalSemitones,
      };
    };

    let diatonicLines: LineWithInterval[] = [];
    const hasExtensionData =
      originalChordNotes.length > 0 && modifiedChordNotes.length > 0;

    if (hasExtensionData) {
      const originalSet = new Set(originalChordNotes);
      const modifiedSet = new Set(modifiedChordNotes);

      const keptNotes = originalChordNotes.filter((n) => modifiedSet.has(n));
      const removedNotes = originalChordNotes.filter((n) => !modifiedSet.has(n));
      const addedNotes = modifiedChordNotes.filter((n) => !originalSet.has(n));

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
      const chordNotesArr = getChordNotes(modeNotes, hoveredIndex, "triads");
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
          x1: fromRect.left - containerRect.left + fromRect.width / 2,
          y1: fromRect.bottom - containerRect.top,
          x2: toRect.left - containerRect.left + toRect.width / 2,
          y2: toRect.top - containerRect.top,
          type: "base" as LineType,
        };
      })
      .filter((l): l is LineWithInterval => l !== null);

    setLines([...diatonicLines, ...baseLines]);
  }, [
    containerRef,
    hoveredIndex,
    modeNotesWithOverflow,
    modeLeftOverflowSize,
    chordHighlightPairs,
    originalChordNotes,
    modifiedChordNotes,
  ]);

  measureRef.current = measure;

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  // Keep ResizeObserver alive across hover changes
  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const ro = new ResizeObserver(() => measureRef.current?.());
    ro.observe(container);

    const onResize = () => measureRef.current?.();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, [containerRef]);

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
      {/* Render all paths first */}
      {lines.map((line, idx) => {
        const isRemoved = line.type === "removed";
        return (
          <path
            key={`p${idx}`}
            d={buildSplinePath(line)}
            stroke="#000000"
            strokeWidth={isRemoved ? "1.5" : "2.5"}
            strokeLinecap="round"
            strokeDasharray={isRemoved ? "4 3" : undefined}
            fill="none"
          />
        );
      })}
      {/* Render all labels on top */}
      {lines.map((line, idx) => {
        const showLabel =
          line.intervalSemitones !== undefined &&
          line.type !== "base" &&
          line.type !== "removed";
        if (!showLabel) return null;
        const t = line.type === "added" ? 0.75 : 0.5;
        const mt = 1 - t;
        const dy = line.y2 - line.y1;
        const c1x = line.x1, c1y = line.y1 + dy * 0.45;
        const c2x = line.x2, c2y = line.y2 - dy * 0.45;
        const midX = mt*mt*mt*line.x1 + 3*mt*mt*t*c1x + 3*mt*t*t*c2x + t*t*t*line.x2;
        const midY = mt*mt*mt*line.y1 + 3*mt*mt*t*c1y + 3*mt*t*t*c2y + t*t*t*line.y2;
        return (
          <g key={`l${idx}`}>
            <rect
              x={midX - 14}
              y={midY - 8}
              width="28"
              height="16"
              rx="4"
              fill="#000000"
            />
            <text
              x={midX}
              y={midY + 4}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="9"
              fontWeight="600"
              fontFamily="Inter, system-ui, sans-serif"
            >
              {getIntervalLabel(line.intervalSemitones!)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
