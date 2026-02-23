import React from "react"
import { cn } from "../lib/cn"
import { SQUARE_SIDE } from "../lib/music/scale"

export type NoteCellProps = {
  idx?: number;
  optCaption?: string | number | null;
  optBackground?: string | null;
  dataRow?: string;
  dataIdx?: number;
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
      className = "",
      style: customStyle = {},
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
          "flex items-center justify-center text-sm font-semibold box-border relative select-none transition-colors duration-0 text-gray-800 hover:bg-black/[0.08]",
          className,
        )}
        style={{
          width: `${SQUARE_SIDE}px`,
          height: `${SQUARE_SIDE}px`,
          background: optBackground || undefined,
          borderRadius: "6px",
          fontFamily: "'JetBrains Mono', monospace",
          ...customStyle,
        }}
        {...props}
      >
        {children}
        {optCaption != null && (
          <div className="absolute -bottom-5 text-[10px] font-normal text-gray-400">
            {optCaption}
          </div>
        )}
      </div>
    )
  },
)

NoteCell.displayName = "NoteCell"

export default NoteCell
