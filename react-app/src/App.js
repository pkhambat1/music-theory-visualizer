import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { DownOutlined } from "@ant-design/icons";
import {
  Dropdown,
  Space,
  Select,
  Card,
  Typography,
  Divider,
  Tag,
  theme,
} from "antd";
import TriadScale from "./components/TriadScale";
import DiatonicScaleDegreesRow from "./components/DistonicScaleDegreesRow";
import LineGroup from "./components/LineGroup";
import HoverLines from "./components/HoverLines";
import NoteCell from "./components/NoteCell";
import NotesArray from "./components/NotesArray";
import ModeNoteCell from "./components/ModeNoteCell";
import { geekblue } from "@ant-design/colors";
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
import { spellModeNotes } from "./utils/noteSpelling";

const { Title, Text } = Typography;

const squareSidePx = 60;

const defaultRootNote = "C3";
export const notes = generateOctaves(6);

export default function App() {
  const { token } = theme.useToken();
  const azureHighlight = geekblue[2];
  const coolBorder = token.colorBorderSecondary;
  const charcoalText = token.colorTextBase;
  const canvasBackground = token.colorBgBase;
  const ashFill = token.colorFill;
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
  const handlePlayNote = useCallback((val) => playNote(val), []);
  const spelledModeNotes = useMemo(
    () => spellModeNotes(modeNotesWithOverflow, modeLeftOverflowSize, notes),
    [modeNotesWithOverflow, modeLeftOverflowSize]
  );

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
    <div style={{ padding: "32px", background: canvasBackground }}>
      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
        <Card style={{ maxWidth: 1200, width: "100%", margin: "0 auto" }}>
          <Space orientation="vertical" size="small" style={{ width: "100%" }}>
            <Title level={3} style={{ margin: 0 }}>
              Music Theory Visualizer
            </Title>
            <Text type="secondary">
              Explore modes, intervals, and diatonic chords with quick audio
              playback.
            </Text>
            <Divider style={{ margin: "12px 0" }} />
            <Space size="middle" wrap>
              <Text strong>Key:</Text>
              <Tag
                style={{
                  fontSize: 16,
                  padding: "6px 10px",
                  border: `1px solid ${coolBorder}`,
                  color: charcoalText,
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
                <Tag
                  style={{
                    border: `1px solid ${coolBorder}`,
                    color: charcoalText,
                    cursor: "pointer",
                    background: token.colorBgContainer,
                  }}
                >
                  {selectedMode} <DownOutlined />
                </Tag>
              </Dropdown>
            </Space>
            <Divider style={{ margin: "12px 0" }} />
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
                    background = azureHighlight;
                  } else if (modeIntervals.includes(idx)) {
                    background = ashFill;
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
                  <ModeNoteCell
                    key={idx}
                    squareSidePx={squareSidePx}
                    idx={idx}
                    dataIdx={idx}
                    noteString={noteString}
                    newValue={spelledModeNotes[idx]}
                    onPlay={handlePlayNote}
                  />
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
              extensionOptions={extensionOptions}
              onExtensionChange={(degreeIdx, value) => {
                setSelectedExtensions((prev) => {
                  const next = [...prev];
                  next[degreeIdx] = value;
                  return next;
                });
              }}
              modeLeftOverflowSize={modeLeftOverflowSize}
            />
          </div>
        </Card>
      </Space>
    </div>
  );
}
