import { describe, it, expect } from "vitest"
import { Connection } from "../../src/models/Connection"
import { StaticConnection } from "../../src/models/StaticConnection"
import { IntervalConnection } from "../../src/models/IntervalConnection"
import { DiatonicConnection } from "../../src/models/DiatonicConnection"
import { RemovedConnection } from "../../src/models/RemovedConnection"
import { AddedConnection } from "../../src/models/AddedConnection"
import { BassConnection } from "../../src/models/BassConnection"
import { bezierPath, bezierPointAt } from "../../src/lib/bezier"

describe("StaticConnection", () => {
  it("stores from and to points", () => {
    const c = new StaticConnection({ x: 0, y: 0 }, { x: 100, y: 200 })
    expect(c.from).toEqual({ x: 0, y: 0 })
    expect(c.to).toEqual({ x: 100, y: 200 })
  })

  it("is an instance of Connection", () => {
    const c = new StaticConnection({ x: 0, y: 0 }, { x: 10, y: 20 })
    expect(c).toBeInstanceOf(Connection)
  })
})

describe("IntervalConnection subclasses", () => {
  const cases = [
    { name: "DiatonicConnection", Ctor: DiatonicConnection },
    { name: "RemovedConnection", Ctor: RemovedConnection },
    { name: "AddedConnection", Ctor: AddedConnection },
    { name: "BassConnection", Ctor: BassConnection },
  ] as const

  for (const { name, Ctor } of cases) {
    describe(name, () => {
      it("stores from, to, and intervalSemitones", () => {
        const c = new Ctor({ x: 0, y: 0 }, { x: 10, y: 20 }, 7)
        expect(c.from).toEqual({ x: 0, y: 0 })
        expect(c.to).toEqual({ x: 10, y: 20 })
        expect(c.intervalSemitones).toBe(7)
      })

      it("is an instance of IntervalConnection and Connection", () => {
        const c = new Ctor({ x: 0, y: 0 }, { x: 10, y: 20 }, 4)
        expect(c).toBeInstanceOf(IntervalConnection)
        expect(c).toBeInstanceOf(Connection)
      })
    })
  }

  it("subclasses are distinguishable via instanceof", () => {
    const d = new DiatonicConnection({ x: 0, y: 0 }, { x: 1, y: 1 }, 0)
    const r = new RemovedConnection({ x: 0, y: 0 }, { x: 1, y: 1 }, 0)
    expect(d).toBeInstanceOf(DiatonicConnection)
    expect(d).not.toBeInstanceOf(RemovedConnection)
    expect(r).toBeInstanceOf(RemovedConnection)
    expect(r).not.toBeInstanceOf(DiatonicConnection)
  })
})

describe("bezierPath()", () => {
  it("returns a string starting with M and containing C", () => {
    const path = bezierPath({ x: 0, y: 0 }, { x: 100, y: 200 })
    expect(path).toMatch(/^M /)
    expect(path).toContain(" C ")
  })

  it("produces correct coordinates for a simple line", () => {
    // tension=0.45, dy=20, c1y=20+20*0.45=29, c2y=40-20*0.45=31
    expect(bezierPath({ x: 10, y: 20 }, { x: 30, y: 40 })).toBe("M 10 20 C 10 29 30 31 30 40")
  })

  it("produces a valid path for a vertical line (from.x = to.x)", () => {
    const path = bezierPath({ x: 50, y: 0 }, { x: 50, y: 100 })
    expect(path).toMatch(/^M 50 0 C 50 /)
    expect(path).toContain("50 100")
  })

  it("handles negative coordinates", () => {
    expect(bezierPath({ x: -10, y: -20 }, { x: -30, y: -40 })).toMatch(/^M -10 -20 C /)
  })
})

describe("bezierPointAt()", () => {
  it("returns the start point at t=0", () => {
    const p = bezierPointAt({ x: 10, y: 20 }, { x: 100, y: 200 }, 0)
    expect(p.x).toBe(10)
    expect(p.y).toBe(20)
  })

  it("returns the end point at t=1", () => {
    const p = bezierPointAt({ x: 10, y: 20 }, { x: 100, y: 200 }, 1)
    expect(p.x).toBe(100)
    expect(p.y).toBe(200)
  })

  it("returns a midpoint at t=0.5", () => {
    const p = bezierPointAt({ x: 0, y: 0 }, { x: 100, y: 100 }, 0.5)
    // Should be roughly centered
    expect(p.x).toBe(50)
    expect(p.y).toBe(50)
  })
})
