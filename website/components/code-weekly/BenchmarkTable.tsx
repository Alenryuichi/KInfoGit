import { useState } from 'react'
import type {
  ArenaRanking,
  AiderLeaderboardEntry,
  SweBenchEntry,
  BigCodeBenchEntry,
  EvalPlusEntry,
  LiveCodeBenchEntry,
} from '@/lib/code-weekly'

interface ArenaTableProps {
  rankings: ArenaRanking[]
  defaultVisible?: number
}

interface AiderTableProps {
  entries: AiderLeaderboardEntry[]
  defaultVisible?: number
}

function DeltaCell({ delta }: { delta: number | null }) {
  if (delta === null || delta === undefined) {
    return <span className="text-gray-600">—</span>
  }
  if (delta > 0) {
    return <span className="text-emerald-400">+{delta}</span>
  }
  if (delta < 0) {
    return <span className="text-red-400">{delta}</span>
  }
  return <span className="text-gray-500">0</span>
}

export function ArenaRankingTable({ rankings, defaultVisible = 10 }: ArenaTableProps) {
  const [showAll, setShowAll] = useState(false)

  if (rankings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        暂无 Chatbot Arena 数据
      </div>
    )
  }

  const visible = showAll ? rankings : rankings.slice(0, defaultVisible)
  const hasMore = rankings.length > defaultVisible

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="sr-only">Chatbot Arena Rankings</caption>
        <thead>
          <tr className="border-b border-white/[0.08] text-xs text-gray-500 uppercase tracking-wider">
            <th className="text-left py-3 px-3 w-12">#</th>
            <th className="text-left py-3 px-3">Model</th>
            <th className="text-right py-3 px-3">Elo</th>
            <th className="text-right py-3 px-3 w-20">Δ</th>
            <th className="text-left py-3 px-3">Org</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((entry, i) => (
            <tr
              key={`${entry.model}-${i}`}
              className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
            >
              <td className="py-3 px-3 text-gray-500 font-mono">{entry.rank}</td>
              <td className="py-3 px-3 text-gray-200 font-medium">{entry.model}</td>
              <td className="py-3 px-3 text-right text-gray-300 font-mono">{entry.elo}</td>
              <td className="py-3 px-3 text-right font-mono text-xs">
                <DeltaCell delta={entry.delta} />
              </td>
              <td className="py-3 px-3 text-gray-500">{entry.org}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          {showAll ? '收起' : `显示全部 ${rankings.length} 个模型`}
        </button>
      )}
    </div>
  )
}

export function AiderLeaderboardTable({ entries, defaultVisible = 10 }: AiderTableProps) {
  const [showAll, setShowAll] = useState(false)

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        暂无 Aider Leaderboard 数据
      </div>
    )
  }

  const visible = showAll ? entries : entries.slice(0, defaultVisible)
  const hasMore = entries.length > defaultVisible

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="sr-only">Aider Code Editing Leaderboard</caption>
        <thead>
          <tr className="border-b border-white/[0.08] text-xs text-gray-500 uppercase tracking-wider">
            <th className="text-left py-3 px-3">Model</th>
            <th className="text-right py-3 px-3">Pass Rate</th>
            <th className="text-right py-3 px-3 w-20">Δ</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((entry, i) => (
            <tr
              key={`${entry.model}-${i}`}
              className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
            >
              <td className="py-3 px-3 text-gray-200 font-medium">{entry.model}</td>
              <td className="py-3 px-3 text-right text-gray-300 font-mono">{entry.passRate}%</td>
              <td className="py-3 px-3 text-right font-mono text-xs">
                <DeltaCell delta={entry.delta} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          {showAll ? '收起' : `显示全部 ${entries.length} 个模型`}
        </button>
      )}
    </div>
  )
}

// ─── Generic simple table for extra benchmarks ─────────────

interface SimpleTableProps<T> {
  data: T[]
  columns: Array<{ key: keyof T; label: string; align?: 'left' | 'right'; format?: (v: unknown) => string }>
  caption: string
  defaultVisible?: number
  emptyText?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SimpleTable<T extends Record<string, any>>({
  data, columns, caption, defaultVisible = 10, emptyText = '暂无数据',
}: SimpleTableProps<T>) {
  const [showAll, setShowAll] = useState(false)

  if (data.length === 0) {
    return <div className="text-center py-12 text-gray-500">{emptyText}</div>
  }

  const visible = showAll ? data : data.slice(0, defaultVisible)
  const hasMore = data.length > defaultVisible

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-white/[0.08] text-xs text-gray-500 uppercase tracking-wider">
            {columns.map(col => (
              <th key={String(col.key)} className={`py-3 px-3 ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((row, i) => (
            <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
              {columns.map(col => (
                <td key={String(col.key)} className={`py-3 px-3 ${col.align === 'right' ? 'text-right font-mono text-gray-300' : 'text-gray-200 font-medium'}`}>
                  {col.format ? col.format(row[col.key]) : String(row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          {showAll ? '收起' : `显示全部 ${data.length} 个模型`}
        </button>
      )}
    </div>
  )
}

export function SweBenchTable({ entries }: { entries: SweBenchEntry[] }) {
  return (
    <SimpleTable
      data={entries}
      caption="SWE-bench Verified Leaderboard"
      columns={[
        { key: 'model', label: 'Model' },
        { key: 'resolved', label: 'Resolved %', align: 'right', format: v => `${v}%` },
        { key: 'org', label: 'Org' },
      ]}
      emptyText="暂无 SWE-bench 数据"
    />
  )
}

export function BigCodeBenchTable({ entries }: { entries: BigCodeBenchEntry[] }) {
  return (
    <SimpleTable
      data={entries}
      caption="BigCodeBench Leaderboard"
      columns={[
        { key: 'model', label: 'Model' },
        { key: 'passRate', label: 'Instruct Pass@1', align: 'right', format: v => `${v}` },
        { key: 'completeRate', label: 'Complete Pass@1', align: 'right', format: v => `${v}` },
      ]}
      emptyText="暂无 BigCodeBench 数据"
    />
  )
}

export function EvalPlusTable({ entries }: { entries: EvalPlusEntry[] }) {
  return (
    <SimpleTable
      data={entries}
      caption="EvalPlus (HumanEval+ / MBPP+) Leaderboard"
      columns={[
        { key: 'model', label: 'Model' },
        { key: 'humanEvalPlus', label: 'HumanEval+', align: 'right', format: v => `${v}` },
        { key: 'mbppPlus', label: 'MBPP+', align: 'right', format: v => `${v}` },
        { key: 'average', label: 'Avg', align: 'right', format: v => `${v}` },
      ]}
      emptyText="暂无 EvalPlus 数据"
    />
  )
}

export function LiveCodeBenchTable({ entries }: { entries: LiveCodeBenchEntry[] }) {
  return (
    <SimpleTable
      data={entries}
      caption="LiveCodeBench Leaderboard"
      columns={[
        { key: 'model', label: 'Model' },
        { key: 'passRate', label: 'Pass@1', align: 'right', format: v => `${Number(v).toFixed(1)}%` },
        { key: 'easy', label: 'Easy', align: 'right', format: v => v != null ? `${Number(v).toFixed(1)}%` : '—' },
        { key: 'medium', label: 'Med', align: 'right', format: v => v != null ? `${Number(v).toFixed(1)}%` : '—' },
        { key: 'hard', label: 'Hard', align: 'right', format: v => v != null ? `${Number(v).toFixed(1)}%` : '—' },
      ]}
      emptyText="暂无 LiveCodeBench 数据"
    />
  )
}
