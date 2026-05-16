import { schemeSet3, interpolateRainbow } from "d3-scale-chromatic"
import { quantize } from "d3-interpolate"
import { scaleOrdinal } from "d3-scale"
import { rgb } from "d3-color"
import { tint, shade, hueBand } from "./colors"

const RAINBOW_ROOT = 0.68 // teal green
const RAINBOW_SCALE = 0.40 // yellow ochre
const RAINBOW_UI = 0.85 // blue (UI buttons / focus rings)
const RAINBOW_RESPELLING = 0.70 // teal

/** Slots for diatonic degree cells (7 degrees + octave / wrap). Observable-style: `scaleOrdinal(quantize(interpolateRainbow, n))`. */
const DEGREE_SLOT_COUNT = 8

/**
 * Alpha applied only to degree-row rainbow fills (same idea as sunburst `fill-opacity="0.6"` on white).
 * No `tint()` on these colors — softening is compositing only.
 */
export const RAINBOW_DEGREE_FILL_OPACITY = 0.6

const LGRAY = rgb(schemeSet3[8]!) // #d9d9d9

const rainbowOrdinalRange = quantize(interpolateRainbow, DEGREE_SLOT_COUNT)
const rainbowDegreeOrdinal = scaleOrdinal<number, string>(rainbowOrdinalRange).domain(
  Array.from({ length: DEGREE_SLOT_COUNT }, (_, i) => i),
)

function degreeSlotToRgba(slot: number): string {
  const opaque = rainbowDegreeOrdinal(slot)
  const c = rgb(opaque)
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${RAINBOW_DEGREE_FILL_OPACITY})`
}

/**
 * Central color tokens — derived from `interpolateRainbow`.
 *
 * Use `colors.*` in inline styles, SVG attributes, and component props.
 * Use `var(--app-tokenName)` in Tailwind classes (e.g. `bg-[var(--app-primary)]`).
 *
 * Note: UI / scale / root tokens below still use `tint` / `shade` in `src/lib/colors.ts`.
 * Only diatonic degree fills (`DEGREE_COLORS`, `degreeColor`) use rainbow + `RAINBOW_DEGREE_FILL_OPACITY` only.
 */
export const colors = {
  primary: shade(rgb(interpolateRainbow(RAINBOW_UI)), 0.20).formatHex(),
  primaryHover: shade(rgb(interpolateRainbow(RAINBOW_UI)), 0.35).formatHex(),
  primaryFill: tint(rgb(interpolateRainbow(RAINBOW_UI)), 0.75).formatHex(),
  scaleFill: tint(rgb(interpolateRainbow(RAINBOW_SCALE)), 0.45).formatHex(),
  scaleBorder: shade(rgb(interpolateRainbow(RAINBOW_SCALE)), 0.25).formatHex(),
  scaleText: shade(rgb(interpolateRainbow(RAINBOW_SCALE)), 0.35).formatHex(),
  rootFill: tint(rgb(interpolateRainbow(RAINBOW_ROOT)), 0.45).formatHex(),
  rootBorder: shade(rgb(interpolateRainbow(RAINBOW_ROOT)), 0.25).formatHex(),
  grayText: shade(LGRAY, 0.55).formatHex(),
  respelling: shade(rgb(interpolateRainbow(RAINBOW_RESPELLING)), 0.40).formatHex(),
  rowBg: tint(LGRAY, 0.55).formatHex(),
  border: tint(LGRAY, 0.30).formatHex(),
  muted: LGRAY.formatHex(),
} as const

/** Tailwind text color class for de-emphasized notes (non-chord-tones, struck-through naturals, arrows). */
export const MUTED_TEXT = "text-gray-500"

/** Eight `rgba(..., RAINBOW_DEGREE_FILL_OPACITY)` strings — ordinal `quantize(interpolateRainbow, 8)` range, no `tint()`. */
export const DEGREE_COLORS: string[] = Array.from({ length: DEGREE_SLOT_COUNT }, (_, slot) =>
  degreeSlotToRgba(slot),
)

/** Background for a diatonic degree cell: rainbow ordinal sample + fill opacity only. */
export function degreeColor(index: number): string {
  return DEGREE_COLORS[index % DEGREE_COLORS.length]!
}

/** Generate `count` scale-tone background hex colors as a subtle hue-varied band. */
export function scaleToneBand(count: number): string[] {
  return hueBand(RAINBOW_SCALE, count, 0.10, 0.45).map((c) => c.formatHex())
}

/** Register `--app-*` CSS custom properties on `:root`. Call once at startup before React renders. */
export function registerCssColors(): void {
  const root = document.documentElement
  for (const [token, value] of Object.entries(colors)) {
    root.style.setProperty(`--app-${token}`, value)
  }
}
