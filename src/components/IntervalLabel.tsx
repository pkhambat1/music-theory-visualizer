export type IntervalLabelProps = {
  x: number,
  y: number,
  children: React.ReactNode,
}

export default function IntervalLabel({ x, y, children }: IntervalLabelProps) {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={8}
        fill="#ffffff"
      />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fill="#000000"
        fontSize="11"
        fontWeight="600"
        fontFamily="Inter, system-ui, sans-serif"
      >
        {children}
      </text>
    </g>
  )
}
