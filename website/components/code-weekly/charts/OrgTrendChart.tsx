import { motion } from 'framer-motion'
import { orgColor } from './OrgColors'
import type { OrgTrendSeries } from '@/lib/code-weekly'

interface OrgTrendChartProps {
  series: OrgTrendSeries[]
}

// Chart layout — extra right margin for labels
const MARGIN = { top: 12, right: 120, bottom: 32, left: 44 }
const WIDTH = 600
const HEIGHT = 360
const INNER_W = WIDTH - MARGIN.left - MARGIN.right
const INNER_H = HEIGHT - MARGIN.top - MARGIN.bottom
const MAX_ORGS = 10

function formatDateLabel(dateStr: string): string {
  const [, m, d] = dateStr.split('-')
  return `${m}/${d}`
}

export function OrgTrendChart({ series }: OrgTrendChartProps) {
  const visibleSeries = series.slice(0, MAX_ORGS)
  if (visibleSeries.length === 0) return null

  // Collect all unique dates
  const dateSet = new Set<string>()
  for (const s of visibleSeries) {
    for (const pt of s.points) {
      dateSet.add(pt.date)
    }
  }
  const allDates = Array.from(dateSet).sort()
  if (allDates.length === 0) return null

  // X scale
  const dateCount = allDates.length
  const xScale = (i: number) =>
    MARGIN.left + (dateCount === 1 ? INNER_W / 2 : (i / (dateCount - 1)) * INNER_W)
  const dateIndex = new Map(allDates.map((d, i) => [d, i]))

  // Y domain from data with padding
  let minElo = Infinity
  let maxElo = -Infinity
  for (const s of visibleSeries) {
    for (const pt of s.points) {
      if (pt.score < minElo) minElo = pt.score
      if (pt.score > maxElo) maxElo = pt.score
    }
  }
  const eloRange = maxElo - minElo || 100
  const yMin = Math.floor((minElo - eloRange * 0.08) / 10) * 10
  const yMax = Math.ceil((maxElo + eloRange * 0.08) / 10) * 10
  const yScale = (v: number) => MARGIN.top + INNER_H - ((v - yMin) / (yMax - yMin)) * INNER_H

  // Build paths per org + track last point for labels
  const orgPaths = visibleSeries.map(({ org, points }, rank) => {
    const segments: string[] = []
    let lastX = 0
    let lastY = 0
    let lastScore = 0

    for (const pt of points) {
      const idx = dateIndex.get(pt.date)
      if (idx === undefined) continue
      const x = xScale(idx)
      const y = yScale(pt.score)
      lastX = x
      lastY = y
      lastScore = pt.score

      if (segments.length === 0) {
        segments.push(`M${x},${y}`)
      } else {
        segments.push(`L${x},${y}`)
      }
    }

    return { org, d: segments.join(' '), lastX, lastY, lastScore, rank }
  })

  // Y ticks
  const tickStep = Math.max(10, Math.round((yMax - yMin) / 5 / 10) * 10)
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

  // Resolve right-side label positions to avoid overlapping
  const LABEL_MIN_GAP = 12 // min vertical pixels between labels
  const resolvedLabels = resolveOverlap(
    orgPaths.map(p => ({ org: p.org, y: p.lastY, score: p.lastScore })),
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
            {tick}
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

        {/* Org lines — top 3 bolder */}
        {orgPaths.map(({ org, d, rank }, i) => {
          if (!d) return null
          const color = orgColor(org)
          const isTop3 = rank < 3
          return (
            <motion.path
              key={org}
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
        {orgPaths.map(({ org, lastX, lastScore, rank }) => {
          const color = orgColor(org)
          const label = resolvedLabels.find(l => l.org === org)
          if (!label) return null
          const dotY = yScale(lastScore)
          return (
            <g key={`label-${org}`}>
              <circle cx={lastX} cy={dotY} r={3} fill={color} />
              {/* Connector line from dot to label if they diverged */}
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
                {org} ({Math.round(lastScore)})
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/** Push overlapping right-side labels apart vertically */
function resolveOverlap(
  labels: Array<{ org: string; y: number; score: number }>,
  minGap: number,
): Array<{ org: string; resolvedY: number }> {
  // Sort by Y position (top to bottom)
  const sorted = [...labels].sort((a, b) => a.y - b.y)
  const resolved: Array<{ org: string; resolvedY: number }> = []

  let prevY = -Infinity
  for (const { org, y } of sorted) {
    const resolvedY = Math.max(y, prevY + minGap)
    resolved.push({ org, resolvedY })
    prevY = resolvedY
  }

  return resolved
}
