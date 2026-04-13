import { cn } from "../lib/cn"
import { SQUARE_SIDE } from "../lib/music"
import type { RowId } from "../lib/geometry"

export type NoteCellProps = {
  idx?: number,
  optCaption?: string | number | null,
  optBackground?: string | null,
  dataRow?: RowId,
  dataIdx?: number,
} & React.HTMLAttributes<HTMLDivElement>

export default function NoteCell({
  idx,
  children,
  optCaption,
  optBackground,
  dataRow,
  dataIdx,
  className,
  style: customStyle,
  ...props
}: NoteCellProps) {
  return (
    <div
      key={idx}
      data-row={dataRow}
      data-idx={dataIdx}
      className={cn(
        "flex items-center justify-center text-sm font-semibold box-border relative select-none text-black hover:bg-black/[0.08]",
        className ?? "",
      )}
      style={{
        width: `${SQUARE_SIDE}px`,
        height: `${SQUARE_SIDE}px`,
        background: optBackground || undefined,
        borderRadius: "6px",
        fontFamily: "'JetBrains Mono', monospace",
        border: optBackground ? "2px solid rgba(0,0,0,0.12)" : "2px solid transparent",
        ...(customStyle ?? {}),
      }}
      {...props}
    >
      {children}
      {optCaption != null && (
        <div className="absolute -bottom-5 text-[10px] font-normal text-black">
          {optCaption}
        </div>
      )}
    </div>
  )
}
