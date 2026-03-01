import { SQUARE_SIDE } from "../lib/music"
import { colors } from "../lib/theme"

export type NotesArrayProps = {
  size: number,
  children: React.ReactNode,
  caption?: string,
  captionSubtitle?: string,
  captionRight?: React.ReactNode,
  clipContent?: boolean,
  zIndex?: number,
  rowBackground?: string,
}

export default function NotesArray({
  size,
  children,
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
        margin: "0 auto",
        overflow: "visible",
        position: "relative",
        zIndex,
      }}
    >
      {(caption || captionRight) && (
        <div
          style={{ width: `${SQUARE_SIDE * size}px` }}
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
          width: `${SQUARE_SIDE * size}px`,
          height: `${SQUARE_SIDE}px`,
          position: "relative",
          boxSizing: "content-box",
          background: rowBackground ?? colors.rowBg,
          border: "2px solid transparent",
          display: "flex",
          alignItems: "center",
          borderRadius: "8px",
          overflow: clipContent ? "hidden" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  )
}
