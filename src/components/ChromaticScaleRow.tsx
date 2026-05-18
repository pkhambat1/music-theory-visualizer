import type { Interval } from "../lib/music"
import type { Note } from "../models"
import { CHROMATIC_SCALE } from "../lib/notes"
import { renderNote } from "./NoteLabel"
import { BASE_SCALE_LEFT_OVERFLOW, BASE_SCALE_WITH_OVERFLOW_SIZE, SQUARE_SIDE } from "../lib/music"
import { BLACK, colors, neonHoverCellOutline } from "../lib/theme"
import NotesArray from "./NotesArray"
import NoteCell from "./NoteCell"

const HIGHLIGHTED_CHROMATIC_STYLE = neonHoverCellOutline

export type ChromaticScaleRowProps = {
  sliderRef: (node: HTMLDivElement) => void,
  notes: Note[],
  modeIntervals: Interval[],
  highlightedBaseIdxs: Set<number>,
  highlightedBaseBackgrounds: Map<number, string> | null,
  onPlayNote: (note: Note) => void,
  onPrev: () => void,
  onNext: () => void,
}

export default function ChromaticScaleRow({
  sliderRef,
  notes,
  modeIntervals,
  highlightedBaseIdxs,
  highlightedBaseBackgrounds,
  onPlayNote,
  onPrev,
  onNext,
}: ChromaticScaleRowProps) {
  return (
    <NotesArray
      size={BASE_SCALE_WITH_OVERFLOW_SIZE}
      cellWidth={SQUARE_SIDE}
      clipContent
      zIndex={1}
      rowStrokeColor={BLACK}
      caption="Chromatic Scale"
      captionSubtitle="All notes in sequential order"
    >
      <div
        className="absolute z-10 flex"
        style={{
          translate: `${(BASE_SCALE_LEFT_OVERFLOW * 100) / CHROMATIC_SCALE.length}%`,
        }}
      >
        {(() => {
          return CHROMATIC_SCALE.map((_, idx) => {
            let background: string | null = null
            if (idx === 0) {
              background = colors.mutedDark
            } else if (modeIntervals.includes(idx)) {
              background = colors.border
            }
            const isInMode = modeIntervals.includes(idx)
            return (
              <NoteCell
                key={idx}
                dataRow="chromatic-row"
                dataIdx={idx}
                optBackground={background}
                style={
                  isInMode
                    ? { boxShadow: `inset 0 0 0 1px ${BLACK}, 0 0 0 1px ${BLACK}` }
                    : undefined
                }
              />
            )
          })
        })()}
      </div>

      <div
        ref={sliderRef}
        className="keen-slider relative z-20 flex h-full cursor-grab active:cursor-grabbing items-center"
      >
        {notes.map((note, idx) => (
          <NoteCell
            key={idx}
            idx={idx}
            dataRow="base-row"
            dataIdx={idx}
            className="keen-slider__slide cursor-pointer"
            optBackground={
              highlightedBaseIdxs.has(idx)
                ? (highlightedBaseBackgrounds?.get(idx) ?? null)
                : null
            }
            style={
              highlightedBaseIdxs.has(idx)
                ? HIGHLIGHTED_CHROMATIC_STYLE
                : undefined
            }
            onClick={() => onPlayNote(note)}
          >
            {renderNote(note)}
          </NoteCell>
        ))}
      </div>

      {/* Arrow buttons */}
      <button
        onClick={onPrev}
        className="absolute left-1 top-1/2 z-40 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-white hover:bg-gray-100 text-black border border-[var(--app-border)]"
        aria-label="Scroll left"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        onClick={onNext}
        className="absolute right-1 top-1/2 z-40 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-white hover:bg-gray-100 text-black border border-[var(--app-border)]"
        aria-label="Scroll right"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </NotesArray>
  )
}
