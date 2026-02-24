import type { ChordHighlightPair, NoteIndex, Point } from "../types"
import { Connection } from "../models/Connection"
import { StaticConnection } from "../models/StaticConnection"
import { IntervalConnection } from "../models/IntervalConnection"
import { DiatonicConnection } from "../models/DiatonicConnection"
import { RemovedConnection } from "../models/RemovedConnection"
import { AddedConnection } from "../models/AddedConnection"
import { BassConnection } from "../models/BassConnection"
import { leftTrimOverflowNotes } from "./music/scale"
import { getChordNotes } from "./music/chords"

// ─── Position resolution (DOM → coordinates) ────────────────────────

type ElementPosition = { cx: number, top: number, bottom: number }

function resolveElement(
  container: HTMLElement,
  containerRect: DOMRect,
  row: string,
  idx: number,
): ElementPosition | null {
  const el = container.querySelector(`[data-row="${row}"][data-idx="${idx}"]`)
  if (!el) return null
  const rect = el.getBoundingClientRect()
  return {
    cx: rect.left - containerRect.left + rect.width / 2,
    top: rect.top - containerRect.top,
    bottom: rect.bottom - containerRect.top,
  }
}

// ─── Line builders (pure once positions are resolved) ────────────────

function buildModeTargetLine(
  source: Point,
  container: HTMLElement,
  containerRect: DOMRect,
  chordRoot: NoteIndex | undefined,
  tIdx: number,
  Ctor: new (from: Point, to: Point, s: number) => IntervalConnection,
  noteIdx?: NoteIndex,
): Connection | null {
  const pos = resolveElement(container, containerRect, "mode-row", tIdx)
  if (!pos) return null
  const to = { x: pos.cx, y: pos.bottom }
  const semitones =
    noteIdx !== undefined && chordRoot !== undefined
      ? noteIdx - chordRoot
      : undefined
  if (semitones !== undefined) {
    return new Ctor(source, to, semitones)
  }
  return new StaticConnection(source, to)
}

function buildBaseTargetLine(
  source: Point,
  container: HTMLElement,
  containerRect: DOMRect,
  chordRoot: NoteIndex | undefined,
  noteIdx: NoteIndex,
): Connection | null {
  const pos = resolveElement(container, containerRect, "base-row", noteIdx)
  if (!pos) return null
  const to = { x: pos.cx, y: pos.bottom }
  const semitones =
    chordRoot !== undefined ? noteIdx - chordRoot : undefined
  if (semitones !== undefined) {
    return new AddedConnection(source, to, semitones)
  }
  return new StaticConnection(source, to)
}

// ─── Diatonic lines (kept / removed / added) ────────────────────────

function buildDiatonicLines(
  source: Point,
  container: HTMLElement,
  containerRect: DOMRect,
  chordRoot: NoteIndex | undefined,
  hoveredIndex: number,
  modeNotesWithOverflow: NoteIndex[],
  modeLeftOverflowSize: number,
  originalChordNotes: NoteIndex[],
  modifiedChordNotes: NoteIndex[],
): Connection[] {
  const hasExtensionData =
    originalChordNotes.length > 0 && modifiedChordNotes.length > 0

  if (hasExtensionData) {
    const originalSet = new Set(originalChordNotes)
    const modifiedSet = new Set(modifiedChordNotes)

    const keptNotes = originalChordNotes.filter((n) => modifiedSet.has(n))
    const removedNotes = originalChordNotes.filter((n) => !modifiedSet.has(n))
    const addedNotes = modifiedChordNotes.filter((n) => !originalSet.has(n))

    const toModeRow = (
      noteList: NoteIndex[],
      Ctor: new (from: Point, to: Point, s: number) => IntervalConnection,
    ): Connection[] =>
      noteList
        .map((note) => {
          const tIdx = modeNotesWithOverflow.indexOf(note)
          if (tIdx < 0) return null
          return buildModeTargetLine(source, container, containerRect, chordRoot, tIdx, Ctor, note)
        })
        .filter((l): l is Connection => l !== null)

    const toBaseRow = (noteList: NoteIndex[]): Connection[] =>
      noteList
        .map((note) => buildBaseTargetLine(source, container, containerRect, chordRoot, note))
        .filter((l): l is Connection => l !== null)

    return [
      ...toModeRow(removedNotes, RemovedConnection),
      ...toModeRow(keptNotes, DiatonicConnection),
      ...toBaseRow(addedNotes),
    ]
  }

  // No extensions — plain triad lines to mode row
  const modeNotes = leftTrimOverflowNotes(modeNotesWithOverflow, modeLeftOverflowSize)
  const chordNotesArr = getChordNotes(modeNotes, hoveredIndex)
  return chordNotesArr
    .map((note) => {
      const tIdx = modeNotesWithOverflow.indexOf(note)
      if (tIdx < 0) return null
      return buildModeTargetLine(
        source, container, containerRect, chordRoot,
        tIdx, DiatonicConnection, modeNotesWithOverflow[tIdx],
      )
    })
    .filter((l): l is Connection => l !== null)
}

// ─── Chromatic ↔ mode highlight lines ────────────────────────────────

function buildHighlightLines(
  container: HTMLElement,
  containerRect: DOMRect,
  chordHighlightPairs: ChordHighlightPair[],
): Connection[] {
  return chordHighlightPairs
    .map(({ baseIdx, modeIdx }) => {
      const fromPos = resolveElement(container, containerRect, "base-row", baseIdx)
      const toPos = resolveElement(container, containerRect, "mode-row", modeIdx)
      if (!fromPos || !toPos) return null
      return new StaticConnection(
        { x: fromPos.cx, y: fromPos.bottom },
        { x: toPos.cx, y: toPos.top },
      )
    })
    .filter((l): l is Connection => l !== null)
}

// ─── Bass line (slash chord) ─────────────────────────────────────────

function buildBassLine(
  source: Point,
  container: HTMLElement,
  containerRect: DOMRect,
  chordRoot: NoteIndex | undefined,
  slashBassNoteIndex: NoteIndex,
): Connection | null {
  const pos = resolveElement(container, containerRect, "base-row", slashBassNoteIndex)
  if (!pos) return null
  const to = { x: pos.cx, y: pos.bottom }
  const semitones =
    chordRoot !== undefined
      ? (((slashBassNoteIndex - chordRoot) % 12) + 12) % 12
      : undefined
  if (semitones !== undefined) {
    return new BassConnection(source, to, semitones)
  }
  return new StaticConnection(source, to)
}

// ─── Top-level entry point ───────────────────────────────────────────

export type HoverConnectionsInput = {
  container: HTMLElement,
  hoveredIndex: number,
  modeNotesWithOverflow: NoteIndex[],
  modeLeftOverflowSize: number,
  chordHighlightPairs: ChordHighlightPair[],
  originalChordNotes: NoteIndex[],
  modifiedChordNotes: NoteIndex[],
  slashBassNoteIndex: NoteIndex | null,
}

export function buildHoverConnections(input: HoverConnectionsInput): Connection[] {
  const {
    container,
    hoveredIndex,
    modeNotesWithOverflow,
    modeLeftOverflowSize,
    chordHighlightPairs,
    originalChordNotes,
    modifiedChordNotes,
    slashBassNoteIndex,
  } = input

  const containerRect = container.getBoundingClientRect()

  // Resolve source (diatonic cell)
  const sourcePos = resolveElement(container, containerRect, "diatonic-row", hoveredIndex)
  if (!sourcePos) return []
  const source: Point = { x: sourcePos.cx, y: sourcePos.top }

  const modeNotes = leftTrimOverflowNotes(modeNotesWithOverflow, modeLeftOverflowSize)
  const chordRoot = modeNotes[hoveredIndex]

  const diatonicLines = buildDiatonicLines(
    source, container, containerRect, chordRoot,
    hoveredIndex, modeNotesWithOverflow, modeLeftOverflowSize,
    originalChordNotes, modifiedChordNotes,
  )

  const highlightLines = buildHighlightLines(container, containerRect, chordHighlightPairs)

  const bassLine = slashBassNoteIndex !== null
    ? buildBassLine(source, container, containerRect, chordRoot, slashBassNoteIndex)
    : null

  return [
    ...diatonicLines,
    ...highlightLines,
    ...(bassLine ? [bassLine] : []),
  ]
}
