import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticProps } from 'next'
import { getAllDailyDates, type DailyDigestSummary } from '@/lib/ai-daily'
import { getLatestAiDailyWeekly, type AiDailyWeeklyDigest } from '@/lib/ai-daily-weekly'
import { motion } from 'framer-motion'

interface AiDailyListProps {
  dates: DailyDigestSummary[]
  latestWeekly: AiDailyWeeklyDigest | null
}

const FOCUS_TOPIC_META: Record<string, { label: string; color: string }> = {
  // Current anchors (v2, 2026-04-17)
  'coding-agents':       { label: 'Coding Agents',       color: 'text-blue-400' },
  'context-engineering': { label: 'Context Engineering', color: 'text-purple-400' },
  'agent-harness':       { label: 'Agent Harness',       color: 'text-cyan-400' },
  'planning':            { label: 'Planning',            color: 'text-emerald-500/70' },
  'tool-use':            { label: 'Tool Use',            color: 'text-gray-400' },
  'post-training':       { label: 'Post-Training',       color: 'text-amber-400' },
  'model-release':       { label: 'Model Release',       color: 'text-pink-400' },
  'evals':               { label: 'Evals',               color: 'text-lime-400' },

  // Legacy anchors (v1) — kept so historical digests still render labels
  memory:          { label: 'Memory',         color: 'text-purple-400/60' },
  'self-evolution':{ label: 'Self-Evolution', color: 'text-amber-400/60' },
  'multi-agent':   { label: 'Multi-Agent',    color: 'text-cyan-400/60' },
  reflection:      { label: 'Reflection',     color: 'text-rose-500/60' },
}

export const getStaticProps: GetStaticProps<AiDailyListProps> = async () => {
  const dates = getAllDailyDates()
  const latestWeekly = getLatestAiDailyWeekly()
  return { props: { dates, latestWeekly } }
}

export default function AiDailyList({ dates, latestWeekly }: AiDailyListProps) {
  // Truncate overview for banner preview (first paragraph or ~200 chars)
  const weeklyPreview = latestWeekly
    ? (() => {
        const firstPara = latestWeekly.overview.split('\n\n')[0] ?? ''
        return firstPara.length > 220 ? firstPara.slice(0, 220).trimEnd() + '…' : firstPara
      })()
    : ''

  // Top 3 v2 topics for the banner signal line
  const topTopics = latestWeekly
    ? Object.entries(latestWeekly.stats.topicCounts)
        .filter(([t]) =>
          [
            'coding-agents',
            'context-engineering',
            'agent-harness',
            'planning',
            'tool-use',
            'post-training',
            'model-release',
            'evals',
          ].includes(t)
        )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
    : []

  const fmtRange = latestWeekly
    ? (() => {
        const s = new Date(latestWeekly.dateRange.start + 'T00:00:00')
        const e = new Date(latestWeekly.dateRange.end + 'T00:00:00')
        const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        return `${fmt(s)} – ${fmt(e)}`
      })()
    : ''

  return (
    <>
      <Head>
        <title>AI Daily — Kylin Miao</title>
        <meta name="description" content="Curated AI news, delivered daily. Sourced from HN, ArXiv, HF Papers, and RSS." />
      </Head>

      <div className="min-h-screen bg-[#0a0a0a] text-white relative" data-pagefind-body data-pagefind-meta="type:AI Daily">
        <div className="fixed inset-0 bg-[#0a0a0a] -z-10" />
        <div className="max-w-4xl mx-auto px-5 sm:px-6 pt-32 pb-32 relative z-10">
            
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-0 relative z-10"
            >
                <div className="flex items-center gap-3 mb-4">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                    <span className="font-mono text-blue-400 text-xs uppercase tracking-[0.2em]">Signal.Radar</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    AI <span className="font-serif italic font-light text-white/60">Daily</span>
                </h1>
                <p className="text-gray-400 font-mono text-xs sm:text-sm max-w-lg border-l-2 border-blue-500/30 pl-4 py-1.5 bg-blue-500/5 leading-relaxed">
                    Curated intelligence sourced from ArXiv, Tavily, Exa, HN, Bluesky, and RSS.<br/>
                    Timeliness-filtered &amp; scored by DeepSeek.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                    <Link href="/ai-daily/metrics" className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 rounded px-2 py-1">
                        [Metrics →]
                    </Link>
                    {latestWeekly && (
                      <Link href={`/ai-daily/weekly/${latestWeekly.week}/`} className="font-mono text-[10px] uppercase tracking-[0.2em] text-blue-400 hover:text-blue-300 border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 rounded px-2 py-1">
                          [Weekly: {latestWeekly.week} →]
                      </Link>
                    )}
                </div>
            </motion.div>

            {/* Weekly Digest Banner — rendered only when a latestWeekly digest exists */}
            {latestWeekly && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="relative z-10 mt-4 mb-0"
              >
                <Link
                  href={`/ai-daily/weekly/${latestWeekly.week}/`}
                  className="group block border border-dashed border-blue-500/40 hover:border-blue-400/80 bg-blue-500/[0.02] hover:bg-blue-500/[0.05] rounded-xl p-5 transition-all relative overflow-hidden"
                >
                  {/* Decorative corner markers */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-blue-400/50"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-blue-400/50"></div>
                  
                  {/* Top Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] px-2 py-1 rounded bg-blue-500/20 text-blue-300 font-mono uppercase tracking-widest border border-blue-500/30">
                        Weekly
                      </span>
                      <span className="text-sm font-mono text-blue-400 font-bold">{latestWeekly.week}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-xs font-mono text-gray-400">{fmtRange}</span>
                    </div>
                    <div className="text-[10px] font-mono text-gray-500 flex gap-4">
                      <span><strong className="text-white font-normal">{latestWeekly.stats.totalItems}</strong> signals</span>
                      <span><strong className="text-white font-normal">{latestWeekly.stats.uniqueTopics}</strong> topics</span>
                    </div>
                  </div>
                  
                  {/* Text */}
                  {weeklyPreview && (
                    <p className="text-gray-400 text-[13px] leading-relaxed font-serif font-light mb-5 group-hover:text-gray-300 transition-colors">
                      {weeklyPreview}
                    </p>
                  )}
                  
                  {/* Bottom Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto">
                    {topTopics.length > 0 ? (
                      <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                        {topTopics.map(([topic, count]) => {
                          const meta = FOCUS_TOPIC_META[topic]
                          const colorClass = meta ? meta.color : 'text-gray-400'
                          return (
                            <span key={topic} className="text-gray-500 border border-gray-800 bg-black/40 px-2 py-1 rounded">
                              <span className={colorClass}>{topic}</span> ({count})
                            </span>
                          )
                        })}
                      </div>
                    ) : <div />}
                    <div className="text-[10px] font-mono text-blue-500 group-hover:text-blue-400 uppercase tracking-widest flex items-center gap-2">
                      Read full digest <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* List - The Hacker Terminal Variant */}
            <div className="space-y-3 font-mono text-sm mt-4 relative z-10">
                {/* Table Header */}
                {dates.length > 0 && (
                  <div className="flex text-[10px] text-gray-600 uppercase tracking-widest border-b border-white/10 pb-2 mb-4 hidden sm:flex">
                      <div className="w-16">ID</div>
                      <div className="w-32">DATE</div>
                      <div className="flex-1">FOCUS_VECTORS</div>
                      <div className="w-24 text-right">PAYLOAD</div>
                  </div>
                )}

                {dates.length === 0 ? (
                  <div className="text-gray-500 text-sm font-mono">No signals detected yet. Radar scanning...</div>
                ) : (
                  dates.map(({ date, itemCount, focusTopics }, idx) => {
                    const isLatest = idx === 0;
                    const hexId = `0x0${(15 - (idx % 16)).toString(16).toUpperCase()}`

                    return (
                      <motion.div
                        key={date}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                      >
                        <Link 
                          href={`/ai-daily/${date}/`} 
                          className="group flex flex-col sm:flex-row sm:items-center py-2 -mx-4 px-4 hover:bg-white/[0.03] transition-colors rounded gap-2 sm:gap-0"
                        >
                            {/* ID */}
                            <div className={`w-16 transition-colors ${isLatest ? 'text-blue-400 group-hover:text-blue-300' : 'text-gray-600 group-hover:text-blue-400/50'}`}>
                              {hexId}
                            </div>
                            
                            {/* Date */}
                            <div className={`w-32 transition-colors ${isLatest ? 'text-gray-300 group-hover:text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                              {date}
                            </div>
                            
                            {/* Tags */}
                            <div className="flex-1 flex flex-wrap gap-2">
                              {(!focusTopics || focusTopics.length === 0) ? (
                                <span className="text-gray-600">[No_Focus]</span>
                              ) : (
                                focusTopics.map(topic => {
                                  const meta = FOCUS_TOPIC_META[topic]
                                  if (!meta) return null
                                  return (
                                    <span
                                      key={topic}
                                      className={`${meta.color} transition-colors`}
                                    >
                                      [{meta.label}]
                                    </span>
                                  )
                                })
                              )}
                            </div>
                            
                            {/* Payload/Count */}
                            <div className={`w-24 sm:text-right transition-colors ${isLatest ? 'text-gray-500 group-hover:text-blue-400' : 'text-gray-600 group-hover:text-gray-400'}`}>
                                {itemCount} items <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">→</span>
                            </div>
                        </Link>
                      </motion.div>
                    )
                  })
                )}
                
                {/* EOF Marker */}
                {dates.length > 0 && (
                  <div className="mt-12 text-gray-600 text-[10px] uppercase tracking-widest pt-4 border-t border-white/5">
                      -- EOF --
                  </div>
                )}
            </div>
        </div>
      </div>
    </>
  )
}
