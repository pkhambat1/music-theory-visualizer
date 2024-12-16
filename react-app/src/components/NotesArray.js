import React from "react";

const NotesArray = ({ size, SQUARE_SIDE, children, show_border = true }) => (
  <div
    style={{
      width: `${SQUARE_SIDE * size}px`,
      height: `${SQUARE_SIDE}px`,
      margin: `${SQUARE_SIDE}px auto`,
      position: "relative",
      boxSizing: "content-box",
      background: "#fff",
      border: show_border ? "1px solid #333" : null,
      display: "flex",
      alignItems: "center", // Centers the NoteCell vertically within the container
      zIndex: 2, // Manages stacking context, although it might be less necessary without overlapping content
    }}
  >
    {children}
  </div>
);

export default NotesArray;
