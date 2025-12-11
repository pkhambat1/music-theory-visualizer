import React, { useEffect, useRef } from "react";

export default function Popover({
  open,
  onOpenChange,
  trigger,
  children,
  position = "bottom",
}) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onOpenChange?.(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onOpenChange?.(false);
      }
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

  const positionClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
  };

  const arrowClasses = {
    top: "top-full -mt-1 border-b border-r border-slate-200",
    bottom: "bottom-full -mb-1 border-t border-l border-slate-200",
  };

  return (
    <div className="relative inline-block" ref={ref}>
      <div onClick={() => onOpenChange?.(!open)}>{trigger}</div>
      {open && (
        <div
          data-popover-panel
          className={`absolute left-1/2 z-30 -translate-x-1/2 rounded-md border border-slate-200 bg-white p-2 shadow-lg ${positionClasses[position]}`}
        >
          {children}
          {/* Arrow */}
          <div
            className={`absolute left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-white ${arrowClasses[position]}`}
          />
        </div>
      )}
    </div>
  );
}
