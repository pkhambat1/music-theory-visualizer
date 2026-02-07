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
          className={`absolute left-1/2 z-30 -translate-x-1/2 rounded-xl border border-white/[0.08] bg-[#0d0d20]/95 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl ${positionClasses[position]}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
