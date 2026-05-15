import { useCallback, useState } from "react"
import type { CellLink } from "../lib/geometry"
import { StaticConnection } from "../models"
import { bezierPath } from "../lib/bezier"
import { BLACK } from "../lib/theme"
import { useContainerMeasure } from "../hooks"

export type FixedLinesProps = {
  containerRef: React.RefObject<HTMLDivElement | null>,
  connections: CellLink[],
}

export default function FixedLines({ containerRef, connections }: FixedLinesProps) {
  const [lines, setLines] = useState<StaticConnection[]>([])

  const measure = useCallback(() => {
    const container = containerRef?.current
    if (!container || connections.length === 0) {
      setLines([])
      return
    }
    const containerRect = container.getBoundingClientRect()
    const scrollLeft = container.scrollLeft
    const scrollTop = container.scrollTop

    // Measure the root chromatic cell (index 0) to extrapolate overflow positions.
    const rootEl = container.querySelector(`[data-row="chromatic-row"][data-idx="0"]`)
    const rootRect = rootEl?.getBoundingClientRect() ?? null
    const cellWidth = rootRect?.width ?? 0

    const nextLines = connections
      .map(({ fromRow, fromIdx, toRow, toIdx }) => {
        const toEl = container.querySelector(`[data-row="${toRow}"][data-idx="${toIdx}"]`)
        if (!toEl) return null

        const fromEl = container.querySelector(`[data-row="${fromRow}"][data-idx="${fromIdx}"]`)
        let fromX: number
        let fromY: number
        if (fromEl) {
          const fromRect = fromEl.getBoundingClientRect()
          fromX = fromRect.left - containerRect.left + fromRect.width / 2 + scrollLeft
          fromY = fromRect.bottom - containerRect.top + scrollTop
        } else if (rootRect) {
          fromX = rootRect.left - containerRect.left + rootRect.width / 2 + fromIdx * cellWidth + scrollLeft
          fromY = rootRect.bottom - containerRect.top + scrollTop
        } else {
          return null
        }

        const toRect = toEl.getBoundingClientRect()

        return new StaticConnection(
          { x: fromX, y: fromY },
          {
            x: toRect.left - containerRect.left + toRect.width / 2 + scrollLeft,
            y: toRect.top - containerRect.top + scrollTop,
          },
        )
      })
      .filter((c): c is StaticConnection => c !== null)

    setLines(nextLines)
  }, [containerRef, connections])

  useContainerMeasure(containerRef, measure)

  if (!lines.length) return null

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
        overflow: "visible",
      }}
    >
      {lines.map((conn, idx) => (
        <path
          key={idx}
          d={bezierPath(conn.from, conn.to)}
          stroke="darkgray"
          strokeWidth="2"
          fill="none"
        />
      ))}
    </svg>
  )
}
