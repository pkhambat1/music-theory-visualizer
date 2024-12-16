import React, { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import TriadScale from "./components/TriadScale";
import MajorTriadsRow from "./components/MajorTriadsRow";
import MajorScaleRow from "./components/MajorScaleRow";
import Lines from "./components/Lines";
import HoverLines from "./components/HoverLines";
import NoteCell from "./components/NoteCell";
import { renderNote, generateOctaves } from "./utils/helpers";
import NotesArray from "./components/NotesArray";

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

export const modes = {
  Ionian: [0, 2, 4, 5, 7, 9, 11], // Major scale
  Dorian: [0, 2, 3, 5, 7, 9, 10],
  Phrygian: [0, 1, 3, 5, 7, 8, 10],
  Lydian: [0, 2, 4, 6, 7, 9, 11],
  Mixolydian: [0, 2, 4, 5, 7, 9, 10],
  Aeolian: [0, 2, 3, 5, 7, 8, 10], // Natural minor scale
  Locrian: [0, 1, 3, 5, 6, 8, 10],
  HarmonicMinor: [0, 2, 3, 5, 7, 8, 11],
};

const modeIntervals = modes.Ionian;
// const majorIntervals = [0, 2, 4, 5, 7, 8, 10]; // actually minor
// const majorIntervals = [0, 2, 4, 5, 7, 8, 10]; // actually minor

const SQUARE_SIDE = 70;
const pinkColor = "#f2c2c2";
const greyColor = "#cccccc";

const defaultRootNote = "C3";
export const baseScaleWithOverflowSize = baseScale.length + 8;
export const borderWidth = 1;
export const baseScaleLeftOverflowSize =
  (baseScaleWithOverflowSize - baseScale.length) / 2;
export const getLineBorder = (borderWidth) => `${borderWidth}px solid #333`;

const notes = generateOctaves(6);
console.log("notes are", notes);

const majorScaleIntervalsWithOverflow = [
  ...[1, 2, 3, 4, 5, 6].map((idx) => modeIntervals[idx] - baseScale.length),
  ...modeIntervals,
  ...[0, 1, 2, 3, 4, 5].map((idx) => modeIntervals[idx] + baseScale.length),
];

console.log(
  "majorScaleWithOverflow",
  majorScaleIntervalsWithOverflow,
  majorScaleIntervalsWithOverflow.map((i) => notes[i]),
  notes.indexOf("C3")
);

export const majorScaleLeftOverflowSize =
  (majorScaleIntervalsWithOverflow.length - modeIntervals.length) / 2;

export default function App() {
  const [majorScaleWithOverflowNotes, setMajorScaleWithOverflowNotes] =
    useState(() => {
      return majorScaleIntervalsWithOverflow.map(
        (inter) => notes[inter + notes.indexOf(defaultRootNote)]
      );
    });

  const [hoveredTriadIndex, setHoveredTriadIndex] = useState(null);
  const [triadNotes, setTriadNotes] = useState([]);

  const [sliderRef] = useKeenSlider({
    centered: true,
    slides: {
      perView: baseScaleWithOverflowSize,
    },
    initial: notes.indexOf(defaultRootNote) - baseScaleLeftOverflowSize,

    slideChanged(s) {
      const rootIndex = s.track.details.abs + baseScaleLeftOverflowSize;
      console.log(rootIndex, notes[rootIndex]);
      const updatedNotes = majorScaleIntervalsWithOverflow.map(
        (interval) => notes[rootIndex + interval]
      );
      setMajorScaleWithOverflowNotes(updatedNotes);
    },
  });

  return (
    <div
      style={{
        width: "fit-content",
        margin: "50px auto",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      <Lines
        majorIntervals={modeIntervals}
        SQUARE_SIDE={SQUARE_SIDE}
        borderWidth={borderWidth}
        baseScale={baseScale}
      />

      <HoverLines
        hoveredIndex={hoveredTriadIndex}
        SQUARE_SIDE={SQUARE_SIDE}
        borderWidth={borderWidth}
        baseScale={baseScale}
        majorIntervals={modeIntervals}
      />

      <TriadScale
        baseScale={baseScale}
        majorIntervals={modeIntervals}
        SQUARE_SIDE={SQUARE_SIDE}
        triadNotes={triadNotes}
      />

      <NotesArray
        SQUARE_SIDE={SQUARE_SIDE}
        size={baseScaleWithOverflowSize}
        show_border={false}
      >
        <div
          style={{
            position: "absolute",
            zIndex: 1,
            display: "flex",
            translate: `${
              (baseScaleLeftOverflowSize * 100) / baseScale.length
            }%`,
            outline: getLineBorder(borderWidth), // HACK: cause `border` seems to break things
          }}
        >
          {baseScale.map((_, idx) => {
            let background = null;
            if (idx === 0) {
              background = pinkColor;
            } else if (modeIntervals.includes(idx)) {
              background = greyColor;
            }
            return (
              <NoteCell
                key={idx}
                SQUARE_SIDE={SQUARE_SIDE}
                opt_background={background}
              />
            );
          })}
        </div>

        <div
          ref={sliderRef}
          className="keen-slider"
          style={{
            cursor: "grab",
            position: "relative",
            zIndex: 2,
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          {notes.map((note, idx) => (
            <NoteCell
              key={idx}
              idx={idx}
              SQUARE_SIDE={SQUARE_SIDE}
              className="keen-slider__slide"
              show_border={false}
            >
              {renderNote(note)}
            </NoteCell>
          ))}
        </div>
      </NotesArray>

      <MajorScaleRow
        majorScaleNotes={majorScaleWithOverflowNotes}
        SQUARE_SIDE={SQUARE_SIDE}
        showBorder={false}
      />

      <MajorTriadsRow
        SQUARE_SIDE={SQUARE_SIDE}
        majorScaleNotes={majorScaleWithOverflowNotes}
        setHoveredTriadIndex={setHoveredTriadIndex}
        setTriadNotes={setTriadNotes}
        notes={notes}
        baseScale={baseScale}
      />
    </div>
  );
}
