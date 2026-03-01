import { schemeSet3, interpolateRainbow } from "d3-scale-chromatic"
import { rgb } from "d3-color"
import { tint, shade } from "./colors"

// ── Rainbow positions for each color role ────────────────

const RAINBOW_ROOT  = 0.68   // teal green
export const RAINBOW_SCALE = 0.40   // yellow ochre
const RAINBOW_UI    = 0.85   // blue (UI buttons / focus rings)
const RAINBOW_RESPELLING  = 0.70   // teal

// ── Set3 neutrals ────────────────────────────────────────

const LGRAY = rgb(schemeSet3[8]!)   // #d9d9d9

// ── App color tokens ─────────────────────────────────────

/**
 * Central color tokens — derived from `interpolateRainbow`.
 *
 * Use `colors.*` in inline styles, SVG attributes, and component props.
 * Use `var(--app-tokenName)` in Tailwind classes (e.g. `bg-[var(--app-primary)]`).
 */
export const colors = {
  // ── Core accent roles ──────────────────────────────────
  primary:      shade(rgb(interpolateRainbow(RAINBOW_UI)), 0.20).formatHex(),
  primaryHover: shade(rgb(interpolateRainbow(RAINBOW_UI)), 0.35).formatHex(),
  primaryFill:  tint(rgb(interpolateRainbow(RAINBOW_UI)), 0.75).formatHex(),

  // ── Scale / root fills ─────────────────────────────────
  scaleFill:    tint(rgb(interpolateRainbow(RAINBOW_SCALE)), 0.45).formatHex(),
  scaleBorder:  shade(rgb(interpolateRainbow(RAINBOW_SCALE)), 0.25).formatHex(),
  scaleText:    shade(rgb(interpolateRainbow(RAINBOW_SCALE)), 0.35).formatHex(),
  rootFill:     tint(rgb(interpolateRainbow(RAINBOW_ROOT)), 0.45).formatHex(),
  rootBorder:   shade(rgb(interpolateRainbow(RAINBOW_ROOT)), 0.25).formatHex(),

  // ── Utility / neutral ─────────────────────────────────
  grayText:     shade(LGRAY, 0.55).formatHex(),
  respelling:   shade(rgb(interpolateRainbow(RAINBOW_RESPELLING)), 0.40).formatHex(),
  rowBg:        tint(LGRAY, 0.55).formatHex(),
  border:       tint(LGRAY, 0.30).formatHex(),
  muted:        LGRAY.formatHex(),
} as const

// ── Rainbow degree palette (fixed per scale degree) ─────

/** 8 rainbow colors (7 degrees + octave), tinted to pastel for cell backgrounds. */
export const DEGREE_COLORS: string[] = Array.from({ length: 8 }, (_, i) =>
  tint(rgb(interpolateRainbow(i / 8)), 0.45).formatHex()
)

/**
 * Register `--app-*` CSS custom properties on `:root`.
 * Call once at startup before React renders.
 */
export function registerCssColors(): void {
  const root = document.documentElement
  for (const [token, value] of Object.entries(colors)) {
    root.style.setProperty(`--app-${token}`, value)
  }
}
