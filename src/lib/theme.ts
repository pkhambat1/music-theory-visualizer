import { schemeSet3, interpolateRainbow, interpolateWarm } from "d3-scale-chromatic"
import { rgb } from "d3-color"
import type { RGBColor } from "d3-color"
import { tint, shade } from "./colors"

const RAINBOW_UI = 0.85 // blue

const LGRAY = rgb(schemeSet3[8]!) // #d9d9d9

export const neonHoverCellOutline = {
  boxShadow:
    "inset 0 0 0 1px black, 0 0 0 1px black",
} as const

export const BLACK = "black"

export const colors = {
  primary: shade(rgb(interpolateRainbow(RAINBOW_UI)), 0.20).formatHex(),
  primaryHover: shade(rgb(interpolateRainbow(RAINBOW_UI)), 0.35).formatHex(),
  primaryFill: tint(rgb(interpolateRainbow(RAINBOW_UI)), 0.75).formatHex(),
  grayText: shade(LGRAY, 0.55).formatHex(),
  border: tint(LGRAY, 0.30).formatHex(),
  muted: LGRAY.formatHex(),
  mutedDark: shade(LGRAY, 0.15).formatHex(),
} as const

/** Tailwind text color class for de-emphasized notes (non-chord-tones, struck-through naturals, arrows). */
export const MUTED_TEXT = "text-gray-500"

/** 8 warm-spectrum colors (7 degrees + octave) for cell backgrounds. */
export const DEGREE_COLORS: RGBColor[] = Array.from({ length: 8 }, (_, i) =>
  rgb(interpolateWarm(i / 7))
)

/** Return the background hex color for a given scale degree index. */
export function degreeColor(index: number): string {
  return DEGREE_COLORS[index % DEGREE_COLORS.length]!.formatHex()
}

/** Generate `count` scale-tone background hex colors sampled from the warm spectrum. */
export function scaleToneBand(count: number): string[] {
  if (count <= 1) return [rgb(interpolateWarm(0.5)).formatHex()]
  return Array.from({ length: count }, (_, i) =>
    rgb(interpolateWarm(i / (count - 1))).formatHex()
  )
}

/** Register `--app-*` CSS custom properties on `:root`. Call once at startup before React renders. */
export function registerCssColors(): void {
  const root = document.documentElement
  for (const [token, value] of Object.entries(colors)) {
    root.style.setProperty(`--app-${token}`, value)
  }
}
