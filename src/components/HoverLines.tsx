import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import type { ChordHighlightPair, ModeDataProps, NoteIndex, Point } from "../types"
import { Connection } from "../models/Connection"
import { StaticConnection } from "../models/StaticConnection"
import { IntervalConnection } from "../models/IntervalConnection"
import { DiatonicConnection } from "../models/DiatonicConnection"
import { RemovedConnection } from "../models/RemovedConnection"
import { AddedConnection } from "../models/AddedConnection"
import { BassConnection } from "../models/BassConnection"
import { bezierPath, bezierPointAt } from "../lib/bezier"
import { leftTrimOverflowNotes } from "../lib/music/scale"
import { getChordNotes } from "../lib/music/chords"

// ─── Interval → degree label mapping ────────────────────────────────

const INTERVAL_DEGREE_LABELS: Record<number, string> = {
  0: "1",
  1: "♭2",
  2: "2",
  3: "♭3",
  4: "3",
  5: "4",
  6: "♭5",
  7: "5",
  8: "♭6",
  9: "6",
  10: "♭7",
  11: "7",
  12: "8",
  13: "♭9",
  14: "9",
  15: "♯9",
  16: "♭11",
  17: "11",
  18: "♯11",
  19: "♭13",
  20: "13",
  21: "♯13",
}

function getIntervalLabel(semitones: number): string {
  return INTERVAL_DEGREE_LABELS[semitones] ?? `${semitones}`
}

// ─── Interval label pill ─────────────────────────────────────────────

function IntervalLabel({ x, y, children }: { x: number, y: number, children: React.ReactNode }) {
  return (
    <g>
      <rect
        x={x - 14}
        y={y - 8}
        width="28"
        height="16"
        rx="4"
        fill="#000000"
      />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fill="#ffffff"
        fontSize="9"
        fontWeight="600"
        fontFamily="Inter, system-ui, sans-serif"
      >
        {children}
      </text>
    </g>
  )
}

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
  const measureRef = useRef<(() => void) | null>(null)

  const measure = useCallback(() => {
    const container = containerRef?.current
    if (!container || hoveredIndex === null) {
      setLines([])
      return
    }
    const containerRect = container.getBoundingClientRect()

    const sourceEl = container.querySelector(
      `[data-row="diatonic-row"][data-idx="${hoveredIndex}"]`,
    )
    if (!sourceEl) {
      setLines([])
      return
    }
    const sourceRect = sourceEl.getBoundingClientRect()
    const sourceX =
      sourceRect.left - containerRect.left + sourceRect.width / 2
    const sourceY = sourceRect.top - containerRect.top

    const modeNotes = leftTrimOverflowNotes(
      modeNotesWithOverflow,
      modeLeftOverflowSize,
    )
    const chordRoot = modeNotes[hoveredIndex]

    const lineToModeTarget = (
      tIdx: number,
      Ctor: new (from: Point, to: Point, s: number) => IntervalConnection,
      noteIdx?: NoteIndex,
    ): Connection | null => {
      const targetEl = container.querySelector(
        `[data-row="mode-row"][data-idx="${tIdx}"]`,
      )
      if (!targetEl) return null
      const targetRect = targetEl.getBoundingClientRect()
      const from = { x: sourceX, y: sourceY }
      const to = {
        x: targetRect.left - containerRect.left + targetRect.width / 2,
        y: targetRect.bottom - containerRect.top,
      }
      const intervalSemitones =
        noteIdx !== undefined && chordRoot !== undefined
          ? noteIdx - chordRoot
          : undefined
      if (intervalSemitones !== undefined) {
        return new Ctor(from, to, intervalSemitones)
      }
      return new StaticConnection(from, to)
    }

    const lineToBaseTarget = (
      noteIdx: number,
    ): Connection | null => {
      const targetEl = container.querySelector(
        `[data-row="base-row"][data-idx="${noteIdx}"]`,
      )
      if (!targetEl) return null
      const targetRect = targetEl.getBoundingClientRect()
      const from = { x: sourceX, y: sourceY }
      const to = {
        x: targetRect.left - containerRect.left + targetRect.width / 2,
        y: targetRect.bottom - containerRect.top,
      }
      const intervalSemitones =
        chordRoot !== undefined ? noteIdx - chordRoot : undefined
      if (intervalSemitones !== undefined) {
        return new AddedConnection(from, to, intervalSemitones)
      }
      return new StaticConnection(from, to)
    }

    let diatonicLines: Connection[] = []
    const hasExtensionData =
      originalChordNotes.length > 0 && modifiedChordNotes.length > 0

    if (hasExtensionData) {
      const originalSet = new Set(originalChordNotes)
      const modifiedSet = new Set(modifiedChordNotes)

      const keptNotes = originalChordNotes.filter((n) => modifiedSet.has(n))
      const removedNotes = originalChordNotes.filter((n) => !modifiedSet.has(n))
      const addedNotes = modifiedChordNotes.filter((n) => !originalSet.has(n))

      const resolveToModeRow = (
        noteList: NoteIndex[],
        Ctor: new (from: Point, to: Point, s: number) => IntervalConnection,
      ): Connection[] =>
        noteList
          .map((note) => {
            const tIdx = modeNotesWithOverflow.indexOf(note)
            if (tIdx < 0) return null
            return lineToModeTarget(tIdx, Ctor, note)
          })
          .filter((l): l is Connection => l !== null)

      const resolveToBaseRow = (
        noteList: NoteIndex[],
      ): Connection[] =>
        noteList
          .map((note) => lineToBaseTarget(note))
          .filter((l): l is Connection => l !== null)

      diatonicLines = [
        ...resolveToModeRow(removedNotes, RemovedConnection),
        ...resolveToModeRow(keptNotes, DiatonicConnection),
        ...resolveToBaseRow(addedNotes),
      ]
    } else {
      const chordNotesArr = getChordNotes(modeNotes, hoveredIndex)
      const targetIdxs = chordNotesArr
        .map((note) => modeNotesWithOverflow.indexOf(note))
        .filter((idx) => idx >= 0)

      diatonicLines = targetIdxs
        .map((tIdx) => {
          const noteIdx = modeNotesWithOverflow[tIdx]
          return lineToModeTarget(tIdx, DiatonicConnection, noteIdx)
        })
        .filter((l): l is Connection => l !== null)
    }

    const baseLines: Connection[] = chordHighlightPairs
      .map(({ baseIdx, modeIdx }) => {
        const fromEl = container.querySelector(
          `[data-row="base-row"][data-idx="${baseIdx}"]`,
        )
        const toEl = container.querySelector(
          `[data-row="mode-row"][data-idx="${modeIdx}"]`,
        )
        if (!fromEl || !toEl) return null
        const fromRect = fromEl.getBoundingClientRect()
        const toRect = toEl.getBoundingClientRect()
        return new StaticConnection(
          {
            x: fromRect.left - containerRect.left + fromRect.width / 2,
            y: fromRect.bottom - containerRect.top,
          },
          {
            x: toRect.left - containerRect.left + toRect.width / 2,
            y: toRect.top - containerRect.top,
          },
        )
      })
      .filter((l): l is Connection => l !== null)

    // ── Bass line (slash chord) ──────────────────────────────────
    const bassLines: Connection[] = []
    if (slashBassNoteIndex !== null) {
      const bassEl = container.querySelector(
        `[data-row="base-row"][data-idx="${slashBassNoteIndex}"]`,
      )
      if (bassEl) {
        const bassRect = bassEl.getBoundingClientRect()
        const intervalSemitones =
          chordRoot !== undefined
            ? (((slashBassNoteIndex - chordRoot) % 12) + 12) % 12
            : undefined
        const from = { x: sourceX, y: sourceY }
        const to = {
          x: bassRect.left - containerRect.left + bassRect.width / 2,
          y: bassRect.bottom - containerRect.top,
        }
        if (intervalSemitones !== undefined) {
          bassLines.push(new BassConnection(from, to, intervalSemitones))
        } else {
          bassLines.push(new StaticConnection(from, to))
        }
      }
    }

    setLines([...diatonicLines, ...baseLines, ...bassLines])
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

  measureRef.current = measure

  useLayoutEffect(() => {
    measure()
  }, [measure])

  // Keep ResizeObserver alive across hover changes
  useEffect(() => {
    const container = containerRef?.current
    if (!container) return

    const ro = new ResizeObserver(() => measureRef.current?.())
    ro.observe(container)

    const onResize = () => measureRef.current?.()
    window.addEventListener("resize", onResize)

    return () => {
      window.removeEventListener("resize", onResize)
      ro.disconnect()
    }
  }, [containerRef])

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
