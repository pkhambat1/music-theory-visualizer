import { useCallback, useMemo, useState } from "react"
import type { NoteIndex, NoteRef } from "../lib/music"
import type { ChordHighlightPair } from "../lib/geometry"
import { buildHoverConnections } from "../lib/hoverConnections"
import { bezierPath, bezierPointAt } from "../lib/bezier"
import { Connection, IntervalConnection, RemovedConnection, AddedConnection, BassConnection } from "../models"
import { getIntervalLabel } from "../lib/music"
import { BLACK } from "../lib/theme"
import { useContainerMeasure } from "../hooks"
import IntervalLabel from "./IntervalLabel"
import type { ModeDataProps } from "../lib/music"

export type HoverLinesLayer = {
  hoveredIndex: number,
  chordHighlightPairs: ChordHighlightPair[],
  originalChordNotes: NoteRef[],
  modifiedChordNotes: NoteRef[],
  slashBassNoteIndex: NoteIndex | null,
}

export type HoverLinesProps = ModeDataProps & {
  containerRef: React.RefObject<HTMLDivElement | null>,
  layers: HoverLinesLayer[],
  freeze: boolean,
}

export default function HoverLines({
  containerRef,
  layers,
  freeze,
  modeNotesWithOverflow,
  modeLeftOverflowSize,
}: HoverLinesProps) {
  const [lines, setLines] = useState<{ layerIdx: number, conn: Connection }[]>([])

  const modeIndices = useMemo(
    () => modeNotesWithOverflow.map((r) => r.index),
    [modeNotesWithOverflow],
  )

  const measure = useCallback(() => {
    if (freeze) return
    const container = containerRef?.current
    if (!container || layers.length === 0) {
      setLines([])
      return
    }
    const built: { layerIdx: number, conn: Connection }[] = []
    for (let layerIdx = 0; layerIdx < layers.length; layerIdx++) {
      const layer = layers[layerIdx]!
      const originalIndices = layer.originalChordNotes.map((r) => r.index)
      const modifiedIndices = layer.modifiedChordNotes.map((r) => r.index)
      const conns = buildHoverConnections({
        container,
        hoveredIndex: layer.hoveredIndex,
        modeNotesWithOverflow: modeIndices,
        modeLeftOverflowSize,
        chordHighlightPairs: layer.chordHighlightPairs,
        originalChordNotes: originalIndices,
        modifiedChordNotes: modifiedIndices,
        slashBassNoteIndex: layer.slashBassNoteIndex,
      })
      for (const conn of conns) {
        built.push({ layerIdx, conn })
      }
    }
    setLines(built)
  }, [containerRef, freeze, layers, modeIndices, modeLeftOverflowSize])

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
      {lines.map(({ layerIdx, conn }, idx) => {
        const isRemoved = conn instanceof RemovedConnection
        return (
          <path
            key={`p-${layerIdx}-${idx}`}
            d={bezierPath(conn.from, conn.to)}
            stroke={BLACK}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={isRemoved ? "4 3" : undefined}
            fill="none"
          />
        )
      })}
      {lines.map(({ layerIdx, conn }, idx) => {
        if (!(conn instanceof IntervalConnection)) return null
        if (conn instanceof RemovedConnection) return null
        const t = conn instanceof AddedConnection || conn instanceof BassConnection ? 0.85 : 0.5
        const labelPos = bezierPointAt(conn.from, conn.to, t)
        return (
          <IntervalLabel key={`l-${layerIdx}-${idx}`} x={labelPos.x} y={labelPos.y}>
            {getIntervalLabel(conn.intervalSemitones)}
          </IntervalLabel>
        )
      })}
    </svg>
  )
}
