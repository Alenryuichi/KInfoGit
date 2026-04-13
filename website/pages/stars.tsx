import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticProps } from 'next'
import {
  getAllFeedDates,
  getAllWeeklyDigests,
  getWeeklyDigestByWeek,
  type DailyFeedSummary,
  type WeeklyDigest,
} from '@/lib/social-feeds'

interface StarsListProps {
  dates: DailyFeedSummary[]
  latestDigest: WeeklyDigest | null
}

export const getStaticProps: GetStaticProps<StarsListProps> = async () => {
  const dates = getAllFeedDates()
  const digests = getAllWeeklyDigests()
  const latestDigest = digests.length > 0
    ? getWeeklyDigestByWeek(digests[0].week)
    : null

  return { props: { dates, latestDigest } }
}

// --- Weekly Digest Card ---

function WeeklyDigestCard({ digest }: { digest: WeeklyDigest }) {
  const [expanded, setExpanded] = useState(false)

  // Preview: first 2 sentences of overview
  const sentences = digest.overview.match(/[^.!?]+[.!?]+/g) || []
  const preview = sentences.slice(0, 2).join('').trim() || digest.overview.slice(0, 200)

  return (
    <div className="mb-10 rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-300">This Week</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">
              AI Digest
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              {digest.stats.totalRepos} repos · {digest.stats.totalPosts} posts
            </span>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-2">
          {digest.week} · {digest.dateRange.start} – {digest.dateRange.end}
        </p>
        <p className="text-gray-400 text-[15px] leading-relaxed">
          {preview}
        </p>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-white/[0.04]">
          {/* Trending Topics */}
          {digest.trendingTopics.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Trending Topics
              </h3>
              <div className="space-y-2">
                {digest.trendingTopics.map((topic) => (
                  <div key={topic.topic}>
                    <span className="text-gray-200 text-sm font-medium">{topic.topic}</span>
                    <span className="text-gray-500 text-sm"> — {topic.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cross-References */}
          {digest.crossReferences.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Starred by Multiple People
              </h3>
              <div className="space-y-1">
                {digest.crossReferences.map((cr) => (
                  <div key={cr.repo} className="text-sm">
                    <a
                      href={cr.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-200 hover:text-white transition-colors"
                    >
                      {cr.repo}
                    </a>
                    <span className="text-gray-500"> — {cr.starredBy.join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Link to full digest */}
          <div className="mt-4 pt-3 border-t border-white/[0.04]">
            <Link
              href={`/stars/weekly/${digest.week}/`}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              View full digest →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// --- Page ---

export default function StarsList({ dates, latestDigest }: StarsListProps) {
  const [sourceFilter, setSourceFilter] = useState<string>('all')

  // Compute which sources have data
  const hasSources = {
    github: dates.some(d => d.githubCount > 0),
    bluesky: dates.some(d => d.blueskyCount > 0),
    youtube: dates.some(d => d.youtubeCount > 0),
    blog: dates.some(d => d.blogCount > 0),
  }

  // Filter dates by source
  const filteredDates = sourceFilter === 'all'
    ? dates
    : dates.filter(d => {
        if (sourceFilter === 'github') return d.githubCount > 0
        if (sourceFilter === 'bluesky') return d.blueskyCount > 0
        if (sourceFilter === 'youtube') return d.youtubeCount > 0
        if (sourceFilter === 'blog') return d.blogCount > 0
        return true
      })
  return (
    <>
      <Head>
        <title>Stars — Kylin Miao</title>
        <meta name="description" content="Recently starred GitHub repos and Bluesky posts from AI leaders with AI-powered highlights." />
        <link rel="alternate" type="application/rss+xml" title="Stars & Posts — Kylin Miao" href="/stars/feed.xml" />
      </Head>

      <div className="min-h-screen bg-black text-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 pt-32 pb-20">
          {/* Header */}
          <div className="flex items-center gap-3">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">Stars & Posts</h1>
            <a
              href="/stars/feed.xml"
              title="RSS Feed"
              className="text-gray-400 hover:text-orange-400 transition-colors mb-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <circle cx="6.18" cy="17.82" r="2.18" />
                <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z" />
              </svg>
            </a>
          </div>
          <p className="text-gray-400 text-lg mb-4">
            Recently starred GitHub repos, Bluesky posts, YouTube videos, and blog articles from AI leaders.<br />
            <span className="text-gray-500 text-sm">Curated from GitHub, Bluesky, YouTube & RSS · Powered by DeepSeek</span>
          </p>

          {/* Quick links */}
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/stars/people/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-lg border border-white/[0.06] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
              AI Leaders
            </Link>
          </div>

          {/* Source filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {(['all', 'github', 'bluesky', 'youtube', 'blog'] as const).map(source => {
              if (source !== 'all' && !hasSources[source]) return null
              const labels: Record<string, string> = { all: 'All', github: 'GitHub', bluesky: 'Bluesky', youtube: 'YouTube', blog: 'Blog' }
              const isActive = sourceFilter === source
              return (
                <button
                  key={source}
                  onClick={() => setSourceFilter(source)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    isActive
                      ? 'bg-white/[0.12] text-white'
                      : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-gray-300'
                  }`}
                >
                  {labels[source]}
                </button>
              )
            })}
          </div>

          {/* Weekly Digest Card */}
          {latestDigest && sourceFilter === 'all' && <WeeklyDigestCard digest={latestDigest} />}

          {/* Date list */}
          {filteredDates.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">
                {sourceFilter === 'all' ? 'No stars or posts yet. Check back soon.' : `No ${sourceFilter} content yet.`}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredDates.map(({ date, githubCount, blueskyCount, youtubeCount, blogCount }) => {
                const d = new Date(date + 'T00:00:00')
                const formatted = d.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
                const parts: string[] = []
                if (sourceFilter === 'all' || sourceFilter === 'github') {
                  if (githubCount > 0) parts.push(`${githubCount} repo${githubCount === 1 ? '' : 's'}`)
                }
                if (sourceFilter === 'all' || sourceFilter === 'bluesky') {
                  if (blueskyCount > 0) parts.push(`${blueskyCount} post${blueskyCount === 1 ? '' : 's'}`)
                }
                if (sourceFilter === 'all' || sourceFilter === 'youtube') {
                  if (youtubeCount > 0) parts.push(`${youtubeCount} video${youtubeCount === 1 ? '' : 's'}`)
                }
                if (sourceFilter === 'all' || sourceFilter === 'blog') {
                  if (blogCount > 0) parts.push(`${blogCount} blog${blogCount === 1 ? '' : 's'}`)
                }
                return (
                  <Link
                    key={date}
                    href={`/stars/${date}/`}
                    className="flex items-center justify-between py-4 px-4 -mx-4 rounded-lg hover:bg-white/[0.02] transition-colors group"
                  >
                    <span className="text-gray-200 font-medium group-hover:text-white transition-colors">
                      {formatted}
                    </span>
                    <span className="text-gray-500 text-sm flex-shrink-0 ml-3">
                      {parts.join(' · ')}
                      <span> →</span>
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
