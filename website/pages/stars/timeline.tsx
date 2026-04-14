import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticProps } from 'next'
import {
  getAllFeedItems,
  type TimelineFeedItem,
  type FeedItem,
} from '@/lib/social-feeds'
import { getHandleToPersonMap } from '@/lib/people'
import { RepoCard } from '@/components/stars/RepoCard'
import { BlueskyPostCard } from '@/components/stars/BlueskyPostCard'
import { BlogPostCard } from '@/components/stars/BlogPostCard'
import { YouTubeVideoCard } from '@/components/stars/YouTubeVideoCard'

interface TimelineProps {
  items: TimelineFeedItem[]
  personMap: Record<string, string>
}

export const getStaticProps: GetStaticProps<TimelineProps> = async () => {
  const items = getAllFeedItems()
  const personMap = getHandleToPersonMap()
  return { props: { items, personMap } }
}

type SourceKey = 'all' | 'github' | 'bluesky' | 'blog' | 'youtube'

function ItemCard({ item, personMap }: { item: FeedItem; personMap: Record<string, string> }) {
  if (item.type === 'github') return <RepoCard star={item} personMap={personMap} />
  if (item.type === 'bluesky') return <BlueskyPostCard post={item} personMap={personMap} />
  if (item.type === 'blog') return <BlogPostCard post={item} />
  if (item.type === 'youtube') return <YouTubeVideoCard video={item} />
  return null
}

export default function Timeline({ items, personMap }: TimelineProps) {
  const [sourceFilter, setSourceFilter] = useState<SourceKey>('all')
  const [visibleCount, setVisibleCount] = useState(30)

  const filtered = sourceFilter === 'all'
    ? items
    : items.filter(i => i.item.type === sourceFilter)

  const visible = filtered.slice(0, visibleCount)

  // Group by date for date separators
  let lastDate = ''

  return (
    <>
      <Head>
        <title>Timeline — Stars & Posts — Kylin Miao</title>
        <meta name="description" content="All starred repos, posts, videos, and articles from AI leaders in chronological order." />
      </Head>

      <div className="min-h-screen bg-black text-white relative">
        <div className="fixed inset-0 bg-black -z-10" />
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

          <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Timeline</h1>
          <p className="text-gray-400 mb-6">
            {filtered.length} items from all sources, sorted by time
          </p>

          {/* Source Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {([
              { key: 'all' as SourceKey, label: 'All' },
              { key: 'github' as SourceKey, label: 'GitHub' },
              { key: 'bluesky' as SourceKey, label: 'Bluesky' },
              { key: 'youtube' as SourceKey, label: 'YouTube' },
              { key: 'blog' as SourceKey, label: 'Blog' },
            ]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setSourceFilter(key); setVisibleCount(30) }}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  sourceFilter === key
                    ? 'bg-white/[0.12] text-white'
                    : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Timeline items */}
          <div>
            {visible.map((tItem, idx) => {
              const showDate = tItem.date !== lastDate
              lastDate = tItem.date

              const d = new Date(tItem.date + 'T00:00:00')
              const formatted = d.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })

              return (
                <div key={`${tItem.item.type}-${idx}`}>
                  {showDate && (
                    <div className="flex items-center gap-3 mt-6 mb-2 first:mt-0">
                      <div className="w-2 h-2 rounded-full bg-white/20 flex-shrink-0" />
                      <Link
                        href={`/stars/${tItem.date}/`}
                        className="text-xs font-medium text-gray-500 hover:text-gray-300 transition-colors uppercase tracking-wider"
                      >
                        {formatted}
                      </Link>
                      <div className="flex-1 border-t border-white/[0.04]" />
                    </div>
                  )}
                  <ItemCard item={tItem.item} personMap={personMap} />
                </div>
              )
            })}
          </div>

          {/* Load more */}
          {visibleCount < filtered.length && (
            <div className="text-center mt-8">
              <button
                onClick={() => setVisibleCount(prev => prev + 30)}
                className="px-6 py-2 text-sm font-medium text-gray-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-lg border border-white/[0.06] transition-colors"
              >
                Load more ({filtered.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
