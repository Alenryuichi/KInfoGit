import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import type { GetStaticProps, GetStaticPaths } from 'next'
import {
  getAllDailyDates,
  getFilteredDailyDigest,
  getAdjacentDates,
  MIN_SCORE,
  type DailyDigest,
  type DigestSection,
  type NewsItem,
} from '@/lib/ai-daily'

// ─── Focus Topic Labels & Colors ────────────────────────────

const FOCUS_TOPIC_META: Record<string, { label: string; color: string }> = {
  // Current anchors (v2, 2026-04-17)
  'coding-agents':       { label: 'Coding Agents',       color: 'text-blue-400 border-blue-400/20 hover:bg-blue-500/10' },
  'context-engineering': { label: 'Context Engineering', color: 'text-purple-400 border-purple-400/20 hover:bg-purple-500/10' },
  'agent-harness':       { label: 'Agent Harness',       color: 'text-cyan-400 border-cyan-400/20 hover:bg-cyan-500/10' },
  'planning':            { label: 'Planning',            color: 'text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10' },
  'tool-use':            { label: 'Tool Use',            color: 'text-gray-400 border-gray-400/20 hover:bg-gray-500/10' },
  'post-training':       { label: 'Post-Training',       color: 'text-amber-400 border-amber-400/20 hover:bg-amber-500/10' },
  'model-release':       { label: 'Model Release',       color: 'text-pink-400 border-pink-400/20 hover:bg-pink-500/10' },
  'evals':               { label: 'Evals',               color: 'text-lime-400 border-lime-400/20 hover:bg-lime-500/10' },

  // Legacy anchors (v1) — kept so historical digests still render labels
  memory:          { label: 'Memory',         color: 'text-purple-400/60 border-purple-400/10 hover:bg-purple-500/5' },
  'self-evolution':{ label: 'Self-Evolution', color: 'text-amber-400/60 border-amber-400/10 hover:bg-amber-500/5' },
  'multi-agent':   { label: 'Multi-Agent',    color: 'text-cyan-400/60 border-cyan-400/10 hover:bg-cyan-500/5' },
  reflection:      { label: 'Reflection',     color: 'text-rose-500/60 border-rose-500/10 hover:bg-rose-500/5' },
}

// ─── Types ──────────────────────────────────────────────────

interface AiDailyDetailProps {
  digest: DailyDigest
  prevDate: string | null
  nextDate: string | null
  allDates: string[]
  allFocusTopics: string[]
  minScore: number
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
  const digest = getFilteredDailyDigest(date)
  if (!digest) return { notFound: true }

  const { prev, next } = getAdjacentDates(date)
  const allDates = getAllDailyDates().map(d => d.date)

  // Compute focus topics from the already-filtered digest so the filter UI
  // never offers topics whose only items were below MIN_SCORE.
  const topicSet = new Set<string>()
  for (const section of digest.sections) {
    for (const item of section.items) {
      for (const t of item.focusTopics ?? []) {
        topicSet.add(t)
      }
    }
  }
  const allFocusTopics = Array.from(topicSet).sort()

  return { props: { digest, prevDate: prev, nextDate: next, allDates, allFocusTopics, minScore: MIN_SCORE } }
}

// ─── Anchor Helpers ────────────────────────────────────────

/** Generate a stable anchor id from a news item's URL */
function itemAnchorId(item: NewsItem): string {
  try {
    const u = new URL(item.url)
    const slug = (u.hostname + u.pathname)
      .replace(/^www\./, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 60)
    return `item-${slug}`
  } catch {
    return `item-${item.title.slice(0, 30).replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`
  }
}

/** Render brief text with inline anchor links from DeepSeek Markdown output */
function BriefWithLinks({ text }: { text: string }) {
  // Split the text by markdown links: [text](#anchor)
  const parts = text.split(/(\[[^\]]+\]\(#[^\)]+\))/g)

  return (
    <p className="text-sm text-gray-300 leading-relaxed">
      {parts.map((part, i) => {
        const match = part.match(/^\[([^\]]+)\]\((#[^\)]+)\)$/)
        if (match) {
          return (
            <a
              key={i}
              href={match[2]}
              onClick={(e) => {
                e.preventDefault()
                const targetId = match[2].slice(1)
                const target = document.getElementById(targetId)
                if (target) {
                  // Smooth scroll to target, accounting for header offset
                  const offset = 120
                  const top = target.getBoundingClientRect().top + window.scrollY - offset
                  window.scrollTo({ top, behavior: 'smooth' })
                  
                  // Trigger highlight animation reliably
                  if (target.classList && typeof target.classList.remove === 'function') {
                    target.classList.remove('target-bracket-lock')
                  }
                  
                  if ((target as any)._bracketTimer) clearTimeout((target as any)._bracketTimer)
                  
                  // Force browser to paint a frame without the class to restart CSS animations
                  requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                      if (target && target.classList && typeof target.classList.add === 'function') {
                        target.classList.add('target-bracket-lock')
                      }
                      
                      // Bracket and track CSS animations completely finish at 2.5s
                      (target as any)._bracketTimer = setTimeout(() => {
                        if (target && target.classList && typeof target.classList.remove === 'function') {
                          target.classList.remove('target-bracket-lock')
                        }
                      }, 2500)
                    })
                  })
                  
                  // Update URL without jumping
                  window.history.pushState(null, '', match[2])
                }
              }}
              className="text-emerald-400 hover:text-emerald-300 underline decoration-emerald-500/30 underline-offset-2 hover:decoration-emerald-400/60 transition-colors"
            >
              {match[1]}
            </a>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </p>
  )
}

// ─── Score Color ────────────────────────────────────────────

function scoreColor(score: number): { text: string, bg: string, track: string, hoverBg: string } {
  if (score >= 8) return { text: 'text-emerald-400', bg: 'bg-emerald-400/10', track: 'from-emerald-400 to-emerald-600 shadow-[0_0_12px_rgba(52,211,153,0.8)]', hoverBg: 'hover:bg-emerald-500/5' }
  if (score >= 7) return { text: 'text-yellow-400', bg: 'bg-yellow-400/10', track: 'from-yellow-400 to-yellow-600 shadow-[0_0_12px_rgba(250,204,21,0.8)]', hoverBg: 'hover:bg-yellow-500/5' }
  return { text: 'text-blue-400', bg: 'bg-blue-400/10', track: 'from-blue-400 to-blue-600 shadow-[0_0_12px_rgba(96,165,250,0.8)]', hoverBg: 'hover:bg-blue-500/5' }
}

// ─── News Item Component ────────────────────────────────────

function NewsItemCard({ item, index }: { item: NewsItem, index: number }) {
  const sourceLine = item.sources
    .map(s => s.meta ? `${s.name} · ${s.meta}` : s.name)
    .join(' · ')
    
  const sColor = scoreColor(item.score)
  const anchorId = itemAnchorId(item)

  return (
    <motion.div 
      id={anchorId}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`group relative scroll-mt-24 transition-all duration-500 rounded-xl p-4 -mx-4 ${sColor.hoverBg}`}
    >
      {/* Linear Track Timeline */}
      <div className={`absolute left-[-5px] top-0 w-[2px] h-0 group-hover:h-full bg-gradient-to-b ${sColor.track} track-fill-height hidden sm:block`}></div>
      
      <div className="flex items-start gap-3 mb-2">
        {/* Score Badge */}
        <span className={`${sColor.text} ${sColor.bg} font-mono text-[10px] px-1.5 py-0.5 rounded mt-1 shrink-0`}>
          {item.score.toFixed(1)}
        </span>
        
        {/* Title */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-semibold text-gray-200 group-hover:text-blue-400 transition-colors leading-snug"
        >
          {item.title}
        </a>
      </div>

      {/* Summary */}
      <p className="text-sm text-gray-400 leading-relaxed mb-4">
        {item.summary}
      </p>

      {/* Metadata Row */}
      <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] text-gray-600 mb-8">
        {sourceLine && <span className="text-gray-500">{sourceLine}</span>}
        
        {item.tags.length > 0 && (
          <span>
            {item.tags.slice(0, 3).map(t => `#${t}`).join(' ')}
          </span>
        )}
        
        {/* Focus Topic Badges */}
        {(item.focusTopics ?? []).length > 0 && (
          <>
            {(item.focusTopics ?? []).map(topic => {
              const meta = FOCUS_TOPIC_META[topic]
              if (!meta) return null
              return (
                <span
                  key={topic}
                  className={`${meta.color.split(' ')[0]} transition-colors`}
                >
                  [{meta.label}]
                </span>
              )
            })}
          </>
        )}
      </div>
    </motion.div>
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
    <div className="flex flex-wrap gap-2 mb-16 font-mono text-[10px]">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 rounded transition-colors border ${
          activeTopic === null
            ? 'bg-white/10 text-white border-white/20'
            : 'bg-transparent text-gray-500 border-white/5 hover:text-white hover:border-white/20'
        }`}
      >
        [*All]
      </button>
      {topics.map(topic => {
        const meta = FOCUS_TOPIC_META[topic]
        if (!meta) return null
        const isActive = activeTopic === topic
        // Extract base text color for active state
        const textColor = meta.color.split(' ')[0]
        
        return (
          <button
            key={topic}
            onClick={() => onSelect(isActive ? null : topic)}
            className={`px-3 py-1.5 rounded transition-colors border ${
              isActive
                ? `${textColor} bg-white/5 border-current`
                : `${textColor} border-transparent ${meta.color.split(' ').find(c => c.startsWith('hover:'))}`
            } opacity-80 hover:opacity-100`}
          >
            [{meta.label}]
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
    <div className="mb-16">
      <h2 className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-blue-400 mb-6 flex items-center gap-2">
        <span className="text-blue-400/50">&gt;</span> {section.title}
      </h2>
      <div className="space-y-2 border-l border-white/10 pl-5 ml-1">
        {filteredItems.map((item, i) => (
          <NewsItemCard key={i} item={item} index={i} />
        ))}
      </div>
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
  return (
    <div className="flex items-center justify-between mb-12 text-xs font-mono text-gray-500 border-b border-white/5 pb-4">
      <Link href="/ai-daily/" className="hover:text-blue-400 transition-colors flex items-center gap-2">
          <span className="text-blue-500/50 hidden sm:inline">~/</span>
          <span className="hidden sm:inline">ai-daily</span>
          <span className="text-blue-500/50 sm:hidden">←</span>
          <span className="sm:text-blue-400 sm:before:content-['/']">cd ..</span>
      </Link>
      
      <div className="flex items-center gap-4">
        {prevDate ? (
          <Link href={`/ai-daily/${prevDate}/`} className="hover:text-white transition-colors">
            ← prev
          </Link>
        ) : (
          <span className="text-gray-700 cursor-not-allowed">← null</span>
        )}
        
        <span className="text-white/20">|</span>
        
        {nextDate ? (
          <Link href={`/ai-daily/${nextDate}/`} className="hover:text-white transition-colors">
            next →
          </Link>
        ) : (
          <span className="text-white/40 cursor-not-allowed">today</span>
        )}
      </div>
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────

export default function AiDailyDetail({ digest, prevDate, nextDate, allDates, allFocusTopics, minScore }: AiDailyDetailProps) {
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

      <div className="min-h-screen bg-[#050505] text-white relative" data-pagefind-body data-pagefind-meta="type:AI Daily">
        <div className="fixed inset-0 bg-[#050505] -z-10" />
        <meta data-pagefind-meta={`date:${digest.date}`} />
        
        <div className="max-w-4xl mx-auto px-6 pt-24 pb-32 relative z-10">
          
          {/* Top Date nav */}
          <DateNav
            currentDate={digest.date}
            prevDate={prevDate}
            nextDate={nextDate}
            allDates={allDates}
          />

          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="font-mono text-blue-500/80 text-[10px] tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                Intelligence.Log
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-6">
                {formatted}
            </h1>
            <div className="text-xs font-mono text-gray-500 border-l-2 border-blue-500/30 pl-4 py-1.5 bg-blue-500/5">
                Extracted: {digest.itemCount} items. Sources: {uniqueSources.size}. Filter: Score &gt;= {minScore.toFixed(1)}
            </div>
          </motion.div>

          {/* AI Summary */}
          {digest.aiSummary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mb-12 border-l-2 border-emerald-500/50 pl-4 py-3 bg-emerald-500/5"
            >
              <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-[0.15em] mb-2">
                ++ Daily.Brief ++
              </div>
              <BriefWithLinks text={digest.aiSummary} />
            </motion.div>
          )}

          {/* Focus Topic Filter */}
          {allFocusTopics.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <FocusTopicFilter
                topics={allFocusTopics}
                activeTopic={activeTopic}
                onSelect={setActiveTopic}
              />
            </motion.div>
          )}

          {/* Sections */}
          <div className="min-h-[40vh]">
            {digest.sections.map((section, idx) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
              >
                <SectionBlock section={section} filterTopic={activeTopic} />
              </motion.div>
            ))}
          </div>

          {/* Footer stats */}
          <div className="pt-8 mt-16 border-t border-white/[0.06] text-[10px] sm:text-xs font-mono text-gray-600 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>[STATS] {digest.itemCount} items · {uniqueSources.size} sources · Score &gt;= {minScore.toFixed(1)}</div>
            <div className="text-blue-500/50">Powered by Tavily + Exa + RSS + DeepSeek</div>
          </div>
          
        </div>
      </div>
    </>
  )
}
