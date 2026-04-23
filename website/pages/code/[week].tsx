import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticProps, GetStaticPaths } from 'next'
import {
  getAllCodeWeeks,
  getCodeWeekByWeek,
  getAdjacentWeeks,
  computeEditorDiffMatrix,
  type CodeWeekly,
  type EditorDiffMatrix as EditorDiffMatrixData,
} from '@/lib/code-weekly'
import { EditorCard } from '@/components/code-weekly/EditorCard'
import { EditorDiffMatrix } from '@/components/code-weekly/EditorDiffMatrix'
import { ArenaRankingTable, AiderLeaderboardTable, SweBenchTable, LiveCodeBenchTable } from '@/components/code-weekly/BenchmarkTable'
import { BlogCard } from '@/components/code-weekly/BlogCard'
import { EcosystemCard } from '@/components/code-weekly/EcosystemCard'

// ─── Types ─────────────────────────────────────────────────

interface CodeWeekDetailProps {
  data: CodeWeekly
  prevWeek: string | null
  nextWeek: string | null
  allWeeks: string[]
  editorDiffMatrix: EditorDiffMatrixData
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

  // Load previous-week editors for WoW diff. If no previous week exists
  // (earliest week in dataset), matrix falls back to wow='unknown' for
  // every row, rendered as "—" in the UI.
  const prevWeekData = prev ? getCodeWeekByWeek(prev) : null
  const editorDiffMatrix = computeEditorDiffMatrix(
    data.editors,
    prevWeekData?.editors,
  )

  return {
    props: {
      data,
      prevWeek: prev,
      nextWeek: next,
      allWeeks,
      editorDiffMatrix,
    },
  }
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
    <div className="flex items-center justify-between mb-10 mt-16 pt-8 border-t border-white/10">
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

export default function CodeWeekDetail({ data, prevWeek, nextWeek, allWeeks, editorDiffMatrix }: CodeWeekDetailProps) {
  const ideEditors = data.editors.filter(e => e.category === 'ide')
  const cliEditors = data.editors.filter(e => e.category === 'cli')

  return (
    <>
      <Head>
        <title>Code Weekly — {data.week} — Kylin Miao</title>
        <meta name="description" content={`Code Weekly ${data.week}: ${data.weekSummary?.slice(0, 150)}`} />
      </Head>

      <div className="min-h-screen bg-[#050505] text-white relative" data-pagefind-body data-pagefind-meta="type:Code">
        <div className="fixed inset-0 bg-[#050505] -z-10" />
        {/* Top Nav spacing (header is global, so we just add pt) */}
        <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-32 pb-20 relative z-10">
          
          {/* Top Summary Card */}
          <div className="bg-gradient-to-br from-[#0a0a0a] to-[#050505] border border-white/10 rounded-2xl p-6 sm:p-8 mb-8 shadow-2xl relative overflow-hidden">
            {/* Glow Effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
              <div className="max-w-2xl">
                <Link 
                  href="/code/"
                  className="inline-flex items-center text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors mb-6 bg-emerald-500/10 px-3 py-1.5 rounded-full"
                >
                  ← Return to Overview
                </Link>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {data.week} Overview
                </h1>
                <p className="text-sm sm:text-[15px] text-gray-400 leading-relaxed font-serif font-light tracking-wide">
                  {data.weekSummary || "AI Code 编辑器生态周报汇总更新。"}
                </p>
              </div>
              
              <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                <div className="font-mono text-lg sm:text-xl text-white">{data.dateRange}</div>
                <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                  Updated
                </div>
              </div>
            </div>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column 1: Editors & Blogs (Span 2) */}
            <div className="lg:col-span-2 space-y-10">
              
              {/* Editor Updates */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-5 bg-emerald-500 rounded-full"></div>
                  <h2 className="text-lg font-bold text-white tracking-wide">Editor Updates</h2>
                </div>

                {/* Week-over-Week Overview matrix — compact scan view above the card grid */}
                {data.editors.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] mb-3">
                      Week-over-Week Overview
                    </h3>
                    <EditorDiffMatrix matrix={editorDiffMatrix} />
                  </div>
                )}

                <div className="space-y-8">
                  {/* IDE Group */}
                  {ideEditors.length > 0 && (
                    <div>
                      <h3 className="text-xs font-mono text-emerald-500/80 tracking-widest uppercase mb-4">IDE</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {ideEditors.map(editor => (
                          <EditorCard key={editor.name} editor={editor} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CLI Group */}
                  {cliEditors.length > 0 && (
                    <div>
                      <h3 className="text-xs font-mono text-blue-500/80 tracking-widest uppercase mb-4">CLI</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {cliEditors.map(editor => (
                          <EditorCard key={editor.name} editor={editor} />
                        ))}
                      </div>
                    </div>
                  )}

                  {data.editors.length === 0 && (
                    <div className="text-sm text-gray-500 p-8 border border-white/5 rounded-xl bg-white/[0.02] text-center">
                      No editor updates recorded for this week.
                    </div>
                  )}
                </div>
              </div>

              {/* Company Blogs */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-5 bg-orange-500 rounded-full"></div>
                  <h2 className="text-lg font-bold text-white tracking-wide">Company Blogs</h2>
                </div>
                
                {data.blogs.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {data.blogs.map((blog, i) => (
                      <BlogCard key={`${blog.url}-${i}`} blog={blog} />
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 p-8 border border-white/5 rounded-xl bg-white/[0.02] text-center">
                    No company blogs published this week.
                  </div>
                )}
              </div>

              {/* Coding Agents Ecosystem — items that surface via AI Daily's
                  coding-agents focus topic. Section renders only when there's
                  at least one item, so legacy weeks (no ecosystem field) stay
                  visually identical to how they shipped. */}
              {data.ecosystem && data.ecosystem.length > 0 && (
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-5 bg-blue-400 rounded-full"></div>
                      <h2 className="text-lg font-bold text-white tracking-wide">Coding Agents Ecosystem</h2>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                      via AI Daily
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                    High-signal items tagged <span className="font-mono text-blue-400/70">coding-agents</span> by the
                    AI Daily pipeline this week — repos, tools, and writeups beyond the 10 tracked editors.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {data.ecosystem.map((item, i) => (
                      <EcosystemCard key={`${item.url}-${i}`} item={item} />
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Column 2: Benchmarks (Span 1) */}
            <div className="lg:col-span-1 space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-5 bg-blue-500 rounded-full"></div>
                  <h2 className="text-lg font-bold text-white tracking-wide">Live Rank</h2>
                </div>
              </div>
              
              {/* Arena Ranking */}
              {data.benchmarks.arenaRanking && data.benchmarks.arenaRanking.length > 0 && (
                <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5 overflow-hidden">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">Chatbot Arena</div>
                  <div className="-mx-5 -mb-5">
                    <ArenaRankingTable rankings={data.benchmarks.arenaRanking} defaultVisible={5} />
                  </div>
                </div>
              )}

              {/* SWE Bench */}
              {data.benchmarks.sweBench && data.benchmarks.sweBench.length > 0 && (
                <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5 overflow-hidden">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">SWE-bench Verified</div>
                  <div className="-mx-5 -mb-5">
                    <SweBenchTable entries={data.benchmarks.sweBench} />
                  </div>
                </div>
              )}

              {/* Aider Leaderboard */}
              {data.benchmarks.aiderLeaderboard && data.benchmarks.aiderLeaderboard.length > 0 && (
                <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5 overflow-hidden">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">Aider Leaderboard</div>
                  <div className="-mx-5 -mb-5">
                    <AiderLeaderboardTable entries={data.benchmarks.aiderLeaderboard} defaultVisible={5} />
                  </div>
                </div>
              )}

              {/* LiveCodeBench */}
              {data.benchmarks.liveCodeBench && data.benchmarks.liveCodeBench.length > 0 && (
                <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5 overflow-hidden">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">LiveCodeBench</div>
                  <div className="-mx-5 -mb-5">
                    <LiveCodeBenchTable entries={data.benchmarks.liveCodeBench} />
                  </div>
                </div>
              )}

              {/* Notable text */}
              {data.benchmarks.notable && (
                <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5 text-sm text-gray-400 leading-relaxed font-serif font-light">
                  {data.benchmarks.notable}
                </div>
              )}

              {/* Empty State for Benchmarks */}
              {Object.keys(data.benchmarks).length === 0 && (
                <div className="text-sm text-gray-500 p-8 border border-white/5 rounded-xl bg-[#0a0a0a] text-center">
                  No benchmarks data recorded for this week.
                </div>
              )}
              
            </div>
            
          </div>

          <WeekNav
            currentWeek={data.week}
            prevWeek={prevWeek}
            nextWeek={nextWeek}
            allWeeks={allWeeks}
          />
        </div>
      </div>
    </>
  )
}
