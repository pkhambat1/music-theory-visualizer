import { useEffect, useRef } from "react"
import Button from "./Button"

export type PopoverPosition = "top" | "bottom"

export const DEFAULT_TRIGGER = (
  <Button
    variant="ghost"
    size="icon"
    asChild={false}
    className="h-5 w-5 rounded-full border border-[var(--app-border)] bg-gray-50 p-0 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
    aria-label="Open menu"
  >
    <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="3" cy="8" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="13" cy="8" r="1.5" />
    </svg>
  </Button>
)

export type PopoverProps = {
  open: boolean,
  onOpenChange: (open: boolean) => void,
  trigger: React.ReactNode,
  children: React.ReactNode,
  position: PopoverPosition,
}

const positionClasses: Record<PopoverPosition, string> = {
  top: "bottom-full mb-2",
  bottom: "top-full mt-2",
}

export default function Popover({
  open,
  onOpenChange,
  trigger,
  children,
  position,
}: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOpenChange(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }

    if (open) {
      document.addEventListener("mousedown", handleClick)
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, onOpenChange])

  return (
    <div className="relative inline-block" ref={ref}>
      <div onClick={() => onOpenChange(!open)}>{trigger}</div>
      {open && (
        <div
          data-popover-panel
          className={`absolute left-1/2 z-30 -translate-x-1/2 rounded-lg border border-[var(--app-border)] bg-white p-2 shadow-sm ${positionClasses[position]}`}
        >
          {children}
        </div>
      )}
    </div>
  )
}
