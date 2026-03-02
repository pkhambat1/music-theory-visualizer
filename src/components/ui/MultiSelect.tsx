import { useState } from "react"

export type MultiSelectOption = {
  value: string,
  label?: string,
}

export type MultiSelectProps = {
  options: MultiSelectOption[],
  value: string[],
  onChange?: (value: string[]) => void,
  placeholder: string,
  header?: string,
  /** Values that should be greyed out and non-interactive (e.g. conflicting options). */
  disabledValues: Set<string>,
}

export default function MultiSelect({
  options,
  value,
  onChange,
  placeholder,
  header,
  disabledValues,
}: MultiSelectProps) {
  const [focusedIndex, setFocusedIndex] = useState(-1)

  const toggle = (val: string) => {
    const exists = value.includes(val)
    const next = exists ? value.filter((v) => v !== val) : [...value, val]
    onChange?.(next)
  }

  return (
    <div className="flex min-w-[200px] flex-col gap-2 text-sm">
      {(header || value.length > 0) && (
        <div className="flex items-center justify-between">
          {header && (
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--app-textTertiary)]">{header}</span>
          )}
          {value.length > 0 && (
            <button
              className="rounded-lg px-2 py-1 text-xs text-[var(--app-textMuted)] hover:text-[var(--app-textSecondary)] hover:bg-[var(--app-surfaceHover)] transition-colors"
              onClick={() => onChange?.([])}
            >
              Clear
            </button>
          )}
        </div>
      )}
      {options.length === 0 ? (
        <span className="text-[var(--app-textMuted)]">{placeholder}</span>
      ) : (
        <div className="max-h-[200px] overflow-y-auto grid grid-cols-3 gap-0.5">
          {options.map((opt, idx) => {
            const isSelected = value.includes(opt.value)
            const isDisabled = disabledValues.has(opt.value)
            const isFocused = idx === focusedIndex
            return (
              <label
                key={opt.value}
                className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs transition-colors ${
                  isDisabled
                    ? "text-[var(--app-textDisabled)] pointer-events-none"
                    : isSelected
                    ? "bg-[var(--app-primaryFill)] text-[var(--app-primary)] font-medium cursor-pointer"
                    : isFocused
                    ? "bg-[var(--app-surfaceHover)] text-[var(--app-textPrimary)] cursor-pointer"
                    : "text-[var(--app-textSecondary)] hover:bg-[var(--app-surfaceSubtle)] cursor-pointer"
                }`}
                onMouseEnter={() => {
                  if (!isDisabled) setFocusedIndex(idx)
                }}
              >
                <input
                  type="checkbox"
                  className={`h-3 w-3 rounded border-[var(--app-border)] bg-[var(--app-surfaceBase)] text-[var(--app-primary)] focus:ring-[var(--app-primary)] ${isDisabled ? "opacity-40" : ""}`}
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={() => toggle(opt.value)}
                />
                <span>{opt.label ?? opt.value}</span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
