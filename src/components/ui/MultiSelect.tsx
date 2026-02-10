import { useState } from "react";

export interface MultiSelectOption {
  value: string;
  label?: string;
}

export interface MultiSelectProps {
  options?: MultiSelectOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  header?: string;
  /** Values that should be greyed out and non-interactive (e.g. conflicting options). */
  disabledValues?: Set<string>;
}

export default function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = "Select",
  header,
  disabledValues = new Set(),
}: MultiSelectProps) {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const toggle = (val: string) => {
    const exists = value.includes(val);
    const next = exists ? value.filter((v) => v !== val) : [...value, val];
    onChange?.(next);
  };

  return (
    <div className="flex min-w-[200px] flex-col gap-2 text-sm">
      {(header || value.length > 0) && (
        <div className="flex items-center justify-between">
          {header && (
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{header}</span>
          )}
          {value.length > 0 && (
            <button
              className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors"
              onClick={() => onChange?.([])}
            >
              Clear
            </button>
          )}
        </div>
      )}
      {options.length === 0 ? (
        <span className="text-slate-500">{placeholder}</span>
      ) : (
        <div className="max-h-[200px] overflow-y-auto grid grid-cols-3 gap-0.5">
          {options.map((opt, idx) => {
            const isSelected = value.includes(opt.value);
            const isDisabled = disabledValues.has(opt.value);
            const isFocused = idx === focusedIndex;
            return (
              <label
                key={opt.value}
                className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs transition-colors ${
                  isDisabled
                    ? "text-slate-600 pointer-events-none"
                    : isSelected
                    ? "bg-cyan-400/10 text-cyan-300 font-medium cursor-pointer"
                    : isFocused
                    ? "bg-white/[0.06] text-slate-200 cursor-pointer"
                    : "text-slate-400 hover:bg-white/[0.04] cursor-pointer"
                }`}
                onMouseEnter={() => {
                  if (!isDisabled) setFocusedIndex(idx);
                }}
              >
                <input
                  type="checkbox"
                  className={`h-3 w-3 rounded border-white/20 bg-white/[0.04] text-cyan-500 focus:ring-cyan-400/30 ${isDisabled ? "opacity-40" : ""}`}
                  checked={isSelected}
                  disabled={isDisabled}
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
