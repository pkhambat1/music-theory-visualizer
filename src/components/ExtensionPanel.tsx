import type { Extension, ExtensionOption } from "../lib/music"
import { getDisabledExtensions } from "../lib/music"
import { MultiSelect } from "./ui"

const ROMAN_BASE = ["I", "II", "III", "IV", "V", "VI", "VII"]

export type ExtensionPanelProps = {
  chordNumeralIdx: number,
  extensionOptions: ExtensionOption[],
  selectedExtensions: Extension[],
  activeExtensions: Extension[],
  slashBass: number | null,
  onExtensionChange?: (degreeIdx: number, value: string[]) => void,
  onSlashBassChange?: (degreeIdx: number, bassDegree: number | null) => void,
}

export default function ExtensionPanel({
  chordNumeralIdx,
  extensionOptions,
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
        options={extensionOptions}
        value={selectedExtensions}
        onChange={(value) => onExtensionChange?.(chordNumeralIdx, value)}
        placeholder="Select"
        disabledValues={getDisabledExtensions(activeExtensions)}
      />
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--app-textTertiary)]">
            Bass Note
          </span>
          {slashBass !== null && (
            <button
              className="rounded-lg px-2 py-1 text-xs text-[var(--app-textMuted)] hover:text-[var(--app-textSecondary)] hover:bg-[var(--app-surfaceHover)] transition-colors"
              onClick={() => onSlashBassChange?.(chordNumeralIdx, null)}
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex gap-1">
          {ROMAN_BASE.map((numeral, degIdx) => {
            const isOwn = degIdx === chordNumeralIdx
            const isSelected = slashBass === degIdx
            return (
              <button
                key={degIdx}
                disabled={isOwn}
                className={`flex-1 rounded px-1 py-1 text-[10px] font-medium transition-colors ${
                  isOwn
                    ? "text-[var(--app-textDisabled)] cursor-not-allowed"
                    : isSelected
                    ? "bg-[var(--app-primaryFill)] text-[var(--app-primary)]"
                    : "text-[var(--app-textSecondary)] hover:bg-[var(--app-surfaceHover)]"
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
