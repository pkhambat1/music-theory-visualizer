import React, { useEffect, useState } from "react";
import NotesArray from "./NotesArray";
import NoteCell from "./NoteCell";
import { playChord, renderNote } from "../utils/helpers";
import NotesUtils from "../utils/NotesUtils";
import Dropdown from "./ui/Dropdown";
import Button from "./ui/Button";
import Tooltip from "./ui/Tooltip";
import MultiSelect from "./ui/MultiSelect";

const ChordProgressionBuilder = ({
  rootNote,
  selectedMode,
  modeIntervals,
  notes,
  squareSidePx,
  chordProgression,
  onUpdateChordProgression,
}) => {
  const [chords, setChords] = useState(
    chordProgression || [
      { degree: 1, extensions: [] },
      { degree: 4, extensions: [] },
      { degree: 5, extensions: [] },
      { degree: 1, extensions: [] },
    ]
  );
  const [progressionKey, setProgressionKey] = useState(rootNote);
  const [progressionMode, setProgressionMode] = useState(selectedMode);
  const [progressionModeIntervals, setProgressionModeIntervals] =
    useState(modeIntervals);

  useEffect(() => {
    if (chordProgression) {
      setChords(chordProgression);
    }
  }, [chordProgression]);

  useEffect(() => {
    setProgressionModeIntervals(NotesUtils.modes[progressionMode]);
  }, [progressionMode]);

  const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII"];
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

  const keyOptions = notes
    .filter((note) => note.endsWith("3") || note.endsWith("4"))
    .map((note) => ({
      key: note,
      label: renderNote(note),
    }));

  const addChord = () => setChords([...chords, { degree: 1, extensions: [] }]);

  const removeChord = (index) => {
    const next = [...chords];
    next.splice(index, 1);
    setChords(next);
    onUpdateChordProgression?.(next);
  };

  const updateChord = (index, field, value) => {
    const next = [...chords];
    next[index] = { ...next[index], [field]: value };
    setChords(next);
    onUpdateChordProgression?.(next);
  };

  const buildChordNotes = (root, extensions) => {
    const rootIndex = notes.indexOf(root);
    if (rootIndex === -1) return [];
    let intervals = [0, 4, 7];
    if (extensions.includes("m")) intervals[1] = 3;
    if (extensions.includes("dim")) {
      intervals[1] = 3;
      intervals[2] = 6;
    }
    if (extensions.includes("aug")) intervals[2] = 8;
    if (extensions.includes("sus2")) intervals[1] = 2;
    if (extensions.includes("sus4")) intervals[1] = 5;
    if (extensions.includes("7")) intervals.push(10);
    if (extensions.includes("maj7")) intervals.push(11);
    if (extensions.includes("9") || extensions.includes("add9")) {
      intervals.push(14);
      if (
        extensions.includes("add9") &&
        !intervals.includes(10) &&
        !intervals.includes(11)
      ) {
        intervals.push(11);
      }
    }
    return intervals
      .map((i) => notes[rootIndex + i])
      .filter(Boolean);
  };

  const getChordNotes = (chordObj) => {
    const scaleIndex = chordObj.degree - 1;
    const rootIndex = notes.indexOf(progressionKey);
    const intervalOffset = progressionModeIntervals[scaleIndex];
    const chordRootIndex = rootIndex + intervalOffset;
    const chordRootNote = notes[chordRootIndex];
    return buildChordNotes(chordRootNote, chordObj.extensions || []);
  };

  const handlePlayChord = (chordObj) => {
    const chordNotes = getChordNotes(chordObj);
    playChord(chordNotes);
  };

  const playProgression = () => {
    chords.forEach((chord, idx) => {
      setTimeout(() => handlePlayChord(chord), idx * 800);
    });
  };

  const getFormattedRomanNumeral = (degree, mode) => {
    const intervals = NotesUtils.modes[mode];
    if (!intervals) return romanNumerals[degree - 1];
    const scaleIndex = degree - 1;
    const thirdOffset = (scaleIndex + 2) % 7;
    const fifthOffset = (scaleIndex + 4) % 7;
    const rootInMode = intervals[scaleIndex];
    const thirdInMode = intervals[thirdOffset];
    const fifthInMode = intervals[fifthOffset];
    const normalizedThird = (thirdInMode - rootInMode + 12) % 12;
    const normalizedFifth = (fifthInMode - rootInMode + 12) % 12;
    const numeral = romanNumerals[degree - 1];
    if (normalizedThird === 3 && normalizedFifth === 6) return numeral.toLowerCase() + "°";
    if (normalizedThird === 4 && normalizedFifth === 8) return numeral + "+";
    if (normalizedThird === 3 && normalizedFifth === 7) return numeral.toLowerCase();
    return numeral;
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="m-0 text-lg font-semibold text-slate-900">
          Chord Progression Builder
        </h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-700">Key:</span>
            <Dropdown
              label={<span className="text-slate-900">{renderNote(progressionKey)}</span>}
              items={keyOptions}
              onSelect={(key) => setProgressionKey(key)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-700">Mode:</span>
            <Dropdown
              label={<span className="text-slate-900">{progressionMode}</span>}
              items={Object.keys(NotesUtils.modes).map((mode) => ({
                key: mode,
                label: mode,
              }))}
              onSelect={(key) => setProgressionMode(key)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={playProgression} className="bg-indigo-600 text-white hover:bg-indigo-700">
          Play Progression
        </Button>
        <Button variant="ghost" onClick={addChord}>
          Add Chord
        </Button>
      </div>

      <NotesArray
        squareSidePx={squareSidePx * 2}
        size={chords.length + 1}
        marginPx={squareSidePx}
      >
        {chords.map((chord, index) => (
          <NoteCell
            key={index}
            squareSidePx={squareSidePx * 2}
            overflow="visible"
            className="flex flex-col items-center justify-center gap-2 p-3"
          >
            <div className="absolute right-1 top-1">
              <Button variant="ghost" size="sm" onClick={() => removeChord(index)}>
                ✕
              </Button>
            </div>
            <div className="text-lg font-semibold text-slate-900">
              {getFormattedRomanNumeral(chord.degree, progressionMode)}
              {chord.extensions?.length > 0 && (
                <span className="ml-1 text-sm text-slate-600">
                  {chord.extensions.join(",")}
                </span>
              )}
            </div>
            <select
              className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={chord.degree}
              onChange={(e) => updateChord(index, "degree", Number(e.target.value))}
            >
              {romanNumerals.map((numeral, i) => (
                <option key={numeral} value={i + 1}>
                  {numeral}
                </option>
              ))}
            </select>
            <MultiSelect
              options={extensionOptions}
              value={chord.extensions}
              onChange={(value) => updateChord(index, "extensions", value)}
            />
            <Button variant="ghost" size="sm" onClick={() => handlePlayChord(chord)}>
              ▶
            </Button>
          </NoteCell>
        ))}
        <NoteCell
          squareSidePx={squareSidePx * 2}
          className="flex flex-col items-center justify-center gap-2"
        >
          <Tooltip title="Add chord">
            <Button variant="ghost" size="sm" onClick={addChord}>
              +
            </Button>
          </Tooltip>
          <Tooltip title="Play progression">
            <Button
              className="bg-indigo-600 text-white hover:bg-indigo-700"
              size="md"
              onClick={playProgression}
            >
              ▶
            </Button>
          </Tooltip>
        </NoteCell>
      </NotesArray>
    </div>
  );
};

export default ChordProgressionBuilder;
