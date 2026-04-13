import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticProps } from 'next'
import { getLatestBenchmarks, type BenchmarkData } from '@/lib/code-weekly'
import {
  ArenaRankingTable,
  AiderLeaderboardTable,
  SweBenchTable,
  BigCodeBenchTable,
  EvalPlusTable,
  LiveCodeBenchTable,
} from '@/components/code-weekly/BenchmarkTable'
import { HeroCards, type BenchmarkSummary } from '@/components/code-weekly/charts/HeroCards'
import { BenchmarkSection } from '@/components/code-weekly/charts/BenchmarkSection'

interface BenchmarksPageProps {
  benchmarks: BenchmarkData | null
  summaries: BenchmarkSummary[]
  formattedDate: string | null
}

function buildSummaries(b: BenchmarkData): BenchmarkSummary[] {
  const summaries: BenchmarkSummary[] = []

  if (b.arenaRanking.length > 0) {
    summaries.push({
      id: 'arena-coding',
      title: 'Arena Coding',
      unit: 'Elo',
      maxValue: 1600,
      minValue: 1250,
      topN: b.arenaRanking.slice(0, 10).map(e => ({
        label: e.model, value: e.elo, org: e.org,
      })),
    })
  }

  if (b.sweBench && b.sweBench.length > 0) {
    summaries.push({
      id: 'swe-bench',
      title: 'SWE-bench',
      unit: '%',
      maxValue: 100,
      topN: b.sweBench.slice(0, 10).map(e => ({
        label: e.model, value: e.resolved, org: e.org || '',
      })),
    })
  }

  if (b.aiderLeaderboard.length > 0) {
    summaries.push({
      id: 'aider',
      title: 'Aider',
      unit: '%',
      maxValue: 100,
      topN: b.aiderLeaderboard.slice(0, 10).map(e => ({
        label: e.model, value: e.passRate, org: '',
      })),
    })
  }

  if (b.liveCodeBench && b.liveCodeBench.length > 0) {
    summaries.push({
      id: 'livecodebench',
      title: 'LiveCodeBench',
      unit: '%',
      maxValue: 100,
      topN: b.liveCodeBench.slice(0, 10).map(e => ({
        label: e.model, value: e.passRate, org: '',
      })),
    })
  }

  if (b.bigCodeBench && b.bigCodeBench.length > 0) {
    summaries.push({
      id: 'bigcodebench',
      title: 'BigCodeBench',
      unit: '%',
      maxValue: 100,
      topN: b.bigCodeBench.slice(0, 10).map(e => ({
        label: e.model, value: e.passRate, org: '',
      })),
    })
  }

  if (b.evalPlus && b.evalPlus.length > 0) {
    summaries.push({
      id: 'evalplus',
      title: 'EvalPlus',
      unit: '%',
      maxValue: 100,
      topN: b.evalPlus.slice(0, 10).map(e => ({
        label: e.model, value: e.average, org: '',
      })),
    })
  }

  return summaries
}

export const getStaticProps: GetStaticProps<BenchmarksPageProps> = async () => {
  const benchmarks = getLatestBenchmarks()
  const summaries = benchmarks ? buildSummaries(benchmarks) : []
  const formattedDate = benchmarks?.updatedAt
    ? new Date(benchmarks.updatedAt).toISOString().slice(0, 16).replace('T', ' ')
    : null
  return { props: { benchmarks, summaries, formattedDate } }
}

const SECTION_META: Record<string, { description: string }> = {
  'arena-coding': { description: '基于用户投票的代码能力 Elo 排名 · arena.ai/leaderboard/webdev' },
  'swe-bench': { description: '真实 GitHub issue 修复能力 · swebench.com' },
  'aider': { description: '代码编辑通过率 · aider.chat' },
  'livecodebench': { description: '竞赛编程（LeetCode / Codeforces）· livecodebench.github.io' },
  'bigcodebench': { description: '综合代码生成能力 · bigcode-bench.github.io' },
  'evalplus': { description: '经典代码生成基准增强版 · evalplus.github.io' },
}

export default function BenchmarksPage({ benchmarks, summaries, formattedDate }: BenchmarksPageProps) {
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
    'bigcodebench': benchmarks.bigCodeBench ? <BigCodeBenchTable entries={benchmarks.bigCodeBench} /> : null,
    'evalplus': benchmarks.evalPlus ? <EvalPlusTable entries={benchmarks.evalPlus} /> : null,
    'livecodebench': benchmarks.liveCodeBench ? <LiveCodeBenchTable entries={benchmarks.liveCodeBench} /> : null,
  }

  return (
    <>
      <Head>
        <title>Coding Benchmarks — Code Weekly — Kylin Miao</title>
        <meta name="description" content="AI coding benchmark rankings: Arena Coding, SWE-bench, Aider, LiveCodeBench, BigCodeBench, EvalPlus." />
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
              数据采集: {formattedDate} UTC
              {benchmarks.arenaPublishDate && (
                <span className="ml-3">· Arena 数据: {benchmarks.arenaPublishDate}</span>
              )}
            </p>
          )}

          {/* Hero cards */}
          <HeroCards benchmarks={summaries} />

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
            数据每天自动更新 · 6 个评测源 · Chart/Table 可切换
          </div>
        </div>
      </div>
    </>
  )
}
