import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import type { GetStaticProps, GetStaticPaths } from 'next'
import {
  getAllFeedDates,
  getFeedByDate,
  getAdjacentDates,
  type DailyFeed,
  type FeedItem,
} from '@/lib/social-feeds'
import { getHandleToPersonMap } from '@/lib/people'
import { RepoCard } from '@/components/stars/RepoCard'
import { BlueskyPostCard } from '@/components/stars/BlueskyPostCard'
import { BlogPostCard } from '@/components/stars/BlogPostCard'
import { YouTubeVideoCard } from '@/components/stars/YouTubeVideoCard'

// --- Types ---

interface StarsDetailProps {
  daily: DailyFeed
  prevDate: string | null
  nextDate: string | null
  allDates: string[]
  allTags: string[]
  personMap: Record<string, string>
}

// --- Data Loading ---

export const getStaticPaths: GetStaticPaths = async () => {
  const dates = getAllFeedDates()
  return {
    paths: dates.map(d => ({ params: { date: d.date } })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<StarsDetailProps> = async ({ params }) => {
  const date = params?.date as string
  const daily = getFeedByDate(date)
  if (!daily) return { notFound: true }

  const { prev, next } = getAdjacentDates(date)
  const allDates = getAllFeedDates().map(d => d.date)
  const personMap = getHandleToPersonMap()

  const tagSet = new Set<string>()
  for (const item of daily.items) {
    const tags = 'tags' in item ? (item.tags ?? []) : []
    for (const t of tags) {
      tagSet.add(t)
    }
  }
  const allTags = Array.from(tagSet).sort()

  return { props: { daily, prevDate: prev, nextDate: next, allDates, allTags, personMap } }
}

import { STAR_TOPIC_META } from '@/lib/tag-metadata'

// --- Polymorphic Item Card ---

function ItemCard({ item, personMap }: { item: FeedItem; personMap: Record<string, string> }) {
  if (item.type === 'github') {
    return <RepoCard star={item} personMap={personMap} />
  } else if (item.type === 'bluesky') {
    return <BlueskyPostCard post={item} personMap={personMap} />
  } else if (item.type === 'blog') {
    return <BlogPostCard post={item} />
  } else if (item.type === 'youtube') {
    return <YouTubeVideoCard video={item} />
  }
  return null
}

// --- Topic Filter ---

function TopicFilter({
  topics,
  activeTopic,
  onSelect,
}: {
  topics: string[]
  activeTopic: string | null
  onSelect: (topic: string | null) => void
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
          activeTopic === null
            ? 'bg-white/[0.12] text-white'
            : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-gray-300'
        }`}
      >
        All
      </button>
      {topics.map(topic => {
        const meta = STAR_TOPIC_META[topic]
        if (!meta) return null
        const isActive = activeTopic === topic
        return (
          <button
            key={topic}
            onClick={() => onSelect(isActive ? null : topic)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              isActive
                ? meta.color
                : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-gray-300'
            }`}
          >
            {meta.label}
          </button>
        )
      })}
    </div>
  )
}

// --- Source Filter ---

type SourceKey = 'all' | 'github' | 'bluesky' | 'blog' | 'youtube'

function SourceFilter({
  activeSource,
  onSelect,
}: {
  activeSource: SourceKey
  onSelect: (source: SourceKey) => void
}) {
  const sources: { key: SourceKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'github', label: 'GitHub' },
    { key: 'bluesky', label: 'Bluesky' },
    { key: 'blog', label: 'Blogs' },
    { key: 'youtube', label: 'YouTube' },
  ]

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {sources.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            activeSource === key
              ? 'bg-white/[0.12] text-white'
              : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-gray-300'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// --- Date Navigation ---

function DateNav({
  currentDate,
  prevDate,
  nextDate,
  allDates,
}: {
  currentDate: string
  prevDate: string | null
  nextDate: string | null
  allDates: string[]
}) {
  const idx = allDates.indexOf(currentDate)
  const start = Math.max(0, idx - 2)
  const nearby = allDates.slice(start, start + 5)

  return (
    <div className="flex items-center justify-between mb-10">
      {prevDate ? (
        <Link
          href={`/stars/${prevDate}/`}
          className="text-gray-500 hover:text-white text-sm transition-colors"
        >
          ← {prevDate}
        </Link>
      ) : (
        <span className="text-gray-700 text-sm">← oldest</span>
      )}

      <div className="hidden sm:flex items-center gap-1.5">
        {nearby.map(d => (
          <Link
            key={d}
            href={`/stars/${d}/`}
            className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
              d === currentDate
                ? 'bg-white/[0.08] text-white font-medium'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'
            }`}
          >
            {d.slice(5)}
          </Link>
        ))}
      </div>

      {nextDate ? (
        <Link
          href={`/stars/${nextDate}/`}
          className="text-gray-500 hover:text-white text-sm transition-colors"
        >
          {nextDate} →
        </Link>
      ) : (
        <span className="text-gray-700 text-sm">latest →</span>
      )}
    </div>
  )
}

// --- Page ---

export default function StarsDetail({ daily, prevDate, nextDate, allDates, allTags, personMap }: StarsDetailProps) {
  const [activeTopic, setActiveTopic] = useState<string | null>(null)
  const [activeSource, setActiveSource] = useState<SourceKey>('all')

  const d = new Date(daily.date + 'T00:00:00')
  const formatted = d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Count items by type
  const githubCount = daily.items.filter(item => item.type === 'github').length
  const blueskyCount = daily.items.filter(item => item.type === 'bluesky').length
  const blogCount = daily.items.filter(item => item.type === 'blog').length
  const youtubeCount = daily.items.filter(item => item.type === 'youtube').length

  // Apply composed filters (topic + source)
  const filteredItems = daily.items.filter(item => {
    if (activeSource !== 'all' && item.type !== activeSource) return false
    if (activeTopic && !('tags' in item ? (item.tags ?? []) : []).includes(activeTopic)) return false
    return true
  })

  return (
    <>
      <Head>
        <title>Stars — {daily.date} — Kylin Miao</title>
        <meta name="description" content={`GitHub stars and Bluesky posts for ${formatted}: ${daily.items.length} items.`} />
      </Head>

      <div className="min-h-screen bg-black text-white relative" data-pagefind-body data-pagefind-meta="type:Stars">
        <div className="fixed inset-0 bg-black -z-10" />
        <meta data-pagefind-meta={`date:${daily.date}`} />
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Stars & Posts</h1>
          <p className="text-gray-400 mb-8">{formatted}</p>

          {/* Date nav */}
          <DateNav
            currentDate={daily.date}
            prevDate={prevDate}
            nextDate={nextDate}
            allDates={allDates}
          />

          {/* AI Daily Overview */}
          {daily.summary && (
            <div className="mb-10 p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-gray-300">Daily Overview</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">AI</span>
              </div>
              <p className="text-gray-400 text-[15px] leading-relaxed">
                {daily.summary}
              </p>
            </div>
          )}

          {/* Topic Filter — show when ≥2 distinct tags */}
          {allTags.length >= 2 && (
            <TopicFilter
              topics={allTags}
              activeTopic={activeTopic}
              onSelect={setActiveTopic}
            />
          )}

          {/* Source Filter — show when multiple source types present */}
          {[githubCount, blueskyCount, blogCount, youtubeCount].filter(c => c > 0).length >= 2 && (
            <SourceFilter
              activeSource={activeSource}
              onSelect={setActiveSource}
            />
          )}

          {/* Item cards */}
          <div>
            {filteredItems.map((item, idx) => (
              <ItemCard key={`${item.type}-${idx}`} item={item} personMap={personMap} />
            ))}
          </div>

          {/* Footer stats */}
          <div className="pt-6 border-t border-white/[0.06] text-xs text-gray-500">
            {githubCount > 0 && <span>{githubCount} repos · </span>}
            {blueskyCount > 0 && <span>{blueskyCount} posts · </span>}
            {blogCount > 0 && <span>{blogCount} blogs · </span>}
            {youtubeCount > 0 && <span>{youtubeCount} videos · </span>}
            Powered by DeepSeek
          </div>

          {/* Bottom date nav */}
          <div className="mt-10">
            <DateNav
              currentDate={daily.date}
              prevDate={prevDate}
              nextDate={nextDate}
              allDates={allDates}
            />
          </div>
        </div>
      </div>
    </>
  )
}
