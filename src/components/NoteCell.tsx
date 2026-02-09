import React from "react";
import { BORDER_PX, getLineBorder } from "../lib/music/scale";
import { cn } from "../lib/cn";

export interface NoteCellProps extends React.HTMLAttributes<HTMLDivElement> {
  squareSidePx: number;
  idx?: number;
  optCaption?: string | number | null;
  optBackground?: string | null;
  showBorder?: boolean;
  dataRow?: string;
  dataIdx?: number;
  isRoot?: boolean;
}

const NoteCell = React.forwardRef<HTMLDivElement, NoteCellProps>(
  (
    {
      squareSidePx,
      idx,
      children,
      optCaption,
      optBackground,
      showBorder = true,
      dataRow,
      dataIdx,
      isRoot = false,
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
          "flex items-center justify-center text-sm font-semibold box-border relative select-none transition-all duration-150 text-slate-200 hover:scale-[1.08] hover:z-10",
          isRoot && "animate-root-pulse",
          className,
        )}
        style={{
          width: `${squareSidePx}px`,
          height: `${squareSidePx}px`,
          border: showBorder ? getLineBorder(BORDER_PX) : undefined,
          background: optBackground || undefined,
          borderRadius: "8px",
          ...customStyle,
        }}
        {...props}
      >
        {children}
        {optCaption != null && (
          <div className="absolute bottom-1 text-[10px] font-normal text-slate-500">
            {optCaption}
          </div>
        )}
      </div>
    );
  },
);

NoteCell.displayName = "NoteCell";

export default NoteCell;
