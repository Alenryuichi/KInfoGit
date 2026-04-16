import { motion } from 'framer-motion'
import type { StarsTrendSeries } from '@/lib/spec-tracker'

interface StarsTrendChartProps {
  series: StarsTrendSeries[]
}

const MARGIN = { top: 12, right: 120, bottom: 32, left: 52 }
const WIDTH = 600
const HEIGHT = 360
const INNER_W = WIDTH - MARGIN.left - MARGIN.right
const INNER_H = HEIGHT - MARGIN.top - MARGIN.bottom
const MAX_LINES = 8

const FRAMEWORK_COLORS: Record<string, string> = {
  'spec-kit': '#3B82F6',
  bmad: '#F97316',
  openspec: '#22C55E',
  gsd: '#8B5CF6',
  kiro: '#06B6D4',
  tessl: '#EC4899',
  'rulebook-ai': '#F59E0B',
  'awesome-cursorrules': '#EF4444',
}

const DEFAULT_COLOR = '#6B7280'

function formatDateLabel(dateStr: string): string {
  const [, m, d] = dateStr.split('-')
  return `${m}/${d}`
}

function formatStarsLabel(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return `${n}`
}

export function StarsTrendChart({ series }: StarsTrendChartProps) {
  const visibleSeries = series.slice(0, MAX_LINES)
  if (visibleSeries.length === 0) return null

  // Collect all unique dates
  const dateSet = new Set<string>()
  for (const s of visibleSeries) {
    for (const pt of s.points) {
      dateSet.add(pt.date)
    }
  }
  const allDates = Array.from(dateSet).sort()
  if (allDates.length < 3) return null

  // X scale
  const dateCount = allDates.length
  const xScale = (i: number) =>
    MARGIN.left + (dateCount === 1 ? INNER_W / 2 : (i / (dateCount - 1)) * INNER_W)
  const dateIndex = new Map(allDates.map((d, i) => [d, i]))

  // Y domain
  let minVal = Infinity
  let maxVal = -Infinity
  for (const s of visibleSeries) {
    for (const pt of s.points) {
      if (pt.stars < minVal) minVal = pt.stars
      if (pt.stars > maxVal) maxVal = pt.stars
    }
  }
  const range = maxVal - minVal || 1000
  const yMin = Math.floor((minVal - range * 0.08) / 1000) * 1000
  const yMax = Math.ceil((maxVal + range * 0.08) / 1000) * 1000
  const yScale = (v: number) => MARGIN.top + INNER_H - ((v - yMin) / (yMax - yMin)) * INNER_H

  // Build paths
  const orgPaths = visibleSeries.map(({ id, name, points }, rank) => {
    const segments: string[] = []
    let lastX = 0
    let lastY = 0
    let lastStars = 0

    for (const pt of points) {
      const idx = dateIndex.get(pt.date)
      if (idx === undefined) continue
      const x = xScale(idx)
      const y = yScale(pt.stars)
      lastX = x
      lastY = y
      lastStars = pt.stars

      if (segments.length === 0) {
        segments.push(`M${x},${y}`)
      } else {
        segments.push(`L${x},${y}`)
      }
    }

    return { id, name, d: segments.join(' '), lastX, lastY, lastStars, rank }
  })

  // Y ticks
  const tickStep = Math.max(1000, Math.round((yMax - yMin) / 5 / 1000) * 1000)
  const yTicks: number[] = []
  for (let v = Math.ceil(yMin / tickStep) * tickStep; v <= yMax; v += tickStep) {
    yTicks.push(v)
  }

  // X ticks
  const maxXTicks = Math.min(8, dateCount)
  const xTickIndices: number[] = []
  if (dateCount <= maxXTicks) {
    for (let i = 0; i < dateCount; i++) xTickIndices.push(i)
  } else {
    for (let i = 0; i < maxXTicks; i++) {
      xTickIndices.push(Math.round((i / (maxXTicks - 1)) * (dateCount - 1)))
    }
  }

  // Resolve right-side label positions
  const LABEL_MIN_GAP = 12
  const resolvedLabels = resolveOverlap(
    orgPaths.map(p => ({ id: p.id, y: p.lastY, stars: p.lastStars })),
    LABEL_MIN_GAP,
  )

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        className="overflow-visible"
      >
        {/* Grid lines */}
        {yTicks.map((tick, i) => (
          <line
            key={`grid-${i}`}
            x1={MARGIN.left}
            x2={WIDTH - MARGIN.right}
            y1={yScale(tick)}
            y2={yScale(tick)}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={0.5}
          />
        ))}

        {/* Y-axis labels */}
        {yTicks.map((tick, i) => (
          <text
            key={`ytick-${i}`}
            x={MARGIN.left - 6}
            y={yScale(tick)}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-gray-500"
            fontSize={10}
          >
            {formatStarsLabel(tick)}
          </text>
        ))}

        {/* X-axis labels */}
        {xTickIndices.map(idx => (
          <text
            key={`xtick-${idx}`}
            x={xScale(idx)}
            y={HEIGHT - 4}
            textAnchor="middle"
            className="fill-gray-500"
            fontSize={10}
          >
            {formatDateLabel(allDates[idx])}
          </text>
        ))}

        {/* Axis lines */}
        <line
          x1={MARGIN.left}
          x2={WIDTH - MARGIN.right}
          y1={HEIGHT - MARGIN.bottom}
          y2={HEIGHT - MARGIN.bottom}
          stroke="#4B5563"
          strokeWidth={0.5}
        />
        <line
          x1={MARGIN.left}
          x2={MARGIN.left}
          y1={MARGIN.top}
          y2={HEIGHT - MARGIN.bottom}
          stroke="#4B5563"
          strokeWidth={0.5}
        />

        {/* Lines — top 3 bolder */}
        {orgPaths.map(({ id, d, rank }, i) => {
          if (!d) return null
          const color = FRAMEWORK_COLORS[id] ?? DEFAULT_COLOR
          const isTop3 = rank < 3
          return (
            <motion.path
              key={id}
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={isTop3 ? 2.5 : 1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={isTop3 ? 1 : 0.7}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
            />
          )
        })}

        {/* Endpoint dots + right-side labels */}
        {orgPaths.map(({ id, name, lastX, lastStars, rank }) => {
          const color = FRAMEWORK_COLORS[id] ?? DEFAULT_COLOR
          const label = resolvedLabels.find(l => l.id === id)
          if (!label) return null
          const dotY = yScale(lastStars)
          return (
            <g key={`label-${id}`}>
              <circle cx={lastX} cy={dotY} r={3} fill={color} />
              {Math.abs(dotY - label.resolvedY) > 2 && (
                <line
                  x1={lastX + 4}
                  y1={dotY}
                  x2={lastX + 10}
                  y2={label.resolvedY}
                  stroke={color}
                  strokeWidth={0.5}
                  opacity={0.4}
                />
              )}
              <text
                x={lastX + 12}
                y={label.resolvedY}
                dominantBaseline="middle"
                fontSize={rank < 3 ? 10 : 9}
                fontWeight={rank < 3 ? 600 : 400}
                fill={color}
              >
                {name} ({formatStarsLabel(lastStars)})
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function resolveOverlap(
  labels: Array<{ id: string; y: number; stars: number }>,
  minGap: number,
): Array<{ id: string; resolvedY: number }> {
  const sorted = [...labels].sort((a, b) => a.y - b.y)
  const resolved: Array<{ id: string; resolvedY: number }> = []

  let prevY = -Infinity
  for (const { id, y } of sorted) {
    const resolvedY = Math.max(y, prevY + minGap)
    resolved.push({ id, resolvedY })
    prevY = resolvedY
  }

  return resolved
}
