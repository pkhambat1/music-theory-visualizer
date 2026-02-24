import { useCallback, useEffect, useMemo, useState } from "react"
import type { ChordDegreeState, Extension } from "../types"

const EMPTY_DEGREE_STATE: ChordDegreeState = { extensions: [], slashBass: null }

export function useChordExtensions(modeIntervalsLength: number) {
  const [chordDegreeStates, setChordDegreeStates] = useState<ChordDegreeState[]>(
    Array.from({ length: modeIntervalsLength }, () => ({ ...EMPTY_DEGREE_STATE })),
  )

  useEffect(() => {
    setChordDegreeStates((prev) =>
      Array.from(
        { length: modeIntervalsLength },
        (_, idx) => prev[idx] ?? { ...EMPTY_DEGREE_STATE },
      ),
    )
  }, [modeIntervalsLength])

  const selectedExtensions = useMemo(
    () => chordDegreeStates.map((s) => s.extensions),
    [chordDegreeStates],
  )

  const slashBasses = useMemo(
    () => chordDegreeStates.map((s) => s.slashBass),
    [chordDegreeStates],
  )

  const hasAnyExtensionsOrSlash = useMemo(
    () => chordDegreeStates.some((s) => s.extensions.length > 0 || s.slashBass !== null),
    [chordDegreeStates],
  )

  const handleExtensionChange = useCallback((degreeIdx: number, value: string[]) => {
    setChordDegreeStates((prev) => {
      const next = [...prev]
      next[degreeIdx] = { ...next[degreeIdx]!, extensions: value as Extension[] }
      return next
    })
  }, [])

  const handleSlashBassChange = useCallback((degreeIdx: number, bassDegree: number | null) => {
    setChordDegreeStates((prev) => {
      const next = [...prev]
      next[degreeIdx] = { ...next[degreeIdx]!, slashBass: bassDegree }
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setChordDegreeStates(
      Array.from({ length: modeIntervalsLength }, () => ({ ...EMPTY_DEGREE_STATE })),
    )
  }, [modeIntervalsLength])

  return {
    selectedExtensions,
    slashBasses,
    hasAnyExtensionsOrSlash,
    handleExtensionChange,
    handleSlashBassChange,
    clearAll,
  }
}
