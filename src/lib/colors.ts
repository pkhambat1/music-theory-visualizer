import { schemeSet3, interpolateRainbow } from "d3-scale-chromatic"

// ── Helpers ──────────────────────────────────────────────

/** Mix a hex color toward white. t=0 → original, t=1 → pure white. */
function tint(hex: string, t: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const m = (c: number) => Math.round(c + (255 - c) * t)
  return `#${m(r).toString(16).padStart(2, "0")}${m(g).toString(16).padStart(2, "0")}${m(b).toString(16).padStart(2, "0")}`
}

/** Mix a hex color toward black. t=0 → original, t=1 → pure black. */
function shade(hex: string, t: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const m = (c: number) => Math.round(c * (1 - t))
  return `#${m(r).toString(16).padStart(2, "0")}${m(g).toString(16).padStart(2, "0")}${m(b).toString(16).padStart(2, "0")}`
}

// ── Rainbow helpers ──────────────────────────────────────

function rgbCssToHex(css: string): string {
  const m = css.match(/rgb\((\d+), (\d+), (\d+)\)/)
  if (!m) return "#888888"
  return `#${(+m[1]!).toString(16).padStart(2, "0")}${(+m[2]!).toString(16).padStart(2, "0")}${(+m[3]!).toString(16).padStart(2, "0")}`
}

function rb(t: number): string { return rgbCssToHex(interpolateRainbow(t)) }

// Pick specific rainbow positions for each color role
const RB_ROOT  = 0.68   // teal green
const RB_SCALE = 0.40   // yellow ochre
const RB_UI    = 0.85   // blue (UI buttons / focus rings)
const RB_RESP  = 0.70   // teal

/**
 * Sample a narrow band of the rainbow around `center`, producing `count` colors
 * with subtle hue variation. `spread` controls how wide the band is (0.06 = ±3%).
 * Each color is tinted to pastel.
 */
export function rainbowBand(center: number, count: number, spread = 0.10, tintAmt = 0.45): string[] {
  if (count <= 1) return [tint(rb(center), tintAmt)]
  const start = center - spread / 2
  return Array.from({ length: count }, (_, i) => {
    const t = start + (spread * i) / (count - 1)
    return tint(rb(t), tintAmt)
  })
}

// ── Set3 neutrals only ──────────────────────────────────

const LGRAY   = schemeSet3[8]!   // #d9d9d9

/**
 * Central color tokens — derived from `interpolateRainbow`.
 *
 * Use `colors.*` in inline styles, SVG attributes, and component props.
 * Use `var(--d3-tokenName)` in Tailwind classes (e.g. `bg-[var(--d3-primary)]`).
 */
export const colors = {
  // ── Core accent roles ──────────────────────────────────
  primary:      shade(rb(RB_UI), 0.20),
  primaryHover: shade(rb(RB_UI), 0.35),
  primaryFill:  tint(rb(RB_UI), 0.75),

  // ── Scale / root fills ─────────────────────────────────
  scaleFill:    tint(rb(RB_SCALE), 0.45),
  scaleBorder:  shade(rb(RB_SCALE), 0.25),
  scaleText:    shade(rb(RB_SCALE), 0.35),
  rootFill:     tint(rb(RB_ROOT), 0.45),
  rootBorder:   shade(rb(RB_ROOT), 0.25),

  // ── Utility / neutral ─────────────────────────────────
  grayText:     shade(LGRAY, 0.55),
  respelling:   shade(rb(RB_RESP), 0.40),
  rowBg:        tint(LGRAY, 0.55),
  border:       tint(LGRAY, 0.30),
  muted:        LGRAY,
} as const

/** Rainbow band center for gradient fills in uniform-color rows. */
export const BAND_SCALE = RB_SCALE

// ── Rainbow degree palette (fixed per scale degree) ─────

/** 8 rainbow colors (7 degrees + octave), tinted to pastel for cell backgrounds. */
export const DEGREE_COLORS: string[] = Array.from({ length: 8 }, (_, i) => {
  const raw = interpolateRainbow(i / 8)
  return tint(rgbCssToHex(raw), 0.45)
})

/**
 * Register `--d3-*` CSS custom properties on `:root`.
 * Call once at startup before React renders.
 */
export function registerCssColors(): void {
  const root = document.documentElement
  for (const [token, value] of Object.entries(colors)) {
    root.style.setProperty(`--d3-${token}`, value)
  }
}
