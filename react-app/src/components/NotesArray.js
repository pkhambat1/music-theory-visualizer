import React from "react";
import { lineBorder } from "../App";

const NotesArray = ({ size, SQUARE_SIDE, children, show_border = true }) => (
  <div
    style={{
      width: `${SQUARE_SIDE * size}px`,
      height: `${SQUARE_SIDE}px`,
      margin: `${SQUARE_SIDE}px auto`,
      position: "relative",
      boxSizing: "content-box",
      background: "#fff",
      border: show_border ? lineBorder : null,
      display: "flex",
      alignItems: "center",
      zIndex: 2,
    }}
  >
    {children}
  </div>
);

export default NotesArray;
