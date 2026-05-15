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

export type ChordHoverLayerComputed = {
  voicedOriginal: NoteRef[],
  voicedModified: NoteRef[],
  fullVoicedModified: NoteRef[],
  slashBassNoteIndex: NoteIndex | null,
  chordHighlightPairs: ChordHighlightPair[],
  highlightedModeIdxs: Set<number>,
  highlightedBaseIdxs: Set<number>,
  chordRootIndex: NoteIndex | null,
}

export function computeChordHoverLayer(
  triadIndex: number | null,
  original: NoteRef[],
  modified: NoteRef[],
  modeNotesWithOverflow: NoteRef[],
  visibleModeNotes: NoteRef[],
  slashBasses: (number | null)[],
  notes: Note[],
): ChordHoverLayerComputed {
  const modeIndices = modeNotesWithOverflow.map((r) => r.index)
  const modeNoteIndices = visibleModeNotes.map((r) => r.index)
  const modifiedHoverNotes = modified

  if (triadIndex === null || modified.length === 0) {
    return {
      voicedOriginal: [],
      voicedModified: [],
      fullVoicedModified: [],
      slashBassNoteIndex: null,
      chordHighlightPairs: [],
      highlightedModeIdxs: new Set(),
      highlightedBaseIdxs: new Set(),
      chordRootIndex: null,
    }
  }

  const slashBass = slashBasses[triadIndex]
  const slashBassNoteIndex =
    slashBass === null || slashBass === undefined
      ? null
      : getSlashBassNote(modeNoteIndices, triadIndex, slashBass)

  const voiceChord = (chordNotes: NoteRef[]): NoteRef[] => {
    if (slashBass === null || slashBass === undefined || chordNotes.length === 0) {
      return chordNotes
    }
    const chordIndices = chordNotes.map((r) => r.index)
    const voicedIndices = buildSlashChordVoicing(
      chordIndices,
      modeNoteIndices,
      triadIndex,
      slashBass,
    ).slice(1)
    return toNoteRefs(voicedIndices, notes)
  }

  const voicedOriginal = voiceChord(original)
  const voicedModified = voiceChord(modifiedHoverNotes)

  const fullVoicedModified: NoteRef[] =
    slashBassNoteIndex === null
      ? voicedModified
      : [toNoteRef(slashBassNoteIndex, notes), ...voicedModified]

  const originalSet = new Set(voicedOriginal.map((r) => r.index))
  const notesToHighlight =
    originalSet.size > 0 ? voicedModified.filter((r) => originalSet.has(r.index)) : voicedModified

  const chordHighlightPairs: ChordHighlightPair[] = notesToHighlight
    .map((ref) => {
      const modeIdx = modeIndices.indexOf(ref.index)
      if (modeIdx < 0) return null
      return { modeIdx, baseIdx: ref.index }
    })
    .filter((p): p is ChordHighlightPair => p !== null)

  const highlightedModeIdxs = new Set(chordHighlightPairs.map((p) => p.modeIdx))

  const highlightedBaseIdxs = new Set(
    voicedModified
      .map((r) => r.index)
      .filter((idx): idx is NoteIndex => idx >= 0 && idx < notes.length),
  )
  if (
    slashBassNoteIndex !== null &&
    slashBassNoteIndex >= 0 &&
    slashBassNoteIndex < notes.length
  ) {
    highlightedBaseIdxs.add(slashBassNoteIndex)
  }

  const chordRootIndex = modifiedHoverNotes.length > 0 ? modifiedHoverNotes[0]!.index : null

  return {
    voicedOriginal,
    voicedModified,
    fullVoicedModified,
    slashBassNoteIndex,
    chordHighlightPairs,
    highlightedModeIdxs,
    highlightedBaseIdxs,
    chordRootIndex,
  }
}

export function useChordHover(
  modeNotesWithOverflow: NoteRef[],
  visibleModeNotes: NoteRef[],
  slashBasses: (number | null)[],
  notes: Note[],
) {
  const [hoverState, setHoverState] = useState<HoverState>({
    index: null,
    original: [],
    modified: [],
  })

  const hoveredTriadIndex = hoverState.index

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

  const layer = useMemo(
    () =>
      computeChordHoverLayer(
        hoverState.index,
        hoverState.original,
        hoverState.modified,
        modeNotesWithOverflow,
        visibleModeNotes,
        slashBasses,
        notes,
      ),
    [hoverState, modeNotesWithOverflow, visibleModeNotes, slashBasses, notes],
  )

  return {
    hoveredTriadIndex,
    fullVoicedModified: layer.fullVoicedModified,
    chordRootIndex: layer.chordRootIndex,
    voicedOriginal: layer.voicedOriginal,
    voicedModified: layer.voicedModified,
    slashBassNoteIndex: layer.slashBassNoteIndex,
    chordHighlightPairs: layer.chordHighlightPairs,
    highlightedModeIdxs: layer.highlightedModeIdxs,
    highlightedBaseIdxs: layer.highlightedBaseIdxs,
    setHoveredTriadIndex,
    handleChordHoverChange,
  }
}
