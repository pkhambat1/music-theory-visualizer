import React from "react";
import { borderWidth, getLineBorder } from "../App";

const NotesArray = ({ size, SQUARE_SIDE, children, show_border = true }) => (
  <div
    style={{
      width: `${SQUARE_SIDE * size}px`,
      height: `${SQUARE_SIDE}px`,
      margin: `${SQUARE_SIDE}px auto`,
      position: "relative",
      boxSizing: "content-box",
      background: "#fff",
      border: show_border
        ? getLineBorder(borderWidth)
        : `${borderWidth}px solid transparent`, // Transparent border when show_border is false
      display: "flex",
      alignItems: "center",
      zIndex: 2,
    }}
  >
    {children}
  </div>
);

export default NotesArray;
