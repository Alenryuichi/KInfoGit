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

  // Find daily pages that fall within this digest's date range
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
  return (
    <>
      <Head>
        <title>Weekly Digest — {digest.week} — Kylin Miao</title>
        <meta
          name="description"
          content={`Weekly digest for ${digest.week}: ${digest.stats.totalRepos} repos, ${digest.stats.totalPosts} posts.`}
        />
      </Head>

      <div className="min-h-screen bg-black text-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 pt-32 pb-20">
          {/* Back link */}
          <Link
            href="/stars/"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors group mb-8"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            All Stars & Posts
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Weekly Digest</h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">
                AI
              </span>
            </div>
            <p className="text-gray-400">
              {digest.week} · {digest.dateRange.start} – {digest.dateRange.end}
            </p>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-10">
            {prevWeek ? (
              <Link
                href={`/stars/weekly/${prevWeek}/`}
                className="text-gray-500 hover:text-white text-sm transition-colors"
              >
                ← {prevWeek}
              </Link>
            ) : (
              <span className="text-gray-700 text-sm">← oldest</span>
            )}
            {nextWeek ? (
              <Link
                href={`/stars/weekly/${nextWeek}/`}
                className="text-gray-500 hover:text-white text-sm transition-colors"
              >
                {nextWeek} →
              </Link>
            ) : (
              <span className="text-gray-700 text-sm">latest →</span>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <div className="text-2xl font-bold text-white">{digest.stats.totalRepos}</div>
              <div className="text-xs text-gray-500">Repos</div>
            </div>
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <div className="text-2xl font-bold text-white">{digest.stats.totalPosts}</div>
              <div className="text-xs text-gray-500">Posts</div>
            </div>
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <div className="text-2xl font-bold text-white">{digest.stats.uniqueAuthors}</div>
              <div className="text-xs text-gray-500">Authors</div>
            </div>
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <div className="text-2xl font-bold text-white">{digest.stats.daysWithContent}</div>
              <div className="text-xs text-gray-500">Days</div>
            </div>
          </div>

          {/* Overview */}
          {digest.overview && (
            <div className="mb-10 p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-gray-300">Summary</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">AI</span>
              </div>
              <div className="text-gray-400 text-[15px] leading-relaxed whitespace-pre-line">
                {digest.overview}
              </div>
            </div>
          )}

          {/* Trending Topics */}
          {digest.trendingTopics.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-semibold text-gray-200 mb-4">Trending Topics</h2>
              <div className="space-y-3">
                {digest.trendingTopics.map((topic) => (
                  <div
                    key={topic.topic}
                    className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]"
                  >
                    <h3 className="text-gray-200 font-medium mb-1">{topic.topic}</h3>
                    <p className="text-gray-500 text-sm">{topic.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notable Repos */}
          {digest.notableRepos.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-semibold text-gray-200 mb-4">Notable Repos</h2>
              <div className="space-y-3">
                {digest.notableRepos.map((repo) => (
                  <div
                    key={repo.repo}
                    className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]"
                  >
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-100 font-semibold hover:text-white transition-colors"
                    >
                      {repo.repo}
                      <svg className="inline-block w-3.5 h-3.5 ml-1 -mt-0.5 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>⭐ {repo.stars.toLocaleString()}</span>
                      <span>·</span>
                      <span>starred by {repo.starredBy.join(', ')}</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">{repo.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Discussions */}
          {digest.keyDiscussions.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-semibold text-gray-200 mb-4">Key Discussions</h2>
              <div className="space-y-3">
                {digest.keyDiscussions.map((disc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]"
                  >
                    <h3 className="text-gray-200 font-medium mb-1">{disc.title}</h3>
                    <p className="text-xs text-gray-500 mb-2">by {disc.author}</p>
                    <p className="text-gray-400 text-sm">{disc.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cross-References */}
          {digest.crossReferences.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-semibold text-gray-200 mb-4">Cross-References</h2>
              <p className="text-gray-500 text-sm mb-3">
                Repos starred by multiple people this week
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left py-2 text-gray-400 font-medium">Repo</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Starred By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {digest.crossReferences.map((cr) => (
                      <tr key={cr.repo} className="border-b border-white/[0.04]">
                        <td className="py-2">
                          <a
                            href={cr.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-200 hover:text-white transition-colors"
                          >
                            {cr.repo}
                          </a>
                        </td>
                        <td className="py-2 text-gray-500">{cr.starredBy.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Daily Pages */}
          {dailyDatesInRange.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-semibold text-gray-200 mb-4">Daily Pages</h2>
              <div className="space-y-1">
                {dailyDatesInRange.map((date) => {
                  const d = new Date(date + 'T00:00:00')
                  const formatted = d.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })
                  return (
                    <Link
                      key={date}
                      href={`/stars/${date}/`}
                      className="flex items-center justify-between py-3 px-4 -mx-4 rounded-lg hover:bg-white/[0.02] transition-colors group"
                    >
                      <span className="text-gray-300 group-hover:text-white transition-colors">
                        {formatted}
                      </span>
                      <span className="text-gray-500 text-sm">→</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-6 border-t border-white/[0.06] text-xs text-gray-500">
            {digest.stats.totalRepos} repos · {digest.stats.totalPosts} posts · {digest.stats.daysWithContent} days · Powered by DeepSeek
          </div>

          {/* Bottom Navigation */}
          <div className="flex items-center justify-between mt-10">
            {prevWeek ? (
              <Link
                href={`/stars/weekly/${prevWeek}/`}
                className="text-gray-500 hover:text-white text-sm transition-colors"
              >
                ← {prevWeek}
              </Link>
            ) : (
              <span className="text-gray-700 text-sm">← oldest</span>
            )}
            {nextWeek ? (
              <Link
                href={`/stars/weekly/${nextWeek}/`}
                className="text-gray-500 hover:text-white text-sm transition-colors"
              >
                {nextWeek} →
              </Link>
            ) : (
              <span className="text-gray-700 text-sm">latest →</span>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
