import type { NoteIndex } from "./music/types"

/** Maps a cell in one row to a cell in another row, resolved to screen coordinates via `data-row` and `data-idx` DOM attributes. */
export type CellLink = {
  fromRow: string,
  fromIdx: number,
  toRow: string,
  toIdx: number,
}

/** Pairs a mode row position with a chromatic base row position for chord tone highlighting. */
export type ChordHighlightPair = {
  modeIdx: number,
  baseIdx: NoteIndex,
}
