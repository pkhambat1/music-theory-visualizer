import { useMemo, useState } from "react"
import type { Extension, ExtensionOption, ModeDataProps, NoteIndex } from "../types"
import type { Note } from "../lib/note"
import NoteCell from "./NoteCell"
import NotesArray from "./NotesArray"
import { playChord, arpeggiateChord } from "../lib/audio"
import { getChordDescriptor, getChordNotes, applyExtensions, getDisabledExtensions, buildSlashChordVoicing } from "../lib/music/chords"
import { leftTrimOverflowNotes } from "../lib/music/scale"
import Popover from "./ui/Popover"
import MultiSelect from "./ui/MultiSelect"
import Button from "./ui/Button"
import { DEGREE_COLORS } from "../lib/colors"
import { SQUARE_SIDE } from "../lib/music/scale"

export type ChordHoverData = {
  original: NoteIndex[];
  modified: NoteIndex[];
}

export type DiatonicScaleDegreesRowProps = ModeDataProps & {
  setHoveredChordIndex: (idx: number | null) => void;
  notes: Note[];
  selectedExtensions: Extension[][];
  extensionOptions?: ExtensionOption[];
  onExtensionChange?: (degreeIdx: number, value: string[]) => void;
  slashBasses?: (number | null)[];
  onSlashBassChange?: (degreeIdx: number, bassDegree: number | null) => void;
  modeLength?: number;
  onChordHoverChange?: (data: ChordHoverData) => void;
  captionRight?: React.ReactNode;
  arpeggiate?: boolean;
  hoveredIndex?: number | null;
}

// ─── Constants ──────────────────────────────────────────────────────

const DATA_ROW = "diatonic-row"
const HOVER_COLOR = "#000000"
const CAPTION = "Diatonic Chords"
const CAPTION_SUBTITLE = "Chords built from the mode"

// ─── Component ──────────────────────────────────────────────────────

export default function DiatonicScaleDegreesRow({
  modeNotesWithOverflow,
  setHoveredChordIndex,
  notes,
  selectedExtensions,
  extensionOptions = [],
  onExtensionChange,
  slashBasses = [],
  onSlashBassChange,
  modeLeftOverflowSize,
  modeLength = 0,
  onChordHoverChange,
  captionRight,
  arpeggiate = false,
  hoveredIndex = null,
}: DiatonicScaleDegreesRowProps) {
  const romanBase = ["I", "II", "III", "IV", "V", "VI", "VII"]
  const degreeCount = modeLength > 0 ? modeLength : romanBase.length + 1
  const chordNumerals = Array.from({ length: degreeCount }, (_, idx) =>
    idx === degreeCount - 1 ? "I" : (romanBase[idx] ?? "I"),
  )
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  const modeNotes = useMemo(
    () => leftTrimOverflowNotes(modeNotesWithOverflow, modeLeftOverflowSize),
    [modeNotesWithOverflow, modeLeftOverflowSize],
  )

  const chordData = useMemo(
    () =>
      chordNumerals.map((_, chordNumeralIdx) => {
        const originalNotes = getChordNotes(modeNotes, chordNumeralIdx)
        const activeExtensions = selectedExtensions[chordNumeralIdx] ?? []
        const chordNotesArr = applyExtensions(originalNotes, activeExtensions)
        const chordDescriptor = getChordDescriptor(chordNotesArr)
        const slashBass = slashBasses[chordNumeralIdx] ?? null
        return { originalNotes, chordNotesArr, chordDescriptor, activeExtensions, slashBass }
      }),
    [chordNumerals, modeNotes, selectedExtensions, slashBasses],
  )

  const emitHover = (
    chordNumeralIdx: number,
    originalNotes: NoteIndex[],
    modifiedNotes: NoteIndex[],
  ) => {
    setHoveredChordIndex(chordNumeralIdx)
    onChordHoverChange?.({ original: originalNotes, modified: modifiedNotes })
  }

  const clearHover = () => {
    setHoveredChordIndex(null)
    onChordHoverChange?.({ original: [], modified: [] })
  }

  return (
    <NotesArray
      size={chordNumerals.length}
      caption={CAPTION}
      captionSubtitle={CAPTION_SUBTITLE}
      captionRight={captionRight}
      zIndex={openIdx !== null ? 4 : undefined}
    >
      {chordNumerals.map((chordNumeral, chordNumeralIdx) => {
        const { originalNotes, chordNotesArr, chordDescriptor, activeExtensions, slashBass } = chordData[chordNumeralIdx]!
        const degreeBg = DEGREE_COLORS[chordNumeralIdx % DEGREE_COLORS.length]!
        return (
          <div
            key={chordNumeralIdx}
            className="relative"
            style={{
              width: `${SQUARE_SIDE}px`,
              height: `${SQUARE_SIDE}px`,
              overflow: "visible",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <NoteCell
              idx={chordNumeralIdx}
              dataRow={DATA_ROW}
              dataIdx={chordNumeralIdx}
              optBackground={degreeBg}
              className="group cursor-pointer hover:bg-black/[0.08] transition-colors"
              style={
                hoveredIndex === chordNumeralIdx
                  ? { border: `2px solid ${HOVER_COLOR}` }
                  : { border: "2px solid transparent" }
              }
              onMouseEnter={() =>
                emitHover(chordNumeralIdx, originalNotes, chordNotesArr)
              }
              onMouseLeave={() => clearHover()}
              onClick={() => {
                const voicing = slashBass !== null
                  ? buildSlashChordVoicing(chordNotesArr, modeNotes, chordNumeralIdx, slashBass)
                  : chordNotesArr
                const chordNotes = voicing.map((idx) => notes[idx]!)
                if (arpeggiate) {
                  arpeggiateChord(chordNotes)
                } else {
                  playChord(chordNotes)
                }
              }}
            >
              <span
                className={activeExtensions.length > 0 || slashBass !== null ? "-translate-y-1" : ""}
                style={{ color: "#000000" }}
              >
                {chordNumeral}
                {chordDescriptor}
                {slashBass !== null && (
                  <span className="text-[9px]">/{romanBase[slashBass] ?? ""}</span>
                )}
              </span>

              {/* Extension pills */}
              {(activeExtensions.length > 0 || slashBass !== null) && (
                <div className="absolute bottom-0.5 inset-x-0 flex flex-wrap justify-center gap-[2px] px-0.5">
                  {activeExtensions.map((ext) => (
                    <span
                      key={ext}
                      className="rounded bg-[var(--d3-primaryFill)] px-1 text-[9px] font-medium text-[var(--d3-primary)] leading-[14px]"
                    >
                      {ext}
                    </span>
                  ))}
                  {slashBass !== null && (
                    <span className="rounded bg-gray-200 px-1 text-[9px] font-medium text-gray-600 leading-[14px]">
                      /{romanBase[slashBass]}
                    </span>
                  )}
                </div>
              )}

              <div
                className="absolute right-1 bottom-1 z-10 opacity-30 transition-opacity pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={(e) => {
                  e.stopPropagation()
                  clearHover()
                }}
                onMouseLeave={(e) => {
                  e.stopPropagation()
                  const related = e.relatedTarget as Element | null
                  if (related?.closest?.("[data-popover-panel]")) return
                  emitHover(chordNumeralIdx, originalNotes, chordNotesArr)
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
                      className="h-5 w-5 rounded-full border border-[var(--d3-border)] bg-gray-50 p-0 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
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
                    className="min-w-[180px] space-y-3"
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
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Bass Note</span>
                        {slashBass !== null && (
                          <button
                            className="rounded-lg px-2 py-1 text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => onSlashBassChange?.(chordNumeralIdx, null)}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {romanBase.map((numeral, degIdx) => {
                          const isOwn = degIdx === chordNumeralIdx
                          const isSelected = slashBass === degIdx
                          return (
                            <button
                              key={degIdx}
                              disabled={isOwn}
                              className={`flex-1 rounded px-1 py-1 text-[10px] font-medium transition-colors ${
                                isOwn
                                  ? "text-gray-300 cursor-not-allowed"
                                  : isSelected
                                  ? "bg-[var(--d3-primaryFill)] text-[var(--d3-primary)]"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                              onClick={() =>
                                onSlashBassChange?.(
                                  chordNumeralIdx,
                                  isSelected ? null : degIdx,
                                )
                              }
                            >
                              {numeral}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </Popover>
              </div>
            </NoteCell>

          </div>
        )
      })}
    </NotesArray>
  )
}
