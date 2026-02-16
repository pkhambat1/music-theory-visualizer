import { BORDER_PX } from "../lib/music/scale";

export interface NotesArrayProps {
  size: number;
  squareSidePx: number;
  children: React.ReactNode;
  marginPx?: number;
  showBorder?: boolean;
  caption?: string;
  captionSubtitle?: string;
  captionRight?: React.ReactNode;
  clipContent?: boolean;
  zIndex?: number;
  rowBackground?: string;
}

export default function NotesArray({
  size,
  squareSidePx,
  children,
  marginPx = 0,
  showBorder = true,
  caption,
  captionSubtitle,
  captionRight,
  clipContent = false,
  zIndex,
  rowBackground,
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
        zIndex,
      }}
    >
      {(caption || captionRight) && (
        <div
          style={{ width: `${squareSidePx * size}px` }}
          className="mb-2 flex items-center justify-between"
        >
          <div>
            {caption && (
              <span className="pointer-events-none select-none whitespace-nowrap text-[13px] font-semibold tracking-wide text-gray-500">
                {caption}
              </span>
            )}
            {captionSubtitle && (
              <span className="pointer-events-none select-none whitespace-nowrap text-[11px] text-gray-400 ml-2">
                {captionSubtitle}
              </span>
            )}
          </div>
          {captionRight}
        </div>
      )}
      <div
        style={{
          width: `${squareSidePx * size}px`,
          height: `${squareSidePx}px`,
          position: "relative",
          boxSizing: "content-box",
          background: rowBackground ?? "transparent",
          border: showBorder
            ? `${BORDER_PX}px solid #000`
            : `${BORDER_PX}px solid transparent`,
          display: "flex",
          alignItems: "center",
          zIndex: 2,
          borderRadius: "8px",
          overflow: clipContent ? "hidden" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
