import { schemeSet3, interpolateRainbow } from "d3-scale-chromatic"
import { rgb } from "d3-color"
import type { RGBColor } from "d3-color"
import { tint, shade, hueBand } from "./colors"

export type ThemeMode = "light" | "dark"

const RAINBOW_ROOT = 0.68 // teal green
const RAINBOW_SCALE = 0.40 // yellow ochre
const RAINBOW_UI = 0.85 // blue (UI buttons / focus rings)
const RAINBOW_RESPELLING = 0.70 // teal

const LGRAY = rgb(schemeSet3[8]!) // #d9d9d9

function buildColors(mode: ThemeMode) {
  const isDark = mode === "dark"

  // Existing rainbow-derived tokens — adjusted for dark mode
  const primary = shade(rgb(interpolateRainbow(RAINBOW_UI)), isDark ? 0.05 : 0.20).formatHex()
  const primaryHover = shade(rgb(interpolateRainbow(RAINBOW_UI)), isDark ? 0.15 : 0.35).formatHex()
  const primaryFill = isDark
    ? shade(rgb(interpolateRainbow(RAINBOW_UI)), 0.60).formatHex()
    : tint(rgb(interpolateRainbow(RAINBOW_UI)), 0.75).formatHex()
  const scaleFill = isDark
    ? shade(rgb(interpolateRainbow(RAINBOW_SCALE)), 0.50).formatHex()
    : tint(rgb(interpolateRainbow(RAINBOW_SCALE)), 0.45).formatHex()
  const scaleBorder = isDark
    ? tint(rgb(interpolateRainbow(RAINBOW_SCALE)), 0.20).formatHex()
    : shade(rgb(interpolateRainbow(RAINBOW_SCALE)), 0.25).formatHex()
  const scaleText = isDark
    ? tint(rgb(interpolateRainbow(RAINBOW_SCALE)), 0.30).formatHex()
    : shade(rgb(interpolateRainbow(RAINBOW_SCALE)), 0.35).formatHex()
  const rootFill = tint(rgb(interpolateRainbow(RAINBOW_ROOT)), isDark ? 0.25 : 0.45).formatHex()
  const rootBorder = isDark
    ? tint(rgb(interpolateRainbow(RAINBOW_ROOT)), 0.20).formatHex()
    : shade(rgb(interpolateRainbow(RAINBOW_ROOT)), 0.25).formatHex()
  const grayText = isDark
    ? tint(LGRAY, 0.20).formatHex()
    : shade(LGRAY, 0.55).formatHex()
  const respelling = isDark
    ? tint(rgb(interpolateRainbow(RAINBOW_RESPELLING)), 0.30).formatHex()
    : shade(rgb(interpolateRainbow(RAINBOW_RESPELLING)), 0.40).formatHex()
  const rowBg = isDark ? "#1e1e24" : tint(LGRAY, 0.55).formatHex()
  const border = isDark
    ? "rgba(255,255,255,0.15)"
    : tint(LGRAY, 0.30).formatHex()
  const muted = isDark
    ? shade(LGRAY, 0.40).formatHex()
    : LGRAY.formatHex()

  return {
    // Original tokens
    primary,
    primaryHover,
    primaryFill,
    scaleFill,
    scaleBorder,
    scaleText,
    rootFill,
    rootBorder,
    grayText,
    respelling,
    rowBg,
    border,
    muted,

    // New semantic tokens
    pageBg: isDark ? "#111114" : "#ffffff",
    surfaceBase: isDark ? "#1e1e24" : "#ffffff",
    surfaceHover: isDark ? "#2a2a32" : "#f3f4f6",
    surfaceSubtle: isDark ? "#222228" : "#f9fafb",
    textPrimary: isDark ? "#e8e8ec" : "#1f2937",
    textSecondary: isDark ? "#c0c0c8" : "#374151",
    textTertiary: isDark ? "#8888a0" : "#6b7280",
    textMuted: isDark ? "#5a5a6e" : "#9ca3af",
    textDisabled: isDark ? "#3a3a44" : "#d1d5db",
    textOnSurface: "#000000",
    borderDefault: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
    borderHighlight: isDark ? "#ffffff" : "#000000",
    strokeHover: isDark ? "#ffffff" : "#000000",
    intervalLabelBg: isDark ? "#2a2a32" : "#ffffff",
    intervalLabelText: isDark ? "#ffffff" : "#000000",
    pillBg: "#F5F0E8",
    pillBorder: "#D5CFC5",
    hoverOverlay: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
  } as const
}

/** Light-mode colors for backwards compatibility with static imports. */
export const colors = buildColors("light")

/** Get the full color map for a given theme mode. */
export function getThemeColors(mode: ThemeMode) {
  return buildColors(mode)
}

/** Tailwind text color class for de-emphasized notes. */
export const MUTED_TEXT = "text-[var(--app-textTertiary)]"

/** 8 rainbow colors (7 degrees + octave), tinted to pastel for cell backgrounds. */
export function buildDegreeColors(mode: ThemeMode): RGBColor[] {
  return Array.from({ length: 8 }, (_, i) =>
    tint(rgb(interpolateRainbow(i / 8)), mode === "dark" ? 0.25 : 0.45)
  )
}

export const DEGREE_COLORS: RGBColor[] = buildDegreeColors("light")

/** Return the CSS variable reference for a given scale degree's background color. */
export function degreeColor(index: number): string {
  return `var(--app-degree${index % 8})`
}

/** Generate `count` scale-tone background hex colors as a subtle hue-varied band. */
export function scaleToneBand(count: number): string[] {
  return hueBand(RAINBOW_SCALE, count, 0.10, 0.45).map((c) => c.formatHex())
}

/** Register `--app-*` CSS custom properties on `:root`. Call once at startup before React renders. */
export function registerCssColors(mode: ThemeMode): void {
  const root = document.documentElement
  const themeColors = buildColors(mode)
  for (const [token, value] of Object.entries(themeColors)) {
    root.style.setProperty(`--app-${token}`, value)
  }

  // Degree colors
  const degColors = buildDegreeColors(mode)
  degColors.forEach((c, i) => {
    root.style.setProperty(`--app-degree${i}`, c.formatHex())
  })
}
