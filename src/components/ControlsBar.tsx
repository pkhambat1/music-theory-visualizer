import { useState } from "react"
import type { Note } from "../models/Note"
import { renderNote } from "../lib/notes"
import { MODES, Mode } from "../lib/music/modes"
import Tag from "./ui/Tag"
import Dropdown from "./ui/Dropdown"

const MODE_ITEMS = MODES.map((mode) => ({
  key: mode.name,
  label: mode.name,
}))

export type ControlsBarProps = {
  rootNote: Note,
  selectedMode: Mode,
  arpeggiate: boolean,
  onModeChange: (mode: Mode) => void,
  onArpeggiateToggle: () => void,
}

export default function ControlsBar({
  rootNote,
  selectedMode,
  arpeggiate,
  onModeChange,
  onArpeggiateToggle,
}: ControlsBarProps) {
  const [showKeyHint, setShowKeyHint] = useState(false)

  return (
    <>
      <div className="flex flex-wrap items-center gap-5">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Key</span>
          <div
            className="relative cursor-pointer"
            onClick={() => {
              setShowKeyHint(true)
              setTimeout(() => setShowKeyHint(false), 2500)
            }}
          >
            <Tag>{renderNote(rootNote)}</Tag>
            {showKeyHint && (
              <div className="absolute left-0 top-full z-30 mt-2 whitespace-nowrap rounded-md bg-[var(--d3-grayText)] px-2.5 py-1.5 text-xs font-medium text-white">
                Drag the chromatic row to change key
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Mode</span>
          <Dropdown
            label={selectedMode.name}
            items={MODE_ITEMS}
            onSelect={(key) => {
              const mode = MODES.find((m) => m.name === key)
              if (mode) onModeChange(mode)
            }}
          />
        </div>
        <button
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors border ${
            arpeggiate
              ? "border-[var(--d3-primary)] bg-[var(--d3-primaryFill)] text-[var(--d3-primary)]"
              : "border-[var(--d3-border)] bg-white text-gray-500 hover:text-gray-700"
          }`}
          onClick={onArpeggiateToggle}
        >
          Arpeggiate
        </button>
      </div>
      {selectedMode.description && (
        <p className="text-sm text-gray-500">{selectedMode.description}</p>
      )}
    </>
  )
}
