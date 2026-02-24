import { useCallback, useMemo, useState } from "react"
import type { ChordHighlightPair, NoteIndex } from "../types"
import type { ChordHoverData } from "../components/DiatonicScaleDegreesRow"
import { getSlashBassNote, buildSlashChordVoicing } from "../lib/music/chords"
import { leftTrimOverflowNotes } from "../lib/music/scale"

type HoverState = {
  index: number | null,
  original: NoteIndex[],
  modified: NoteIndex[],
}

export function useChordHover(
  modeNotesWithOverflow: NoteIndex[],
  modeLeftOverflowSize: number,
  slashBasses: (number | null)[],
  notesLength: number,
) {
  const [hoverState, setHoverState] = useState<HoverState>({
    index: null,
    original: [],
    modified: [],
  })

  const hoveredTriadIndex = hoverState.index
  const modifiedHoverNotes = hoverState.modified

  const setHoveredTriadIndex = useCallback((idx: number | null) => {
    if (idx === null) {
      setHoverState({ index: null, original: [], modified: [] })
    } else {
      setHoverState((prev) => ({ ...prev, index: idx }))
    }
  }, [])

  const handleChordHoverChange = useCallback((data: ChordHoverData) => {
    if (data?.original) {
      setHoverState((prev) => ({
        ...prev,
        original: data.original,
        modified: data.modified,
      }))
    } else {
      setHoverState((prev) => ({
        ...prev,
        original: [],
        modified: [],
      }))
    }
  }, [])

  // ── Slash bass note for hover lines ──────────────────────────────

  const slashBassNoteIndex = useMemo<NoteIndex | null>(() => {
    if (hoveredTriadIndex === null) return null
    const slashBass = slashBasses[hoveredTriadIndex]
    if (slashBass === null || slashBass === undefined) return null
    const modeNotes = leftTrimOverflowNotes(modeNotesWithOverflow, modeLeftOverflowSize)
    return getSlashBassNote(modeNotes, hoveredTriadIndex, slashBass)
  }, [hoveredTriadIndex, slashBasses, modeNotesWithOverflow, modeLeftOverflowSize])

  // ── Voiced hover notes (slash chords rearrange octaves) ─────────

  const hoveredSlashBass = useMemo(() => {
    if (hoveredTriadIndex === null) return null
    return slashBasses[hoveredTriadIndex] ?? null
  }, [hoveredTriadIndex, slashBasses])

  const voiceForSlash = useCallback(
    (chordNotes: NoteIndex[]): NoteIndex[] => {
      if (hoveredSlashBass === null || hoveredTriadIndex === null || chordNotes.length === 0)
        return chordNotes
      const mn = leftTrimOverflowNotes(modeNotesWithOverflow, modeLeftOverflowSize)
      return buildSlashChordVoicing(chordNotes, mn, hoveredTriadIndex, hoveredSlashBass).slice(1)
    },
    [hoveredSlashBass, hoveredTriadIndex, modeNotesWithOverflow, modeLeftOverflowSize],
  )

  const voicedOriginal = useMemo(
    () => voiceForSlash(hoverState.original),
    [hoverState.original, voiceForSlash],
  )
  const voicedModified = useMemo(
    () => voiceForSlash(modifiedHoverNotes),
    [modifiedHoverNotes, voiceForSlash],
  )

  const chordHighlightPairs = useMemo<ChordHighlightPair[]>(() => {
    if (!voicedModified.length) return []

    const originalSet = new Set(voicedOriginal)
    const notesToHighlight =
      originalSet.size > 0 ? voicedModified.filter((n) => originalSet.has(n)) : voicedModified

    return notesToHighlight
      .map((noteIdx) => {
        if (typeof noteIdx !== "number") return null
        const modeIdx = modeNotesWithOverflow.indexOf(noteIdx)
        if (modeIdx < 0) return null
        return { modeIdx, baseIdx: noteIdx } as ChordHighlightPair
      })
      .filter((p): p is ChordHighlightPair => p !== null)
  }, [voicedModified, modeNotesWithOverflow, voicedOriginal])

  const highlightedModeIdxs = useMemo(
    () => new Set(chordHighlightPairs.map((p) => p.modeIdx)),
    [chordHighlightPairs],
  )

  const highlightedBaseIdxs = useMemo(() => {
    const idxs = new Set(
      voicedModified.filter(
        (idx): idx is NoteIndex => typeof idx === "number" && idx >= 0 && idx < notesLength,
      ),
    )
    if (
      slashBassNoteIndex !== null &&
      slashBassNoteIndex >= 0 &&
      slashBassNoteIndex < notesLength
    ) {
      idxs.add(slashBassNoteIndex)
    }
    return idxs
  }, [voicedModified, slashBassNoteIndex, notesLength])

  return {
    hoveredTriadIndex,
    modifiedHoverNotes,
    voicedOriginal,
    voicedModified,
    slashBassNoteIndex,
    chordHighlightPairs,
    highlightedModeIdxs,
    highlightedBaseIdxs,
    setHoveredTriadIndex,
    handleChordHoverChange,
  }
}
