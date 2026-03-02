import { schemeSet3, interpolateRainbow } from "d3-scale-chromatic"
import { rgb } from "d3-color"
import type { RGBColor } from "d3-color"
import { tint, shade, hueBand } from "./colors"

const RAINBOW_ROOT = 0.68 // teal green
const RAINBOW_SCALE = 0.40 // yellow ochre
const RAINBOW_UI = 0.85 // blue (UI buttons / focus rings)
const RAINBOW_RESPELLING = 0.70 // teal

const LGRAY = rgb(schemeSet3[8]!) // #d9d9d9

/**
 * Central color tokens — derived from `interpolateRainbow`.
 *
 * Use `colors.*` in inline styles, SVG attributes, and component props.
 * Use `var(--app-tokenName)` in Tailwind classes (e.g. `bg-[var(--app-primary)]`).
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

/** 8 rainbow colors (7 degrees + octave), tinted to pastel for cell backgrounds. */
export const DEGREE_COLORS: RGBColor[] = Array.from({ length: 8 }, (_, i) =>
  tint(rgb(interpolateRainbow(i / 8)), 0.45)
)

/** Return the pastel background hex color for a given scale degree index. */
export function degreeColor(index: number): string {
  return DEGREE_COLORS[index % DEGREE_COLORS.length]!.formatHex()
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
