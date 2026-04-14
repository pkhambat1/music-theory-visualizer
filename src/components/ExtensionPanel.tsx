import type { Extension } from "../lib/music"
import { EXTENSION_ORDER, getDisabledExtensions, ROMAN_NUMERALS } from "../lib/music"
import { MultiSelect } from "./ui"

const EXTENSION_OPTIONS = EXTENSION_ORDER.map((e) => ({ value: e }))

export type ExtensionPanelProps = {
  chordNumeralIdx: number,
  selectedExtensions: Extension[],
  activeExtensions: Extension[],
  slashBass: number | null,
  onExtensionChange?: (degreeIdx: number, value: Extension[]) => void,
  onSlashBassChange?: (degreeIdx: number, bassDegree: number | null) => void,
}

export default function ExtensionPanel({
  chordNumeralIdx,
  selectedExtensions,
  activeExtensions,
  slashBass,
  onExtensionChange,
  onSlashBassChange,
}: ExtensionPanelProps) {
  return (
    <div
      data-popover-panel
      className="min-w-[180px] space-y-3"
      onClick={(e) => e.stopPropagation()}
    >
      <MultiSelect
        header="Extensions"
        options={EXTENSION_OPTIONS}
        value={selectedExtensions}
        onChange={(value) => onExtensionChange?.(chordNumeralIdx, value)}
        placeholder="Select"
        disabledValues={getDisabledExtensions(activeExtensions)}
      />
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-black">
            Bass Note
          </span>
          {slashBass !== null && (
            <button
              className="rounded-lg px-2 py-1 text-xs text-black hover:bg-gray-100"
              onClick={() => onSlashBassChange?.(chordNumeralIdx, null)}
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex gap-1">
          {ROMAN_NUMERALS.map((numeral, degIdx) => {
            const isOwn = degIdx === chordNumeralIdx
            const isSelected = slashBass === degIdx
            return (
              <button
                key={degIdx}
                disabled={isOwn}
                className={`flex-1 rounded px-1 py-1 text-[10px] font-medium ${
                  isOwn
                    ? "text-gray-300 cursor-not-allowed"
                    : isSelected
                    ? "bg-[var(--app-primaryFill)] text-[var(--app-primary)]"
                    : "text-black hover:bg-gray-100"
                }`}
                onClick={() =>
                  onSlashBassChange?.(chordNumeralIdx, isSelected ? null : degIdx)
                }
              >
                {numeral}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
