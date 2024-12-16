import React from "react";

const NoteCell = ({ SQUARE_SIDE, idx, children, opt_caption, ...props }) => {
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
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: `${SQUARE_SIDE}px`,
        height: `${SQUARE_SIDE}px`,
        fontSize: "16px",
        fontWeight: "bold",
        boxSizing: "border-box",
        border: "1px solid #333",
        position: "relative",
      }}
      {...props}
    >
      {children}
      {opt_caption && <Caption>{opt_caption}</Caption>}
    </div>
  );
};

export default NoteCell;
