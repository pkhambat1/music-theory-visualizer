export interface LineCoords {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const DEFAULT_TENSION = 0.45;

/**
 * Build a cubic-bezier SVG path string that travels vertically first
 * before bending horizontally toward the target.
 */
export function buildSplinePath(
  line: LineCoords,
  tension: number = DEFAULT_TENSION,
): string {
  const dy = line.y2 - line.y1;
  const c1x = line.x1;
  const c1y = line.y1 + dy * tension;
  const c2x = line.x2;
  const c2y = line.y2 - dy * tension;
  return `M ${line.x1} ${line.y1} C ${c1x} ${c1y} ${c2x} ${c2y} ${line.x2} ${line.y2}`;
}
