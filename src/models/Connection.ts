import type { Point } from "./Point"

/**
 * A directed line between two screen-space points.
 * Subclasses distinguish plain visual connections from those carrying musical data.
 */
export abstract class Connection {
  from: Point
  to: Point

  constructor(from: Point, to: Point) {
    this.from = from
    this.to = to
  }
}
