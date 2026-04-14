import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticProps, GetStaticPaths } from 'next'
import { getAllPersonIds, getPersonByHandle, type PersonDetail } from '@/lib/people'
import type { StarredRepo, BlueskyPost, YouTubeVideo, BlogPost, FeedItem } from '@/lib/social-feeds'
import { RepoCard } from '@/components/stars/RepoCard'
import { BlueskyPostCard } from '@/components/stars/BlueskyPostCard'
import { YouTubeVideoCard } from '@/components/stars/YouTubeVideoCard'
import { BlogPostCard } from '@/components/stars/BlogPostCard'
import { PlatformBadge } from '@/components/stars/PlatformBadge'
import { ActivitySparkline } from '@/components/stars/ActivitySparkline'

interface PersonPageProps {
  person: PersonDetail
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

  // Merge all activity into a chronological list
  const allItems: FeedItem[] = [
    ...activity.stars.map(s => ({ ...s, type: 'github' as const })),
    ...activity.posts.map(p => ({ ...p, type: 'bluesky' as const })),
    ...(activity.videos || []).map(v => ({ ...v, type: 'youtube' as const })),
    ...(activity.blogs || []).map(b => ({ ...b, type: 'blog' as const })),
  ]

  const totalActivity = activity.stars.length + activity.posts.length + (activity.videos?.length || 0) + (activity.blogs?.length || 0)

  return (
    <>
      <Head>
        <title>{person.name} — Stars — Kylin Miao</title>
        <meta name="description" content={`${person.name}'s recent activity: ${activity.stars.length} stars, ${activity.posts.length} posts, ${activity.videos?.length || 0} videos, ${activity.blogs?.length || 0} blogs.`} />
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
                    activity.stars.length > 0 && `${activity.stars.length} stars`,
                    activity.posts.length > 0 && `${activity.posts.length} posts`,
                    (activity.videos?.length || 0) > 0 && `${activity.videos.length} videos`,
                    (activity.blogs?.length || 0) > 0 && `${activity.blogs.length} blogs`,
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
              <h2 className="text-lg font-semibold text-gray-200 mb-4">Recent Activity</h2>
              {allItems.map((item, idx) => {
                if (item.type === 'github') {
                  return <RepoCard key={`github-${idx}`} star={item as StarredRepo} />
                } else if (item.type === 'bluesky') {
                  return <BlueskyPostCard key={`bluesky-${idx}`} post={item as BlueskyPost} />
                } else if (item.type === 'youtube') {
                  return <YouTubeVideoCard key={`youtube-${idx}`} video={item as YouTubeVideo} />
                } else if (item.type === 'blog') {
                  return <BlogPostCard key={`blog-${idx}`} post={item as BlogPost} />
                }
                return null
              })}
            </div>
          )}

          {/* Footer stats */}
          <div className="pt-6 border-t border-white/[0.06] text-xs text-gray-500 mt-8">
            {activity.stars.length > 0 && <span>{activity.stars.length} repos · </span>}
            {activity.posts.length > 0 && <span>{activity.posts.length} posts · </span>}
            {(activity.videos?.length || 0) > 0 && <span>{activity.videos.length} videos · </span>}
            {(activity.blogs?.length || 0) > 0 && <span>{activity.blogs.length} blogs · </span>}
            All time
          </div>
        </div>
      </div>
    </>
  )
}
