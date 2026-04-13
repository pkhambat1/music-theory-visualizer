import { useState } from "react"

export type MultiSelectOption<T extends string = string> = {
  value: T,
  label?: string,
}

export type MultiSelectProps<T extends string = string> = {
  options: MultiSelectOption<T>[],
  value: T[],
  onChange?: (value: T[]) => void,
  placeholder: string,
  header?: string,
  /** Values that should be greyed out and non-interactive (e.g. conflicting options). */
  disabledValues: Set<string>,
}

export default function MultiSelect<T extends string = string>({
  options,
  value,
  onChange,
  placeholder,
  header,
  disabledValues,
}: MultiSelectProps<T>) {
  const [focusedIndex, setFocusedIndex] = useState(-1)

  const toggle = (val: T) => {
    const exists = value.includes(val)
    const next = exists ? value.filter((v) => v !== val) : [...value, val]
    onChange?.(next)
  }

  return (
    <div className="flex min-w-[200px] flex-col gap-2 text-sm">
      {(header || value.length > 0) && (
        <div className="flex items-center justify-between">
          {header && (
            <span className="text-[11px] font-medium uppercase tracking-wider text-black">{header}</span>
          )}
          {value.length > 0 && (
            <button
              className="rounded-lg px-2 py-1 text-xs text-black hover:bg-gray-100"
              onClick={() => onChange?.([])}
            >
              Clear
            </button>
          )}
        </div>
      )}
      {options.length === 0 ? (
        <span className="text-black">{placeholder}</span>
      ) : (
        <div className="max-h-[200px] overflow-y-auto grid grid-cols-3 gap-0.5">
          {options.map((opt, idx) => {
            const isSelected = value.includes(opt.value)
            const isDisabled = disabledValues.has(opt.value)
            const isFocused = idx === focusedIndex
            return (
              <label
                key={opt.value}
                className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs ${
                  isDisabled
                    ? "text-gray-300 pointer-events-none"
                    : isSelected
                    ? "bg-[var(--app-primaryFill)] text-[var(--app-primary)] font-medium cursor-pointer"
                    : isFocused
                    ? "bg-gray-100 text-black cursor-pointer"
                    : "text-black hover:bg-gray-50 cursor-pointer"
                }`}
                onMouseEnter={() => {
                  if (!isDisabled) setFocusedIndex(idx)
                }}
              >
                <input
                  type="checkbox"
                  className={`h-3 w-3 cursor-pointer rounded border-gray-300 bg-white text-[var(--app-primary)] focus:ring-[var(--app-primary)] ${isDisabled ? "opacity-40" : ""}`}
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
