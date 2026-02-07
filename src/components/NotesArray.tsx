import { BORDER_PX, getLineBorder } from "../lib/music/scale";

export interface NotesArrayProps {
  size: number;
  squareSidePx: number;
  children: React.ReactNode;
  marginPx?: number;
  showBorder?: boolean;
  caption?: string;
}

export default function NotesArray({
  size,
  squareSidePx,
  children,
  marginPx = 0,
  showBorder = true,
  caption,
}: NotesArrayProps) {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: `${marginPx}px auto`,
        overflow: "visible",
        position: "relative",
      }}
    >
      {caption && (
        <div
          style={{ width: `${squareSidePx * size}px` }}
          className="mb-1.5"
        >
          <span className="pointer-events-none select-none whitespace-nowrap text-[10px] font-medium uppercase tracking-wider text-slate-500">
            {caption}
          </span>
        </div>
      )}
      <div
        style={{
          width: `${squareSidePx * size}px`,
          height: `${squareSidePx}px`,
          position: "relative",
          boxSizing: "content-box",
          background: "rgba(8, 8, 24, 0.85)",
          border: showBorder
            ? getLineBorder(BORDER_PX)
            : `${BORDER_PX}px solid transparent`,
          display: "flex",
          alignItems: "center",
          zIndex: 2,
        }}
      >
        {children}
      </div>
    </div>
  );
}
