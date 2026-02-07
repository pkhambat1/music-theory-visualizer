import type { NoteIndex } from "./music";

export type LineType = "diatonic" | "base" | "kept" | "removed" | "added";

export interface Point {
  x: number;
  y: number;
}

export interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: LineType;
}

export interface Connection {
  fromRow: string;
  fromIdx: number;
  toRow: string;
  toIdx: number;
}

export interface ChordHighlightPair {
  modeIdx: number;
  baseIdx: NoteIndex;
}
