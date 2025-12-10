import React, { useCallback, useMemo } from "react";
import ReactDiffViewer from "react-diff-viewer-continued";
import NoteCell from "./NoteCell";

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

const stripOctave = (note) => (note ? note.replace(/[0-9]/g, "") : "");

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
  const displayNote = useMemo(() => stripOctave(noteString), [noteString]);
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
      <ModeNoteDiff oldValue={displayNote} newValue={newValue} />
    </NoteCell>
  );
});

export default ModeNoteCell;
