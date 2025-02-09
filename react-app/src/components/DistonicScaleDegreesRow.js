import React from "react";
import NoteCell from "./NoteCell";
import NotesArray from "./NotesArray";
import { modeLeftOverflowSize } from "../App";
import { playChord } from "../utils/helpers";
import { modes } from "../App";

const DiatonicScaleDegreesRow = ({
  SQUARE_SIDE,
  modeIntervalWithOverflowNotes,
  setHoveredChordIndex,
  setChordNotes,
  notes,
  baseScale,
  chordType = "triads", // 'triads' or 'seventhChords'
  selectedExtensions,
  setMajorScaleNotes,
}) => {
  console.log("modeIntervalWithOverflowNotes", modeIntervalWithOverflowNotes);
  const chordNumerals = ["I", "II", "III", "IV", "V", "VI", "VII"];
  let alternatingOffsets = chordType === "triads" ? [0, 2, 4] : [0, 2, 4, 6];

  const getChordDescriptor = (chordAbsoluteIndices) => {
    const thirdDeviation =
      chordAbsoluteIndices[1] - chordAbsoluteIndices[0] - 4;
    const fifthDeviation =
      chordAbsoluteIndices[2] - chordAbsoluteIndices[0] - 7;

    if (thirdDeviation === 0 && fifthDeviation === 0) {
      return null;
    } else if (thirdDeviation === -1 && fifthDeviation === 0) {
      return "m";
    } else if (thirdDeviation === -1 && fifthDeviation === -1) {
      return <sup>{"°"}</sup>;
    } else if (thirdDeviation === 0 && fifthDeviation === 1) {
      return "+";
    } else if (thirdDeviation === 1 && fifthDeviation === 0) {
      return <sub>{"sus4"}</sub>;
    } else if (thirdDeviation === -2 && fifthDeviation === 0) {
      return <sub>{"sus2"}</sub>;
    } else {
      return "?";
    }
  };

  return (
    <NotesArray size={chordNumerals.length} SQUARE_SIDE={SQUARE_SIDE}>
      {chordNumerals.map((chordNumeral, chordNumeralIdx) => {
        const rootNoteAbsoluteIndex = notes.indexOf(
          modeIntervalWithOverflowNotes[modeLeftOverflowSize]
        );
        console.log(
          "rootNoteAbsoluteIndex",
          rootNoteAbsoluteIndex,
          modeIntervalWithOverflowNotes[modeLeftOverflowSize]
        );

        // The (modified or unmodified) 1, 3 and 5 for the chord
        const chordNoteAbsoluteIndices = alternatingOffsets.map(
          (alternatingOffset) => {
            return notes.indexOf(
              modeIntervalWithOverflowNotes[
                alternatingOffset + chordNumeralIdx + modeLeftOverflowSize
              ]
            );
          }
        );
        const chordRootAbsoluteIdx = chordNoteAbsoluteIndices[0];

        // hardcoded for demo
        if (selectedExtensions) {
          if (selectedExtensions[chordNumeralIdx].includes("sus4")) {
            chordNoteAbsoluteIndices[1] =
              chordRootAbsoluteIdx + modes["Ionian (major)"][4 - 1];
          }
          if (selectedExtensions[chordNumeralIdx].includes("sus2")) {
            chordNoteAbsoluteIndices[1] =
              chordRootAbsoluteIdx + modes["Ionian (major)"][2 - 1];
          }
          if (selectedExtensions[chordNumeralIdx].includes("maj7")) {
            chordNoteAbsoluteIndices.push(
              chordRootAbsoluteIdx + modes["Ionian (major)"][7 - 1]
            );
          }
          if (selectedExtensions[chordNumeralIdx].includes("7")) {
            chordNoteAbsoluteIndices.push(
              chordRootAbsoluteIdx + modes["Ionian (major)"][7 - 1] - 1
            );
          }
          if (selectedExtensions[chordNumeralIdx].includes("aug")) {
            chordNoteAbsoluteIndices[2] =
              chordRootAbsoluteIdx + modes["Ionian (major)"][5 - 1] + 1;
          }
          if (selectedExtensions[chordNumeralIdx].includes("dim")) {
            chordNoteAbsoluteIndices[1] =
              chordRootAbsoluteIdx + modes["Ionian (major)"][3 - 1] - 1;
            chordNoteAbsoluteIndices[2] =
              chordRootAbsoluteIdx + modes["Ionian (major)"][5 - 1] - 1;
          }
        }
        console.log("chordNoteAbsoluteIndices", chordNoteAbsoluteIndices);

        const chordDescriptor = getChordDescriptor(chordNoteAbsoluteIndices);

        return (
          <NoteCell
            idx={chordNumeralIdx}
            key={chordNumeralIdx}
            SQUARE_SIDE={SQUARE_SIDE}
            onMouseEnter={() => {
              setHoveredChordIndex(chordNumeralIdx);

              console.log("chordRootAbsoluteIdx", chordRootAbsoluteIdx);

              const chordRelativeIndices = chordNoteAbsoluteIndices.map(
                (chordNoteAbsoluteIdx) => {
                  const relativeIndex =
                    chordNoteAbsoluteIdx - chordRootAbsoluteIdx;
                  console.log("relativeIndex", relativeIndex);
                  console.assert(
                    relativeIndex >= 0 && relativeIndex < baseScale.length
                  );
                  return relativeIndex;
                }
              );
              const chordNotes = Array(baseScale.length).fill(null);

              chordRelativeIndices.forEach((relativeIndex, i) => {
                chordNotes[relativeIndex] = notes[chordNoteAbsoluteIndices[i]];
              });

              setChordNotes(chordNotes);
              console.log("chordNotes", chordNotes);
              const majorScaleNotes = modes["Ionian (major)"].map(
                (inter) => notes[inter + chordRootAbsoluteIdx]
              );
              console.log("major scale notes are ", majorScaleNotes);
              setMajorScaleNotes(majorScaleNotes);
            }}
            onMouseLeave={() => {
              setHoveredChordIndex(null);
              setChordNotes([]);
              setMajorScaleNotes([...Array(7)]);
            }}
            onClick={() => {
              playChord(chordNoteAbsoluteIndices.map((idx) => notes[idx]));
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
