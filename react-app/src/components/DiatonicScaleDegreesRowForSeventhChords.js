import React from "react";
import NoteCell from "./NoteCell";
import NotesArray from "./NotesArray";
import { modeLeftOverflowSize } from "../App";
import { playChord } from "../utils/helpers";

const DiatonicScaleDegreesRowForSeventhChords = ({
  SQUARE_SIDE,
  modeIntervalNotes,
  setHoveredSeventhChordIndex,
  setTriadNotes,
  notes,
  baseScale,
}) => {
  const seventhChords = ["I", "II", "III", "IV", "V", "VI", "VII"];

  const getTriadDescriptor = (triadNotes) => {
    const triadNoteIndices = triadNotes.map((note) => notes.indexOf(note));

    const thirdDeviation = triadNoteIndices[1] - triadNoteIndices[0] - 4;
    const fifthDeviation = triadNoteIndices[2] - triadNoteIndices[0] - 7;

    if (thirdDeviation === 0 && fifthDeviation === 0) {
      return null;
    } else if (thirdDeviation === -1 && fifthDeviation === 0) {
      return "m";
    } else if (thirdDeviation === -1 && fifthDeviation === -1) {
      return <sup>{"°"}</sup>;
    }
    return "?";
  };

  return (
    <NotesArray size={seventhChords.length} SQUARE_SIDE={SQUARE_SIDE}>
      {seventhChords.map((seventhChord, seventhChordIdx) => {
        // Fetch triad notes
        const seventhChordNotes = [0, 2, 4, 6].map(
          (offset) =>
            modeIntervalNotes[seventhChordIdx + offset + modeLeftOverflowSize]
        );

        const seventhChordDescriptor = getTriadDescriptor(seventhChordNotes);

        return (
          <NoteCell
            idx={seventhChordIdx}
            key={seventhChordIdx}
            SQUARE_SIDE={SQUARE_SIDE}
            onMouseEnter={() => {
              setHoveredSeventhChordIndex(seventhChordIdx);

              console.log("seventhChordNotes notes are ", seventhChordNotes);

              // Calculate the relative indices in the top row
              const rootNoteIndex = notes.indexOf(
                modeIntervalNotes[modeLeftOverflowSize + seventhChordIdx]
              );

              console.log("rootNoteIndex", rootNoteIndex);

              const triadIndices = seventhChordNotes.map((triadNote) => {
                const relativeIndex = notes.indexOf(triadNote) - rootNoteIndex;
                return (relativeIndex + baseScale.length) % baseScale.length; // Ensure positive index with wrap-around
              });

              // Update `TriadScale` with notes at calculated indices
              const triadScale = Array(baseScale.length).fill(null); // Empty array for the top row
              triadIndices.forEach((relativeIndex, i) => {
                triadScale[relativeIndex] = seventhChordNotes[i];
              });
              setTriadNotes(triadScale); // Pass calculated triad notes to `TriadScale`
            }}
            onMouseLeave={() => {
              setHoveredSeventhChordIndex(null);
              setTriadNotes([]);
            }}
            onClick={() => {
              console.log("traad notes are ", seventhChordNotes);
              playChord(seventhChordNotes);
            }}
          >
            {seventhChord}
            {seventhChordDescriptor}
          </NoteCell>
        );
      })}
    </NotesArray>
  );
};

export default DiatonicScaleDegreesRowForSeventhChords;
