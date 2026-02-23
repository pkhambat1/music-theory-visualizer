import type { Point } from "../types"

const TENSION = 0.45

/** Cubic-bezier SVG path that curves vertically before bending toward the target. */
export function bezierPath(from: Point, to: Point): string {
  const dy = to.y - from.y
  const c1x = from.x
  const c1y = from.y + dy * TENSION
  const c2x = to.x
  const c2y = to.y - dy * TENSION
  return `M ${from.x} ${from.y} C ${c1x} ${c1y} ${c2x} ${c2y} ${to.x} ${to.y}`
}

/** Evaluate the bezier curve at parameter t (0–1), returning the point. */
export function bezierPointAt(from: Point, to: Point, t: number): Point {
  const mt = 1 - t
  const dy = to.y - from.y
  const c1x = from.x
  const c1y = from.y + dy * TENSION
  const c2x = to.x
  const c2y = to.y - dy * TENSION
  return {
    x: mt*mt*mt*from.x + 3*mt*mt*t*c1x + 3*mt*t*t*c2x + t*t*t*to.x,
    y: mt*mt*mt*from.y + 3*mt*mt*t*c1y + 3*mt*t*t*c2y + t*t*t*to.y,
  }
}
