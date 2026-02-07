import { useMemo, useState } from "react";

export interface MultiSelectOption {
  value: string;
  label?: string;
}

export interface MultiSelectProps {
  options?: MultiSelectOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = "Select",
  autoFocus = false,
}: MultiSelectProps) {
  const [query, setQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const toggle = (val: string) => {
    const exists = value.includes(val);
    const next = exists ? value.filter((v) => v !== val) : [...value, val];
    onChange?.(next);
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    return options.filter((opt) =>
      (opt.label ?? opt.value)
        .toString()
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  }, [options, query]);

  // Reset focus when filtered list changes
  useMemo(() => {
    setFocusedIndex(filtered.length > 0 ? 0 : -1);
  }, [filtered]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex(
        (prev) => (prev - 1 + filtered.length) % filtered.length,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < filtered.length) {
        toggle(filtered[focusedIndex]!.value);
      }
    }
  };

  return (
    <div className="flex min-w-[200px] flex-col gap-2 text-sm">
      <input
        autoFocus={autoFocus}
        className="w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-2.5 py-1.5 text-sm text-slate-200 shadow-sm outline-none placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20"
        placeholder="Search extensions..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {filtered.length === 0 ? (
        <span className="text-slate-500">{placeholder}</span>
      ) : (
        <div className="max-h-[200px] overflow-y-auto flex flex-col gap-0.5">
          {filtered.map((opt, idx) => {
            const isSelected = value.includes(opt.value);
            const isFocused = idx === focusedIndex;
            return (
              <label
                key={opt.value}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-cyan-400/10 text-cyan-300 font-medium"
                    : isFocused
                    ? "bg-white/[0.06] text-slate-200"
                    : "text-slate-400 hover:bg-white/[0.04]"
                }`}
                onMouseEnter={() => setFocusedIndex(idx)}
              >
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-white/20 bg-white/[0.04] text-cyan-500 focus:ring-cyan-400/30"
                  checked={isSelected}
                  onChange={() => toggle(opt.value)}
                />
                <span>{opt.label ?? opt.value}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
