import { useMemo, useState } from 'react'
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
import { XPostCard } from '@/components/stars/XPostCard'

interface TimelineProps {
  items: TimelineFeedItem[]
  personMap: Record<string, string>
}

export const getStaticProps: GetStaticProps<TimelineProps> = async () => {
  const items = getAllFeedItems()
  const personMap = getHandleToPersonMap()
  return { props: { items, personMap } }
}

type SourceKey = 'all' | 'github' | 'bluesky' | 'x' | 'blog' | 'youtube'

function ItemCard({ item, personMap }: { item: FeedItem; personMap: Record<string, string> }) {
  if (item.type === 'github') return <RepoCard star={item} personMap={personMap} />
  if (item.type === 'bluesky') return <BlueskyPostCard post={item} personMap={personMap} />
  if (item.type === 'x') return <XPostCard post={item} personMap={personMap} />
  if (item.type === 'blog') return <BlogPostCard post={item} personMap={personMap} />
  if (item.type === 'youtube') return <YouTubeVideoCard video={item} personMap={personMap} />
  return null
}

export default function Timeline({ items, personMap }: TimelineProps) {
  const [sourceFilter, setSourceFilter] = useState<SourceKey>('all')
  const [visibleCount, setVisibleCount] = useState(30)

  const filtered = sourceFilter === 'all'
    ? items
    : items.filter(i => i.item.type === sourceFilter)

  const visible = filtered.slice(0, visibleCount)

  // Pre-compute date separators (avoid mutating outer var during render)
  const visibleWithDateFlag = useMemo(
    () =>
      visible.map((tItem, idx) => ({
        tItem,
        showDate: idx === 0 || tItem.date !== visible[idx - 1].date,
      })),
    [visible]
  )

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
          <div className="flex items-center justify-between mb-12 text-xs text-gray-500 border-b border-white/5 pb-4 font-mono">
            <Link href="/stars/" className="hover:text-orange-400 transition-colors flex items-center">
              <span className="text-orange-500/50">~/</span>stars <span className="text-orange-400 ml-2">/</span><span className="ml-2">tail -f global_timeline.log</span>
            </Link>
          </div>

          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-4 bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]"></span>
              <span className="text-orange-400 text-[10px] uppercase tracking-widest">System.Timeline</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-6 font-sans">Global Timeline</h1>
            <div className="text-xs text-gray-500 border-l-2 border-orange-500/30 pl-4 py-1.5 bg-orange-500/5">
              {filtered.length} items from all sources, sorted by time
            </div>
          </div>

          {/* Source Filter */}
          <div className="flex flex-wrap items-center gap-4 mb-12 text-[10px] uppercase tracking-widest font-mono">
            <span className="text-gray-600">grep SOURCE=</span>
            <div className="flex flex-wrap gap-2">
              {([
                { key: 'all' as SourceKey, label: '[*All]' },
                { key: 'github' as SourceKey, label: 'GitHub' },
                { key: 'bluesky' as SourceKey, label: 'Bluesky' },
                { key: 'x' as SourceKey, label: 'X' },
                { key: 'youtube' as SourceKey, label: 'YouTube' },
                { key: 'blog' as SourceKey, label: 'Blog' },
              ]).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => { setSourceFilter(key); setVisibleCount(30) }}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    sourceFilter === key
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'text-gray-500 hover:text-white border border-transparent'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline items */}
          <div>
            {visibleWithDateFlag.map(({ tItem, showDate }, idx) => {
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
