import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import Button from "./Button";

export interface DropdownItem {
  key: string;
  label?: string;
}

export interface DropdownProps {
  label: string;
  items?: DropdownItem[];
  onSelect?: (key: string) => void;
}

export default function Dropdown({
  label,
  items = [],
  onSelect,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)}>
        <span className="text-slate-200">{label}</span>
        <svg
          className={cn(
            "ml-2 h-3.5 w-3.5 text-slate-500 transition-transform duration-100",
            open && "rotate-180",
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Button>
      {open && (
        <div className="absolute left-0 z-30 mt-2 max-h-64 min-w-[180px] overflow-y-auto rounded-xl border border-white/[0.08] bg-[#0d0d20] p-1 shadow-2xl shadow-black/40">
          {items.map((item) => (
            <button
              key={item.key}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-slate-100"
              onClick={() => {
                onSelect?.(item.key);
                setOpen(false);
              }}
            >
              {item.label ?? item.key}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
