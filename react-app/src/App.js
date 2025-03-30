import React, { useState, useRef, useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import TriadScale from "./components/TriadScale";
import DiatonicScaleDegreesRow from "./components/DistonicScaleDegreesRow";
import LineGroup from "./components/LineGroup";
import HoverLines from "./components/HoverLines";
import NoteCell from "./components/NoteCell";
import { renderNote, generateOctaves, playNote, playChord } from "./utils/helpers";
import NotesArray from "./components/NotesArray";
import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Space, Select, Button } from "antd";
import NotesUtils from "./utils/NotesUtils";

const squareSidePx = 60;
const pinkColor = "#f2c2c2";
const greyColor = "#cccccc";

const defaultRootNote = "C3";
export const baseScaleLeftOverflow = 5;
export const baseScaleWithOverflowSize =
  NotesUtils.chromaticScale.length + 2 * baseScaleLeftOverflow;
export const borderPx = 1.5;
export const baseScaleLeftOverflowSize =
  (baseScaleWithOverflowSize - NotesUtils.chromaticScale.length) / 2;
export const getLineBorder = (borderWidth) => `${borderWidth}px solid #333`;

export const notes = generateOctaves(6);

export const extensionOptions = [
  { value: "maj", label: "maj" },
  { value: "m", label: "m" },
  { value: "dim", label: "dim" },
  { value: "aug", label: "aug" },
  { value: "sus2", label: "sus2" },
  { value: "sus4", label: "sus4" },
  { value: "7", label: "7" },
  { value: "maj7", label: "maj7" },
  { value: "add9", label: "add9" },
  { value: "9", label: "9" }
];

const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];


function modeIntervalsToMode(rootNote, intervals) {
  // return intervals.map((inter) => notes[inter + notes.indexOf(rootNote)]);
  return intervals.map((inter) => inter + notes.indexOf(rootNote));
}

export function addOverflowToModeIntervals(modeIntervals) {
  return [
    ...[2, 3, 4, 5, 6].map(
      (idx) => modeIntervals[idx] - (NotesUtils.chromaticScale.length - 1)
    ),
    ...modeIntervals,
    ...[1, 2, 3, 4, 5].map(
      (idx) => modeIntervals[idx] + NotesUtils.chromaticScale.length - 1
    ),
  ];
}

export const modeLeftOverflowSize =
  (addOverflowToModeIntervals(NotesUtils.modes["Ionian (major)"]).length -
    NotesUtils.modes["Ionian (major)"].length) /
  2;

export default function App() {
  const [selectedMode, setSelectedMode] = useState("Ionian (major)");
  const [rootNote, setRootNote] = useState(defaultRootNote);
  const modeIntervals = NotesUtils.modes[selectedMode];
  const modeWithOverflowIntervalsRef = useRef(
    addOverflowToModeIntervals(modeIntervals)
  );
  useEffect(() => {
    modeWithOverflowIntervalsRef.current =
      addOverflowToModeIntervals(modeIntervals);
    setModeNotesWithOverflow(
      modeIntervalsToMode(rootNote, modeWithOverflowIntervalsRef.current)
    );
  }, [rootNote, modeIntervals]);
  const [modeNotesWithOverflow, setModeNotesWithOverflow] = useState(() => {
    return modeIntervalsToMode(rootNote, modeWithOverflowIntervalsRef.current);
  });
  const [hoveredTriadIndex, setHoveredTriadIndex] = useState(null);
  // const [hoveredSeventhChordIndex, setHoveredSeventhChordIndex] =
  //   useState(null);
  const [triadNotes, setTriadNotes] = useState([]);
  // Initializze to empty array size 7
  const [majorScaleNotes, setMajorScaleNotes] = useState([
    ...Array(NotesUtils.modes["Ionian (major)"].length),
  ]);

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

  const items = Object.keys(NotesUtils.modes).map((mode) => ({
    key: mode,
    label: mode,
  }));

  const [selectedExtensions, setSelectedExtensions] = useState(
    Array.from({ length: modeIntervals.length }, () => [])
  );

  const [chordProgression, setChordProgression] = useState([
    { numeral: 'I', extensions: [] },
    { numeral: 'IV', extensions: [] },
    { numeral: 'V', extensions: [] },
    { numeral: 'I', extensions: [] }
  ]);


  const [isPlaying, setIsPlaying] = useState(false);
  const currentChordRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      const playNextChord = () => {
        if (currentChordRef.current >= chordProgression.length) {
          setIsPlaying(false);
          currentChordRef.current = 0;
          return;
        }

        const chord = chordProgression[currentChordRef.current];
        console.log('Current chord:', chord);
        console.log('Current index:', currentChordRef.current);
        
        playSingleChord(chord, currentChordRef.current);

        currentChordRef.current += 1;
        timerRef.current = setTimeout(playNextChord, 1000);
      };

      playNextChord();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, chordProgression, modeNotesWithOverflow, rootNote]);

  const playChordProgression = () => {
    currentChordRef.current = 0;
    setIsPlaying(true);
  };

  const playSingleChord = (chord, index) => {
    const chordNumeralIdx = romanNumerals.indexOf(chord.numeral);

    const modeNotes = NotesUtils.leftTrimOverflowNotes(modeNotesWithOverflow, modeLeftOverflowSize);

    
    const chordNotes = NotesUtils.getChordNotes(modeNotes, chordNumeralIdx);
    console.log('chordNotes', chordNotes);
    
    const notesWithExtensions = NotesUtils.applyExtensionsToChordNotes(chordNotes, chord.extensions);
    console.log('notesWithExtensions', notesWithExtensions);

    playChord(notesWithExtensions.map(note => notes[note]));
  };

  return (
    <div
      style={{
        width: "fit-content",
        margin: "50px auto",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      <NotesArray squareSidePx={squareSidePx} show_border={false}>
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
      </NotesArray>

      <LineGroup
        aboveRowIntervals={NotesUtils.modes["Ionian (major)"]}
        aboveRowSquareSidePx={squareSidePx}
        borderWidth={borderPx}
        belowRow={[0, 1, 2, 3, 4, 5, 6, 7]}
        aboveRowIndex={1}
        belowRowSquareSidePx={squareSidePx}
        isBelowRowModeInterval={true}
      />
      <LineGroup
        aboveRowIntervals={modeIntervals}
        aboveRowSquareSidePx={squareSidePx}
        borderWidth={borderPx}
        belowRow={[0, 1, 2, 3, 4, 5, 6, 7]}
        aboveRowIndex={3}
        belowRowSquareSidePx={squareSidePx}
        isBelowRowModeInterval={true}
      />
      <LineGroup
        aboveRowIntervals={[0, 1, 2, 3, 4, 5, 6, 7]}
        aboveRowSquareSidePx={squareSidePx}
        borderWidth={borderPx}
        belowRow={[0, 1, 2, 3, 4, 5, 6, 7]}
        aboveRowIndex={5}
        belowRowSquareSidePx={squareSidePx * 2}
        isBelowRowModeInterval={false}
      />

      <HoverLines
        hoveredIndex={hoveredTriadIndex}
        SQUARE_SIDE={squareSidePx}
        borderWidth={borderPx}
        baseScale={NotesUtils.chromaticScale}
        majorIntervals={modeIntervals}
        belowRowIndex={5}
      />

      <TriadScale
        baseScale={NotesUtils.chromaticScale}
        squareSidePx={squareSidePx}
        triadNotes={triadNotes}
        notes={notes}
      />

      {/* Major scale row */}
      <NotesArray
        squareSidePx={squareSidePx}
        marginPx={squareSidePx}
        size={NotesUtils.modes[selectedMode].length}
      >
        {majorScaleNotes.map((note, idx) => (
          <NoteCell squareSidePx={squareSidePx} idx={idx} key={idx}>
            {note && renderNote(note)}
          </NoteCell>
        ))}
      </NotesArray>

      <NotesArray
        squareSidePx={squareSidePx}
        marginPx={squareSidePx}
        size={baseScaleWithOverflowSize}
        show_border={false}
      >
        <div
          style={{
            position: "absolute",
            zIndex: 1,
            display: "flex",
            translate: `${
              (baseScaleLeftOverflowSize * 100) /
              NotesUtils.chromaticScale.length
            }%`,
            outline: getLineBorder(borderPx), // HACK: cause `border` seems to break things
          }}
        >
          {NotesUtils.chromaticScale.map((_, idx) => {
            let background = null;
            if (idx === 0) {
              background = pinkColor;
            } else if (modeIntervals.includes(idx)) {
              background = greyColor;
            }
            return (
              <NoteCell
                key={idx}
                squareSidePx={squareSidePx}
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
              squareSidePx={squareSidePx}
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
        squareSidePx={squareSidePx}
        size={modeNotesWithOverflow.length}
        marginPx={squareSidePx}
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
            outline: getLineBorder(borderPx), // HACK: cause `border` seems to break things
          }}
        >
          {/* Just boxes */}
          {modeIntervals.map((_, idx) => {
            return <NoteCell key={idx} squareSidePx={squareSidePx} idx={idx} />;
          })}
        </div>

        {modeNotesWithOverflow.map((note, idx) => {
          const noteString = notes[note];
          return (
            <NoteCell
              squareSidePx={squareSidePx}
              idx={idx}
              key={idx}
              show_border={false}
              onClick={() => playNote(noteString)}
            >
              {noteString && renderNote(noteString)}
            </NoteCell>
          );
        })}
      </NotesArray>

      <DiatonicScaleDegreesRow
        SQUARE_SIDE={squareSidePx}
        modeNotesWithOverflow={modeNotesWithOverflow}
        setHoveredChordIndex={setHoveredTriadIndex}
        setChordNotes={setTriadNotes}
        notes={notes}
        chordType="triads"
        setMajorScaleNotes={setMajorScaleNotes}
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
      <NotesArray
        size={modeIntervals.length}
        squareSidePx={squareSidePx * 2}
        marginPx={squareSidePx}
      >
        {Array.from({ length: modeIntervals.length }).map((_, i) => (
          <NoteCell
            key={i}
            squareSidePx={squareSidePx * 2}
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
              options={extensionOptions}
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
                  console.log("selectedExtensions", newExtensions);
                  return newExtensions;
                });
              }}
              maxCount={3}
            />
          </NoteCell>
        ))}
      </NotesArray>

      {/* Chord Progression Row */}
      <NotesArray
        squareSidePx={squareSidePx * 2}
        size={4}
        marginPx={squareSidePx}
      >
        {chordProgression.map((chord, index) => (
          <NoteCell
            key={index}
            squareSidePx={squareSidePx * 2}
            opt_flexDirection='column'
          >
            <Select
              value={chord.numeral}
              style={{ width: "70px" }}
              onChange={(value) => {
                const newProgression = [...chordProgression];
                newProgression[index] = { ...chord, numeral: value };
                setChordProgression(newProgression);
              }}
              options={romanNumerals.map(num => ({ value: num, label: num }))}
            />
            <Select
              mode="multiple"
              placeholder="Extensions"
              value={chord.extensions}
              style={{ 
                width: "100px",
               }}
              onChange={(value) => {
                const newProgression = [...chordProgression];
                newProgression[index] = { ...chord, extensions: value };
                setChordProgression(newProgression);
              }}
              options={extensionOptions}
              maxCount={3}
            />
            <Button 
              type="primary" 
              onClick={() => playSingleChord(chord, index)}
              style={{ marginTop: "5px" }}
            >
              Play
            </Button>
          </NoteCell>
        ))}
      </NotesArray>
        <NoteCell
          squareSidePx={squareSidePx * 2}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          show_border={false}
        >
          <Button 
            type="primary" 
            onClick={playChordProgression}
            style={{ height: "40px" }}
          >
            Play All
          </Button>
        </NoteCell>
    </div>
  );
}
