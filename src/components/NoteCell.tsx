import React from "react"
import { cn } from "../lib/cn"
import { SQUARE_SIDE } from "../lib/music"

export type NoteCellProps = {
  idx?: number,
  optCaption?: string | number | null,
  optBackground?: string | null,
  dataRow?: string,
  dataIdx?: number,
} & React.HTMLAttributes<HTMLDivElement>

const NoteCell = React.forwardRef<HTMLDivElement, NoteCellProps>(
  (
    {
      idx,
      children,
      optCaption,
      optBackground,
      dataRow,
      dataIdx,
      className,
      style: customStyle,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        key={idx}
        ref={ref}
        data-row={dataRow}
        data-idx={dataIdx}
        className={cn(
          "flex items-center justify-center text-sm font-semibold box-border relative select-none transition-colors duration-0",
          optBackground ? "text-[var(--app-textOnSurface)]" : "text-[var(--app-textPrimary)]",
          className ?? "",
        )}
        style={{
          width: `${SQUARE_SIDE}px`,
          height: `${SQUARE_SIDE}px`,
          background: optBackground || undefined,
          borderRadius: "6px",
          fontFamily: "'JetBrains Mono', monospace",
          border: optBackground ? "2px solid var(--app-borderDefault)" : "2px solid transparent",
          ...(customStyle ?? {}),
        }}
        {...props}
      >
        {children}
        {optCaption != null && (
          <div className="absolute -bottom-5 text-[10px] font-normal text-[var(--app-textMuted)]">
            {optCaption}
          </div>
        )}
      </div>
    )
  },
)

export default NoteCell
