import { motion } from 'framer-motion'
import { orgColor, inferOrg } from './OrgColors'

export interface BenchmarkSummary {
  id: string
  title: string
  unit: string
  maxValue: number
  minValue?: number | null
  lastUpdated?: string | null
  topN: Array<{ label: string; value: number; org: string }>
}

interface HeroCardsProps {
  benchmarks: BenchmarkSummary[]
}

function formatHeroValue(v: number, unit: string) {
  if (unit === '%') return `${v.toFixed(1)}%`
  return `${Math.round(v)}`
}

export function HeroCards({ benchmarks }: HeroCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-12">
      {benchmarks.map((b, i) => {
        const winner = b.topN[0]
        if (!winner) return null
        const color = orgColor(inferOrg(winner.label, winner.org))
        const fillPct = ((winner.value - (b.minValue ?? 0)) / (b.maxValue - (b.minValue ?? 0))) * 100

        return (
          <motion.a
            key={b.id}
            href={`#${b.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/[0.12] transition-colors"
          >
            <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500 mb-1.5">
              {b.title}
            </p>
            <p className="text-sm font-semibold text-white truncate mb-0.5">
              {winner.label}
            </p>
            <p className="text-lg font-mono" style={{ color }}>
              {formatHeroValue(winner.value, b.unit)}
            </p>
            <div className="mt-2.5 h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min(fillPct, 100)}%` }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.06 }}
              />
            </div>
          </motion.a>
        )
      })}
    </div>
  )
}
