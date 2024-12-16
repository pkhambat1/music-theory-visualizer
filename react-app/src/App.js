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
const majorIntervals = [0, 2, 4, 5, 7, 9, 11];
const SQUARE_SIDE = 70;
const pinkColor = "#f2c2c2";
const greyColor = "#cccccc";
const baseScaleWithOverflowSize = baseScale.length + 8;
const borderWidth = 8;
export const lineBorder = `${borderWidth}px solid #333`;

const notes = generateOctaves(4);
console.log("notes are", notes);

export default function App() {
  const [majorScaleNotes, setMajorScaleNotes] = useState(() => {
    const rootIndex = 0; // Default root index
    return majorIntervals.map(
      (interval) => notes[(rootIndex + interval) % notes.length]
    );
  });

  const [hoveredTriadIndex, setHoveredTriadIndex] = useState(null);
  const [triadNotes, setTriadNotes] = useState([]);

  const [sliderRef] = useKeenSlider({
    slides: {
      perView: baseScaleWithOverflowSize,
    },

    slideChanged(s) {
      const rootIndex = s.track.details.abs;
      if (rootIndex !== undefined) {
        const updatedNotes = majorIntervals.map(
          (interval) => notes[(rootIndex + interval) % notes.length]
        );
        setMajorScaleNotes(updatedNotes);
      }
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
      {/* Dynamic SVG Lines */}
      <Lines
        majorIntervals={majorIntervals}
        SQUARE_SIDE={SQUARE_SIDE}
        borderWidth={borderWidth}
        baseScale={baseScale}
      />

      {/* Hover Lines */}
      <HoverLines
        hoveredIndex={hoveredTriadIndex}
        SQUARE_SIDE={SQUARE_SIDE}
        borderWidth={borderWidth}
        baseScale={baseScale}
        majorIntervals={majorIntervals}
      />

      {/* TRIAD SCALE */}
      <TriadScale
        baseScale={baseScale}
        majorIntervals={majorIntervals}
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
              (((baseScaleWithOverflowSize - baseScale.length) / 2) * 100) /
              baseScale.length
            }%`,
            outline: lineBorder, // cause `border seems to break things`
          }}
        >
          {baseScale.map((_, idx) => {
            let background = null;
            if (idx === 0) {
              background = pinkColor;
            } else if (majorIntervals.includes(idx)) {
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
        majorScaleNotes={majorScaleNotes}
        SQUARE_SIDE={SQUARE_SIDE}
        lineBorder={lineBorder}
      />

      <MajorTriadsRow
        SQUARE_SIDE={SQUARE_SIDE}
        majorScaleNotes={majorScaleNotes}
        setHoveredTriadIndex={setHoveredTriadIndex}
        setTriadNotes={setTriadNotes}
        notes={notes}
        baseScale={baseScale}
      />
    </div>
  );
}
