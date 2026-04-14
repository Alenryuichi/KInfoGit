import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticProps } from 'next'
import { getAllDailyDates, type DailyDigestSummary } from '@/lib/ai-daily'
import { motion } from 'framer-motion'

interface AiDailyListProps {
  dates: DailyDigestSummary[]
}

const FOCUS_TOPIC_META: Record<string, { label: string; color: string }> = {
  memory: { label: 'Memory', color: 'text-purple-400' },
  'self-evolution': { label: 'Self-Evolution', color: 'text-amber-400' },
  'multi-agent': { label: 'Multi-Agent', color: 'text-cyan-400' },
  planning: { label: 'Planning', color: 'text-emerald-500/70' },
  reflection: { label: 'Reflection', color: 'text-rose-500/70' },
  'tool-use': { label: 'Tool Use', color: 'text-gray-400' },
}

export const getStaticProps: GetStaticProps<AiDailyListProps> = async () => {
  const dates = getAllDailyDates()
  return { props: { dates } }
}

export default function AiDailyList({ dates }: AiDailyListProps) {
  return (
    <>
      <Head>
        <title>AI Daily — Kylin Miao</title>
        <meta name="description" content="Curated AI news, delivered daily. Sourced from HN, ArXiv, HF Papers, and RSS." />
      </Head>

      <div className="min-h-screen bg-[#0a0a0a] text-white relative" data-pagefind-body data-pagefind-meta="type:AI Daily">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 pt-32 pb-32 relative z-10">
            
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-16 relative z-10"
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
                    Curated intelligence sourced from HN, ArXiv, HF Papers, and RSS.<br/>
                    Powered by Horizon + DeepSeek.
                </p>
            </motion.div>

            {/* List - The Hacker Terminal Variant */}
            <div className="space-y-3 font-mono text-sm mt-12 relative z-10">
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
