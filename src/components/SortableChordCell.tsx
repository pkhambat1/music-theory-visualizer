// NOTE: Requires @dnd-kit/sortable and @dnd-kit/utilities as dependencies.
// Install with: npm install @dnd-kit/sortable @dnd-kit/utilities

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface SortableChordCellProps {
  id: string | number;
  children: React.ReactNode;
  disabled?: boolean;
}

export default function SortableChordCell({
  id,
  children,
  disabled,
}: SortableChordCellProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
    zIndex: isDragging ? 999 : "auto",
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
