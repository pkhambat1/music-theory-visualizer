import React, { useEffect, useRef, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Space, Select, Card, Typography, Divider, Tag } from "antd";
import TriadScale from "./components/TriadScale";
import DiatonicScaleDegreesRow from "./components/DistonicScaleDegreesRow";
import LineGroup from "./components/LineGroup";
import HoverLines from "./components/HoverLines";
import NoteCell from "./components/NoteCell";
import NotesArray from "./components/NotesArray";
import { renderNote, generateOctaves, playNote } from "./utils/helpers";
import NotesUtils from "./utils/NotesUtils";
import {
  addOverflowToModeIntervals,
  baseScaleLeftOverflowSize,
  baseScaleWithOverflowSize,
  buildModeNotesWithOverflow,
  borderPx,
  getLineBorder,
  getModeLeftOverflowSize,
  modeIntervalsToMode,
} from "./lib/music/scale";

const { Title, Text } = Typography;

const squareSidePx = 60;
const pinkColor = "#f2c2c2";
const greyColor = "#cccccc";

const defaultRootNote = "C3";
export const notes = generateOctaves(6);

export default function App() {
  const [selectedMode, setSelectedMode] = useState("Ionian (major)");
  const [rootNote, setRootNote] = useState(defaultRootNote);
  const modeIntervals = NotesUtils.modes[selectedMode];
  const modeWithOverflowIntervalsRef = useRef(
    addOverflowToModeIntervals(modeIntervals)
  );
  const modeLeftOverflowSize = getModeLeftOverflowSize(modeIntervals);

  useEffect(() => {
    modeWithOverflowIntervalsRef.current =
      addOverflowToModeIntervals(modeIntervals);
    setModeNotesWithOverflow(
      modeIntervalsToMode(rootNote, modeWithOverflowIntervalsRef.current, notes)
    );
  }, [rootNote, modeIntervals]);
  const [modeNotesWithOverflow, setModeNotesWithOverflow] = useState(() => {
    return buildModeNotesWithOverflow(rootNote, modeIntervals, notes);
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
      console.log("Slider changed event!", {
        position: s.track.details.abs,
        newRootIndex: s.track.details.abs + baseScaleLeftOverflowSize,
        newRootNote: notes[s.track.details.abs + baseScaleLeftOverflowSize],
      });
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
  const diagramRef = useRef(null);
  const modeConnections = modeIntervals.map((interval, idx) => ({
    fromRow: "chromatic-row",
    fromIdx: interval,
    toRow: "mode-row",
    toIdx: modeLeftOverflowSize + idx,
  }));

  return (
    <div style={{ padding: "32px", background: "#f5f5f5" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card style={{ maxWidth: 1200, width: "100%", margin: "0 auto" }}>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Title level={3} style={{ margin: 0 }}>
              Music Theory Visualizer
            </Title>
            <Text type="secondary">
              Explore modes, intervals, and diatonic chords with quick audio playback.
            </Text>
            <Divider style={{ margin: "12px 0" }} />
            <Space size="middle" wrap>
              <Text strong>Key:</Text>
              <Tag color="blue" style={{ fontSize: 16, padding: "6px 10px" }}>
                {renderNote(rootNote)}
              </Tag>
              <Text strong>Mode:</Text>
              <Dropdown
                menu={{
                  items,
                  onClick: ({ key }) => {
                    setSelectedMode(key);
                  },
                }}
                trigger={["click"]}
              >
                <Tag
                  color="geekblue"
                  style={{
                    fontSize: 16,
                    padding: "6px 10px",
                    cursor: "pointer",
                  }}
                >
                  {selectedMode} <DownOutlined />
                </Tag>
              </Dropdown>
            </Space>
            <Divider style={{ margin: "12px 0" }} />
            <Space size="small" wrap align="center">
              <Text type="secondary">Legend:</Text>
              <Tag color={pinkColor}>Root note</Tag>
              <Tag color={greyColor}>Mode tone</Tag>
              <Tag>Non-mode tone</Tag>
            </Space>
          </Space>
        </Card>

        <Card
          style={{ maxWidth: 1200, width: "100%", margin: "0 auto" }}
          bodyStyle={{ padding: 24 }}
        >
          <div
            ref={diagramRef}
            style={{
              position: "relative",
              width: "fit-content",
              margin: "0 auto",
            }}
          >
            <LineGroup
              containerRef={diagramRef}
              connections={modeConnections}
              depKey={`${rootNote}-${selectedMode}`}
            />

          <HoverLines
            hoveredIndex={hoveredTriadIndex}
            containerRef={diagramRef}
            modeNotesWithOverflow={modeNotesWithOverflow}
            modeLeftOverflowSize={modeLeftOverflowSize}
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
                      dataRow="chromatic-row"
                      dataIdx={idx}
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
                    dataRow="base-row"
                    dataIdx={idx}
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
                  return (
                    <NoteCell key={idx} squareSidePx={squareSidePx} idx={idx} />
                  );
                })}
              </div>

            {modeNotesWithOverflow.map((note, idx) => {
              const noteString = notes[note];
              return (
                <NoteCell
                  squareSidePx={squareSidePx}
                  idx={idx}
                  key={idx}
                  dataRow="mode-row"
                  dataIdx={idx}
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
              modeLeftOverflowSize={modeLeftOverflowSize}
            />

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
                    options={[
                      { value: "maj", label: "maj" },
                      { value: "m", label: "m" },
                      { value: "dim", label: "dim" },
                      { value: "aug", label: "aug" },
                      { value: "sus2", label: "sus2" },
                      { value: "sus4", label: "sus4" },
                      { value: "7", label: "7" },
                      { value: "maj7", label: "maj7" },
                      { value: "add9", label: "add9" },
                      { value: "9", label: "9" },
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
                        console.log("selectedExtensions", newExtensions);
                        return newExtensions;
                      });
                    }}
                    maxCount={3}
                  />
                </NoteCell>
              ))}
            </NotesArray>
          </div>
        </Card>
      </Space>
    </div>
  );
}
