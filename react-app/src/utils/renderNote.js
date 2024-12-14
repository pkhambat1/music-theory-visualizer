export const renderNote = (note) => {
  if (note.startsWith("C") && note.length > 1 && !note.includes("#")) {
    const octave = note.slice(1);
    return (
      <>
        C<sub>{octave}</sub>
      </>
    );
  }
  return note;
};
