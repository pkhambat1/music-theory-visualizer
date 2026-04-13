import { useState } from "react"
import type { Note } from "../models"
import { renderNote } from "./NoteLabel"
import { MODES, Mode } from "../lib/music"
import { Tag, Dropdown } from "./ui"

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
          <span className="text-xs font-medium uppercase tracking-wider text-black">Key</span>
          <div
            className="relative cursor-pointer"
            onClick={() => {
              setShowKeyHint(true)
              setTimeout(() => setShowKeyHint(false), 2500)
            }}
          >
            <Tag>{renderNote(rootNote)}</Tag>
            {showKeyHint && (
              <div className="absolute left-0 top-full z-30 mt-2 whitespace-nowrap rounded-md bg-[var(--app-grayText)] px-2.5 py-1.5 text-xs font-medium text-white">
                Drag the chromatic row to change key
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium uppercase tracking-wider text-black">Mode</span>
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
          className="flex items-center gap-2 cursor-pointer"
          onClick={onArpeggiateToggle}
        >
          <span className="text-xs font-medium uppercase tracking-wider text-black">Arpeggiate</span>
          <div
            className={`relative h-5 w-9 rounded-full ${
              arpeggiate ? "bg-[var(--app-primary)]" : "bg-[var(--app-border)]"
            }`}
          >
            <div
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm ${
                arpeggiate ? "translate-x-[18px]" : "translate-x-0.5"
              }`}
            />
          </div>
        </button>
      </div>
    </>
  )
}
