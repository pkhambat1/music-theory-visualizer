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
    () => {
      if (modeIndicesWithOverflow.length === 0) return []
      const rootAbsIdx = modeIndicesWithOverflow[modeLeftOverflowSize]
      if (rootAbsIdx === undefined) return []
      return modeIndicesWithOverflow.flatMap((absNoteIdx, toIdx) => {
        if (absNoteIdx < 0 || absNoteIdx >= notes.length) return []
        const chromaticIdx = absNoteIdx - rootAbsIdx
        const link: CellLink = {
          fromRow: "chromatic-row",
          fromIdx: chromaticIdx,
          toRow: "mode-row",
          toIdx,
        }
        return [link]
      })
    },
    [modeIndicesWithOverflow, modeLeftOverflowSize, notes.length],
  )

  return {
    modeNotesWithOverflow,
    modeLeftOverflowSize,
    visibleModeNotes,
    modeConnections,
  }
}
