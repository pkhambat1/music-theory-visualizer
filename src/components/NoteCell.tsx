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
}

const NoteCell = React.forwardRef<HTMLDivElement, NoteCellProps>(
  (
    {
      squareSidePx,
      idx,
      children,
      optCaption,
      optBackground,
      showBorder = false,
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
          "flex items-center justify-center text-sm font-semibold box-border relative select-none transition-colors duration-0 text-slate-200 hover:bg-white/[0.06]",
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
          <div className="absolute -bottom-5 text-[10px] font-normal text-slate-500">
            {optCaption}
          </div>
        )}
      </div>
    );
  },
);

NoteCell.displayName = "NoteCell";

export default NoteCell;
