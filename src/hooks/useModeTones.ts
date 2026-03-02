import { useMemo } from "react"
import type { Interval } from "../lib/music"
import type { CellLink } from "../lib/geometry"
import type { Note } from "../models"
import {
  buildModeNotesWithOverflow,
  getModeLeftOverflowSize,
  spellModeNotes,
  toNoteRefs,
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

  const modeNotesWithOverflow = useMemo(
    () => toNoteRefs(modeIndicesWithOverflow, notes),
    [modeIndicesWithOverflow, notes],
  )

  const spelledModeNotes = useMemo(
    () => spellModeNotes(modeIndicesWithOverflow, modeLeftOverflowSize, notes),
    [modeIndicesWithOverflow, modeLeftOverflowSize, notes],
  )

  const modeConnections = useMemo<CellLink[]>(
    () =>
      modeIntervals.map((interval, idx) => ({
        fromRow: "chromatic-row",
        fromIdx: interval as number,
        toRow: "mode-row",
        toIdx: modeLeftOverflowSize + idx,
      })),
    [modeIntervals, modeLeftOverflowSize],
  )

  return {
    modeNotesWithOverflow,
    modeLeftOverflowSize,
    spelledModeNotes,
    modeConnections,
  }
}
