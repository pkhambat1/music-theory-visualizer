import type { NoteIndex } from "./music/types"

export type RowId = "chromatic-row" | "mode-row" | "diatonic-row" | "base-row"

/** Maps a cell in one row to a cell in another row, resolved to screen coordinates via `data-row` and `data-idx` DOM attributes. */
export type CellLink = {
  fromRow: RowId,
  fromIdx: number,
  toRow: RowId,
  toIdx: number,
}

/** Pairs a mode row position with a chromatic base row position for chord tone highlighting. */
export type ChordHighlightPair = {
  modeIdx: number,
  baseIdx: NoteIndex,
}
