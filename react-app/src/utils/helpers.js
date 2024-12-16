export function generateOctaves(octaveCount) {
  const baseScale = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  return Array.from({ length: octaveCount }, (_, i) => i + 1).flatMap(
    (octave) => baseScale.map((note) => note + octave)
  );
}

export function renderNote(note) {
  if (!isNaN(parseInt(note.charAt(note.length - 1)))) {
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
