import { motion } from 'framer-motion'
import type { SpecFramework } from '@/lib/spec-tracker'

interface SpecHeroCardsProps {
  frameworks: SpecFramework[]
}

function formatStars(n: number): string {
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

export function SpecHeroCards({ frameworks }: SpecHeroCardsProps) {
  // Top 4 by stars
  const top4 = frameworks
    .filter(f => f.github?.stars)
    .sort((a, b) => (b.github?.stars ?? 0) - (a.github?.stars ?? 0))
    .slice(0, 4)

  if (top4.length === 0) return null

  const maxStars = top4[0]?.github?.stars ?? 1

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-12">
      {top4.map((fw, i) => {
        const stars = fw.github?.stars ?? 0
        const fillPct = (stars / maxStars) * 100
        const color = CATEGORY_COLORS[fw.category] ?? '#6B7280'
        const version = fw.github?.latestRelease?.tag ?? fw.npm?.latestVersion

        return (
          <motion.a
            key={fw.id}
            href={fw.website}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/[0.12] transition-colors"
          >
            <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500 mb-1.5">
              {fw.category.replace('-', ' ')}
            </p>
            <p className="text-sm font-semibold text-white truncate mb-0.5">
              {fw.name}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-mono" style={{ color }}>
                {formatStars(stars)} ★
              </p>
              {version && (
                <p className="text-xs text-gray-500 truncate">{version}</p>
              )}
            </div>
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
