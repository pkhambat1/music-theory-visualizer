import { useEffect, useRef } from "react";

export type PopoverPosition = "top" | "bottom";

export interface PopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  position?: PopoverPosition;
}

const positionClasses: Record<PopoverPosition, string> = {
  top: "bottom-full mb-2",
  bottom: "top-full mt-2",
};

export default function Popover({
  open,
  onOpenChange,
  trigger,
  children,
  position = "bottom",
}: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };

    if (open) {
      document.addEventListener("mousedown", handleClick);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  return (
    <div className="relative inline-block" ref={ref}>
      <div onClick={() => onOpenChange(!open)}>{trigger}</div>
      {open && (
        <div
          data-popover-panel
          className={`absolute left-1/2 z-30 -translate-x-1/2 rounded-lg border border-[#d5dbe2] bg-white p-2 shadow-sm ${positionClasses[position]}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
