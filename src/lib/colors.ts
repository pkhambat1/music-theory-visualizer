import { interpolateRainbow } from "d3-scale-chromatic"
import { rgb } from "d3-color"
import type { RGBColor } from "d3-color"

/** Mix an RGBColor toward white. t=0 → original, t=1 → pure white. */
export function tint(color: RGBColor, t: number): RGBColor {
  const m = (c: number) => Math.round(c + (255 - c) * t)
  return rgb(m(color.r), m(color.g), m(color.b))
}

/** Mix an RGBColor toward black. t=0 → original, t=1 → pure black. */
export function shade(color: RGBColor, t: number): RGBColor {
  const m = (c: number) => Math.round(c * (1 - t))
  return rgb(m(color.r), m(color.g), m(color.b))
}

/**
 * Sample a narrow band of the rainbow around `center`, producing `count` colors
 * with subtle hue variation. `spread` controls how wide the band is (0.06 = ±3%).
 * Each color is tinted to pastel. Returns `RGBColor[]` — call `.formatHex()` at DOM boundaries.
 */
export function hueBand(center: number, count: number, spread: number, tintAmt: number): RGBColor[] {
  if (count <= 1) return [tint(rgb(interpolateRainbow(center)), tintAmt)]
  const start = center - spread / 2
  return Array.from({ length: count }, (_, i) => {
    const t = start + (spread * i) / (count - 1)
    return tint(rgb(interpolateRainbow(t)), tintAmt)
  })
}
