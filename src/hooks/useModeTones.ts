import { useEffect, useMemo, useRef, useState } from "react"
import type { Interval, NoteIndex } from "../lib/music"
import type { CellLink } from "../lib/geometry"
import type { Note } from "../models"
import {
  addOverflowToModeIntervals,
  buildModeNotesWithOverflow,
  getModeLeftOverflowSize,
  modeIntervalsToMode,
  spellModeNotes,
} from "../lib/music"

export function useModeTones(
  modeIntervals: Interval[],
  rootNote: Note,
  notes: Note[],
) {
  const modeWithOverflowIntervalsRef = useRef(addOverflowToModeIntervals(modeIntervals))
  const modeLeftOverflowSize = getModeLeftOverflowSize(modeIntervals)

  useEffect(() => {
    modeWithOverflowIntervalsRef.current = addOverflowToModeIntervals(modeIntervals)
    setModeNotesWithOverflow(
      modeIntervalsToMode(rootNote, modeWithOverflowIntervalsRef.current, notes),
    )
  }, [rootNote, modeIntervals])

  const [modeNotesWithOverflow, setModeNotesWithOverflow] = useState<NoteIndex[]>(() =>
    buildModeNotesWithOverflow(rootNote, modeIntervals, notes),
  )

  const spelledModeNotes = useMemo(
    () => spellModeNotes(modeNotesWithOverflow, modeLeftOverflowSize, notes),
    [modeNotesWithOverflow, modeLeftOverflowSize],
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
