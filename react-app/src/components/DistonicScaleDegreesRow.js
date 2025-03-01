import React from "react";
import NoteCell from "./NoteCell";
import NotesArray from "./NotesArray";
import { modeLeftOverflowSize } from "../App";
import { playChord } from "../utils/helpers";
import NotesUtils from "../utils/NotesUtils";

const DiatonicScaleDegreesRow = ({
  SQUARE_SIDE,
  modeNotesWithOverflow,
  setHoveredChordIndex,
  setChordNotes,
  notes,
  chordType = "triads", // 'triads' or 'seventhChords'
  selectedExtensions,
  setMajorScaleNotes,
}) => {
  const chordNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "I"];

  const getChordDescriptor = (chordAbsoluteIndices) => {
    return NotesUtils.getChordDescriptor(chordAbsoluteIndices);
  };

  const modeNotes = NotesUtils.leftTrimOverflowNotes(
    modeNotesWithOverflow,
    modeLeftOverflowSize
  );

  return (
    <NotesArray
      size={chordNumerals.length}
      squareSidePx={SQUARE_SIDE}
      marginPx={SQUARE_SIDE / 2}
    >
      {chordNumerals.map((chordNumeral, chordNumeralIdx) => {
        // The (modified or unmodified) 1, 3 and 5 for the chord
        const chordNotes = NotesUtils.applyExtensionsToChordNotes(
          NotesUtils.getChordNotes(modeNotes, chordNumeralIdx, chordType),
          selectedExtensions[chordNumeralIdx]
        );

        const chordDescriptor = getChordDescriptor(chordNotes);

        return (
          <NoteCell
            idx={chordNumeralIdx}
            key={chordNumeralIdx}
            squareSidePx={SQUARE_SIDE}
            onMouseEnter={() => {
              setHoveredChordIndex(chordNumeralIdx);
              const chordNotesInChromaticScale =
                NotesUtils.getChordNotesInChromaticScale(chordNotes);

              setChordNotes(chordNotesInChromaticScale);
              const chordRoot = chordNotes[0];

              const majorScaleNotes = NotesUtils.modes["Ionian (major)"].map(
                (inter) => notes[inter + chordRoot]
              );

              setMajorScaleNotes(majorScaleNotes);
            }}
            onMouseLeave={() => {
              setHoveredChordIndex(null);
              setChordNotes([]);
              setMajorScaleNotes([
                ...Array(NotesUtils.modes["Ionian (major)"].length),
              ]);
            }}
            onClick={() => {
              playChord(chordNotes.map((idx) => notes[idx]));
            }}
          >
            {chordNumeral}
            {chordDescriptor}
          </NoteCell>
        );
      })}
    </NotesArray>
  );
};

export default DiatonicScaleDegreesRow;
