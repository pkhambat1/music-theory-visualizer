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
    (octave) => baseScale.map((note) => (note === "C" ? note + octave : note))
  );
}

export function renderNote(note) {
  if (note.startsWith("C") && note.length > 1 && !note.includes("#")) {
    const octave = note.slice(1);
    return (
      <>
        C<sub>{octave}</sub>
      </>
    );
  }
  return note;
}
