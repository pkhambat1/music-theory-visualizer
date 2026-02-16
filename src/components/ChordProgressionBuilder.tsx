import { useEffect, useState } from "react";
import type { Extension, Interval, ModeName, NoteName } from "../types";
import NotesArray from "./NotesArray";
import NoteCell from "./NoteCell";
import { playChord } from "../lib/audio";
import { renderNote } from "../lib/notes";
import { MODES } from "../lib/music/modes";
import Dropdown from "./ui/Dropdown";
import Button from "./ui/Button";
import Tooltip from "./ui/Tooltip";
import MultiSelect from "./ui/MultiSelect";

interface ChordEntry {
  degree: number;
  extensions: Extension[];
}

export interface ChordProgressionBuilderProps {
  rootNote: NoteName;
  selectedMode: ModeName;
  modeIntervals: Interval[];
  notes: NoteName[];
  squareSidePx: number;
  chordProgression?: ChordEntry[];
  onUpdateChordProgression?: (chords: ChordEntry[]) => void;
}

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII"];

const EXTENSION_OPTIONS = [
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

export default function ChordProgressionBuilder({
  rootNote,
  selectedMode,
  modeIntervals,
  notes,
  squareSidePx,
  chordProgression,
  onUpdateChordProgression,
}: ChordProgressionBuilderProps) {
  const [chords, setChords] = useState<ChordEntry[]>(
    chordProgression ?? [
      { degree: 1, extensions: [] },
      { degree: 4, extensions: [] },
      { degree: 5, extensions: [] },
      { degree: 1, extensions: [] },
    ],
  );
  const [progressionKey, setProgressionKey] = useState<NoteName>(rootNote);
  const [progressionMode, setProgressionMode] = useState<ModeName>(selectedMode);
  const [progressionModeIntervals, setProgressionModeIntervals] =
    useState<Interval[]>(modeIntervals);

  useEffect(() => {
    if (chordProgression) setChords(chordProgression);
  }, [chordProgression]);

  useEffect(() => {
    const intervals = MODES[progressionMode];
    if (intervals) setProgressionModeIntervals(intervals);
  }, [progressionMode]);

  const keyOptions = notes
    .filter((note) => note.endsWith("3") || note.endsWith("4"))
    .map((note) => ({ key: note, label: String(renderNote(note)) }));

  const addChord = () =>
    setChords([...chords, { degree: 1, extensions: [] }]);

  const removeChord = (index: number) => {
    const next = [...chords];
    next.splice(index, 1);
    setChords(next);
    onUpdateChordProgression?.(next);
  };

  const updateChord = (index: number, field: keyof ChordEntry, value: number | Extension[]) => {
    const next = [...chords];
    next[index] = { ...next[index]!, [field]: value };
    setChords(next);
    onUpdateChordProgression?.(next);
  };

  const buildChordNotes = (root: NoteName, extensions: Extension[]): NoteName[] => {
    const rootIndex = notes.indexOf(root);
    if (rootIndex === -1) return [];
    const intervals = [0, 4, 7];
    if (extensions.includes("m")) intervals[1] = 3;
    if (extensions.includes("dim")) { intervals[1] = 3; intervals[2] = 6; }
    if (extensions.includes("aug")) intervals[2] = 8;
    if (extensions.includes("sus2")) intervals[1] = 2;
    if (extensions.includes("sus4")) intervals[1] = 5;
    if (extensions.includes("7")) intervals.push(10);
    if (extensions.includes("maj7")) intervals.push(11);
    if (extensions.includes("9") || extensions.includes("add9")) {
      intervals.push(14);
      if (extensions.includes("add9") && !intervals.includes(10) && !intervals.includes(11)) {
        intervals.push(11);
      }
    }
    return intervals.map((i) => notes[rootIndex + i]).filter((n): n is NoteName => !!n);
  };

  const getChordNotesForEntry = (entry: ChordEntry): NoteName[] => {
    const scaleIndex = entry.degree - 1;
    const rootIndex = notes.indexOf(progressionKey);
    const intervalOffset = progressionModeIntervals[scaleIndex]!;
    const chordRootNote = notes[rootIndex + intervalOffset]!;
    return buildChordNotes(chordRootNote, entry.extensions);
  };

  const handlePlayChord = (entry: ChordEntry) => {
    playChord(getChordNotesForEntry(entry));
  };

  const playProgression = () => {
    chords.forEach((chord, idx) => {
      setTimeout(() => handlePlayChord(chord), idx * 800);
    });
  };

  const getFormattedRomanNumeral = (degree: number, mode: ModeName): string => {
    const intervals = MODES[mode];
    if (!intervals) return ROMAN_NUMERALS[degree - 1] ?? "";
    const scaleIndex = degree - 1;
    const thirdOffset = (scaleIndex + 2) % 7;
    const fifthOffset = (scaleIndex + 4) % 7;
    const rootInMode = intervals[scaleIndex]!;
    const thirdInMode = intervals[thirdOffset]!;
    const fifthInMode = intervals[fifthOffset]!;
    const normalizedThird = (thirdInMode - rootInMode + 12) % 12;
    const normalizedFifth = (fifthInMode - rootInMode + 12) % 12;
    const numeral = ROMAN_NUMERALS[degree - 1] ?? "";
    if (normalizedThird === 3 && normalizedFifth === 6) return numeral.toLowerCase() + "°";
    if (normalizedThird === 4 && normalizedFifth === 8) return numeral + "+";
    if (normalizedThird === 3 && normalizedFifth === 7) return numeral.toLowerCase();
    return numeral;
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="m-0 text-lg font-semibold text-gray-900">
          Chord Progression Builder
        </h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Key
            </span>
            <Dropdown
              label={String(renderNote(progressionKey))}
              items={keyOptions}
              onSelect={(key) => setProgressionKey(key as NoteName)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Mode
            </span>
            <Dropdown
              label={progressionMode}
              items={Object.keys(MODES).map((mode) => ({
                key: mode,
                label: mode,
              }))}
              onSelect={(key) => setProgressionMode(key as ModeName)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={playProgression}>Play Progression</Button>
        <Button variant="outline" onClick={addChord}>
          Add Chord
        </Button>
      </div>

      <NotesArray squareSidePx={squareSidePx * 2} size={chords.length + 1}>
        {chords.map((chord, index) => (
          <NoteCell
            key={index}
            squareSidePx={squareSidePx * 2}
            className="flex flex-col items-center justify-center gap-2 p-3"
          >
            <div className="absolute right-1 top-1">
              <Button variant="ghost" size="sm" onClick={() => removeChord(index)}>
                &times;
              </Button>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {getFormattedRomanNumeral(chord.degree, progressionMode)}
              {chord.extensions.length > 0 && (
                <span className="ml-1 text-sm text-gray-500">
                  {chord.extensions.join(",")}
                </span>
              )}
            </div>
            <select
              className="w-20 rounded-lg border border-[#d5dbe2] bg-white px-2 py-1 text-sm text-gray-800 outline-none focus:border-[#64BDFF] focus:ring-1 focus:ring-[#64BDFF]"
              value={chord.degree}
              onChange={(e) => updateChord(index, "degree", Number(e.target.value))}
            >
              {ROMAN_NUMERALS.map((numeral, i) => (
                <option key={numeral} value={i + 1}>
                  {numeral}
                </option>
              ))}
            </select>
            <MultiSelect
              options={EXTENSION_OPTIONS}
              value={chord.extensions}
              onChange={(value) => updateChord(index, "extensions", value as Extension[])}
            />
            <Button variant="ghost" size="sm" onClick={() => handlePlayChord(chord)}>
              &#9654;
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
            <Button size="md" onClick={playProgression}>
              &#9654;
            </Button>
          </Tooltip>
        </NoteCell>
      </NotesArray>
    </div>
  );
}
