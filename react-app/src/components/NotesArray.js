import React from "react";
import { borderPx, getLineBorder } from "../lib/music/scale";

const NotesArray = ({
  size,
  squareSidePx,
  children,
  marginPx,
  show_border = true,
}) => {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        margin: `${marginPx}px auto`,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          width: `${squareSidePx * size}px`,
          height: `${squareSidePx}px`,
          position: "relative",
          boxSizing: "content-box",
          background: "#fff",
          border: show_border
            ? getLineBorder(borderPx)
            : `${borderPx}px solid transparent`,
          display: "flex",
          alignItems: "center",
          zIndex: 2,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default NotesArray;
