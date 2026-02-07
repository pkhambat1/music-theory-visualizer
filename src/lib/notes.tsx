import type { NoteName } from "../types";

/** The 13-element chromatic scale (C through C, inclusive of octave wrap). */
export const CHROMATIC_SCALE = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C",
] as const;

/**
 * Generate note names across `octaveCount` octaves (starting at octave 1).
 * Returns e.g. ["C1", "C#1", … "B1", "C2", …].
 */
export function generateOctaves(octaveCount: number): NoteName[] {
  const baseScale = [
    "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
  ];
  return Array.from({ length: octaveCount }, (_, i) => i + 1).flatMap(
    (octave) => baseScale.map((note) => `${note}${octave}` as NoteName),
  );
}

/**
 * Render a note name. For "C" notes with an octave digit, the octave
 * is shown as a subscript; other notes just strip the octave.
 */
export function renderNote(note: string): React.ReactNode {
  const lastChar = note.charAt(note.length - 1);
  if (!isNaN(parseInt(lastChar))) {
    const noteWithoutOctave = note.slice(0, -1);
    return (
      <>
        {noteWithoutOctave}
        {noteWithoutOctave === "C" && <sub>{note.slice(-1)}</sub>}
      </>
    );
  }
  return note;
}
