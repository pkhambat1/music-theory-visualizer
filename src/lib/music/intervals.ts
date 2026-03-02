const INTERVAL_DEGREE_LABELS: Record<number, string> = {
  0: "1",
  1: "♭2",
  2: "2",
  3: "♭3",
  4: "3",
  5: "4",
  6: "♭5",
  7: "5",
  8: "♭6",
  9: "6",
  10: "♭7",
  11: "7",
  12: "8",
  13: "♭9",
  14: "9",
  15: "♯9",
  16: "♭11",
  17: "11",
  18: "♯11",
  19: "♭13",
  20: "13",
  21: "♯13",
}

/**
 * Normalize negative semitones to 0–11 before lookup. Negative values occur when a
 * chord tone (e.g. in a slash chord voicing) appears in a lower octave than the
 * chord root. We display the pitch-class interval (e.g. -6 → ♭5) rather than "-6".
 * Non-negative values are passed through to preserve compound intervals (♭9, 13, etc.).
 */
export function getIntervalLabel(semitones: number): string {
  const normalized =
    semitones < 0 ? ((semitones % 12) + 12) % 12 : semitones
  return INTERVAL_DEGREE_LABELS[normalized] ?? String(normalized)
}
