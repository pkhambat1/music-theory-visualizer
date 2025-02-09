import React from "react";
import NoteCell from "./NoteCell";
import NotesArray from "./NotesArray";
import { modeLeftOverflowSize } from "../App";
import { playChord } from "../utils/helpers";
import { modes } from "../App";

const DiatonicScaleDegreesRowForTriads = ({
  SQUARE_SIDE,
  modeIntervalNotes,
  setHoveredTriadIndex,
  setTriadNotes,
  notes,
  baseScale,
  setMajorScaleNotes,
}) => {
  const triads = ["I", "II", "III", "IV", "V", "VI", "VII"];

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
    <NotesArray size={triads.length} SQUARE_SIDE={SQUARE_SIDE}>
      {triads.map((triad, triadIdx) => {
        // Fetch triad notes
        const triadNotes = [0, 2, 4].map(
          (offset) =>
            modeIntervalNotes[triadIdx + offset + modeLeftOverflowSize]
        );

        const triadDescriptor = getTriadDescriptor(triadNotes);

        return (
          <NoteCell
            idx={triadIdx}
            key={triadIdx}
            SQUARE_SIDE={SQUARE_SIDE}
            onMouseEnter={() => {
              setHoveredTriadIndex(triadIdx);

              console.log("triad notes are ", triadNotes);

              // Calculate the relative indices in the top row
              const rootNoteIndex = notes.indexOf(
                modeIntervalNotes[modeLeftOverflowSize + triadIdx]
              );

              console.log("rootNoteIndex", rootNoteIndex);

              const triadIndices = triadNotes.map((triadNote) => {
                const relativeIndex = notes.indexOf(triadNote) - rootNoteIndex;
                return (relativeIndex + baseScale.length) % baseScale.length; // Ensure positive index with wrap-around
              });

              // Update `TriadScale` with notes at calculated indices
              const triadScale = Array(baseScale.length).fill(null); // Empty array for the top row
              triadIndices.forEach((relativeIndex, i) => {
                triadScale[relativeIndex] = triadNotes[i];
              });
              setTriadNotes(triadScale); // Pass calculated triad notes to `TriadScale`

              const majorScaleNotes = modes.Ionian.map(
                (inter) => notes[inter + rootNoteIndex]
              );
              console.log("major scale notes are ", majorScaleNotes);
              setMajorScaleNotes(majorScaleNotes);
            }}
            onMouseLeave={() => {
              setHoveredTriadIndex(null);
              setTriadNotes([]);
              setMajorScaleNotes([...Array(7)]);
            }}
            onClick={() => {
              console.log("traad notes are ", triadNotes);
              playChord(triadNotes);
            }}
          >
            {triad}
            {triadDescriptor}
          </NoteCell>
        );
      })}
    </NotesArray>
  );
};

export default DiatonicScaleDegreesRowForTriads;
