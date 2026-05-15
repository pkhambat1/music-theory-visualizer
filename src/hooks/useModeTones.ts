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
      return modeIndicesWithOverflow
        .map((absNoteIdx, toIdx) => {
          if (absNoteIdx < 0 || absNoteIdx >= notes.length) return null
          const chromaticIdx = absNoteIdx - rootAbsIdx
          return {
            fromRow: "chromatic-row" as const,
            fromIdx: chromaticIdx,
            toRow: "mode-row" as const,
            toIdx,
          }
        })
        .filter((c): c is CellLink => c !== null)
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
