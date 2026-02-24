export type IntervalLabelProps = {
  x: number,
  y: number,
  children: React.ReactNode,
}

export default function IntervalLabel({ x, y, children }: IntervalLabelProps) {
  return (
    <g>
      <rect
        x={x - 14}
        y={y - 8}
        width="28"
        height="16"
        rx="4"
        fill="#000000"
      />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fill="#ffffff"
        fontSize="9"
        fontWeight="600"
        fontFamily="Inter, system-ui, sans-serif"
      >
        {children}
      </text>
    </g>
  )
}
