import { useMemo } from "react"
import type { Interval } from "../lib/music"
import type { CellLink } from "../lib/geometry"
import type { Note } from "../models"
import {
  buildModeNotesWithOverflow,
  getModeLeftOverflowSize,
  spellModeNotes,
  toNoteInModeArray,
} from "../lib/music"

export function useModeTones(
  modeIntervals: Interval[],
  rootNote: Note,
  notes: Note[],
) {
  const modeLeftOverflowSize = getModeLeftOverflowSize(modeIntervals)

  const modeIndicesWithOverflow = useMemo(
    () => buildModeNotesWithOverflow(rootNote, modeIntervals, notes),
    [rootNote, modeIntervals, notes],
  )

  const spelledModeNotes = useMemo(
    () => spellModeNotes(modeIndicesWithOverflow, modeLeftOverflowSize, notes),
    [modeIndicesWithOverflow, modeLeftOverflowSize, notes],
  )

  const modeNotesWithOverflow = useMemo(
    () => toNoteInModeArray(modeIndicesWithOverflow, spelledModeNotes, modeLeftOverflowSize, notes),
    [modeIndicesWithOverflow, spelledModeNotes, modeLeftOverflowSize, notes],
  )

  const visibleModeNotes = useMemo(
    () => modeNotesWithOverflow.slice(modeLeftOverflowSize),
    [modeNotesWithOverflow, modeLeftOverflowSize],
  )

  const modeConnections = useMemo<CellLink[]>(
    () =>
      modeIntervals.map((interval, idx) => ({
        fromRow: "chromatic-row",
        fromIdx: interval,
        toRow: "mode-row",
        toIdx: modeLeftOverflowSize + idx,
      })),
    [modeIntervals, modeLeftOverflowSize],
  )

  return {
    modeNotesWithOverflow,
    modeLeftOverflowSize,
    visibleModeNotes,
    modeConnections,
  }
}
