import NotesUtils from "../../utils/NotesUtils";

// Base chromatic layout values used to size sliders/rows
export const baseScaleLeftOverflow = 5;
export const baseScaleWithOverflowSize =
  NotesUtils.chromaticScale.length + 2 * baseScaleLeftOverflow;
export const baseScaleLeftOverflowSize =
  (baseScaleWithOverflowSize - NotesUtils.chromaticScale.length) / 2;
export const borderPx = 1.5;

export const getLineBorder = (borderWidth) => `${borderWidth}px solid #333`;

export const addOverflowToModeIntervals = (modeIntervals) => [
  ...[2, 3, 4, 5, 6].map(
    (idx) => modeIntervals[idx] - (NotesUtils.chromaticScale.length - 1)
  ),
  ...modeIntervals,
  ...[1, 2, 3, 4, 5].map(
    (idx) => modeIntervals[idx] + NotesUtils.chromaticScale.length - 1
  ),
];

export const getModeLeftOverflowSize = (modeIntervals) =>
  (addOverflowToModeIntervals(modeIntervals).length - modeIntervals.length) / 2;

export const modeIntervalsToMode = (rootNote, intervals, notes) => {
  const rootIndex = notes.indexOf(rootNote);
  if (rootIndex < 0) return [];
  return intervals.map((interval) => interval + rootIndex);
};

export const buildModeNotesWithOverflow = (rootNote, modeIntervals, notes) => {
  const withOverflow = addOverflowToModeIntervals(modeIntervals);
  return modeIntervalsToMode(rootNote, withOverflow, notes);
};
