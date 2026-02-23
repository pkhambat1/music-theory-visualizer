import type { Point } from "../types"

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

/** A plain connection with no musical data. */
export class StaticConnection extends Connection {}

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

/** A chord tone connecting the diatonic row to the mode row (kept through extensions if any). */
export class DiatonicConnection extends IntervalConnection {}

/** A chord tone dropped when an extension is applied. */
export class RemovedConnection extends IntervalConnection {}

/** A new tone introduced by an extension. */
export class AddedConnection extends IntervalConnection {}

/** A slash-chord bass note. */
export class BassConnection extends IntervalConnection {}
