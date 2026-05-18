export type NotesArrayProps = {
  size: number,
  cellWidth: number,
  children: React.ReactNode,
  caption?: string,
  captionSubtitle?: string,
  captionRight?: React.ReactNode,
  clipContent: boolean,
  zIndex?: number,
  rowBackground?: string,
  rowStrokeColor?: string,
}

export default function NotesArray({
  size,
  cellWidth,
  children,
  caption,
  captionSubtitle,
  captionRight,
  clipContent,
  zIndex,
  rowBackground,
  rowStrokeColor,
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
          style={{ width: `${cellWidth * size}px` }}
          className="mb-2 flex items-center justify-between"
        >
          <div>
            {caption && (
              <span className="pointer-events-none select-none whitespace-nowrap text-[13px] font-semibold tracking-wide text-black">
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
          width: `${cellWidth * size}px`,
          height: `${cellWidth}px`,
          position: "relative",
          boxSizing: "border-box",
          background: rowBackground ?? "transparent",
          border: "none",
          borderRadius: 0,
          boxShadow:
            rowStrokeColor === undefined
              ? undefined
              : `0 0 0 2px ${rowStrokeColor}`,
          display: "flex",
          alignItems: "center",
          overflow: clipContent ? "hidden" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  )
}
