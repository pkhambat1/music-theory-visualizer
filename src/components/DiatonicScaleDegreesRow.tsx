import { useState } from "react";
import type { ChordType, Extension, ExtensionOption, NoteIndex, NoteName } from "../types";
import NoteCell from "./NoteCell";
import NotesArray from "./NotesArray";
import { playChord } from "../lib/audio";
import { getChordDescriptor, getChordNotes, getChordNotesInChromaticScale, applyExtensions } from "../lib/music/chords";
import { leftTrimOverflowNotes } from "../lib/music/scale";
import { IONIAN } from "../lib/music/modes";
import Popover from "./ui/Popover";
import MultiSelect from "./ui/MultiSelect";
import Button from "./ui/Button";

export interface ChordHoverData {
  original: NoteIndex[];
  modified: NoteIndex[];
}

export interface DiatonicScaleDegreesRowProps {
  squareSide: number;
  modeNotesWithOverflow: NoteIndex[];
  setHoveredChordIndex: (idx: number | null) => void;
  setChordNotes: (notes: (NoteIndex | null)[]) => void;
  notes: NoteName[];
  chordType?: ChordType;
  selectedExtensions: Extension[][];
  extensionOptions?: ExtensionOption[];
  onExtensionChange?: (degreeIdx: number, value: string[]) => void;
  setMajorScaleNotes: (notes: (string | undefined)[]) => void;
  modeLeftOverflowSize: number;
  modeLength?: number;
  dataRow?: string;
  onChordHoverChange?: (data: ChordHoverData) => void;
  caption?: string;
}

export default function DiatonicScaleDegreesRow({
  squareSide,
  modeNotesWithOverflow,
  setHoveredChordIndex,
  setChordNotes,
  notes,
  chordType = "triads",
  selectedExtensions,
  extensionOptions = [],
  onExtensionChange,
  setMajorScaleNotes,
  modeLeftOverflowSize,
  modeLength = 0,
  dataRow = "diatonic-row",
  onChordHoverChange,
  caption,
}: DiatonicScaleDegreesRowProps) {
  const romanBase = ["I", "II", "III", "IV", "V", "VI", "VII"];
  const degreeCount = modeLength > 0 ? modeLength : romanBase.length + 1;
  const chordNumerals = Array.from({ length: degreeCount }, (_, idx) =>
    idx === degreeCount - 1 ? "I" : (romanBase[idx] ?? "I"),
  );
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const modeNotes = leftTrimOverflowNotes(
    modeNotesWithOverflow,
    modeLeftOverflowSize,
  );

  const emitHover = (
    chordNumeralIdx: number,
    originalNotes: NoteIndex[],
    modifiedNotes: NoteIndex[],
  ) => {
    setHoveredChordIndex(chordNumeralIdx);
    setChordNotes(getChordNotesInChromaticScale(modifiedNotes));
    const chordRoot = modifiedNotes[0]!;
    const majorScaleNotes = IONIAN.map(
      (inter) => notes[inter + chordRoot],
    );
    setMajorScaleNotes(majorScaleNotes);
    onChordHoverChange?.({ original: originalNotes, modified: modifiedNotes });
  };

  const clearHover = () => {
    setHoveredChordIndex(null);
    setChordNotes([]);
    setMajorScaleNotes([...Array(IONIAN.length)]);
    onChordHoverChange?.({ original: [], modified: [] });
  };

  return (
    <NotesArray
      size={chordNumerals.length}
      squareSidePx={squareSide}
      caption={caption}
    >
      {chordNumerals.map((chordNumeral, chordNumeralIdx) => {
        const originalNotes = getChordNotes(
          modeNotes,
          chordNumeralIdx,
          chordType,
        );
        const chordNotesArr = applyExtensions(
          originalNotes,
          (selectedExtensions[chordNumeralIdx] ?? []) as Extension[],
        );
        const chordDescriptor = getChordDescriptor(chordNotesArr);
        const activeExtensions = selectedExtensions[chordNumeralIdx] ?? [];

        return (
          <div
            key={chordNumeralIdx}
            style={{
              position: "relative",
              width: `${squareSide}px`,
              height: `${squareSide}px`,
              overflow: "visible",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <NoteCell
              idx={chordNumeralIdx}
              squareSidePx={squareSide}
              dataRow={dataRow}
              dataIdx={chordNumeralIdx}
              className="group cursor-pointer hover:bg-white/[0.08] transition-colors"
              onMouseEnter={() =>
                emitHover(chordNumeralIdx, originalNotes, chordNotesArr)
              }
              onMouseLeave={() => clearHover()}
              onClick={() => {
                playChord(chordNotesArr.map((idx) => notes[idx]!));
              }}
            >
              <span
                className={
                  activeExtensions.length > 0 ? "-translate-y-1" : ""
                }
              >
                {chordNumeral}
                {chordDescriptor}
              </span>

              {/* Extension pills */}
              {activeExtensions.length > 0 && (
                <div className="absolute bottom-0.5 inset-x-0 flex flex-wrap justify-center gap-[2px] px-0.5">
                  {activeExtensions.map((ext) => (
                    <span
                      key={ext}
                      className="rounded bg-cyan-400/15 px-[3px] text-[7px] font-medium text-cyan-300 leading-[12px]"
                    >
                      {ext}
                    </span>
                  ))}
                </div>
              )}

              <div
                className="absolute right-1 bottom-1 z-10 opacity-0 transition-opacity pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  clearHover();
                }}
                onMouseLeave={(e) => {
                  e.stopPropagation();
                  const related = e.relatedTarget as Element | null;
                  if (related?.closest?.("[data-popover-panel]")) return;
                  emitHover(chordNumeralIdx, originalNotes, chordNotesArr);
                }}
              >
                <Popover
                  open={openIdx === chordNumeralIdx}
                  onOpenChange={(nextOpen) =>
                    setOpenIdx(nextOpen ? chordNumeralIdx : null)
                  }
                  position="top"
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-full border border-white/[0.15] bg-white/[0.06] p-0 text-slate-400 hover:bg-white/[0.12] hover:text-slate-200 shadow-sm"
                      aria-label="Add extensions"
                    >
                      <span className="text-[10px] font-bold leading-none">
                        +
                      </span>
                    </Button>
                  }
                >
                  <div
                    data-popover-panel
                    className="min-w-[180px] space-y-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MultiSelect
                      options={extensionOptions.map((o) => ({
                        value: o.value,
                        label: o.label,
                      }))}
                      value={selectedExtensions[chordNumeralIdx] ?? []}
                      onChange={(value) =>
                        onExtensionChange?.(chordNumeralIdx, value)
                      }
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
}
