import { describe, it, expect } from "vitest";
import { buildSplinePath } from "../linePath";

describe("buildSplinePath", () => {
  it("returns a string starting with M and containing C", () => {
    const path = buildSplinePath({ x1: 0, y1: 0, x2: 100, y2: 200 });
    expect(path).toMatch(/^M /);
    expect(path).toContain(" C ");
  });

  it("produces correct coordinates for a simple line", () => {
    const path = buildSplinePath({ x1: 10, y1: 20, x2: 30, y2: 40 });
    // M 10 20 C 10 29 30 31 30 40
    // tension=0.45, dy=20, c1y=20+20*0.45=29, c2y=40-20*0.45=31
    expect(path).toBe("M 10 20 C 10 29 30 31 30 40");
  });

  it("produces a valid path for a vertical line (x1 = x2)", () => {
    const path = buildSplinePath({ x1: 50, y1: 0, x2: 50, y2: 100 });
    expect(path).toMatch(/^M 50 0 C 50 /);
    expect(path).toContain("50 100");
  });

  it("custom tension changes control point positions", () => {
    const defaultPath = buildSplinePath({ x1: 0, y1: 0, x2: 100, y2: 100 });
    const customPath = buildSplinePath(
      { x1: 0, y1: 0, x2: 100, y2: 100 },
      0.8,
    );
    expect(defaultPath).not.toBe(customPath);
  });

  it("tension=0 produces control points at endpoints", () => {
    const path = buildSplinePath(
      { x1: 0, y1: 0, x2: 100, y2: 200 },
      0,
    );
    // c1y = 0 + 200*0 = 0, c2y = 200 - 200*0 = 200
    expect(path).toBe("M 0 0 C 0 0 100 200 100 200");
  });

  it("handles negative coordinates", () => {
    const path = buildSplinePath({ x1: -10, y1: -20, x2: -30, y2: -40 });
    expect(path).toMatch(/^M -10 -20 C /);
  });
});
