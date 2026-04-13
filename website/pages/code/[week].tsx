import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticProps, GetStaticPaths } from 'next'
import {
  getAllCodeWeeks,
  getCodeWeekByWeek,
  getAdjacentWeeks,
  type CodeWeekly,
} from '@/lib/code-weekly'
import { EditorCard } from '@/components/code-weekly/EditorCard'
import { ArenaRankingTable, AiderLeaderboardTable } from '@/components/code-weekly/BenchmarkTable'
import { BlogCard } from '@/components/code-weekly/BlogCard'
import { WeeklyTabs } from '@/components/code-weekly/WeeklyTabs'

// ─── Types ─────────────────────────────────────────────────

interface CodeWeekDetailProps {
  data: CodeWeekly
  prevWeek: string | null
  nextWeek: string | null
  allWeeks: string[]
}

// ─── Data Loading ──────────────────────────────────────────

export const getStaticPaths: GetStaticPaths = async () => {
  const weeks = getAllCodeWeeks()
  return {
    paths: weeks.map(w => ({ params: { week: w.week } })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<CodeWeekDetailProps> = async ({ params }) => {
  const week = params?.week as string
  const data = getCodeWeekByWeek(week)
  if (!data) return { notFound: true }

  const { prev, next } = getAdjacentWeeks(week)
  const allWeeks = getAllCodeWeeks().map(w => w.week)

  return { props: { data, prevWeek: prev, nextWeek: next, allWeeks } }
}

// ─── Week Navigation ───────────────────────────────────────

function WeekNav({
  currentWeek,
  prevWeek,
  nextWeek,
  allWeeks,
}: {
  currentWeek: string
  prevWeek: string | null
  nextWeek: string | null
  allWeeks: string[]
}) {
  const idx = allWeeks.indexOf(currentWeek)
  const start = Math.max(0, idx - 2)
  const nearby = allWeeks.slice(start, start + 5)

  return (
    <div className="flex items-center justify-between mb-10">
      {prevWeek ? (
        <Link
          href={`/code/${prevWeek}/`}
          className="text-gray-500 hover:text-white text-sm transition-colors"
        >
          ← {prevWeek}
        </Link>
      ) : (
        <span className="text-gray-700 text-sm">← oldest</span>
      )}

      <div className="hidden sm:flex items-center gap-1.5">
        {nearby.map(w => (
          <Link
            key={w}
            href={`/code/${w}/`}
            className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
              w === currentWeek
                ? 'bg-white/[0.08] text-white font-medium'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'
            }`}
          >
            {w}
          </Link>
        ))}
      </div>

      {nextWeek ? (
        <Link
          href={`/code/${nextWeek}/`}
          className="text-gray-500 hover:text-white text-sm transition-colors"
        >
          {nextWeek} →
        </Link>
      ) : (
        <span className="text-gray-700 text-sm">latest →</span>
      )}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────

const TABS = [
  { id: 'editors', label: '编辑器动态' },
  { id: 'benchmarks', label: '模型评测' },
  { id: 'blogs', label: '公司博客' },
]

export default function CodeWeekDetail({ data, prevWeek, nextWeek, allWeeks }: CodeWeekDetailProps) {
  const ideEditors = data.editors.filter(e => e.category === 'ide')
  const cliEditors = data.editors.filter(e => e.category === 'cli')

  return (
    <>
      <Head>
        <title>Code Weekly — {data.week} — Kylin Miao</title>
        <meta name="description" content={`Code Weekly ${data.week}: ${data.weekSummary?.slice(0, 150)}`} />
      </Head>

      <div className="min-h-screen bg-black text-white" data-pagefind-body data-pagefind-meta="type:Code">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 pt-32 pb-20">
          {/* Back link */}
          <Link
            href="/code/"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors group mb-8"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            All Weeks
          </Link>

          {/* Header */}
          <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Code Weekly</h1>
          <p className="text-gray-400 mb-2">{data.week} · {data.dateRange}</p>

          {/* Week summary */}
          {data.weekSummary && (
            <p className="text-gray-400 text-[15px] leading-relaxed mb-8">
              {data.weekSummary}
            </p>
          )}

          {/* Week nav */}
          <WeekNav
            currentWeek={data.week}
            prevWeek={prevWeek}
            nextWeek={nextWeek}
            allWeeks={allWeeks}
          />

          {/* Tab content */}
          <WeeklyTabs tabs={TABS}>
            {(activeTab) => {
              if (activeTab === 'editors') {
                return (
                  <div>
                    {/* IDE group */}
                    {ideEditors.length > 0 && (
                      <div className="mb-10">
                        <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-gray-500 mb-4 pb-3 border-b border-white/[0.06]">
                          IDE
                        </h2>
                        <div className="grid gap-4">
                          {ideEditors.map(editor => (
                            <EditorCard key={editor.name} editor={editor} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CLI group */}
                    {cliEditors.length > 0 && (
                      <div>
                        <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-gray-500 mb-4 pb-3 border-b border-white/[0.06]">
                          CLI / Plugin
                        </h2>
                        <div className="grid gap-4">
                          {cliEditors.map(editor => (
                            <EditorCard key={editor.name} editor={editor} />
                          ))}
                        </div>
                      </div>
                    )}

                    {data.editors.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        本周暂无编辑器更新数据
                      </div>
                    )}
                  </div>
                )
              }

              if (activeTab === 'benchmarks') {
                return (
                  <div className="space-y-10">
                    <div>
                      <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-gray-500 mb-4 pb-3 border-b border-white/[0.06]">
                        Chatbot Arena — Coding
                      </h2>
                      <ArenaRankingTable rankings={data.benchmarks.arenaRanking} />
                    </div>
                    <div>
                      <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-gray-500 mb-4 pb-3 border-b border-white/[0.06]">
                        Aider Leaderboard
                      </h2>
                      <AiderLeaderboardTable entries={data.benchmarks.aiderLeaderboard} />
                    </div>
                    {data.benchmarks.notable && (
                      <p className="text-sm text-gray-400">
                        📊 {data.benchmarks.notable}
                      </p>
                    )}
                  </div>
                )
              }

              if (activeTab === 'blogs') {
                return (
                  <div>
                    {data.blogs.length > 0 ? (
                      <div className="grid gap-4">
                        {data.blogs.map((blog, i) => (
                          <BlogCard key={`${blog.url}-${i}`} blog={blog} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        本周暂无公司博客文章
                      </div>
                    )}
                  </div>
                )
              }

              return null
            }}
          </WeeklyTabs>

          {/* Footer */}
          <div className="pt-6 mt-10 border-t border-white/[0.06] text-xs text-gray-500">
            📊 {data.editors.length} editors · {data.blogs.length} blogs
            <span className="ml-3">🤖 Powered by Tavily + DeepSeek</span>
          </div>

          {/* Bottom week nav */}
          <div className="mt-10">
            <WeekNav
              currentWeek={data.week}
              prevWeek={prevWeek}
              nextWeek={nextWeek}
              allWeeks={allWeeks}
            />
          </div>
        </div>
      </div>
    </>
  )
}
