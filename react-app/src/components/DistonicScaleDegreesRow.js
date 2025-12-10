import React, { useState } from "react";
import { Select, Popover, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import NoteCell from "./NoteCell";
import NotesArray from "./NotesArray";
import { playChord } from "../utils/helpers";
import NotesUtils from "../utils/NotesUtils";

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
                style={{
                  position: "absolute",
                  right: 4,
                  bottom: 2,
                  zIndex: 10,
                }}
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
                    e.relatedTarget.closest(".ant-popover");
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
                  trigger="click"
                  placement="bottom"
                  open={openIdx === chordNumeralIdx}
                  getPopupContainer={(triggerNode) => triggerNode.parentElement}
                  onOpenChange={(nextOpen) =>
                    setOpenIdx(nextOpen ? chordNumeralIdx : null)
                  }
                  content={
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{ padding: 8 }}
                    >
                      <Select
                        mode="multiple"
                        allowClear
                        size="small"
                        placeholder="Extensions"
                        options={extensionOptions}
                        value={selectedExtensions[chordNumeralIdx]}
                        style={{ minWidth: 180 }}
                        onChange={(value) =>
                          onExtensionChange(chordNumeralIdx, value)
                        }
                        maxCount={3}
                        popupMatchSelectWidth={220}
                      />
                    </div>
                  }
                >
                  <Button
                    type="default"
                    shape="circle"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      boxShadow: "0 0 0 1px #d9d9d9",
                      background: "transparent",
                      color: "#8c8c8c",
                      width: 16,
                      height: 16,
                      minWidth: 16,
                      padding: 0,
                    }}
                    aria-label="Add extensions"
                  />
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
