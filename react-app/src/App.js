import React, { useState, useRef, useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import TriadScale from "./components/TriadScale";
import DiatonicScaleDegreesRowForTriads from "./components/DiatonicScaleDegreesRowForTriads";
import Lines from "./components/Lines";
import HoverLines from "./components/HoverLines";
import NoteCell from "./components/NoteCell";
import { renderNote, generateOctaves, playNote } from "./utils/helpers";
import NotesArray from "./components/NotesArray";
import DiatonicScaleDegreesRowForSeventhChords from "./components/DiatonicScaleDegreesRowForSeventhChords";
import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Space } from "antd";

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

const SQUARE_SIDE = 70;
const pinkColor = "#f2c2c2";
const greyColor = "#cccccc";

const defaultRootNote = "C3";
export const baseScaleWithOverflowSize = baseScale.length + 8;
export const borderWidth = 1;
export const baseScaleLeftOverflowSize =
  (baseScaleWithOverflowSize - baseScale.length) / 2;
export const getLineBorder = (borderWidth) => `${borderWidth}px solid #333`;

export const notes = generateOctaves(6);
console.log("notes are", notes);

export const modeLeftOverflowSize = 6; // HARDCODED

function modeIntervalsToNotes(rootNote, intervals) {
  return intervals.map((inter) => notes[inter + notes.indexOf(rootNote)]);
}

function addOverflowToModeIntervals(modeIntervals) {
  return [
    ...[1, 2, 3, 4, 5, 6].map((idx) => modeIntervals[idx] - baseScale.length),
    ...modeIntervals,
    ...[0, 1, 2, 3, 4, 5].map((idx) => modeIntervals[idx] + baseScale.length),
  ];
}

export default function App() {
  const [selectedMode, setSelectedMode] = useState("Ionian");
  const [rootNote, setRootNote] = useState(defaultRootNote);
  const modeIntervals = modes[selectedMode];
  const modeWithOverflowIntervalsRef = useRef(
    addOverflowToModeIntervals(modeIntervals)
  );
  useEffect(() => {
    modeWithOverflowIntervalsRef.current =
      addOverflowToModeIntervals(modeIntervals);
    setModeWithOverflowNotes(
      modeIntervalsToNotes(rootNote, modeWithOverflowIntervalsRef.current)
    );
  }, [rootNote, modeIntervals]);
  const [modeWithOverflowNotes, setModeWithOverflowNotes] = useState(() => {
    return modeIntervalsToNotes(rootNote, modeWithOverflowIntervalsRef.current);
  });
  const [hoveredTriadIndex, setHoveredTriadIndex] = useState(null);
  // const [hoveredSeventhChordIndex, setHoveredSeventhChordIndex] =
  //   useState(null);
  const [triadNotes, setTriadNotes] = useState([]);
  // Initializze to empty array size 7
  const [majorScaleNotes, setMajorScaleNotes] = useState([...Array(7)]);

  const [sliderRef] = useKeenSlider({
    centered: true,
    slides: {
      perView: baseScaleWithOverflowSize,
    },
    initial: notes.indexOf(defaultRootNote) - baseScaleLeftOverflowSize,

    slideChanged(s) {
      const rootIndex = s.track.details.abs + baseScaleLeftOverflowSize;
      setRootNote(notes[rootIndex]);
    },
  });

  const items = Object.keys(modes).map((mode) => ({
    key: mode,
    label: mode,
  }));

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
        modeIntervals={modeIntervals}
        SQUARE_SIDE={SQUARE_SIDE}
        borderWidth={borderWidth}
        baseScale={baseScale}
        hackYOffset={6}
      />
      <Lines
        modeIntervals={modes.Ionian}
        SQUARE_SIDE={SQUARE_SIDE}
        borderWidth={borderWidth}
        baseScale={baseScale}
        hackYOffset={2}
      />

      <HoverLines
        hoveredIndex={hoveredTriadIndex}
        SQUARE_SIDE={SQUARE_SIDE}
        borderWidth={borderWidth}
        baseScale={baseScale}
        majorIntervals={modeIntervals}
        hackYOffset={SQUARE_SIDE * 2}
      />
      {/* <HoverLines
        hoveredIndex={hoveredSeventhChordIndex}
        SQUARE_SIDE={SQUARE_SIDE}
        borderWidth={borderWidth}
        baseScale={baseScale}
        majorIntervals={modeIntervals}
        HACK_y_offset={SQUARE_SIDE * 2}
      /> */}

      <TriadScale
        baseScale={baseScale}
        majorIntervals={modeIntervals}
        SQUARE_SIDE={SQUARE_SIDE}
        triadNotes={triadNotes}
      />

      {/* Major scale row */}
      <NotesArray SQUARE_SIDE={SQUARE_SIDE} size={7}>
        {majorScaleNotes.map((note, idx) => (
          <NoteCell SQUARE_SIDE={SQUARE_SIDE} idx={idx} key={idx}>
            {note && renderNote(note)}
          </NoteCell>
        ))}
      </NotesArray>

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
              onClick={() => playNote(note)}
            >
              {renderNote(note)}
            </NoteCell>
          ))}
        </div>
      </NotesArray>

      {/* Mode row */}
      <NotesArray
        SQUARE_SIDE={SQUARE_SIDE}
        size={modeWithOverflowNotes.length}
        show_border={false}
      >
        <div
          style={{
            position: "absolute",
            zIndex: 0,
            display: "flex",
            translate: `${
              (modeLeftOverflowSize * 100) / modeIntervals.length
            }%`,
            outline: getLineBorder(borderWidth), // HACK: cause `border` seems to break things
          }}
        >
          {/* Just boxes */}
          {modeIntervals.map((_, idx) => {
            return <NoteCell key={idx} SQUARE_SIDE={SQUARE_SIDE} idx={idx} />;
          })}
        </div>

        {modeWithOverflowNotes.map((note, idx) => (
          <NoteCell
            SQUARE_SIDE={SQUARE_SIDE}
            idx={idx}
            key={idx}
            show_border={false}
            onClick={() => playNote(note)}
          >
            {note && renderNote(note)}
          </NoteCell>
        ))}
      </NotesArray>

      <DiatonicScaleDegreesRowForTriads
        SQUARE_SIDE={SQUARE_SIDE}
        modeIntervalNotes={modeWithOverflowNotes}
        setHoveredTriadIndex={setHoveredTriadIndex}
        setTriadNotes={setTriadNotes}
        notes={notes}
        baseScale={baseScale}
        setMajorScaleNotes={setMajorScaleNotes}
      />

      {/* <DiatonicScaleDegreesRowForSeventhChords
        SQUARE_SIDE={SQUARE_SIDE}
        modeIntervalNotes={modeWithOverflowNotes}
        setHoveredSeventhChordIndex={setHoveredSeventhChordIndex}
        setTriadNotes={setTriadNotes}
        notes={notes}
        baseScale={baseScale}
      /> */}

      <h1>
        You're in Key of C mode{" "}
        <Dropdown
          menu={{
            items,
            onClick: ({ key }) => {
              setSelectedMode(key);
            },
          }}
          trigger={["click"]}
        >
          <Space>
            {selectedMode} <DownOutlined />
          </Space>
        </Dropdown>
      </h1>
    </div>
  );
}
