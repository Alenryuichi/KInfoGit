import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticProps } from 'next'
import {
  getLatestSpecs,
  getSpecTrend,
  type SpecSnapshot,
  type StarsTrendSeries,
  type FrameworkDelta,
  type WeeklyDiff as WeeklyDiffType,
} from '@/lib/spec-tracker'
import { SpecHeroCards } from '@/components/spec-tracker/SpecHeroCards'
import { StarsTrendChart } from '@/components/spec-tracker/StarsTrendChart'
import { NpmDownloadsChart } from '@/components/spec-tracker/NpmDownloadsChart'
import { FrameworkTable } from '@/components/spec-tracker/FrameworkTable'
import { RecentActivity } from '@/components/spec-tracker/RecentActivity'
import { EmergingSpecs } from '@/components/spec-tracker/EmergingSpecs'
import { TrendInsights } from '@/components/spec-tracker/TrendInsights'
import { WeeklyDiff } from '@/components/spec-tracker/WeeklyDiff'

interface SpecsPageProps {
  snapshot: SpecSnapshot | null
  trend: StarsTrendSeries[]
  formattedDate: string | null
  deltas: FrameworkDelta[] | null
  weeklyDiff: WeeklyDiffType | null
  insights: string | null
}

export const getStaticProps: GetStaticProps<SpecsPageProps> = async () => {
  const raw = getLatestSpecs()
  const snapshot: SpecSnapshot | null = raw ? JSON.parse(JSON.stringify(raw)) : null
  const trend: StarsTrendSeries[] = JSON.parse(JSON.stringify(getSpecTrend()))
  const formattedDate = snapshot?.updatedAt
    ? new Date(snapshot.updatedAt).toISOString().slice(0, 10)
    : null
  const deltas = snapshot?.deltas ?? null
  const weeklyDiff = snapshot?.weeklyDiff ?? null
  const insights = snapshot?.insights ?? null
  return { props: { snapshot, trend, formattedDate, deltas, weeklyDiff, insights } }
}

export default function SpecsPage({ snapshot, trend, formattedDate, deltas, weeklyDiff, insights }: SpecsPageProps) {
  if (!snapshot) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center relative">
        <div className="fixed inset-0 bg-black -z-10" />
        <p className="text-gray-500 text-lg">暂无数据，请稍后再来。</p>
      </div>
    )
  }

  const { frameworks, discovered } = snapshot
  const hasNpmData = frameworks.some(f => f.npm && f.npm.weeklyDownloads > 0)
  const hasTrend = trend.length > 0 && trend[0]?.points?.length >= 3

  return (
    <>
      <Head>
        <title>Spec Development Tracker — Code Weekly — Kylin Miao</title>
        <meta name="description" content="AI Coding Spec 框架生态追踪：Spec-Kit, BMAD, OpenSpec, GSD, Kiro, Tessl 等。" />
      </Head>

      <div className="min-h-screen bg-black text-white relative">
        <div className="fixed inset-0 bg-black -z-10" />
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
          <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
            Spec Development Tracker
          </h1>
          <p className="text-gray-400 text-lg mb-4">
            AI Coding Spec 框架生态追踪
          </p>

          {formattedDate && (
            <p className="text-xs text-gray-600 mb-10">
              数据采集: {formattedDate}
            </p>
          )}

          {/* Hero Cards */}
          <SpecHeroCards frameworks={frameworks} deltas={deltas ?? undefined} />

          {/* Trend Insights */}
          {insights && (
            <div className="mb-12">
              <TrendInsights insights={insights} />
            </div>
          )}

          {/* Weekly Diff */}
          {weeklyDiff && (
            <div className="mb-14">
              <h2 className="text-xl font-semibold text-gray-200 mb-1">Weekly Diff</h2>
              <p className="text-sm text-gray-500 mb-4">
                较前日变化
              </p>
              <WeeklyDiff weeklyDiff={weeklyDiff} frameworks={frameworks} />
            </div>
          )}

          {/* Stars Trend */}
          {hasTrend && (
            <div className="mb-14">
              <h2 className="text-xl font-semibold text-gray-200 mb-1">Stars Arms Race</h2>
              <p className="text-sm text-gray-500 mb-4">
                各框架 GitHub Stars 趋势 · 每日更新
              </p>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <StarsTrendChart series={trend} />
              </div>
            </div>
          )}

          {/* npm Downloads */}
          {hasNpmData && (
            <div className="mb-14">
              <h2 className="text-xl font-semibold text-gray-200 mb-1">npm Downloads</h2>
              <p className="text-sm text-gray-500 mb-4">
                周下载量排名
              </p>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <NpmDownloadsChart frameworks={frameworks} />
              </div>
            </div>
          )}

          {/* Framework Comparison Table */}
          <div className="mb-14">
            <h2 className="text-xl font-semibold text-gray-200 mb-1">Framework Comparison</h2>
            <p className="text-sm text-gray-500 mb-4">
              {frameworks.length} 个框架全览
            </p>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <FrameworkTable frameworks={frameworks} deltas={deltas ?? undefined} />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mb-14">
            <h2 className="text-xl font-semibold text-gray-200 mb-1">Recent Activity</h2>
            <p className="text-sm text-gray-500 mb-4">
              最近版本更新
            </p>
            <RecentActivity frameworks={frameworks} />
          </div>

          {/* Emerging Specs */}
          {discovered.length > 0 && (
            <div className="mb-14">
              <h2 className="text-xl font-semibold text-gray-200 mb-1">Emerging</h2>
              <p className="text-sm text-gray-500 mb-4">
                自动发现的新兴项目
              </p>
              <EmergingSpecs projects={discovered} />
            </div>
          )}

          {/* Footer */}
          <div className="pt-6 mt-12 border-t border-white/[0.06] text-xs text-gray-500">
            每日自动更新 · GitHub · npm · Discovery
          </div>
        </div>
      </div>
    </>
  )
}
