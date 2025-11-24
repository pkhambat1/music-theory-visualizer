import React, { useState, useEffect } from "react";
import { Select, Button, Tooltip, Space, Dropdown } from "antd";
import {
  PlusOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  DownOutlined,
} from "@ant-design/icons";
import NotesArray from "./NotesArray";
import NoteCell from "./NoteCell";
import { playChord, renderNote } from "../utils/helpers";
import NotesUtils from "../utils/NotesUtils";

const ChordProgressionBuilder = ({
  rootNote,
  selectedMode,
  modeIntervals,
  notes,
  squareSidePx,
  chordProgression,
  onUpdateChordProgression,
}) => {
  // Use internal state that syncs with the prop
  const [chords, setChords] = useState(
    chordProgression || [
      { degree: 1, extensions: [] },
      { degree: 4, extensions: [] },
      { degree: 5, extensions: [] },
      { degree: 1, extensions: [] },
    ]
  );

  // Add local key for chord progression
  const [progressionKey, setProgressionKey] = useState(rootNote);

  // Add local mode for chord progression
  const [progressionMode, setProgressionMode] = useState(selectedMode);
  const [progressionModeIntervals, setProgressionModeIntervals] =
    useState(modeIntervals);

  // Update internal state when prop changes
  useEffect(() => {
    if (chordProgression) {
      setChords(chordProgression);
    }
  }, [chordProgression]);

  // Update progression mode intervals when mode changes
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

  // Create key selection items
  const keyOptions = notes
    .filter((note) => note.endsWith("3") || note.endsWith("4"))
    .map((note) => ({
      key: note,
      label: renderNote(note),
    }));

  const addChord = () => {
    setChords([...chords, { degree: 1, extensions: [] }]);
  };

  const removeChord = (index) => {
    const newChords = [...chords];
    newChords.splice(index, 1);
    setChords(newChords);
  };

  const updateChord = (index, field, value) => {
    const newChords = [...chords];
    newChords[index] = { ...newChords[index], [field]: value };
    setChords(newChords);

    if (onUpdateChordProgression) {
      onUpdateChordProgression(newChords);
    }
  };

  // Build a chord based on root note and extensions
  const buildChordNotes = (rootNote, extensions) => {
    const rootIndex = notes.indexOf(rootNote);
    if (rootIndex === -1) return [];

    // Default chord structure (major triad)
    let intervals = [0, 4, 7]; // Major triad intervals (root, major 3rd, perfect 5th)

    // Modify based on extensions
    if (extensions.includes("m")) {
      intervals[1] = 3; // Minor 3rd
    }

    if (extensions.includes("dim")) {
      intervals[1] = 3; // Minor 3rd
      intervals[2] = 6; // Diminished 5th
    }

    if (extensions.includes("aug")) {
      intervals[2] = 8; // Augmented 5th
    }

    if (extensions.includes("sus2")) {
      intervals[1] = 2; // Major 2nd
    }

    if (extensions.includes("sus4")) {
      intervals[1] = 5; // Perfect 4th
    }

    // Add 7th if applicable
    if (extensions.includes("7")) {
      intervals.push(10); // Dominant 7th
    }

    if (extensions.includes("maj7")) {
      intervals.push(11); // Major 7th
    }

    // Add 9th if applicable
    if (extensions.includes("9") || extensions.includes("add9")) {
      intervals.push(14); // Major 9th

      // If add9, ensure we have a 7th
      if (
        extensions.includes("add9") &&
        !intervals.includes(10) &&
        !intervals.includes(11)
      ) {
        intervals.push(11); // Add major 7th by default with add9
      }
    }

    // Generate the chord notes
    return intervals
      .map((interval) => notes[rootIndex + interval])
      .filter(Boolean);
  };

  const getChordNotes = (chordObj) => {
    // Get the root note of the chord based on scale degree
    const scaleIndex = chordObj.degree - 1;
    const rootIndex = notes.indexOf(progressionKey);
    const intervalOffset = progressionModeIntervals[scaleIndex];
    const chordRootIndex = rootIndex + intervalOffset;
    const chordRootNote = notes[chordRootIndex];

    // Build the full chord
    return buildChordNotes(chordRootNote, chordObj.extensions || []);
  };

  const handlePlayChord = (chordObj) => {
    const chordNotes = getChordNotes(chordObj);
    // Use the original playChord from helpers.js
    playChord(chordNotes);
  };

  const playProgression = () => {
    // Sequential playback with enough time between chords
    chords.forEach((chord, index) => {
      setTimeout(() => {
        handlePlayChord(chord);
      }, index * 800); // 800ms between chords
    });
  };

  // Function to get appropriate Roman numeral based on mode and degree
  const getFormattedRomanNumeral = (degree, mode) => {
    const modeIntervals = NotesUtils.modes[mode];
    if (!modeIntervals) return romanNumerals[degree - 1];

    // Get the chord quality based on the mode and scale degree
    // Calculate the triad quality based on this scale degree's intervals
    const scaleIndex = degree - 1;
    const thirdOffset = (scaleIndex + 2) % 7; // The scale degree two steps up
    const fifthOffset = (scaleIndex + 4) % 7; // The scale degree four steps up

    // Get semitone differences for the third and fifth
    const rootInMode = modeIntervals[scaleIndex];
    const thirdInMode = modeIntervals[thirdOffset];
    const fifthInMode = modeIntervals[fifthOffset];

    // Normalize values (wrap around octave)
    const normalizedThird = (thirdInMode - rootInMode + 12) % 12;
    const normalizedFifth = (fifthInMode - rootInMode + 12) % 12;

    const numeral = romanNumerals[degree - 1];

    // Determine chord quality
    if (normalizedThird === 3 && normalizedFifth === 6) {
      // Diminished triad (minor third, diminished fifth)
      return numeral.toLowerCase() + "°";
    } else if (normalizedThird === 4 && normalizedFifth === 8) {
      // Augmented triad (major third, augmented fifth)
      return numeral + "+";
    } else if (normalizedThird === 3 && normalizedFifth === 7) {
      // Minor triad (minor third, perfect fifth)
      return numeral.toLowerCase();
    } else {
      // Major triad (major third, perfect fifth) or other
      return numeral;
    }
  };

  return (
    <div style={{ marginTop: "30px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "15px",
          justifyContent: "space-between",
        }}
      >
        <h3 style={{ margin: 0 }}>Chord Progression Builder</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div>
            <span style={{ marginRight: "10px" }}>Key:</span>
            <Dropdown
              menu={{
                items: keyOptions,
                onClick: ({ key }) => {
                  setProgressionKey(key);
                },
              }}
              trigger={["click"]}
            >
              <Button>
                <Space>
                  {renderNote(progressionKey)}
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </div>

          <div>
            <span style={{ marginRight: "10px" }}>Mode:</span>
            <Dropdown
              menu={{
                items: Object.keys(NotesUtils.modes).map((mode) => ({
                  key: mode,
                  label: mode,
                })),
                onClick: ({ key }) => {
                  setProgressionMode(key);
                },
              }}
              trigger={["click"]}
              placement="topLeft"
            >
              <Button>
                <Space>
                  {progressionMode}
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </div>
        </div>
      </div>

      <NotesArray
        squareSidePx={squareSidePx * 2}
        size={chords.length + 1} // +1 for add button
        marginPx={squareSidePx}
      >
        {chords.map((chord, index) => (
          <NoteCell
            key={index}
            squareSidePx={squareSidePx * 2}
            overflow="visible"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
              padding: "10px",
              boxSizing: "border-box",
            }}
          >
            <div style={{ position: "absolute", top: "5px", right: "5px" }}>
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => removeChord(index)}
              />
            </div>

            <div style={{ fontWeight: "bold", fontSize: "18px" }}>
              {getFormattedRomanNumeral(chord.degree, progressionMode)}
              {chord.extensions && chord.extensions.length > 0 && (
                <span style={{ fontSize: "14px" }}>
                  {chord.extensions.join(",")}
                </span>
              )}
            </div>

            <Select
              style={{ width: "80px" }}
              value={chord.degree}
              onChange={(value) => updateChord(index, "degree", value)}
            >
              {romanNumerals.map((numeral, i) => (
                <Select.Option key={i} value={i + 1}>
                  {getFormattedRomanNumeral(i + 1, progressionMode)}
                </Select.Option>
              ))}
            </Select>

            <Select
              mode="multiple"
              placeholder="Extensions"
              style={{ width: "120px" }}
              value={chord.extensions || []}
              onChange={(value) => updateChord(index, "extensions", value)}
              maxCount={3}
              options={extensionOptions}
            />

            <Button
              type="text"
              icon={<PlayCircleOutlined />}
              onClick={() => handlePlayChord(chord)}
            />
          </NoteCell>
        ))}

        <NoteCell
          squareSidePx={squareSidePx * 2}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Tooltip title="Add chord">
            <Button
              type="dashed"
              shape="circle"
              icon={<PlusOutlined />}
              onClick={addChord}
              style={{ marginBottom: "10px" }}
            />
          </Tooltip>

          <Tooltip title="Play progression">
            <Button
              type="primary"
              shape="circle"
              icon={<PlayCircleOutlined />}
              onClick={playProgression}
              size="large"
            />
          </Tooltip>
        </NoteCell>
      </NotesArray>
    </div>
  );
};

export default ChordProgressionBuilder;
