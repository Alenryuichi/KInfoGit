import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticProps } from 'next'
import { getLatestBenchmarks, getOrgTrendData, type BenchmarkData, type OrgTrendSeries } from '@/lib/code-weekly'
import {
  ArenaRankingTable,
  AiderLeaderboardTable,
  SweBenchTable,
  LiveCodeBenchTable,
} from '@/components/code-weekly/BenchmarkTable'
import { HeroCards, type BenchmarkSummary } from '@/components/code-weekly/charts/HeroCards'
import { BenchmarkSection } from '@/components/code-weekly/charts/BenchmarkSection'
import { OrgTrendChart } from '@/components/code-weekly/charts/OrgTrendChart'

interface BenchmarksPageProps {
  benchmarks: BenchmarkData | null
  summaries: BenchmarkSummary[]
  orgTrend: OrgTrendSeries[]
  formattedDate: string | null
}

function buildSummaries(b: BenchmarkData): BenchmarkSummary[] {
  const summaries: BenchmarkSummary[] = []

  const push = (
    id: string, title: string, unit: string, maxValue: number,
    topN: BenchmarkSummary['topN'],
    opts?: { minValue?: number | null; lastUpdated?: string | null }
  ) => {
    if (topN.length === 0) return
    summaries.push({
      id, title, unit, maxValue,
      minValue: opts?.minValue ?? null,
      lastUpdated: opts?.lastUpdated ?? null,
      topN,
    })
  }

  push('arena-coding', 'Arena Coding', 'Elo', 1600,
    b.arenaRanking.slice(0, 10).map(e => ({ label: e.model, value: e.elo, org: e.org })),
    { minValue: 1250, lastUpdated: b.arenaPublishDate },
  )

  push('swe-bench', 'SWE-bench', '%', 100,
    (b.sweBench ?? []).slice(0, 10).map(e => ({ label: e.model, value: e.resolved, org: e.org || '' })),
    { lastUpdated: b.sweBenchLastUpdated },
  )

  push('aider', 'Aider', '%', 100,
    b.aiderLeaderboard.slice(0, 10).map(e => ({ label: e.model, value: e.passRate, org: '' })),
    { lastUpdated: b.aiderLastUpdated },
  )

  push('livecodebench', 'LiveCodeBench', '%', 100,
    (b.liveCodeBench ?? []).slice(0, 10).map(e => ({ label: e.model, value: e.passRate, org: '' })),
    { lastUpdated: b.liveCodeBenchLastUpdated },
  )

  return summaries
}

export const getStaticProps: GetStaticProps<BenchmarksPageProps> = async () => {
  const raw = getLatestBenchmarks()
  // JSON roundtrip to convert undefined → removed (Next.js SSG rejects undefined)
  const benchmarks: BenchmarkData | null = raw ? JSON.parse(JSON.stringify(raw)) : null
  const summaries = benchmarks ? JSON.parse(JSON.stringify(buildSummaries(benchmarks))) : []
  const orgTrend: OrgTrendSeries[] = JSON.parse(JSON.stringify(getOrgTrendData()))
  const formattedDate = benchmarks?.updatedAt
    ? new Date(benchmarks.updatedAt).toISOString().slice(0, 10)
    : null
  return { props: { benchmarks, summaries, orgTrend, formattedDate } }
}

const SECTION_META: Record<string, { description: string }> = {
  'arena-coding': { description: '基于用户投票的代码能力 Elo 排名 · arena.ai/leaderboard/webdev' },
  'swe-bench': { description: '真实 GitHub issue 修复能力 · swebench.com' },
  'aider': { description: '代码编辑通过率 · aider.chat' },
  'livecodebench': { description: '竞赛编程（LeetCode / Codeforces）· livecodebench.github.io' },
}

export default function BenchmarksPage({ benchmarks, summaries, orgTrend, formattedDate }: BenchmarksPageProps) {
  if (!benchmarks) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-500 text-lg">暂无评测数据，请稍后再来。</p>
      </div>
    )
  }

  // Map benchmark id → table component
  const tables: Record<string, React.ReactNode> = {
    'arena-coding': <ArenaRankingTable rankings={benchmarks.arenaRanking} />,
    'aider': <AiderLeaderboardTable entries={benchmarks.aiderLeaderboard} />,
    'swe-bench': benchmarks.sweBench ? <SweBenchTable entries={benchmarks.sweBench} /> : null,
    'livecodebench': benchmarks.liveCodeBench ? <LiveCodeBenchTable entries={benchmarks.liveCodeBench} /> : null,
  }

  return (
    <>
      <Head>
        <title>Coding Benchmarks — Code Weekly — Kylin Miao</title>
        <meta name="description" content="AI coding benchmark rankings: Arena Coding, SWE-bench, Aider, LiveCodeBench." />
      </Head>

      <div className="min-h-screen bg-black text-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 pt-32 pb-20">
          {/* Back */}
          <Link
            href="/code/"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors group mb-8"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Code Weekly
          </Link>

          {/* Header */}
          <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Coding Benchmarks</h1>
          <p className="text-gray-400 text-lg mb-4">
            AI 模型代码能力评测排名
          </p>

          {formattedDate && (
            <p className="text-xs text-gray-600 mb-10">
              数据采集: {formattedDate}
              {benchmarks.arenaPublishDate && (
                <span className="ml-3">· Arena 数据: {benchmarks.arenaPublishDate}</span>
              )}
            </p>
          )}

          {/* Hero cards */}
          <HeroCards benchmarks={summaries} />

          {/* Org Trend — Arms Race */}
          {orgTrend.length > 0 && (
            <div className="mb-14">
              <h2 className="text-xl font-semibold text-gray-200 mb-1">Arms Race</h2>
              <p className="text-sm text-gray-500 mb-4">
                各厂商最强模型的 Arena Coding Elo 趋势 · 每日更新
              </p>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <OrgTrendChart series={orgTrend} />
              </div>
            </div>
          )}

          {/* Benchmark sections */}
          <div className="space-y-14">
            {summaries.map(s => (
              <BenchmarkSection
                key={s.id}
                benchmark={s}
                description={SECTION_META[s.id]?.description || ''}
                tableContent={tables[s.id]}
              />
            ))}

            {/* Notable */}
            {benchmarks.notable && benchmarks.notable !== 'No significant changes' && (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Notable Changes</h3>
                <p className="text-sm text-gray-400">{benchmarks.notable}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-6 mt-12 border-t border-white/[0.06] text-xs text-gray-500">
            每日自动更新 · Arena · SWE-bench · Aider · LiveCodeBench
          </div>
        </div>
      </div>
    </>
  )
}
