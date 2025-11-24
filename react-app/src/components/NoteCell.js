import React from "react";
import { getLineBorder, borderPx } from "../lib/music/scale";

const NoteCell = React.forwardRef(
  (
    {
      squareSidePx,
      idx,
      children,
      opt_caption,
      opt_background,
      show_border = true,
      dataRow,
      dataIdx,
      ...props
    },
    ref
  ) => {
    const Caption = ({ children }) => {
      return (
        <div
          style={{
            position: "absolute",
            bottom: "5px",
            fontSize: "12px",
            color: "#666",
          }}
        >
          {children}
        </div>
      );
    };

    return (
      <div
        key={idx}
        ref={ref}
        data-row={dataRow}
        data-idx={dataIdx}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: `${squareSidePx}px`,
          height: `${squareSidePx}px`,
          fontSize: "16px",
          fontWeight: "bold",
          boxSizing: "border-box",
          border: show_border ? getLineBorder(borderPx) : null,
          position: "relative",
          background: opt_background ? opt_background : null,
        }}
        {...props}
      >
        {children}
        {opt_caption && <Caption>{opt_caption}</Caption>}
      </div>
    );
  }
);

export default NoteCell;
