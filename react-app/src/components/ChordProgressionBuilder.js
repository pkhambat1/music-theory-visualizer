import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import NotesArray from "./NotesArray";
import NoteCell from "./NoteCell";
import { playChord, renderNote } from "../utils/helpers";
import NotesUtils from "../utils/NotesUtils";
import Dropdown from "./ui/Dropdown";
import Button from "./ui/Button";
import Tooltip from "./ui/Tooltip";
import MultiSelect from "./ui/MultiSelect";
import Popover from "./ui/Popover";
import SortableChordCell from "./SortableChordCell";

// Helper to generate unique IDs
const generateId = () => `chord-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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
    () => (chordProgression || [
      { degree: 1, extensions: [] },
      { degree: 4, extensions: [] },
      { degree: 5, extensions: [] },
      { degree: 1, extensions: [] },
    ]).map(c => ({ ...c, id: c.id || generateId() })) // Ensure IDs exist
  );

  // Track open state for extension popovers by chord index
  const [openIdx, setOpenIdx] = useState(null);

  const [progressionKey, setProgressionKey] = useState(rootNote);
  const [progressionMode, setProgressionMode] = useState(selectedMode);
  const [progressionModeIntervals, setProgressionModeIntervals] =
    useState(modeIntervals);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (chordProgression) {
       // Preserve IDs if they exist, or generate new ones
      setChords(chordProgression.map(c => ({ ...c, id: c.id || generateId() })));
    }
  }, [chordProgression]);

  useEffect(() => {
    setProgressionModeIntervals(NotesUtils.modes[progressionMode]);
  }, [progressionMode]);

  const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII"];
  // Extended roman numerals with default "I" if index out of bounds
  const getRomanNumeral = (degree) => romanNumerals[degree - 1] || "I";

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

  const addChord = () => setChords([...chords, { degree: 1, extensions: [], id: generateId() }]);

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

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setChords((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newChords = arrayMove(items, oldIndex, newIndex);
        onUpdateChordProgression?.(newChords);
        return newChords;
      });
    }
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
    if (intervalOffset === undefined) return [];
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

  // Helper logic to nicely format the display numeral based on mode intervals like before
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
    const numeral = romanNumerals[degree - 1] || "I";
    if (normalizedThird === 3 && normalizedFifth === 6)
      return numeral.toLowerCase() + "°";
    if (normalizedThird === 4 && normalizedFifth === 8) return numeral + "+";
    if (normalizedThird === 3 && normalizedFifth === 7)
      return numeral.toLowerCase();
    return numeral;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="m-0 text-lg font-semibold text-slate-900">
          Chord Progression Builder
        </h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-700">Key:</span>
            <Dropdown
              label={
                <span className="text-slate-900">
                  {renderNote(progressionKey)}
                </span>
              }
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
        <Button
          onClick={playProgression}
          className="bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Play Progression
        </Button>
        <Button variant="ghost" onClick={addChord}>
          Add Chord
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <NotesArray
          squareSidePx={squareSidePx * 2}
          size={chords.length + 1}
          marginPx={squareSidePx}
        >
          <SortableContext
            items={chords.map((c) => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            {chords.map((chord, index) => (
              <SortableChordCell key={chord.id} id={chord.id}>
                <NoteCell
                  idx={index}
                  squareSidePx={squareSidePx * 2}
                  overflow="visible"
                  className="group flex flex-col items-center justify-center p-2 relative"
                >
                  {/* Remove Button (Top Right) - No drag here */}
                  <div
                    className="absolute right-1 top-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-slate-400 hover:text-red-500"
                      onClick={() => removeChord(index)}
                    >
                      ✕
                    </Button>
                  </div>

                  {/* Main Content */}
                  <div className="flex flex-col items-center gap-1">
                    {/* Degree Dropdown Trigger - Prevent drag propagation */}
                    <div onPointerDown={(e) => e.stopPropagation()}>
                      <Dropdown
                        label={
                          <div className="text-2xl font-bold text-slate-900 cursor-pointer hover:text-indigo-600 transition-colors">
                            {getFormattedRomanNumeral(
                              chord.degree,
                              progressionMode
                            )}
                          </div>
                        }
                        items={romanNumerals.map((numeral, i) => ({
                          key: i + 1,
                          label: numeral,
                        }))}
                        onSelect={(key) =>
                          updateChord(index, "degree", Number(key))
                        }
                      />
                    </div>

                    {/* Extensions Display */}
                    <div className="h-4 text-xs font-medium text-slate-500 truncate max-w-full px-1">
                      {chord.extensions?.length > 0
                        ? chord.extensions.join(", ")
                        : ""}
                    </div>
                  </div>

                  {/* Add Extensions Button (Bottom Right) - No drag */}
                  <div
                    className={`absolute right-1 bottom-1 z-10 transition-opacity duration-200 ${
                      openIdx === index
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <Popover
                      open={openIdx === index}
                      onOpenChange={(nextOpen) =>
                        setOpenIdx(nextOpen ? index : null)
                      }
                      position="top"
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex items-center justify-center h-4 w-4 rounded-full border border-slate-200 bg-white/80 p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900 shadow-sm focus:ring-0 focus:ring-offset-0 focus-visible:ring-0"
                          aria-label="Add extensions"
                        >
                          <span className="text-sm leading-none mb-[1px]">
                            +
                          </span>
                        </Button>
                      }
                    >
                      <div
                        data-popover-panel
                        className="min-w-[180px] p-1"
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()} 
                      >
                        <MultiSelect
                          options={extensionOptions}
                          value={chord.extensions}
                          onChange={(value) =>
                            updateChord(index, "extensions", value)
                          }
                          autoFocus
                        />
                      </div>
                    </Popover>
                  </div>

                  {/* Play Button (Bottom Left) - No drag */}
                  <div
                    className="absolute left-1 bottom-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-indigo-600 hover:bg-indigo-50"
                      onClick={() => handlePlayChord(chord)}
                    >
                      ▶
                    </Button>
                  </div>
                </NoteCell>
              </SortableChordCell>
            ))}
          </SortableContext>

        </NotesArray>
      </DndContext>
    </div>
  );
};

export default ChordProgressionBuilder;
