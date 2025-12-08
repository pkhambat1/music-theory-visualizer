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
const STATE_API_URL =
  process.env.REACT_APP_STATE_API_URL || "http://localhost:7420/state";
const STATE_POLL_INTERVAL_MS = Number(
  process.env.REACT_APP_STATE_POLL_MS || 2000
);
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
  const extensionOptions = [
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
  ];
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

  useEffect(() => {
    let active = true;

    const fetchRemoteState = async () => {
      try {
        const response = await fetch(STATE_API_URL, { cache: "no-store" });
        if (!response.ok) return;

        const remoteState = await response.json();
        if (!active || !remoteState) return;

        if (remoteState.rootNote) {
          setRootNote((prev) =>
            remoteState.rootNote !== prev ? remoteState.rootNote : prev
          );
        }

        if (remoteState.mode && NotesUtils.modes[remoteState.mode]) {
          setSelectedMode((prev) =>
            remoteState.mode !== prev ? remoteState.mode : prev
          );
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Unable to fetch MCP state", error);
        }
      }
    };

    fetchRemoteState();
    const poller = setInterval(fetchRemoteState, STATE_POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(poller);
    };
  }, []);

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
              <Tag
                color="#ffffff"
                style={{
                  fontSize: 16,
                  padding: "6px 10px",
                  border: "1px solid #d9d9d9",
                  color: "#333",
                }}
              >
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
                <Tag color="#ffffff" style={{ border: "1px solid #d9d9d9", color: "#333", cursor: "pointer" }}>
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
          styles={{
            body: { padding: 24, display: "flex", justifyContent: "center" },
          }}
        >
          <div
            ref={diagramRef}
            style={{
              position: "relative",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              overflow: "hidden",
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
            <Card
              size="small"
              style={{ width: "100%", marginTop: 24 }}
              title="Chord extensions per degree"
              styles={{ body: { padding: 16 } }}
            >
              <Space
                wrap
                size="middle"
                style={{ width: "100%", justifyContent: "center" }}
              >
                {Array.from({ length: modeIntervals.length }).map((_, i) => (
                  <Space
                    key={i}
                    direction="vertical"
                    size={8}
                    align="center"
                    style={{
                      padding: "10px 12px",
                      border: "1px solid #e5e5e5",
                      borderRadius: 8,
                      minWidth: 140,
                      background: "#fafafa",
                    }}
                  >
                    <Text strong>
                      {["I", "II", "III", "IV", "V", "VI", "VII", "I"][i] ||
                        `Deg ${i + 1}`}
                    </Text>
                    <Select
                      mode="multiple"
                      allowClear
                      size="small"
                      placeholder="Extensions"
                      options={extensionOptions}
                      value={selectedExtensions[i]}
                      style={{ minWidth: 120 }}
                      onChange={(value) => {
                        setSelectedExtensions((prev) => {
                          const next = [...prev];
                          next[i] = value;
                          return next;
                        });
                      }}
                      maxCount={3}
                      dropdownMatchSelectWidth={200}
                    />
                  </Space>
                ))}
              </Space>
            </Card>
          </div>
        </Card>
      </Space>
    </div>
  );
}
