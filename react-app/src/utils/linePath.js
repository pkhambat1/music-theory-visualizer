const DEFAULT_TENSION = 0.45;

// Build a cubic bezier path with more vertical travel before horizontal bend.
export const buildSplinePath = (line, tension = DEFAULT_TENSION) => {
  const dy = line.y2 - line.y1;
  const c1x = line.x1;
  const c1y = line.y1 + dy * tension;
  const c2x = line.x2;
  const c2y = line.y2 - dy * tension;
  return `M ${line.x1} ${line.y1} C ${c1x} ${c1y} ${c2x} ${c2y} ${line.x2} ${line.y2}`;
};

export default buildSplinePath;
