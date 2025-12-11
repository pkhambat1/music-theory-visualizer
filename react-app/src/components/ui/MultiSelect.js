import React, { useMemo, useState } from "react";

export default function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = "Select",
  autoFocus = false,
}) {
  const [query, setQuery] = useState("");

  const [focusedIndex, setFocusedIndex] = useState(-1);

  const toggle = (val) => {
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
        .includes(query.toLowerCase())
    );
  }, [options, query]);

  const handleKeyDown = (e) => {
    if (filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < filtered.length) {
        toggle(filtered[focusedIndex].value);
      }
    }
  };

  // Reset focus when query changes
  useMemo(() => {
    setFocusedIndex(filtered.length > 0 ? 0 : -1);
  }, [filtered, query]);

  return (
    <div className="flex min-w-[200px] flex-col gap-2 text-sm">
      <input
        autoFocus={autoFocus}
        className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        placeholder="Search extensions..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {filtered.length === 0 ? (
        <span className="text-slate-400">{placeholder}</span>
      ) : (
        <div className="max-h-[200px] overflow-y-auto flex flex-col gap-1">
          {filtered.map((opt, idx) => {
            const isSelected = value.includes(opt.value);
            const isFocused = idx === focusedIndex;
            return (
              <label
                key={opt.value}
                className={`flex items-center gap-2 rounded px-2 py-1.5 transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-indigo-50 text-indigo-900 font-medium"
                    : isFocused
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-800 hover:bg-slate-50"
                }`}
                onMouseEnter={() => setFocusedIndex(idx)}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
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
