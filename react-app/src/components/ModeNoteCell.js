import React, { useCallback, useMemo } from "react";
import ReactDiffViewer from "react-diff-viewer-continued";
import NoteCell from "./NoteCell";
import { renderNote } from "../utils/helpers";

const getCOctave = (note) => {
  if (!note) return null;
  if (!/\d$/.test(note)) return null;
  const base = note.slice(0, -1);
  return base === "C" ? note.slice(-1) : null;
};

const formatNoteForDiff = (note, cOctave = null) => {
  if (!note) return "";
  const hasOctave = /\d$/.test(note);
  if (hasOctave) {
    const base = note.slice(0, -1);
    return base === "C" ? note : base;
  }
  if (cOctave && note[0]?.toUpperCase() === "C") {
    return `${note}${cOctave}`;
  }
  return note;
};

const diffWrapperStyle = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const diffStyles = {
  variables: {
    diffViewerBackground: "transparent",
    addedBackground: "transparent",
    removedBackground: "transparent",
    addedColor: "#52c41a",
    removedColor: "#d4380d",
  },
  diffContainer: {
    background: "transparent",
    display: "inline-flex",
    justifyContent: "center",
    width: "auto",
  },
  splitView: { background: "transparent" },
  marker: { display: "none" },
  line: {
    padding: 0,
    display: "inline-flex",
    justifyContent: "center",
    background: "transparent",
  },
  content: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  gutter: { display: "none" },
  contentText: {
    display: "inline",
    fontSize: 14,
    lineHeight: "18px",
    whiteSpace: "pre",
    textAlign: "center",
    fontFamily: "inherit",
  },
  lineNumber: { display: "none" },
  wordRemoved: {
    textDecoration: "line-through",
  },
};

const ModeNoteDiff = React.memo(function ModeNoteDiff({ oldValue, newValue }) {
  const diffContent = useMemo(
    () => (
      <ReactDiffViewer
        oldValue={oldValue || ""}
        newValue={newValue || ""}
        splitView={false}
        showDiffOnly={false}
        hideLineNumbers
        styles={diffStyles}
      />
    ),
    [oldValue, newValue]
  );

  return <div style={diffWrapperStyle}>{diffContent}</div>;
});

const ModeNoteCell = React.memo(function ModeNoteCell({
  squareSidePx,
  idx,
  dataIdx,
  noteString,
  newValue,
  onPlay,
}) {
  const cOctave = useMemo(() => getCOctave(noteString || ""), [noteString]);
  const displayNote = useMemo(
    () => formatNoteForDiff(noteString || "", cOctave),
    [noteString, cOctave]
  );
  const displayNewValue = useMemo(
    () => formatNoteForDiff(newValue || "", cOctave),
    [newValue, cOctave]
  );
  const usePlainRender =
    displayNote === displayNewValue &&
    displayNote?.startsWith("C") &&
    /\d$/.test(displayNote);
  const handleClick = useCallback(() => {
    if (noteString) onPlay(noteString);
  }, [noteString, onPlay]);

  return (
    <NoteCell
      squareSidePx={squareSidePx}
      idx={idx}
      key={idx}
      dataRow="mode-row"
      dataIdx={dataIdx}
      show_border={false}
      onClick={handleClick}
    >
      {usePlainRender ? (
        renderNote(displayNote)
      ) : (
        <ModeNoteDiff oldValue={displayNote} newValue={displayNewValue} />
      )}
    </NoteCell>
  );
});

export default ModeNoteCell;
