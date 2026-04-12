import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import type { GetStaticProps, GetStaticPaths } from 'next'
import {
  getAllDailyDates,
  getDailyDigest,
  getAdjacentDates,
  type DailyDigest,
  type DigestSection,
  type NewsItem,
} from '@/lib/ai-daily'

// ─── Focus Topic Labels & Colors ────────────────────────────

const FOCUS_TOPIC_META: Record<string, { label: string; color: string }> = {
  memory: { label: 'Memory', color: 'bg-purple-500/20 text-purple-300' },
  'self-evolution': { label: 'Self-Evolution', color: 'bg-amber-500/20 text-amber-300' },
  'multi-agent': { label: 'Multi-Agent', color: 'bg-cyan-500/20 text-cyan-300' },
  planning: { label: 'Planning', color: 'bg-emerald-500/20 text-emerald-300' },
  reflection: { label: 'Reflection', color: 'bg-rose-500/20 text-rose-300' },
  'tool-use': { label: 'Tool Use', color: 'bg-blue-500/20 text-blue-300' },
}

// ─── Types ──────────────────────────────────────────────────

interface AiDailyDetailProps {
  digest: DailyDigest
  prevDate: string | null
  nextDate: string | null
  allDates: string[]
  allFocusTopics: string[]
}

// ─── Data Loading ───────────────────────────────────────────

export const getStaticPaths: GetStaticPaths = async () => {
  const dates = getAllDailyDates()
  return {
    paths: dates.map(d => ({ params: { date: d.date } })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<AiDailyDetailProps> = async ({ params }) => {
  const date = params?.date as string
  const digest = getDailyDigest(date)
  if (!digest) return { notFound: true }

  const { prev, next } = getAdjacentDates(date)
  const allDates = getAllDailyDates().map(d => d.date)

  const topicSet = new Set<string>()
  for (const section of digest.sections) {
    for (const item of section.items) {
      for (const t of item.focusTopics ?? []) {
        topicSet.add(t)
      }
    }
  }
  const allFocusTopics = Array.from(topicSet).sort()

  return { props: { digest, prevDate: prev, nextDate: next, allDates, allFocusTopics } }
}

// ─── Score Color ────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 8) return 'text-emerald-400'
  if (score >= 7) return 'text-yellow-400'
  return 'text-blue-400'
}

// ─── News Item Component ────────────────────────────────────

function NewsItemCard({ item }: { item: NewsItem }) {
  const sourceLine = item.sources
    .map(s => s.meta ? `${s.name} · ${s.meta}` : s.name)
    .join(' · ')

  return (
    <div className="py-5 border-b border-white/[0.04] last:border-0">
      {/* Title */}
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-100 font-semibold hover:text-white transition-colors leading-snug"
      >
        <span className={`${scoreColor(item.score)} text-sm font-mono mr-2`}>
          {item.score.toFixed(1)}
        </span>
        {item.title}
        <svg className="inline-block w-3.5 h-3.5 ml-1 -mt-0.5 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>

      {/* Summary */}
      <p className="text-gray-400 text-[15px] leading-relaxed mt-2">
        {item.summary.length > 300 ? item.summary.slice(0, 300) + '...' : item.summary}
      </p>

      {/* Source + Tags */}
      <div className="flex items-center gap-3 mt-2.5 text-xs text-gray-500">
        {sourceLine && <span>{sourceLine}</span>}
        {item.tags.length > 0 && (
          <span className="text-gray-600">
            {item.tags.slice(0, 3).map(t => `#${t}`).join(' ')}
          </span>
        )}
      </div>

      {/* Focus Topic Badges */}
      {(item.focusTopics ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {(item.focusTopics ?? []).map(topic => {
            const meta = FOCUS_TOPIC_META[topic]
            if (!meta) return null
            return (
              <span
                key={topic}
                className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded-full ${meta.color}`}
              >
                {meta.label}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Focus Topic Filter ─────────────────────────────────────

function FocusTopicFilter({
  topics,
  activeTopic,
  onSelect,
}: {
  topics: string[]
  activeTopic: string | null
  onSelect: (topic: string | null) => void
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
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
        const meta = FOCUS_TOPIC_META[topic]
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

// ─── Section Component ──────────────────────────────────────

function SectionBlock({ section, filterTopic }: { section: DigestSection; filterTopic: string | null }) {
  const filteredItems = filterTopic
    ? section.items.filter(item => (item.focusTopics ?? []).includes(filterTopic))
    : section.items

  if (filteredItems.length === 0) return null

  return (
    <div className="mb-12">
      <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-gray-500 mb-1 pb-3 border-b border-white/[0.06]">
        {section.title}
      </h2>
      {filteredItems.map((item, i) => (
        <NewsItemCard key={i} item={item} />
      ))}
    </div>
  )
}

// ─── Date Navigation ────────────────────────────────────────

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
  // Show up to 5 nearby dates
  const idx = allDates.indexOf(currentDate)
  const start = Math.max(0, idx - 2)
  const nearby = allDates.slice(start, start + 5)

  return (
    <div className="flex items-center justify-between mb-10">
      {/* Prev */}
      {prevDate ? (
        <Link
          href={`/ai-daily/${prevDate}/`}
          className="text-gray-500 hover:text-white text-sm transition-colors"
        >
          ← {prevDate}
        </Link>
      ) : (
        <span className="text-gray-700 text-sm">← oldest</span>
      )}

      {/* Date pills */}
      <div className="hidden sm:flex items-center gap-1.5">
        {nearby.map(d => (
          <Link
            key={d}
            href={`/ai-daily/${d}/`}
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

      {/* Next */}
      {nextDate ? (
        <Link
          href={`/ai-daily/${nextDate}/`}
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

// ─── Page ───────────────────────────────────────────────────

export default function AiDailyDetail({ digest, prevDate, nextDate, allDates, allFocusTopics }: AiDailyDetailProps) {
  const [activeTopic, setActiveTopic] = useState<string | null>(null)

  const d = new Date(digest.date + 'T00:00:00')
  const formatted = d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const uniqueSources = new Set(
    digest.sections.flatMap(s => s.items.flatMap(i => i.sources.map(src => src.name)))
  )

  return (
    <>
      <Head>
        <title>AI Daily — {digest.date} — Kylin Miao</title>
        <meta name="description" content={`AI Daily digest for ${formatted}: ${digest.itemCount} curated items.`} />
      </Head>

      <div className="min-h-screen bg-black text-white" data-pagefind-body data-pagefind-meta="type:AI Daily">
        <meta data-pagefind-meta={`date:${digest.date}`} />
        <div className="max-w-3xl mx-auto px-5 sm:px-6 pt-32 pb-20">
          {/* Back link */}
          <Link
            href="/ai-daily/"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors group mb-8"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            All Digests
          </Link>

          {/* Header */}
          <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">AI Daily</h1>
          <p className="text-gray-400 mb-8">{formatted}</p>

          {/* Date nav */}
          <DateNav
            currentDate={digest.date}
            prevDate={prevDate}
            nextDate={nextDate}
            allDates={allDates}
          />

          {/* Focus Topic Filter */}
          {allFocusTopics.length > 0 && (
            <FocusTopicFilter
              topics={allFocusTopics}
              activeTopic={activeTopic}
              onSelect={setActiveTopic}
            />
          )}

          {/* Sections */}
          {digest.sections.map(section => (
            <SectionBlock key={section.id} section={section} filterTopic={activeTopic} />
          ))}

          {/* Footer stats */}
          <div className="pt-6 border-t border-white/[0.06] text-xs text-gray-500">
            📊 {digest.itemCount} items · {uniqueSources.size} sources · AI score ≥ 6.0
            <span className="ml-3">🤖 Powered by Horizon + DeepSeek</span>
          </div>

          {/* Bottom date nav */}
          <div className="mt-10">
            <DateNav
              currentDate={digest.date}
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
