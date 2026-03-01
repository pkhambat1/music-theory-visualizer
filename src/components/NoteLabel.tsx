import type { Note } from "../models"

/**
 * Render a Note. For "C" notes the octave is shown as a subscript;
 * other notes just show the label (no octave).
 */
export function renderNote(note: Note): React.ReactNode {
  return (
    <>
      {note.label()}
      {note.isC() && <sub>{note.octave}</sub>}
    </>
  )
}
