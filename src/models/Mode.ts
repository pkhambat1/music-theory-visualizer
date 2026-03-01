import type { Interval } from "../lib/music/types"

export class Mode {
  constructor(
    public name: string,
    public intervals: Interval[],
    public description: string,
  ) {}
}
