import { useCallback, useState } from "react"
import type { CellLink } from "../types"
import { StaticConnection } from "../models/StaticConnection"
import { bezierPath } from "../lib/bezier"
import { colors } from "../lib/colors"
import { useContainerMeasure } from "../hooks/useContainerMeasure"

export type LineGroupProps = {
  containerRef: React.RefObject<HTMLDivElement | null>,
  connections?: CellLink[],
  depKey?: string,
}

export default function LineGroup({ containerRef, connections = [], depKey = "" }: LineGroupProps) {
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

    const nextLines = connections
      .map(({ fromRow, fromIdx, toRow, toIdx }) => {
        const fromEl = container.querySelector(`[data-row="${fromRow}"][data-idx="${fromIdx}"]`)
        const toEl = container.querySelector(`[data-row="${toRow}"][data-idx="${toIdx}"]`)
        if (!fromEl || !toEl) return null

        const fromRect = fromEl.getBoundingClientRect()
        const toRect = toEl.getBoundingClientRect()

        return new StaticConnection(
          {
            x: fromRect.left - containerRect.left + fromRect.width / 2 + scrollLeft,
            y: fromRect.bottom - containerRect.top + scrollTop,
          },
          {
            x: toRect.left - containerRect.left + toRect.width / 2 + scrollLeft,
            y: toRect.top - containerRect.top + scrollTop,
          },
        )
      })
      .filter((c): c is StaticConnection => c !== null)

    setLines(nextLines)
  }, [containerRef, connections, depKey])

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
          stroke={colors.border}
          strokeWidth="1.5"
          fill="none"
        />
      ))}
    </svg>
  )
}
