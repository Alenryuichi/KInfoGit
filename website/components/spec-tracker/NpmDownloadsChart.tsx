import { motion } from 'framer-motion'
import type { SpecFramework } from '@/lib/spec-tracker'

interface NpmDownloadsChartProps {
  frameworks: SpecFramework[]
}

function formatDownloads(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return `${n}`
}

const CATEGORY_COLORS: Record<string, string> = {
  toolkit: '#3B82F6',
  'agent-framework': '#F97316',
  ide: '#22C55E',
  platform: '#8B5CF6',
  rules: '#EC4899',
}

export function NpmDownloadsChart({ frameworks }: NpmDownloadsChartProps) {
  const withNpm = frameworks
    .filter(f => f.npm && f.npm.weeklyDownloads > 0)
    .sort((a, b) => (b.npm?.weeklyDownloads ?? 0) - (a.npm?.weeklyDownloads ?? 0))

  if (withNpm.length === 0) return null

  const maxDownloads = withNpm[0]?.npm?.weeklyDownloads ?? 1

  return (
    <div className="space-y-3">
      {withNpm.map((fw, i) => {
        const downloads = fw.npm?.weeklyDownloads ?? 0
        const pct = Math.max(1, (downloads / maxDownloads) * 100)
        const color = CATEGORY_COLORS[fw.category] ?? '#6B7280'

        return (
          <div key={fw.id}>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-sm text-gray-300 truncate mr-3">
                <span className="text-gray-500 font-mono mr-1.5">{i + 1}.</span>
                {fw.npm?.package ?? fw.name}
              </span>
              <span className="text-sm font-mono text-white flex-shrink-0">
                {formatDownloads(downloads)}/wk
              </span>
            </div>
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
