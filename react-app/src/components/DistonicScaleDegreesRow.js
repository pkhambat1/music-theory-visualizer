import React from "react";
import NoteCell from "./NoteCell";
import NotesArray from "./NotesArray";
import { modeLeftOverflowSize } from "../App";
import { playChord } from "../utils/helpers";

const DiatonicScaleDegreesRow = ({
  SQUARE_SIDE,
  modeIntervalNotes,
  setHoveredChordIndex,
  setChordNotes,
  notes,
  baseScale,
  chordType = "triads", // 'triads' or 'seventhChords'
  selectedExtensions,
}) => {
  const chords = ["I", "II", "III", "IV", "V", "VI", "VII"];
  let defaultOffsets = chordType === "triads" ? [0, 2, 4] : [0, 2, 4, 6];

  const getChordDescriptor = (chordNotes) => {
    const chordNoteIndices = chordNotes.map((note) => notes.indexOf(note));
    const thirdDeviation = chordNoteIndices[1] - chordNoteIndices[0] - 4;
    const fifthDeviation = chordNoteIndices[2] - chordNoteIndices[0] - 7;

    if (thirdDeviation === 0 && fifthDeviation === 0) {
      return null;
    } else if (thirdDeviation === -1 && fifthDeviation === 0) {
      return "m";
    } else if (thirdDeviation === -1 && fifthDeviation === -1) {
      return <sup>{"°"}</sup>;
    } else if (thirdDeviation === 0 && fifthDeviation === 1) {
      return "+";
    } else if (thirdDeviation === 1 && fifthDeviation === 0) {
      return <sup>{"sus4"}</sup>;
    } else if (thirdDeviation === -2 && fifthDeviation === 0) {
      return <sup>{"sus2"}</sup>;
    } else {
      return "?";
    }
  };

  return (
    <NotesArray size={chords.length} SQUARE_SIDE={SQUARE_SIDE}>
      {chords.map((chord, chordIdx) => {
        if (selectedExtensions) {
          if (selectedExtensions[chordIdx].length !== 0)
            console.log(
              "selectedExtensions[chordIdx]",
              chordIdx,
              selectedExtensions[chordIdx]
            );

          // hardcoded for demo
          if (selectedExtensions[chordIdx].includes("sus4")) {
            defaultOffsets[1] = 3;
          }
          if (selectedExtensions[chordIdx].includes("sus2")) {
            defaultOffsets[1] = 1;
          }
          if (selectedExtensions[chordIdx].includes("maj7")) {
            defaultOffsets = [...defaultOffsets, 6];
          }
        }

        const chordNotes = defaultOffsets.map((offset) => {
          return modeIntervalNotes[chordIdx + offset + modeLeftOverflowSize];
        });

        // hack - reset
        defaultOffsets = chordType === "triads" ? [0, 2, 4] : [0, 2, 4, 6];

        const chordDescriptor = getChordDescriptor(chordNotes);

        return (
          <NoteCell
            idx={chordIdx}
            key={chordIdx}
            SQUARE_SIDE={SQUARE_SIDE}
            onMouseEnter={() => {
              setHoveredChordIndex(chordIdx);
              const rootNoteIndex = notes.indexOf(
                modeIntervalNotes[modeLeftOverflowSize + chordIdx]
              );
              const chordIndices = chordNotes.map((chordNote) => {
                const relativeIndex = notes.indexOf(chordNote) - rootNoteIndex;
                return (relativeIndex + baseScale.length) % baseScale.length; // Ensure positive index with wrap-around
              });
              const chordScale = Array(baseScale.length).fill(null);
              chordIndices.forEach((relativeIndex, i) => {
                chordScale[relativeIndex] = chordNotes[i];
              });
              setChordNotes(chordScale);
            }}
            onMouseLeave={() => {
              setHoveredChordIndex(null);
              setChordNotes([]);
            }}
            onClick={() => {
              playChord(chordNotes);
            }}
          >
            {chord}
            {chordDescriptor}
          </NoteCell>
        );
      })}
    </NotesArray>
  );
};

export default DiatonicScaleDegreesRow;
