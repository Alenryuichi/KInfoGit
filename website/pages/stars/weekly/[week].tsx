import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticProps, GetStaticPaths } from 'next'
import {
  getAllWeeklyDigests,
  getWeeklyDigestByWeek,
  getAdjacentWeeks,
  getAllFeedDates,
  type WeeklyDigest,
} from '@/lib/social-feeds'

// --- Types ---

interface WeeklyDigestPageProps {
  digest: WeeklyDigest
  prevWeek: string | null
  nextWeek: string | null
  dailyDatesInRange: string[]
}

// --- Data Loading ---

export const getStaticPaths: GetStaticPaths = async () => {
  const digests = getAllWeeklyDigests()
  return {
    paths: digests.map(d => ({ params: { week: d.week } })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<WeeklyDigestPageProps> = async ({ params }) => {
  const week = params?.week as string
  const digest = getWeeklyDigestByWeek(week)
  if (!digest) return { notFound: true }

  const { prev, next } = getAdjacentWeeks(week)

  const allDates = getAllFeedDates().map(d => d.date)
  const dailyDatesInRange = allDates.filter(
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

// --- Page ---

export default function WeeklyDigestPage({
  digest,
  prevWeek,
  nextWeek,
  dailyDatesInRange,
}: WeeklyDigestPageProps) {
  const weekNum = digest.week.split('-W')[1]
  const startDate = new Date(digest.dateRange.start + 'T00:00:00')
  const endDate = new Date(digest.dateRange.end + 'T00:00:00')
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <>
      <Head>
        <title>Weekly Digest — {digest.week} — Kylin Miao</title>
        <meta
          name="description"
          content={`Weekly digest for ${digest.week}: ${digest.stats.totalRepos} repos, ${digest.stats.totalPosts} posts.`}
        />
      </Head>

      <div className="min-h-screen bg-[#050505] text-white relative">
        <div className="fixed inset-0 bg-[#050505] -z-10" />
        <div className="max-w-5xl mx-auto px-5 sm:px-6 pt-24 pb-32 relative z-10">

          {/* Top Header Card */}
          <div className="bg-gradient-to-br from-[#0a0a0a] to-[#050505] border border-white/10 rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px]" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <Link href="/stars/" className="text-xs font-mono text-gray-500 hover:text-white transition-colors">
                  ← Back to Stars
                </Link>
                <div className="flex gap-3 text-xs font-mono text-gray-500">
                  {prevWeek ? (
                    <Link href={`/stars/weekly/${prevWeek}/`} className="hover:text-white transition-colors">
                      ← {prevWeek}
                    </Link>
                  ) : (
                    <span className="text-gray-700">← oldest</span>
                  )}
                  <span className="text-white/20">|</span>
                  {nextWeek ? (
                    <Link href={`/stars/weekly/${nextWeek}/`} className="hover:text-white transition-colors">
                      {nextWeek} →
                    </Link>
                  ) : (
                    <span className="text-gray-700">latest →</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono uppercase tracking-widest">
                  Digest
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 font-display">Week {weekNum}</h1>
              <p className="text-gray-400 text-sm font-mono">
                {fmt(startDate)} – {fmt(endDate)}, {startDate.getFullYear()}
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { value: digest.stats.totalRepos, label: 'Repos' },
              { value: digest.stats.totalPosts, label: 'Posts' },
              { value: digest.stats.uniqueAuthors, label: 'Authors' },
              { value: digest.stats.daysWithContent, label: 'Days' },
            ].map(s => (
              <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white font-display">{s.value}</div>
                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Column (3/5) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Overview Card */}
              {digest.overview && (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wide">Summary</h2>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">AI</span>
                  </div>
                  <p className="text-gray-400 text-[14px] leading-[1.8] font-serif font-light whitespace-pre-line">
                    {digest.overview}
                  </p>
                </div>
              )}

              {/* Notable Repos Card */}
              {digest.notableRepos.length > 0 && (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-4 bg-orange-500 rounded-full" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wide">Notable Repos</h2>
                  </div>
                  <div className="space-y-4">
                    {digest.notableRepos.map(repo => (
                      <div key={repo.repo} className="flex items-start gap-4 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                        <div className="flex-1 min-w-0">
                          <a
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-100 font-semibold hover:text-orange-400 transition-colors text-sm"
                          >
                            {repo.repo}
                            <svg className="inline-block w-3 h-3 ml-1 -mt-0.5 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                          <p className="text-gray-500 text-xs mt-1">{repo.description}</p>
                          <p className="text-[10px] font-mono text-gray-600 mt-2">
                            {repo.starredBy.join(', ')}
                          </p>
                        </div>
                        <span className="text-xs font-mono text-orange-400/70 whitespace-nowrap">
                          ★ {repo.stars >= 1000 ? (repo.stars / 1000).toFixed(1) + 'k' : repo.stars}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Column (2/5) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Key Discussions Card */}
              {digest.keyDiscussions.length > 0 && (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wide">Key Discussions</h2>
                  </div>
                  <div className="space-y-4">
                    {digest.keyDiscussions.map((disc, idx) => (
                      <div key={idx} className="border-l-2 border-blue-500/30 pl-4 py-1">
                        <p className="text-gray-200 font-serif italic text-sm">&ldquo;{disc.title}&rdquo;</p>
                        <p className="text-[10px] font-mono text-blue-400 mt-1">@{disc.author}</p>
                        <p className="text-gray-500 text-xs mt-2">{disc.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Topics Card */}
              {digest.trendingTopics.length > 0 && (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wide">Trending</h2>
                  </div>
                  <div className="space-y-4">
                    {digest.trendingTopics.map(topic => (
                      <div key={topic.topic}>
                        <h3 className="text-sm font-semibold text-white mb-1">{topic.topic}</h3>
                        <p className="text-gray-500 text-xs">{topic.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cross-References Card */}
              {digest.crossReferences.length > 0 && (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-4 bg-yellow-500 rounded-full" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wide">Cross-Refs</h2>
                  </div>
                  <div className="space-y-3 text-xs">
                    {digest.crossReferences.map(cr => (
                      <div key={cr.repo} className="flex justify-between items-start py-2 border-b border-white/5">
                        <a
                          href={cr.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-200 hover:text-orange-400 transition-colors"
                        >
                          {cr.repo}
                        </a>
                        <span className="text-gray-600 font-mono text-[10px] whitespace-nowrap ml-2">
                          ×{cr.starredBy.length}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Daily Logs Card */}
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
                          href={`/stars/${date}/`}
                          className="flex justify-between py-2 hover:text-orange-400 text-gray-400 transition-colors"
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

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] sm:text-xs font-mono text-gray-600">
            <div>
              {digest.stats.totalRepos} repos · {digest.stats.totalPosts} posts · {digest.stats.daysWithContent} days
            </div>
            <div className="text-purple-500/50">Powered by DeepSeek</div>
          </div>

        </div>
      </div>
    </>
  )
}
