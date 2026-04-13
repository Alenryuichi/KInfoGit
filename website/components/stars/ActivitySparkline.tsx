interface ActivitySparklineProps {
  data: number[]
  width?: number
  height?: number
}

export function ActivitySparkline({ data, width = 200, height = 40 }: ActivitySparklineProps) {
  if (!data || data.length === 0) return null

  const max = Math.max(...data, 1)
  const padding = 2
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  const points = data.map((value, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth
    const y = padding + chartHeight - (value / max) * chartHeight
    return `${x},${y}`
  }).join(' ')

  // Create filled area path
  const firstX = padding
  const lastX = padding + chartWidth
  const baseline = padding + chartHeight
  const areaPoints = `${firstX},${baseline} ${points} ${lastX},${baseline}`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="inline-block"
    >
      <defs>
        <linearGradient id="sparkline-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(147, 130, 255, 0.3)" />
          <stop offset="100%" stopColor="rgba(147, 130, 255, 0)" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill="url(#sparkline-gradient)"
      />
      <polyline
        points={points}
        fill="none"
        stroke="rgba(147, 130, 255, 0.8)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
