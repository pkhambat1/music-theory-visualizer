import type { Point } from "../types"
import { Connection } from "./Connection"

/**
 * A connection carrying a musical interval measured in semitones.
 * Concrete subclasses distinguish the role the interval plays in chord voicing.
 */
export abstract class IntervalConnection extends Connection {
  intervalSemitones: number

  constructor(from: Point, to: Point, intervalSemitones: number) {
    super(from, to)
    this.intervalSemitones = intervalSemitones
  }
}
