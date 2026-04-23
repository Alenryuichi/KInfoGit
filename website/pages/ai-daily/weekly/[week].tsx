import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticProps, GetStaticPaths } from 'next'
import {
  getAllAiDailyWeeklies,
  getAiDailyWeeklyByWeek,
  getAdjacentAiDailyWeeks,
  type AiDailyWeeklyDigest,
} from '@/lib/ai-daily-weekly'
import { getAllDailyDates } from '@/lib/ai-daily'

// ─── Focus Topic Labels & Colors (mirrors /ai-daily/[date].tsx) ──────────────

const FOCUS_TOPIC_META: Record<string, { label: string; accent: string; bar: string }> = {
  'coding-agents':       { label: 'Coding Agents',       accent: 'text-blue-400',    bar: 'bg-blue-500' },
  'context-engineering': { label: 'Context Engineering', accent: 'text-purple-400',  bar: 'bg-purple-500' },
  'agent-harness':       { label: 'Agent Harness',       accent: 'text-cyan-400',    bar: 'bg-cyan-500' },
  planning:              { label: 'Planning',            accent: 'text-emerald-400', bar: 'bg-emerald-500' },
  'tool-use':            { label: 'Tool Use',            accent: 'text-gray-300',    bar: 'bg-gray-400' },
  'post-training':       { label: 'Post-Training',       accent: 'text-amber-400',   bar: 'bg-amber-500' },
  'model-release':       { label: 'Model Release',       accent: 'text-pink-400',    bar: 'bg-pink-500' },
  evals:                 { label: 'Evals',               accent: 'text-lime-400',    bar: 'bg-lime-500' },
}

// ─── Types ─────────────────────────────────────────────────────────────────

interface AiDailyWeeklyPageProps {
  digest: AiDailyWeeklyDigest
  prevWeek: string | null
  nextWeek: string | null
  dailyDatesInRange: string[]
}

// ─── Data Loading ──────────────────────────────────────────────────────────

export const getStaticPaths: GetStaticPaths = async () => {
  const weeklies = getAllAiDailyWeeklies()
  return {
    paths: weeklies.map(w => ({ params: { week: w.week } })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<AiDailyWeeklyPageProps> = async ({ params }) => {
  const week = params?.week as string
  const digest = getAiDailyWeeklyByWeek(week)
  if (!digest) return { notFound: true }

  const { prev, next } = getAdjacentAiDailyWeeks(week)

  const allDailyDates = getAllDailyDates().map(d => d.date)
  const dailyDatesInRange = allDailyDates.filter(
    d => d >= digest.dateRange.start && d <= digest.dateRange.end
  )

  return {
    props: {
      digest,
      prevWeek: prev,
      nextWeek: next,
      dailyDatesInRange,
    },
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Sort buckets for display: first by topicCounts (desc), falling back to
 * story count. Ensures the highest-signal topic leads, matching the
 * overview narrative.
 */
function sortBucketsForDisplay(
  digest: AiDailyWeeklyDigest
): AiDailyWeeklyDigest['topStoriesByTopic'] {
  return [...digest.topStoriesByTopic].sort((a, b) => {
    const ca = digest.stats.topicCounts[a.topic] ?? a.stories.length
    const cb = digest.stats.topicCounts[b.topic] ?? b.stories.length
    if (cb !== ca) return cb - ca
    return b.stories.length - a.stories.length
  })
}

/** Top 3 topics (v2 only) for the stats ribbon. */
function getHeadlineTopics(digest: AiDailyWeeklyDigest): Array<{ topic: string; count: number }> {
  return Object.entries(digest.stats.topicCounts)
    .filter(([t]) => FOCUS_TOPIC_META[t])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([topic, count]) => ({ topic, count }))
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function AiDailyWeeklyPage({
  digest,
  prevWeek,
  nextWeek,
  dailyDatesInRange,
}: AiDailyWeeklyPageProps) {
  const weekNum = digest.week.split('-W')[1]
  const startDate = new Date(digest.dateRange.start + 'T00:00:00')
  const endDate = new Date(digest.dateRange.end + 'T00:00:00')
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const sortedBuckets = sortBucketsForDisplay(digest)
  const headlineTopics = getHeadlineTopics(digest)

  return (
    <>
      <Head>
        <title>AI Daily Weekly — {digest.week} — Kylin Miao</title>
        <meta
          name="description"
          content={`AI Daily weekly digest for ${digest.week}: ${digest.stats.totalItems} signals across ${digest.stats.uniqueTopics} focus topics.`}
        />
      </Head>

      <div
        className="min-h-screen bg-[#0a0a0a] text-white relative"
        data-pagefind-body
        data-pagefind-meta="type:AI Daily Weekly"
      >
        <div className="fixed inset-0 bg-[#0a0a0a] -z-10" />
        <div className="max-w-5xl mx-auto px-5 sm:px-6 pt-24 pb-32 relative z-10">

          {/* ─── Top Header Card ────────────────────────────────────────── */}
          <div className="bg-gradient-to-br from-[#0f0f0f] to-[#0a0a0a] border border-white/10 rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px]" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <Link href="/ai-daily/" className="text-xs font-mono text-gray-500 hover:text-white transition-colors">
                  ← Back to AI Daily
                </Link>
                <div className="flex gap-3 text-xs font-mono text-gray-500">
                  {prevWeek ? (
                    <Link href={`/ai-daily/weekly/${prevWeek}/`} className="hover:text-white transition-colors">
                      ← {prevWeek}
                    </Link>
                  ) : (
                    <span className="text-gray-700">← oldest</span>
                  )}
                  <span className="text-white/20">|</span>
                  {nextWeek ? (
                    <Link href={`/ai-daily/weekly/${nextWeek}/`} className="hover:text-white transition-colors">
                      {nextWeek} →
                    </Link>
                  ) : (
                    <span className="text-gray-700">latest →</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono uppercase tracking-widest">
                  Weekly
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 font-mono uppercase tracking-widest border border-white/10">
                  Signal.Radar
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 font-display">
                Week {weekNum}
              </h1>
              <p className="text-gray-400 text-sm font-mono">
                {fmt(startDate)} – {fmt(endDate)}, {startDate.getFullYear()}
              </p>
            </div>
          </div>

          {/* ─── Stats Row ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white font-display">{digest.stats.totalItems}</div>
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">Items</div>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white font-display">{digest.stats.uniqueTopics}</div>
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">Topics</div>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white font-display">{digest.stats.daysWithContent}<span className="text-lg text-gray-500">/7</span></div>
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">Days</div>
            </div>
            {headlineTopics.map(({ topic, count }) => {
              const meta = FOCUS_TOPIC_META[topic]
              return (
                <div
                  key={topic}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center"
                  title={`${count} items tagged ${topic} this week`}
                >
                  <div className={`text-2xl sm:text-3xl font-bold font-display ${meta?.accent ?? 'text-white'}`}>
                    {count}
                  </div>
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1 truncate">
                    {meta?.label ?? topic}
                  </div>
                </div>
              )
            })}
          </div>

          {/* ─── Bento Grid ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* ─── Left Column (3/5) ──────────────────────────────────── */}
            <div className="lg:col-span-3 space-y-6">

              {/* Overview */}
              {digest.overview && (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wide">Summary</h2>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">AI</span>
                  </div>
                  <p className="text-gray-400 text-[14px] leading-[1.8] font-serif font-light whitespace-pre-line">
                    {digest.overview}
                  </p>
                </div>
              )}

              {/* Top Stories by Topic */}
              {sortedBuckets.length > 0 && (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-1.5 h-4 bg-cyan-500 rounded-full" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wide">Top Stories by Topic</h2>
                  </div>
                  <div className="space-y-6">
                    {sortedBuckets.map(bucket => {
                      const meta = FOCUS_TOPIC_META[bucket.topic]
                      const count = digest.stats.topicCounts[bucket.topic] ?? bucket.stories.length
                      return (
                        <div key={bucket.topic}>
                          {/* Topic header */}
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.06]">
                            <div className="flex items-center gap-2">
                              <div className={`w-1 h-3 rounded-full ${meta?.bar ?? 'bg-gray-500'}`} />
                              <span className={`text-xs font-mono uppercase tracking-widest ${meta?.accent ?? 'text-gray-400'}`}>
                                {meta?.label ?? bucket.topic}
                              </span>
                              <span className="text-[10px] font-mono text-gray-600">
                                {bucket.stories.length} picks · {count} total
                              </span>
                            </div>
                          </div>
                          {/* Stories */}
                          <div className="space-y-3">
                            {bucket.stories.map(story => (
                              <div
                                key={story.url}
                                className="flex items-start gap-4 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                              >
                                <div className="flex-1 min-w-0">
                                  <a
                                    href={story.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-gray-100 font-semibold hover:${meta?.accent?.replace('text-', 'text-') ?? 'text-blue-400'} transition-colors text-sm block`}
                                  >
                                    {story.title}
                                    <svg className="inline-block w-3 h-3 ml-1 -mt-0.5 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </a>
                                  <p className="text-gray-500 text-xs mt-1">{story.oneLiner}</p>
                                  {story.sources.length > 0 && (
                                    <p className="text-[10px] font-mono text-gray-600 mt-2">
                                      {story.sources.slice(0, 3).join(' · ')}
                                    </p>
                                  )}
                                </div>
                                <span className={`text-xs font-mono whitespace-nowrap ${meta?.accent ?? 'text-gray-400'}/70`}>
                                  ▲ {story.score.toFixed(1)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Key Reads */}
              {digest.keyReads && digest.keyReads.length > 0 && (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wide">Key Reads</h2>
                    <span className="text-[10px] font-mono text-gray-600">longer-form picks</span>
                  </div>
                  <div className="space-y-4">
                    {digest.keyReads.map(read => (
                      <div key={read.url} className="p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                        <a
                          href={read.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-100 font-semibold hover:text-amber-400 transition-colors text-sm block"
                        >
                          {read.title}
                          <svg className="inline-block w-3 h-3 ml-1 -mt-0.5 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                        <p className="text-gray-500 text-xs mt-2 leading-relaxed">{read.summary}</p>
                        {read.why && (
                          <p className="text-amber-400/70 text-[11px] mt-2 font-mono italic">
                            → {read.why}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* ─── Right Column (2/5) ─────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Trending Topics */}
              {digest.trendingTopics.length > 0 && (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wide">Trending</h2>
                  </div>
                  <div className="space-y-4">
                    {digest.trendingTopics.map(topic => (
                      <div key={topic.topic} className="border-l-2 border-emerald-500/30 pl-3 py-1">
                        <h3 className="text-sm font-semibold text-white mb-1">{topic.topic}</h3>
                        <p className="text-gray-500 text-xs leading-relaxed">{topic.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Topic Spread (full topicCounts) */}
              {Object.keys(digest.stats.topicCounts).length > 0 && (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wide">Topic Spread</h2>
                  </div>
                  <div className="space-y-1.5">
                    {Object.entries(digest.stats.topicCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([topic, count]) => {
                        const meta = FOCUS_TOPIC_META[topic]
                        const isLegacy = !meta
                        return (
                          <div key={topic} className="flex items-center justify-between text-xs font-mono py-1">
                            <span className={`${meta?.accent ?? 'text-gray-600'} ${isLegacy ? 'opacity-50' : ''}`}>
                              {meta?.label ?? topic}
                              {isLegacy && <span className="text-[9px] text-gray-700 ml-1">(legacy)</span>}
                            </span>
                            <span className="text-gray-500">{count}</span>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}

              {/* Daily Logs */}
              {dailyDatesInRange.length > 0 && (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-4 bg-gray-500 rounded-full" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wide">Daily Logs</h2>
                  </div>
                  <div className="space-y-1 text-xs font-mono">
                    {dailyDatesInRange.map(date => {
                      const d = new Date(date + 'T00:00:00')
                      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
                      const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      return (
                        <Link
                          key={date}
                          href={`/ai-daily/${date}/`}
                          className="flex justify-between py-2 hover:text-blue-400 text-gray-400 transition-colors"
                        >
                          <span>{monthDay} ({dayName})</span>
                          <span className="text-gray-600">→</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ─── Footer ─────────────────────────────────────────────────── */}
          <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] sm:text-xs font-mono text-gray-600">
            <div>
              {digest.stats.totalItems} items · {digest.stats.uniqueTopics} topics · {digest.stats.daysWithContent}/7 days · MIN_SCORE ≥ 6.0
            </div>
            <div className="text-blue-500/50">Powered by DeepSeek</div>
          </div>

        </div>
      </div>
    </>
  )
}
