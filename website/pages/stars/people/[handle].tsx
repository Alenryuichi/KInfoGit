import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticProps, GetStaticPaths } from 'next'
import { getAllPersonIds, getPersonByHandle, type PersonDetail } from '@/lib/people'
import type { StarredRepo, BlueskyPost, YouTubeVideo, BlogPost, XPost, FeedItem } from '@/lib/social-feeds'
import { RepoCard } from '@/components/stars/RepoCard'
import { BlueskyPostCard } from '@/components/stars/BlueskyPostCard'
import { YouTubeVideoCard } from '@/components/stars/YouTubeVideoCard'
import { BlogPostCard } from '@/components/stars/BlogPostCard'
import { XPostCard } from '@/components/stars/XPostCard'
import { PlatformBadge } from '@/components/stars/PlatformBadge'
import { ActivitySparkline } from '@/components/stars/ActivitySparkline'

interface PersonPageProps {
  person: PersonDetail
}

type SourceKey = 'all' | 'github' | 'bluesky' | 'x' | 'youtube' | 'blog'

const SOURCE_LABELS: Record<SourceKey, string> = {
  all: '[*All]',
  github: 'GitHub',
  bluesky: 'Bluesky',
  x: 'X',
  youtube: 'YouTube',
  blog: 'Blog',
}

export const getStaticPaths: GetStaticPaths = async () => {
  const ids = getAllPersonIds()
  return {
    paths: ids.map(handle => ({ params: { handle } })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<PersonPageProps> = async ({ params }) => {
  const handle = params?.handle as string
  const person = getPersonByHandle(handle)

  if (!person) return { notFound: true }

  return { props: { person } }
}

export default function PersonPage({ person }: PersonPageProps) {
  const { activity } = person
  const [sourceFilter, setSourceFilter] = useState<SourceKey>('all')

  const starsCount = activity.stars?.length || 0
  const postsCount = activity.posts?.length || 0
  const videosCount = activity.videos?.length || 0
  const blogsCount = activity.blogs?.length || 0
  const xPostsCount = activity.xPosts?.length || 0

  // Merge all activity into a chronological list
  const allItems: FeedItem[] = [
    ...(activity.stars || []).map(s => ({ ...s, type: 'github' as const })),
    ...(activity.posts || []).map(p => ({ ...p, type: 'bluesky' as const })),
    ...(activity.videos || []).map(v => ({ ...v, type: 'youtube' as const })),
    ...(activity.blogs || []).map(b => ({ ...b, type: 'blog' as const })),
    ...(activity.xPosts || []).map(x => ({ ...x, type: 'x' as const })),
  ]

  // Normalize a sortable timestamp per item; missing values sink to the bottom.
  // GitHub stars can have either:
  //   - Full ISO timestamp  "2026-04-16T09:37:52Z"  (new fetcher path)
  //   - Day-only YYYY-MM-DD "2026-04-16"            (legacy / generated fallback)
  // We detect by looking for 'T'; day-only values get pinned to noon UTC so
  // they sort near — but not above — same-day items with real timestamps.
  const getSortTime = (item: FeedItem): string => {
    if (item.type === 'bluesky') return item.createdAt || ''
    if (item.type === 'x') return item.createdAt || ''
    if (item.type === 'youtube') return item.publishedAt || ''
    if (item.type === 'blog') return item.publishedAt || ''
    if (item.type === 'github') {
      if (!item.starredAt) return ''
      return item.starredAt.includes('T') ? item.starredAt : `${item.starredAt}T12:00:00Z`
    }
    return ''
  }

  // Stable sort: items with a time come first (desc), timeless items keep
  // their original order at the tail.
  const sortedItems = [...allItems]
    .map((item, idx) => ({ item, idx, t: getSortTime(item) }))
    .sort((a, b) => {
      if (!a.t && !b.t) return a.idx - b.idx
      if (!a.t) return 1
      if (!b.t) return -1
      if (a.t !== b.t) return b.t.localeCompare(a.t)
      return a.idx - b.idx
    })
    .map(x => x.item)

  // Apply source filter
  const filteredItems = sourceFilter === 'all'
    ? sortedItems
    : sortedItems.filter(item => item.type === sourceFilter)

  const totalActivity = starsCount + postsCount + videosCount + blogsCount + xPostsCount

  // Only show filter buttons for source types the person actually has (≥2 types)
  const availableSources: SourceKey[] = (['github', 'bluesky', 'x', 'youtube', 'blog'] as const).filter(src => {
    if (src === 'github') return starsCount > 0
    if (src === 'bluesky') return postsCount > 0
    if (src === 'x') return xPostsCount > 0
    if (src === 'youtube') return videosCount > 0
    if (src === 'blog') return blogsCount > 0
    return false
  })
  const showFilter = availableSources.length >= 2

  return (
    <>
      <Head>
        <title>{person.name} — Stars — Kylin Miao</title>
        <meta name="description" content={`${person.name}'s recent activity: ${starsCount} stars, ${postsCount} posts, ${videosCount} videos, ${blogsCount} blogs, ${xPostsCount} x-posts.`} />
      </Head>

      <div className="min-h-screen bg-black text-white relative">
        <div className="fixed inset-0 bg-black -z-10" />
        <div className="max-w-3xl mx-auto px-5 sm:px-6 pt-32 pb-20">
          {/* Back link */}
          <Link
            href="/stars/people/"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors group mb-8"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            All People
          </Link>

          {/* Profile header */}
          <div className="flex items-start gap-4 mb-8">
            {person.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={person.avatar}
                alt={person.name}
                className="w-16 h-16 rounded-full bg-white/[0.04]"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/[0.06] flex items-center justify-center text-gray-400 text-xl font-medium">
                {person.name.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{person.name}</h1>
              {person.bio && (
                <p className="text-gray-400 mt-1">{person.bio}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                {person.github && (
                  <PlatformBadge platform="github" handle={person.github} />
                )}
                {person.bluesky && (
                  <PlatformBadge platform="bluesky" handle={person.bluesky} />
                )}
                {person.x && (
                  <PlatformBadge platform="x" handle={person.x} />
                )}
              </div>
            </div>
          </div>

          {/* Recent interests AI summary */}
          {activity.interestSummary && (
            <div className="mb-8 p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-gray-300">Recent Interests</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">AI</span>
              </div>
              <p className="text-gray-400 text-[15px] leading-relaxed">
                {activity.interestSummary}
              </p>
            </div>
          )}

          {/* Activity sparkline */}
          {totalActivity > 0 && activity.dailyCounts.some(c => c > 0) && (
            <div className="mb-8 p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-300">Recent Activity</span>
                <span className="text-xs text-gray-500">
                  {[
                    starsCount > 0 && `${starsCount} stars`,
                    postsCount > 0 && `${postsCount} posts`,
                    videosCount > 0 && `${videosCount} videos`,
                    blogsCount > 0 && `${blogsCount} blogs`,
                    xPostsCount > 0 && `${xPostsCount} x-posts`,
                  ].filter(Boolean).join(' · ') || 'No activity'}
                </span>
              </div>
              <ActivitySparkline data={activity.dailyCounts} width={600} height={48} />
            </div>
          )}

          {/* No activity message */}
          {totalActivity === 0 && (
            <div className="mb-8 p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <p className="text-gray-500 text-sm">No recent activity in the last 30 days.</p>
            </div>
          )}

          {/* Activity items */}
          {allItems.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                <h2 className="text-lg font-semibold text-gray-200">Recent Activity</h2>
                {showFilter && (
                  <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest font-mono">
                    <span className="text-gray-600">grep SOURCE=</span>
                    {(['all', ...availableSources] as SourceKey[]).map(src => {
                      const isActive = sourceFilter === src
                      return (
                        <button
                          key={src}
                          onClick={() => setSourceFilter(src)}
                          className={`px-2 py-0.5 rounded transition-colors border ${
                            isActive
                              ? 'bg-white/10 text-white border-white/20'
                              : 'text-gray-500 hover:text-white border-transparent'
                          }`}
                        >
                          {SOURCE_LABELS[src]}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {filteredItems.length === 0 ? (
                <p className="text-gray-500 text-sm font-mono py-8">No {sourceFilter} content for this person.</p>
              ) : (
                filteredItems.map((item, idx) => {
                  if (item.type === 'github') {
                    return <RepoCard key={`github-${idx}`} star={item as StarredRepo} />
                  } else if (item.type === 'bluesky') {
                    return <BlueskyPostCard key={`bluesky-${idx}`} post={item as BlueskyPost} />
                  } else if (item.type === 'youtube') {
                    return <YouTubeVideoCard key={`youtube-${idx}`} video={item as YouTubeVideo} />
                  } else if (item.type === 'blog') {
                    return <BlogPostCard key={`blog-${idx}`} post={item as BlogPost} />
                  } else if (item.type === 'x') {
                    return <XPostCard key={`x-${idx}`} post={item as XPost} />
                  }
                  return null
                })
              )}
            </div>
          )}

          {/* Footer stats */}
          <div className="pt-6 border-t border-white/[0.06] text-xs text-gray-500 mt-8">
            {starsCount > 0 && <span>{starsCount} repos · </span>}
            {postsCount > 0 && <span>{postsCount} posts · </span>}
            {videosCount > 0 && <span>{videosCount} videos · </span>}
            {blogsCount > 0 && <span>{blogsCount} blogs · </span>}
            {xPostsCount > 0 && <span>{xPostsCount} x-posts · </span>}
            All time
          </div>
        </div>
      </div>
    </>
  )
}
