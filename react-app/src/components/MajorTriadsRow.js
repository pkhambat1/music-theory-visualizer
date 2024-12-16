import React from "react";
import NoteCell from "./NoteCell";
import NotesArray from "./NotesArray";
import { majorScaleLeftOverflowSize } from "../App";
import { playChords } from "../utils/helpers";

const MajorTriadsRow = ({
  SQUARE_SIDE,
  majorScaleNotes: majorScaleWithOverflowNotes,
  setHoveredTriadIndex,
  setTriadNotes,
  notes,
  baseScale,
}) => {
  const triads = ["I", "II", "III", "IV", "V", "VI", "VII"];

  return (
    <NotesArray size={triads.length} SQUARE_SIDE={SQUARE_SIDE}>
      {triads.map((triad, triadIdx) => (
        <NoteCell
          idx={triadIdx}
          key={triadIdx}
          SQUARE_SIDE={SQUARE_SIDE}
          onMouseEnter={() => {
            setHoveredTriadIndex(triadIdx);

            // Fetch triad notes
            const triadNotes = [0, 2, 4].map(
              (offset) =>
                majorScaleWithOverflowNotes[
                  triadIdx + offset + majorScaleLeftOverflowSize
                ]
            );

            console.log("traad notes are ", triadNotes);

            // Calculate the relative indices in the top row
            const rootNoteIndex = notes.indexOf(
              majorScaleWithOverflowNotes[majorScaleLeftOverflowSize + triadIdx]
            );

            console.log("rootNoteIndex", rootNoteIndex);

            const triadIndices = triadNotes.map((triadNote) => {
              const relativeIndex = notes.indexOf(triadNote) - rootNoteIndex;
              return (relativeIndex + baseScale.length) % baseScale.length; // Ensure positive index with wrap-around
            });

            console.log("triadIndices", triadIndices);

            // Update `TriadScale` with notes at calculated indices
            const triadScale = Array(baseScale.length).fill(null); // Empty array for the top row
            triadIndices.forEach((relativeIndex, i) => {
              triadScale[relativeIndex] = triadNotes[i];
            });

            console.log("triadScale", triadScale);

            setTriadNotes(triadScale); // Pass calculated triad notes to `TriadScale`
          }}
          onMouseOut={() => {
            setHoveredTriadIndex(null);
            setTriadNotes([]);
          }}
          onClick={() => {
            // Fetch triad notes
            const triadNotes = [0, 2, 4].map(
              (offset) =>
                majorScaleWithOverflowNotes[
                  triadIdx + offset + majorScaleLeftOverflowSize
                ]
            );

            console.log("traad notes are ", triadNotes);

            playChords(triadNotes);
          }}
        >
          {triad}
        </NoteCell>
      ))}
    </NotesArray>
  );
};

export default MajorTriadsRow;
