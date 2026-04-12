import { useCallback, useEffect, useRef } from "react"
import { useClickOutside } from "../../hooks"

export type PopoverPosition = "top" | "bottom"

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

  const close = useCallback(() => onOpenChange(false), [onOpenChange])
  useClickOutside(ref, close, open)

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
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
