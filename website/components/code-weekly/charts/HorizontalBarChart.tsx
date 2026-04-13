import { motion } from 'framer-motion'
import { orgColor, inferOrg } from './OrgColors'

export interface BarDatum {
  label: string
  value: number
  org: string
}

interface HorizontalBarChartProps {
  data: BarDatum[]
  maxValue: number
  minValue?: number
  unit?: string
}

function formatValue(v: number, unit: string) {
  if (unit === '%') return `${v.toFixed(1)}%`
  return `${Math.round(v)}`
}

export function HorizontalBarChart({
  data,
  maxValue,
  minValue = 0,
  unit = '',
}: HorizontalBarChartProps) {
  const effectiveMax = maxValue - minValue

  return (
    <div className="space-y-3">
      {data.map((d, i) => {
        const pct = Math.max(1, ((d.value - minValue) / effectiveMax) * 100)
        const color = orgColor(inferOrg(d.label, d.org))

        return (
          <div key={`${d.label}-${i}`}>
            {/* Label row: rank + model name + score */}
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-sm text-gray-300 truncate mr-3">
                <span className="text-gray-500 font-mono mr-1.5">{i + 1}.</span>
                {d.label}
              </span>
              <span className="text-sm font-mono text-white flex-shrink-0">
                {formatValue(d.value, unit)}
              </span>
            </div>
            {/* Bar */}
            <div className="h-5 rounded bg-white/[0.04] overflow-hidden">
              <motion.div
                className="h-full rounded"
                style={{ backgroundColor: color }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: i * 0.04, ease: 'easeOut' }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
