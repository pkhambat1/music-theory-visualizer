import type { Interval } from "../types"

export class Mode {
  constructor(
    public name: string,
    public intervals: Interval[],
    public description: string,
  ) {}
}
