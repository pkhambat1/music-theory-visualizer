import { useCallback, useMemo, useState } from "react"
import type { NoteIndex, NoteRef } from "../lib/music"
import type { ChordHighlightPair } from "../lib/geometry"
import type { ChordHoverData } from "../components/DiatonicScaleDegreesRow"
import type { Note } from "../models"
import { getSlashBassNote, buildSlashChordVoicing, toNoteRef, toNoteRefs } from "../lib/music"

type HoverState = {
  index: number | null,
  original: NoteRef[],
  modified: NoteRef[],
}

export function useChordHover(
  modeNotesWithOverflow: NoteRef[],
  modeLeftOverflowSize: number,
  slashBasses: (number | null)[],
  notes: Note[],
) {
  const [hoverState, setHoverState] = useState<HoverState>({
    index: null,
    original: [],
    modified: [],
  })

  const modeIndices = useMemo(
    () => modeNotesWithOverflow.map((r) => r.index),
    [modeNotesWithOverflow],
  )

  const modeNoteIndices = useMemo(
    () => modeIndices.slice(modeLeftOverflowSize),
    [modeIndices, modeLeftOverflowSize],
  )

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

  const slashBassNoteIndex = useMemo<NoteIndex | null>(() => {
    if (hoveredTriadIndex === null) return null
    const slashBass = slashBasses[hoveredTriadIndex]
    if (slashBass === null || slashBass === undefined) return null
    return getSlashBassNote(modeNoteIndices, hoveredTriadIndex, slashBass)
  }, [hoveredTriadIndex, slashBasses, modeNoteIndices])

  const hoveredSlashBass = useMemo(() => {
    if (hoveredTriadIndex === null) return null
    return slashBasses[hoveredTriadIndex] ?? null
  }, [hoveredTriadIndex, slashBasses])

  const voiceForSlash = useCallback(
    (chordNotes: NoteRef[]): NoteRef[] => {
      if (hoveredSlashBass === null || hoveredTriadIndex === null || chordNotes.length === 0)
        return chordNotes
      const chordIndices = chordNotes.map((r) => r.index)
      const voicedIndices = buildSlashChordVoicing(chordIndices, modeNoteIndices, hoveredTriadIndex, hoveredSlashBass).slice(1)
      return toNoteRefs(voicedIndices, notes)
    },
    [hoveredSlashBass, hoveredTriadIndex, modeNoteIndices, notes],
  )

  const voicedOriginal = useMemo(
    () => voiceForSlash(hoverState.original),
    [hoverState.original, voiceForSlash],
  )
  const voicedModified = useMemo(
    () => voiceForSlash(modifiedHoverNotes),
    [modifiedHoverNotes, voiceForSlash],
  )

  const fullVoicedModified = useMemo<NoteRef[]>(() => {
    if (slashBassNoteIndex === null) return voicedModified
    return [toNoteRef(slashBassNoteIndex, notes), ...voicedModified]
  }, [voicedModified, slashBassNoteIndex, notes])

  const chordHighlightPairs = useMemo<ChordHighlightPair[]>(() => {
    if (!voicedModified.length) return []

    const originalSet = new Set(voicedOriginal.map((r) => r.index))
    const notesToHighlight =
      originalSet.size > 0 ? voicedModified.filter((r) => originalSet.has(r.index)) : voicedModified

    return notesToHighlight
      .map((ref) => {
        const modeIdx = modeIndices.indexOf(ref.index)
        if (modeIdx < 0) return null
        return { modeIdx, baseIdx: ref.index } as ChordHighlightPair
      })
      .filter((p): p is ChordHighlightPair => p !== null)
  }, [voicedModified, modeIndices, voicedOriginal])

  const highlightedModeIdxs = useMemo(
    () => new Set(chordHighlightPairs.map((p) => p.modeIdx)),
    [chordHighlightPairs],
  )

  const highlightedBaseIdxs = useMemo(() => {
    const idxs = new Set(
      voicedModified
        .map((r) => r.index)
        .filter((idx): idx is NoteIndex => idx >= 0 && idx < notes.length),
    )
    if (
      slashBassNoteIndex !== null &&
      slashBassNoteIndex >= 0 &&
      slashBassNoteIndex < notes.length
    ) {
      idxs.add(slashBassNoteIndex)
    }
    return idxs
  }, [voicedModified, slashBassNoteIndex, notes.length])

  const chordRootIndex = modifiedHoverNotes.length > 0 ? modifiedHoverNotes[0]!.index : null

  return {
    hoveredTriadIndex,
    fullVoicedModified,
    chordRootIndex,
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
