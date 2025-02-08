import React, { useState, useRef, useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import TriadScale from "./components/TriadScale";
import DiatonicScaleDegreesRow from "./components/DistonicScaleDegreesRow";
import Lines from "./components/Lines";
import HoverLines from "./components/HoverLines";
import NoteCell from "./components/NoteCell";
import { renderNote, generateOctaves, playNote } from "./utils/helpers";
import NotesArray from "./components/NotesArray";
import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Space, Select } from "antd";

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
  "Ionian (major)": [0, 2, 4, 5, 7, 9, 11],
  Dorian: [0, 2, 3, 5, 7, 9, 10],
  Phrygian: [0, 1, 3, 5, 7, 8, 10],
  Lydian: [0, 2, 4, 6, 7, 9, 11],
  Mixolydian: [0, 2, 4, 5, 7, 9, 10],
  "Aeolian (natural minor)": [0, 2, 3, 5, 7, 8, 10],
  Locrian: [0, 1, 3, 5, 6, 8, 10],
  "Harmonic Minor": [0, 2, 3, 5, 7, 8, 11],
  "Melodic Minor": [0, 2, 3, 5, 7, 9, 11],
};

const SQUARE_SIDE = 60;
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
  const [selectedMode, setSelectedMode] = useState("Ionian (major)");
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
  const [hoveredSeventhChordIndex, setHoveredSeventhChordIndex] =
    useState(null);
  const [triadNotes, setTriadNotes] = useState([]);

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

  const [selectedExtensions, setSelectedExtensions] = useState(
    Array.from({ length: modeIntervals.length }, () => [])
  );

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
      <HoverLines
        hoveredIndex={hoveredSeventhChordIndex}
        SQUARE_SIDE={SQUARE_SIDE}
        borderWidth={borderWidth}
        baseScale={baseScale}
        majorIntervals={modeIntervals}
        HACK_y_offset={SQUARE_SIDE * 2}
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

      <DiatonicScaleDegreesRow
        SQUARE_SIDE={SQUARE_SIDE}
        modeIntervalNotes={modeWithOverflowNotes}
        setHoveredChordIndex={setHoveredTriadIndex}
        setChordNotes={setTriadNotes}
        notes={notes}
        baseScale={baseScale}
        chordType="triads"
      />

      <DiatonicScaleDegreesRow
        SQUARE_SIDE={SQUARE_SIDE}
        modeIntervalNotes={modeWithOverflowNotes}
        setHoveredChordIndex={setHoveredTriadIndex}
        setChordNotes={setTriadNotes}
        notes={notes}
        baseScale={baseScale}
        chordType="triads"
        selectedExtensions={selectedExtensions}
      />
      {/* Seventh chords */}
      {/* <DiatonicScaleDegreesRow
        SQUARE_SIDE={SQUARE_SIDE}
        modeIntervalNotes={modeWithOverflowNotes}
        setHoveredChordIndex={setHoveredSeventhChordIndex}
        setChordNotes={setTriadNotes}
        notes={notes}
        baseScale={baseScale}
        chordType="seventhChords"
        selectedExtensions={selectedExtensions}
      /> */}

      {/* Variation Controls */}
      <NotesArray size={modeIntervals.length} SQUARE_SIDE={SQUARE_SIDE * 2}>
        {Array.from({ length: modeIntervals.length }).map((_, i) => (
          <NoteCell
            key={i}
            SQUARE_SIDE={SQUARE_SIDE * 2}
            overflow="visible"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%", // Adjust the width as needed
              minWidth: "100px", // Ensures a minimum width for smaller screens
              padding: "10px",
              boxSizing: "border-box",
            }}
          >
            <Select
              mode="multiple"
              placeholder="Select an option"
              options={[
                { value: "maj", label: "maj" },
                { value: "m", label: "m" },
                { value: "dim", label: "dim" },
                { value: "aug", label: "aug" },
                { value: "sus2", label: "sus2" },
                { value: "sus4", label: "sus4" },
                { value: "7", label: "7" },
                { value: "maj7", label: "maj7" },
              ]}
              style={{
                width: "100px",
                height: "100px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onChange={(value) => {
                setSelectedExtensions((prev) => {
                  const newExtensions = [...prev];
                  newExtensions[i] = value;
                  return newExtensions;
                });
                console.log("selectedExtensions", selectedExtensions);
              }}
              maxCount={3}
            />
          </NoteCell>
        ))}
      </NotesArray>

      <h1>
        You're in Key of {renderNote(rootNote)} mode{" "}
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
