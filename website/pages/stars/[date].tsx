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
import { Github, MessageSquare, Youtube, FileText } from 'lucide-react'
import { STAR_TOPIC_META } from '@/lib/tag-metadata'

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

// --- Polymorphic Item Card (Terminal Style) ---

function ItemCard({ item, personMap }: { item: FeedItem; personMap: Record<string, string> }) {
  if (item.type === 'github') {
    return (
      <div className="group mb-12">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="text-gray-500 w-16 shrink-0 flex items-center gap-2 mt-1">
            <Github className="w-4 h-4" />
            <span className="text-[10px]">GH</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-gray-200 group-hover:text-orange-400 transition-colors font-sans">
                {item.repo}
              </a>
              <span className="text-[10px] text-orange-400/80 bg-orange-500/10 px-1.5 py-0.5 rounded">★ {(item.stargazersCount / 1000).toFixed(1)}k</span>
            </div>
            <p className="text-sm text-gray-400 mb-3 font-sans">
              {item.description}
            </p>
            <div className="text-[10px] text-gray-600 flex flex-wrap gap-x-4 gap-y-2 uppercase tracking-widest items-center">
              <span className="flex gap-1 items-center">
                Starred by 
                {item.starredBy.split(',').map((s, idx, arr) => {
                  const trimmed = s.trim()
                  const p = personMap[trimmed.toLowerCase()]
                  return (
                    <span key={trimmed}>
                      {p ? (
                        <Link href={`/stars/people/${p}`} className="hover:text-gray-300 underline underline-offset-2 decoration-white/20 hover:decoration-white/50 transition-colors">
                          {trimmed}
                        </Link>
                      ) : (
                        <span>{trimmed}</span>
                      )}
                      {idx < arr.length - 1 && ', '}
                    </span>
                  )
                })}
              </span>
              <span>|</span>
              <span className="flex gap-2">
                {item.tags?.map(t => {
                  const meta = STAR_TOPIC_META[t]
                  if (meta) {
                    const colorPrefix = meta.color.split(' ')[0]
                    return <span key={t} className={colorPrefix}>[{meta.label}]</span>
                  }
                  return <span key={t} className="text-gray-500">[{t}]</span>
                })}
              </span>
            </div>
            {item.highlights && (
              <div className="mt-3 text-xs text-gray-400 border-l border-white/10 pl-4 py-1 italic font-serif">
                "{item.highlights}"
              </div>
            )}
          </div>
        </div>
      </div>
    )
  } else if (item.type === 'bluesky') {
    return (
      <div className="group mb-12">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="text-blue-400 w-16 shrink-0 flex items-center gap-2 mt-1">
            <MessageSquare className="w-4 h-4" />
            <span className="text-[10px]">BSKY</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {item.author.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.author.avatar} alt={item.author.handle} className="w-5 h-5 rounded-full border border-white/10" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-[10px] text-blue-400 font-bold uppercase">
                  {item.author.handle.charAt(0)}
                </div>
              )}
              {personMap[item.author.handle.toLowerCase()] ? (
                <Link href={`/stars/people/${personMap[item.author.handle.toLowerCase()]}`} className="text-base font-bold text-gray-200 group-hover:text-blue-400 transition-colors font-sans">
                  {item.author.displayName || item.author.handle}
                </Link>
              ) : (
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-base font-bold text-gray-200 group-hover:text-blue-400 transition-colors font-sans">
                  {item.author.displayName || item.author.handle}
                </a>
              )}
              <span className="text-[10px] text-gray-500 hidden sm:inline">
                {new Date(item.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-sm text-gray-300 mb-3 font-sans leading-relaxed">
              {item.content}
            </p>
            <div className="text-[10px] text-gray-600 flex flex-wrap gap-x-4 gap-y-2 uppercase tracking-widest items-center">
              <span>❤️ {item.likeCount} Likes</span>
              <span>|</span>
              <span className="flex gap-2">
                {item.tags?.map(t => {
                  const meta = STAR_TOPIC_META[t]
                  if (meta) {
                    const colorPrefix = meta.color.split(' ')[0]
                    return <span key={t} className={colorPrefix}>[{meta.label}]</span>
                  }
                  return <span key={t} className="text-gray-500">[{t}]</span>
                })}
              </span>
            </div>
            {item.highlights && (
              <div className="mt-3 text-xs text-gray-400 border-l border-blue-500/30 pl-4 py-1 italic font-serif">
                "DeepSeek Summary: {item.highlights}"
              </div>
            )}
          </div>
        </div>
      </div>
    )
  } else if (item.type === 'youtube') {
    return (
      <div className="group mb-12">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="text-red-400 w-16 shrink-0 flex items-center gap-2 mt-1">
            <Youtube className="w-4 h-4" />
            <span className="text-[10px]">YT</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-base font-bold text-gray-200 group-hover:text-red-400 transition-colors font-sans">
                {item.title}
              </a>
            </div>
            <p className="text-sm text-gray-300 mb-3 font-sans leading-relaxed">
              {item.description.slice(0, 150)}...
            </p>
            <div className="text-[10px] text-gray-600 flex flex-wrap gap-x-4 gap-y-2 uppercase tracking-widest items-center">
              <span>👁 {(item.viewCount / 1000).toFixed(1)}k Views</span>
              <span>|</span>
              <span>{item.channelTitle}</span>
            </div>
            {item.highlights && (
              <div className="mt-3 text-xs text-gray-400 border-l border-red-500/30 pl-4 py-1 italic font-serif">
                "{item.highlights}"
              </div>
            )}
          </div>
        </div>
      </div>
    )
  } else if (item.type === 'blog') {
    return (
      <div className="group mb-12">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="text-emerald-400 w-16 shrink-0 flex items-center gap-2 mt-1">
            <FileText className="w-4 h-4" />
            <span className="text-[10px]">BLOG</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-base font-bold text-gray-200 group-hover:text-emerald-400 transition-colors font-sans">
                {item.title}
              </a>
            </div>
            <p className="text-sm text-gray-300 mb-3 font-sans leading-relaxed">
              {item.summary}
            </p>
            <div className="text-[10px] text-gray-600 flex flex-wrap gap-x-4 gap-y-2 uppercase tracking-widest items-center">
              <span>By {item.author}</span>
            </div>
            {item.highlights && (
              <div className="mt-3 text-xs text-gray-400 border-l border-emerald-500/30 pl-4 py-1 italic font-serif">
                "{item.highlights}"
              </div>
            )}
          </div>
        </div>
      </div>
    )
  } else if (item.type === 'x') {
    return (
      <div className="group mb-12">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="text-gray-300 w-16 shrink-0 flex items-center gap-2 mt-1">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="text-[10px]">X</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {item.author.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.author.avatar} alt={item.author.handle} className="w-5 h-5 rounded-full border border-white/10" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center text-[10px] text-gray-300 font-bold uppercase">
                  {item.author.handle.charAt(0)}
                </div>
              )}
              {personMap[`x:${item.author.handle}`] ? (
                <Link href={`/stars/people/${personMap[`x:${item.author.handle}`]}/`} className="text-base font-bold text-gray-200 group-hover:text-gray-100 transition-colors font-sans">
                  {item.author.displayName || item.author.handle}
                </Link>
              ) : (
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-base font-bold text-gray-200 group-hover:text-gray-100 transition-colors font-sans">
                  {item.author.displayName || item.author.handle}
                </a>
              )}
              <span className="text-[10px] text-gray-500 hidden sm:inline">
                @{item.author.handle}
              </span>
            </div>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-300 mb-3 font-sans leading-relaxed hover:text-gray-200 transition-colors whitespace-pre-wrap">
              {item.content}
            </a>
            <div className="text-[10px] text-gray-600 flex flex-wrap gap-x-4 gap-y-2 uppercase tracking-widest items-center">
              {item.likeCount > 0 && <span>❤️ {item.likeCount} Likes</span>}
              {item.retweetCount > 0 && <span>🔄 {item.retweetCount} Retweets</span>}
              {(item.likeCount > 0 || item.retweetCount > 0) && <span>|</span>}
              <span className="flex gap-2">
                {item.tags?.map(t => {
                  const meta = STAR_TOPIC_META[t]
                  if (meta) {
                    const colorPrefix = meta.color.split(' ')[0]
                    return <span key={t} className={colorPrefix}>[{meta.label}]</span>
                  }
                  return <span key={t} className="text-gray-500">[{t}]</span>
                })}
              </span>
            </div>
            {item.highlights && (
              <div className="mt-3 text-xs text-gray-400 border-l border-gray-500/30 pl-4 py-1 italic font-serif">
                "DeepSeek Summary: {item.highlights}"
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
  return null
}

// --- Topic Filter (Terminal Style) ---

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
    <div className="flex flex-wrap items-center gap-4 mb-12 text-[10px] uppercase tracking-widest">
      <span className="text-gray-600">grep TOPIC=</span>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelect(null)}
          className={`px-2 py-0.5 rounded transition-colors ${
            activeTopic === null
              ? 'bg-white/10 text-white border border-white/20'
              : 'text-gray-500 hover:text-white border border-transparent'
          }`}
        >
          [*All]
        </button>
        {topics.map(topic => {
          const meta = STAR_TOPIC_META[topic]
          if (!meta) return null
          const isActive = activeTopic === topic
          return (
            <button
              key={topic}
              onClick={() => onSelect(isActive ? null : topic)}
              className={`px-2 py-0.5 rounded transition-colors ${
                isActive
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-gray-500 hover:text-white border border-transparent'
              }`}
            >
              [{meta.label}]
            </button>
          )
        })}
      </div>
    </div>
  )
}

// --- Source Filter (Terminal Style) ---

type SourceKey = 'all' | 'github' | 'bluesky' | 'x' | 'blog' | 'youtube'

function SourceFilter({
  activeSource,
  onSelect,
}: {
  activeSource: SourceKey
  onSelect: (source: SourceKey) => void
}) {
  const sources: { key: SourceKey; label: string }[] = [
    { key: 'all', label: '[*All]' },
    { key: 'github', label: 'GitHub' },
    { key: 'bluesky', label: 'Bluesky' },
    { key: 'x', label: 'X' },
    { key: 'blog', label: 'Blogs' },
    { key: 'youtube', label: 'YouTube' },
  ]

  return (
    <div className="flex flex-wrap items-center gap-4 mb-12 text-[10px] uppercase tracking-widest">
      <span className="text-gray-600">grep SOURCE=</span>
      <div className="flex flex-wrap gap-2">
        {sources.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`px-2 py-0.5 rounded transition-colors ${
              activeSource === key
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-gray-500 hover:text-white border border-transparent'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

// --- Date Navigation (Terminal Style) ---

function DateNav({
  currentDate,
  prevDate,
  nextDate,
}: {
  currentDate: string
  prevDate: string | null
  nextDate: string | null
}) {
  return (
    <div className="flex items-center justify-between mb-12 text-xs font-mono text-gray-500 border-b border-white/5 pb-4">
      <Link href="/stars/" className="hover:text-orange-400 transition-colors flex items-center gap-2">
        <span className="text-orange-500/50 hidden sm:inline">~/</span>
        <span className="hidden sm:inline">stars</span>
        <span className="text-orange-500/50 sm:hidden">←</span>
        <span className="sm:text-orange-400 sm:before:content-['/']">cd ..</span>
      </Link>
      
      <div className="flex items-center gap-4">
        {prevDate ? (
          <Link href={`/stars/${prevDate}/`} className="hover:text-white transition-colors">
            ← prev
          </Link>
        ) : (
          <span className="text-gray-700 cursor-not-allowed">← null</span>
        )}
        
        <span className="text-white/20">|</span>
        
        {nextDate ? (
          <Link href={`/stars/${nextDate}/`} className="hover:text-white transition-colors">
            next →
          </Link>
        ) : (
          <span className="text-white/40 cursor-not-allowed">today</span>
        )}
      </div>
    </div>
  )
}

// --- Page ---

export default function StarsDetail({ daily, prevDate, nextDate, allTags, personMap }: StarsDetailProps) {
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
  const xCount = daily.items.filter(item => item.type === 'x').length
  const blogCount = daily.items.filter(item => item.type === 'blog').length
  const youtubeCount = daily.items.filter(item => item.type === 'youtube').length

  const sourceLabels = []
  if (githubCount > 0) sourceLabels.push('GitHub')
  if (blueskyCount > 0) sourceLabels.push('Bluesky')
  if (xCount > 0) sourceLabels.push('X')
  if (youtubeCount > 0) sourceLabels.push('YouTube')
  if (blogCount > 0) sourceLabels.push('Blogs')

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

      <div className="min-h-screen bg-[#050505] text-white relative font-mono" data-pagefind-body data-pagefind-meta="type:Stars">
        <div className="fixed inset-0 bg-[#050505] -z-10" />
        <meta data-pagefind-meta={`date:${daily.date}`} />
        
        <div className="max-w-4xl mx-auto px-6 pt-24 pb-32 relative z-10">
          
          {/* Top Date Nav */}
          <DateNav currentDate={daily.date} prevDate={prevDate} nextDate={nextDate} />

          {/* Terminal Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-4 bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]"></span>
              <span className="text-orange-400 text-[10px] uppercase tracking-widest">Intelligence.Log</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-6 font-sans">
              {daily.date}
            </h1>
            <div className="text-xs text-gray-500 border-l-2 border-orange-500/30 pl-4 py-1.5 bg-orange-500/5">
              Extracted: {daily.items.length} items. Sources: {sourceLabels.join(', ')}.
            </div>
          </div>

          {/* AI Daily Overview */}
          {daily.summary && (
            <div className="mb-12 border-l-2 border-purple-500 pl-4 py-2 bg-purple-500/5 text-sm">
              <div className="text-[10px] text-purple-400 uppercase tracking-widest mb-2">++ AI OVERVIEW ++</div>
              <div className="text-gray-300 leading-relaxed font-sans">
                {daily.summary}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="space-y-4 mb-16">
            {/* Topic Filter */}
            {allTags.length >= 2 && (
              <TopicFilter
                topics={allTags}
                activeTopic={activeTopic}
                onSelect={setActiveTopic}
              />
            )}

            {/* Source Filter */}
            {[githubCount, blueskyCount, xCount, blogCount, youtubeCount].filter(c => c > 0).length >= 2 && (
              <SourceFilter
                activeSource={activeSource}
                onSelect={setActiveSource}
              />
            )}
          </div>

          {/* Log Stream */}
          <div className="space-y-12">
            {filteredItems.length === 0 ? (
              <div className="text-gray-500 text-sm font-mono mt-8">No content matches criteria.</div>
            ) : (
              filteredItems.map((item, idx) => (
                <ItemCard key={`${item.type}-${idx}`} item={item} personMap={personMap} />
              ))
            )}
            
            {/* EOF Marker */}
            {filteredItems.length > 0 && (
              <div className="mt-16 text-gray-600 text-[10px] uppercase tracking-widest pt-4 border-t border-white/10">
                -- END OF LOG --
              </div>
            )}
          </div>

          {/* Footer stats */}
          <div className="pt-8 mt-16 border-t border-white/[0.06] text-[10px] sm:text-xs font-mono text-gray-600 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>[STATS] {filteredItems.length} items · Filter applied</div>
            <div className="text-orange-500/50">Powered by Horizon + DeepSeek</div>
          </div>

        </div>
      </div>
    </>
  )
}