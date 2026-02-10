import { useMemo, useState } from "react";
import type { ChordType, Extension, ExtensionOption, NoteIndex, NoteName } from "../types";
import NoteCell from "./NoteCell";
import NotesArray from "./NotesArray";
import { playChord, arpeggiateChord } from "../lib/audio";
import { getChordDescriptor, getChordNotes, applyExtensions, getDisabledExtensions } from "../lib/music/chords";
import { leftTrimOverflowNotes } from "../lib/music/scale";
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
  notes: NoteName[];
  chordType?: ChordType;
  selectedExtensions: Extension[][];
  extensionOptions?: ExtensionOption[];
  onExtensionChange?: (degreeIdx: number, value: string[]) => void;
  modeLeftOverflowSize: number;
  modeLength?: number;
  dataRow?: string;
  onChordHoverChange?: (data: ChordHoverData) => void;
  caption?: string;
  captionSubtitle?: string;
  captionRight?: React.ReactNode;
  arpeggiate?: boolean;
}

// ─── Component ──────────────────────────────────────────────────────

export default function DiatonicScaleDegreesRow({
  squareSide,
  modeNotesWithOverflow,
  setHoveredChordIndex,
  notes,
  chordType = "triads",
  selectedExtensions,
  extensionOptions = [],
  onExtensionChange,
  modeLeftOverflowSize,
  modeLength = 0,
  dataRow = "diatonic-row",
  onChordHoverChange,
  caption,
  captionSubtitle,
  captionRight,
  arpeggiate = false,
}: DiatonicScaleDegreesRowProps) {
  const romanBase = ["I", "II", "III", "IV", "V", "VI", "VII"];
  const degreeCount = modeLength > 0 ? modeLength : romanBase.length + 1;
  const chordNumerals = Array.from({ length: degreeCount }, (_, idx) =>
    idx === degreeCount - 1 ? "I" : (romanBase[idx] ?? "I"),
  );
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const modeNotes = useMemo(
    () => leftTrimOverflowNotes(modeNotesWithOverflow, modeLeftOverflowSize),
    [modeNotesWithOverflow, modeLeftOverflowSize],
  );

  const chordData = useMemo(
    () =>
      chordNumerals.map((_, chordNumeralIdx) => {
        const originalNotes = getChordNotes(modeNotes, chordNumeralIdx, chordType);
        const activeExtensions = selectedExtensions[chordNumeralIdx] ?? [];
        const chordNotesArr = applyExtensions(originalNotes, activeExtensions as Extension[]);
        const chordDescriptor = getChordDescriptor(chordNotesArr);
        return { originalNotes, chordNotesArr, chordDescriptor, activeExtensions };
      }),
    [chordNumerals, modeNotes, chordType, selectedExtensions],
  );

  const emitHover = (
    chordNumeralIdx: number,
    originalNotes: NoteIndex[],
    modifiedNotes: NoteIndex[],
  ) => {
    setHoveredChordIndex(chordNumeralIdx);
    onChordHoverChange?.({ original: originalNotes, modified: modifiedNotes });
  };

  const clearHover = () => {
    setHoveredChordIndex(null);
    onChordHoverChange?.({ original: [], modified: [] });
  };

  return (
    <NotesArray
      size={chordNumerals.length}
      squareSidePx={squareSide}
      caption={caption}
      captionSubtitle={captionSubtitle}
      captionRight={captionRight}
    >
      {chordNumerals.map((chordNumeral, chordNumeralIdx) => {
        const { originalNotes, chordNotesArr, chordDescriptor, activeExtensions } = chordData[chordNumeralIdx]!;
        return (
          <div
            key={chordNumeralIdx}
            className="relative"
            style={{
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
                const noteNames = chordNotesArr.map((idx) => notes[idx]!);
                arpeggiate ? arpeggiateChord(noteNames) : playChord(noteNames);
              }}
            >
              <span
                className={`text-slate-200 ${
                  activeExtensions.length > 0 ? "-translate-y-1" : ""
                }`}
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
                      className="rounded bg-cyan-400/15 px-1 text-[9px] font-medium text-cyan-300 leading-[14px]"
                    >
                      {ext}
                    </span>
                  ))}
                </div>
              )}

              <div
                className="absolute right-1 bottom-1 z-10 opacity-30 transition-opacity pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
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
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                        <circle cx="3" cy="8" r="1.5" />
                        <circle cx="8" cy="8" r="1.5" />
                        <circle cx="13" cy="8" r="1.5" />
                      </svg>
                    </Button>
                  }
                >
                  <div
                    data-popover-panel
                    className="min-w-[180px] space-y-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MultiSelect
                      header="Extensions"
                      options={extensionOptions.map((o) => ({
                        value: o.value,
                        label: o.label,
                      }))}
                      value={selectedExtensions[chordNumeralIdx] ?? []}
                      onChange={(value) =>
                        onExtensionChange?.(chordNumeralIdx, value)
                      }
                      disabledValues={getDisabledExtensions(activeExtensions)}
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
