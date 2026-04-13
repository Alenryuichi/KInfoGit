import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HorizontalBarChart } from './HorizontalBarChart'
import type { BenchmarkSummary } from './HeroCards'

interface BenchmarkSectionProps {
  benchmark: BenchmarkSummary
  description: string
  tableContent: React.ReactNode
}

export function BenchmarkSection({ benchmark, description, tableContent }: BenchmarkSectionProps) {
  const [view, setView] = useState<'chart' | 'table'>('chart')

  return (
    <section id={benchmark.id} className="scroll-mt-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-gray-200">{benchmark.title}</h2>
        <div role="group" aria-label="View mode" className="flex gap-0.5 rounded-lg bg-white/[0.03] border border-white/[0.06] p-0.5 text-xs">
          <button
            aria-pressed={view === 'chart'}
            onClick={() => setView('chart')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              view === 'chart'
                ? 'bg-white/[0.08] text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Chart
          </button>
          <button
            aria-pressed={view === 'table'}
            onClick={() => setView('table')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              view === 'table'
                ? 'bg-white/[0.08] text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Table
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        {description}
        {benchmark.lastUpdated && (
          <span className="ml-2 text-xs text-gray-600">· 数据更新: {benchmark.lastUpdated}</span>
        )}
      </p>

      {/* Content */}
      <AnimatePresence mode="wait">
        {view === 'chart' ? (
          <motion.div
            key="chart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <HorizontalBarChart
              data={benchmark.topN}
              maxValue={benchmark.maxValue}
              minValue={benchmark.minValue ?? undefined}
              unit={benchmark.unit}
            />
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {tableContent}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
