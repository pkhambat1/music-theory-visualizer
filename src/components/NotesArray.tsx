import { BORDER_PX, getLineBorder } from "../lib/music/scale";

export interface NotesArrayProps {
  size: number;
  squareSidePx: number;
  children: React.ReactNode;
  marginPx?: number;
  showBorder?: boolean;
  caption?: string;
  captionSubtitle?: string;
  accentColor?: string;
}

export default function NotesArray({
  size,
  squareSidePx,
  children,
  marginPx = 0,
  showBorder = true,
  caption,
  captionSubtitle,
  accentColor,
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
          className="mb-2"
        >
          <span className="pointer-events-none select-none whitespace-nowrap text-[13px] font-semibold tracking-wide text-slate-400">
            {caption}
          </span>
          {captionSubtitle && (
            <span className="pointer-events-none select-none whitespace-nowrap text-[11px] text-slate-600 ml-2">
              {captionSubtitle}
            </span>
          )}
        </div>
      )}
      <div
        style={{
          width: `${squareSidePx * size}px`,
          height: `${squareSidePx}px`,
          position: "relative",
          boxSizing: "content-box",
          background: accentColor
            ? `linear-gradient(90deg, ${accentColor}, rgba(8, 8, 24, 0.85))`
            : "rgba(8, 8, 24, 0.85)",
          border: showBorder
            ? getLineBorder(BORDER_PX)
            : `${BORDER_PX}px solid transparent`,
          borderLeft: accentColor
            ? `2px solid ${accentColor.replace(/[\d.]+\)$/, "0.4)")}`
            : showBorder
              ? getLineBorder(BORDER_PX)
              : `${BORDER_PX}px solid transparent`,
          display: "flex",
          alignItems: "center",
          zIndex: 2,
          borderRadius: "6px",
        }}
      >
        {children}
      </div>
    </div>
  );
}
