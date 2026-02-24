import { useCallback, useState } from "react"
import type { ChordHighlightPair, ModeDataProps, NoteIndex } from "../types"
import { Connection } from "../models/Connection"
import { IntervalConnection } from "../models/IntervalConnection"
import { RemovedConnection } from "../models/RemovedConnection"
import { AddedConnection } from "../models/AddedConnection"
import { bezierPath, bezierPointAt } from "../lib/bezier"
import { buildHoverConnections } from "../lib/hoverConnections"
import { useContainerMeasure } from "../hooks/useContainerMeasure"
import IntervalLabel from "./IntervalLabel"
import { getIntervalLabel } from "../lib/music/intervals"

// ─── Component ──────────────────────────────────────────────────────

export type HoverLinesProps = ModeDataProps & {
  containerRef: React.RefObject<HTMLDivElement | null>,
  hoveredIndex: number | null,
  chordHighlightPairs?: ChordHighlightPair[],
  originalChordNotes?: NoteIndex[],
  modifiedChordNotes?: NoteIndex[],
  slashBassNoteIndex?: NoteIndex | null,
}

export default function HoverLines({
  containerRef,
  hoveredIndex,
  modeNotesWithOverflow,
  modeLeftOverflowSize,
  chordHighlightPairs = [],
  originalChordNotes = [],
  modifiedChordNotes = [],
  slashBassNoteIndex = null,
}: HoverLinesProps) {
  const [lines, setLines] = useState<Connection[]>([])

  const measure = useCallback(() => {
    const container = containerRef?.current
    if (!container || hoveredIndex === null) {
      setLines([])
      return
    }
    setLines(
      buildHoverConnections({
        container,
        hoveredIndex,
        modeNotesWithOverflow,
        modeLeftOverflowSize,
        chordHighlightPairs,
        originalChordNotes,
        modifiedChordNotes,
        slashBassNoteIndex,
      }),
    )
  }, [
    containerRef,
    hoveredIndex,
    modeNotesWithOverflow,
    modeLeftOverflowSize,
    chordHighlightPairs,
    originalChordNotes,
    modifiedChordNotes,
    slashBassNoteIndex,
  ])

  useContainerMeasure(containerRef, measure)

  if (!lines.length) return null

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 3,
      }}
    >
      {/* Render all paths first */}
      {lines.map((conn, idx) => {
        const isRemoved = conn instanceof RemovedConnection
        return (
          <path
            key={`p${idx}`}
            d={bezierPath(conn.from, conn.to)}
            stroke="#000000"
            strokeWidth={isRemoved ? "1.5" : "2.5"}
            strokeLinecap="round"
            strokeDasharray={isRemoved ? "4 3" : undefined}
            fill="none"
          />
        )
      })}
      {/* Render all labels on top */}
      {lines.map((conn, idx) => {
        if (!(conn instanceof IntervalConnection)) return null
        if (conn instanceof RemovedConnection) return null
        const t = conn instanceof AddedConnection ? 0.85 : 0.5
        const labelPos = bezierPointAt(conn.from, conn.to, t)
        return (
          <IntervalLabel key={`l${idx}`} x={labelPos.x} y={labelPos.y}>
            {getIntervalLabel(conn.intervalSemitones)}
          </IntervalLabel>
        )
      })}
    </svg>
  )
}
