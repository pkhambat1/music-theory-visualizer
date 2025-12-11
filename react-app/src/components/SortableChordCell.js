import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableChordCell({ id, children, disabled }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
    zIndex: isDragging ? 999 : "auto", // Ensure dragged item is on top
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isDragging ? "cursor-grabbing" : "cursor-grab"}
    >
      {children}
    </div>
  );
}
