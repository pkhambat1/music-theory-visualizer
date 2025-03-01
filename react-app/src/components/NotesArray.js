import React from "react";
import { borderPx, getLineBorder } from "../App";

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
        width: `${squareSidePx * size}px`,
        height: `${squareSidePx}px`,
        margin: `${marginPx}px auto`,
        position: "relative",
        boxSizing: "content-box",
        background: "#fff",
        border: show_border
          ? getLineBorder(borderPx)
          : `${borderPx}px solid transparent`, // Transparent border when show_border is false
        display: "flex",
        alignItems: "center",
        zIndex: 2,
      }}
    >
      {children}
    </div>
  );
};

export default NotesArray;
