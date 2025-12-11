import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import TriadScale from "./TriadScale";
import DiatonicScaleDegreesRow from "./DistonicScaleDegreesRow";
import LineGroup from "./LineGroup";
import HoverLines from "./HoverLines";
import NoteCell from "./NoteCell";
import NotesArray from "./NotesArray";
import ModeNoteCell from "./ModeNoteCell";
import { renderNote, generateOctaves, playNote } from "../utils/helpers";
import NotesUtils from "../utils/NotesUtils";
import Card from "./ui/Card";
import Tag from "./ui/Tag";
import Divider from "./ui/Divider";
import Dropdown from "./ui/Dropdown";
import {
  addOverflowToModeIntervals,
  baseScaleLeftOverflowSize,
  baseScaleWithOverflowSize,
  buildModeNotesWithOverflow,
  borderPx,
  getLineBorder,
  getModeLeftOverflowSize,
  modeIntervalsToMode,
} from "../lib/music/scale";
import { spellModeNotes } from "../utils/noteSpelling";

const squareSidePx = 60;
const defaultRootNote = "C3";
export const notes = generateOctaves(6);

export default function VisualizerPanel() {
  const azureHighlight = "rgb(191 219 254)"; // tailwind blue-200
  const ashFill = "#e2e8f0";
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
  const [triadNotes, setTriadNotes] = useState([]);
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
    <div className="flex flex-col gap-6">
      <Card
        className="max-w-[1600px] w-full mx-auto"
        bodyClassName="flex flex-col gap-3"
      >
        <div className="text-2xl font-semibold text-slate-900">
          Music Theory Visualizer
        </div>
        <div className="text-slate-600">
          Explore modes, intervals, and diatonic chords with quick audio
          playback.
        </div>
        <Divider />
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-900">Key:</span>
          <Tag className="text-base border-slate-300 text-slate-900">
            {renderNote(rootNote)}
          </Tag>
          <span className="font-semibold text-slate-900">Mode:</span>
          <Dropdown
            label={
              <span className="inline-flex items-center gap-2 text-slate-900">
                {selectedMode}
              </span>
            }
            items={items}
            onSelect={(key) => setSelectedMode(key)}
          />
        </div>
      </Card>

      <Card className="max-w-[1600px] w-full mx-auto" bodyClassName="p-6">
        <div
          ref={diagramRef}
          className="relative w-full flex flex-col items-center overflow-x-auto pb-4"
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
              className="absolute z-10 flex"
              style={{
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
              className="keen-slider relative z-20 flex h-full cursor-grab items-center"
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
              className="absolute z-0 flex"
              style={{
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
    </div>
  );
}
