import React, { useState } from "react";
import NoteCell from "./NoteCell";
import NotesArray from "./NotesArray";
import { playChord } from "../utils/helpers";
import NotesUtils from "../utils/NotesUtils";
import Popover from "./ui/Popover";
import MultiSelect from "./ui/MultiSelect";
import Button from "./ui/Button";

const DiatonicScaleDegreesRow = ({
  SQUARE_SIDE,
  modeNotesWithOverflow,
  setHoveredChordIndex,
  setChordNotes,
  notes,
  chordType = "triads", // 'triads' or 'seventhChords'
  selectedExtensions,
  extensionOptions = [],
  onExtensionChange = () => {},
  setMajorScaleNotes,
  modeLeftOverflowSize,
  dataRow = "diatonic-row",
}) => {
  const chordNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "I"];
  const [openIdx, setOpenIdx] = useState(null);

  const getChordDescriptor = (chordAbsoluteIndices) => {
    return NotesUtils.getChordDescriptor(chordAbsoluteIndices);
  };

  const modeNotes = NotesUtils.leftTrimOverflowNotes(
    modeNotesWithOverflow,
    modeLeftOverflowSize
  );

  return (
    <NotesArray
      size={chordNumerals.length}
      squareSidePx={SQUARE_SIDE}
      marginPx={SQUARE_SIDE / 2}
    >
      {chordNumerals.map((chordNumeral, chordNumeralIdx) => {
        // The (modified or unmodified) 1, 3 and 5 for the chord
        const chordNotes = NotesUtils.applyExtensionsToChordNotes(
          NotesUtils.getChordNotes(modeNotes, chordNumeralIdx, chordType),
          selectedExtensions[chordNumeralIdx]
        );

        const chordDescriptor = getChordDescriptor(chordNotes);
        return (
          <div
            key={chordNumeralIdx}
            style={{
              position: "relative",
              width: `${SQUARE_SIDE}px`,
              height: `${SQUARE_SIDE}px`,
              overflow: "visible", // allow the plus/popup to render below
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <NoteCell
              idx={chordNumeralIdx}
              squareSidePx={SQUARE_SIDE}
              dataRow={dataRow}
              dataIdx={chordNumeralIdx}
              onMouseEnter={() => {
                setHoveredChordIndex(chordNumeralIdx);
                const chordNotesInChromaticScale =
                  NotesUtils.getChordNotesInChromaticScale(chordNotes);

                setChordNotes(chordNotesInChromaticScale);
                const chordRoot = chordNotes[0];

                const majorScaleNotes = NotesUtils.modes["Ionian (major)"].map(
                  (inter) => notes[inter + chordRoot]
                );

                setMajorScaleNotes(majorScaleNotes);
              }}
              onMouseLeave={() => {
                setHoveredChordIndex(null);
                setChordNotes([]);
                setMajorScaleNotes([
                  ...Array(NotesUtils.modes["Ionian (major)"].length),
                ]);
              }}
              onClick={() => {
                playChord(chordNotes.map((idx) => notes[idx]));
              }}
            >
              <span>
                {chordNumeral}
                {chordDescriptor}
              </span>
              <div
                className="absolute right-1 bottom-1 z-10"
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  setHoveredChordIndex(null);
                  setChordNotes([]);
                  setMajorScaleNotes([
                    ...Array(NotesUtils.modes["Ionian (major)"].length),
                  ]);
                }}
                onMouseLeave={(e) => {
                  e.stopPropagation();
                  const goingToPopover =
                    e.relatedTarget &&
                    e.relatedTarget.closest &&
                    e.relatedTarget.closest("[data-popover-panel]");
                  if (goingToPopover) return;

                  // Restore hover state when coming back to the cell
                  setHoveredChordIndex(chordNumeralIdx);
                  const chordNotesInChromaticScale =
                    NotesUtils.getChordNotesInChromaticScale(chordNotes);
                  setChordNotes(chordNotesInChromaticScale);
                  const chordRoot = chordNotes[0];
                  const majorScaleNotes = NotesUtils.modes["Ionian (major)"].map(
                    (inter) => notes[inter + chordRoot]
                  );
                  setMajorScaleNotes(majorScaleNotes);
                }}
              >
                <Popover
                  open={openIdx === chordNumeralIdx}
                  onOpenChange={(nextOpen) =>
                    setOpenIdx(nextOpen ? chordNumeralIdx : null)
                  }
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full border border-slate-200 bg-white/80 p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900 shadow-sm focus:ring-0 focus:ring-offset-0 focus-visible:ring-0"
                      aria-label="Add extensions"
                    >
                      <span className="text-xs font-bold leading-none">+</span>
                    </Button>
                  }
                >
                  <div
                    data-popover-panel
                    className="min-w-[180px] space-y-2 rounded-md border border-slate-200 bg-white p-2 shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MultiSelect
                      options={extensionOptions}
                      value={selectedExtensions[chordNumeralIdx]}
                      onChange={(value) => onExtensionChange(chordNumeralIdx, value)}
                    />
                  </div>
                </Popover>
              </div>
            </NoteCell>
          </div>
        );
      })}
    </NotesArray>
  );
};

export default DiatonicScaleDegreesRow;
