import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticProps } from 'next'
import { motion } from 'framer-motion'
import {
  getAllFeedDates,
  getAllWeeklyDigests,
  getWeeklyDigestByWeek,
  getTagStats,
  getTopHighlights,
  type DailyFeedSummary,
  type WeeklyDigest,
  type TagStat,
  type HighlightItem,
} from '@/lib/social-feeds'
import { Github, MessageSquare, Youtube, FileText } from 'lucide-react'

interface StarsListProps {
  dates: DailyFeedSummary[]
  latestDigest: WeeklyDigest | null
  tagStats: TagStat[]
  highlights: HighlightItem[]
}

export const getStaticProps: GetStaticProps<StarsListProps> = async () => {
  const dates = getAllFeedDates()
  const digests = getAllWeeklyDigests()
  const latestDigest = digests.length > 0
    ? getWeeklyDigestByWeek(digests[0].week)
    : null
  const tagStats = getTagStats()
  const highlights = getTopHighlights(6)

  return { props: { dates, latestDigest, tagStats, highlights } }
}

// --- Weekly Digest Alert Component (Terminal Style) ---

function WeeklyDigestAlert({ digest }: { digest: WeeklyDigest }) {
  // Preview: first 2 sentences of overview
  const sentences = digest.overview.match(/[^.!?]+[.!?]+/g) || []
  const preview = sentences.slice(0, 2).join('').trim() || digest.overview.slice(0, 200)

  return (
    <div className="mb-8 border-l-2 border-purple-500 pl-4 py-2 bg-purple-500/5">
        <div className="text-[10px] text-purple-400 uppercase tracking-widest mb-2">++ Digest: {digest.week} Alert ++</div>
        <div className="text-gray-300">{preview}</div>
        <Link href={`/stars/weekly/${digest.week}/`} className="text-[10px] text-purple-400 hover:underline mt-2 inline-block">
            Read full digest -{'>'}
        </Link>
    </div>
  )
}

// --- Page ---

export default function StarsList({ dates, latestDigest, tagStats, highlights }: StarsListProps) {
  const [sourceFilter, setSourceFilter] = useState<string>('all')

  // Compute which sources have data
  const hasSources = {
    github: dates.some(d => d.githubCount > 0),
    bluesky: dates.some(d => d.blueskyCount > 0),
    youtube: dates.some(d => d.youtubeCount > 0),
    blog: dates.some(d => d.blogCount > 0),
  }

  // Filter dates by source
  const filteredDates = sourceFilter === 'all'
    ? dates
    : dates.filter(d => {
        if (sourceFilter === 'github') return d.githubCount > 0
        if (sourceFilter === 'bluesky') return d.blueskyCount > 0
        if (sourceFilter === 'youtube') return d.youtubeCount > 0
        if (sourceFilter === 'blog') return d.blogCount > 0
        return true
      })

  return (
    <>
      <Head>
        <title>Stars — Kylin Miao</title>
        <meta name="description" content="Recently starred GitHub repos and Bluesky posts from AI leaders with AI-powered highlights." />
        <link rel="alternate" type="application/rss+xml" title="Stars & Posts — Kylin Miao" href="/stars/feed.xml" />
      </Head>

      <div className="min-h-screen bg-[#050505] text-white relative font-mono" data-pagefind-body data-pagefind-meta="type:Stars">
        <div className="fixed inset-0 bg-[#050505] -z-10" />
        <div className="max-w-4xl mx-auto px-6 pt-32 pb-32 relative z-10">
          
          {/* Terminal Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 border-b border-white/10 pb-8"
          >
              <div className="flex items-center gap-3 mb-4">
                  <span className="w-2 h-4 bg-orange-500 animate-pulse"></span>
                  <span className="text-orange-400 text-xs uppercase tracking-widest">System.Social_Ingestion</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white mb-4 font-sans">Stars / Feed</h1>
              <div className="text-xs text-gray-500 mb-6 leading-relaxed">
                  [STATUS] Monitoring 50+ AI leaders across GitHub, Bluesky, YouTube, Blog RSS.<br/>
                  [ENGINE] Summarization powered by DeepSeek.
              </div>
              
              {/* CMD Links */}
              <div className="flex gap-4 text-xs flex-wrap">
                  <Link href="/stars/people/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                      <span className="text-orange-500/50">$</span> ./view_leaders.sh
                  </Link>
                  <Link href="/stars/timeline/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                      <span className="text-orange-500/50">$</span> tail -f global_timeline.log
                  </Link>
                  <a href="/stars/feed.xml" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                      <span className="text-orange-500/50">$</span> curl -O rss_feed.xml
                  </a>
              </div>
          </motion.div>

          {/* Filters Terminal Style */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center gap-4 mb-8 text-[10px] uppercase tracking-widest"
          >
              <span className="text-gray-600">grep SOURCE=</span>
              <div className="flex flex-wrap gap-2">
                {(['all', 'github', 'bluesky', 'youtube', 'blog'] as const).map(source => {
                  if (source !== 'all' && !hasSources[source]) return null
                  const labels: Record<string, string> = { all: '[*All]', github: 'GitHub', bluesky: 'Bluesky', youtube: 'YouTube', blog: 'Blog' }
                  const isActive = sourceFilter === source
                  return (
                    <button
                      key={source}
                      onClick={() => setSourceFilter(source)}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        isActive
                          ? 'text-white bg-white/10 border border-white/20'
                          : 'text-gray-500 hover:text-white border border-transparent'
                      }`}
                    >
                      {labels[source]}
                    </button>
                  )
                })}
              </div>
          </motion.div>

          {/* System Variables (Trending) */}
          {sourceFilter === 'all' && tagStats.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8 font-mono text-[10px] sm:text-xs"
            >
                <div className="text-gray-500 uppercase tracking-widest mb-2 border-b border-white/10 pb-2">++ Runtime_Variables ++</div>
                <div className="flex flex-col gap-2 text-gray-400 mt-4">
                    <div><span className="text-orange-400">ACTIVE_VECTORS</span>=[{tagStats.slice(0, 5).map(t => `"${t.tag} (${t.count})"`).join(', ')}]</div>
                </div>
            </motion.div>
          )}

          {/* Top Signals (Highlights) */}
          {sourceFilter === 'all' && highlights.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-10 border-l-2 border-orange-500 pl-4 py-2 bg-orange-500/5 font-mono text-[10px] sm:text-xs overflow-hidden"
            >
                <div className="text-orange-400 uppercase tracking-widest mb-2">++ System.Highlights (Top Signals) ++</div>
                <div className="space-y-3 mt-3 pr-2">
                  {highlights.map((hl, i) => {
                    const type = hl.item.type
                    const url = type === 'github' ? hl.item.url : type === 'bluesky' ? hl.item.url : type === 'youtube' ? hl.item.url : hl.item.url
                    const title = type === 'github' ? hl.item.repo : type === 'bluesky' ? hl.item.content.slice(0, 50) + '...' : type === 'youtube' ? hl.item.title : (hl.item as any).title
                    const stats = type === 'github' ? `★ ${(hl.item.stargazersCount / 1000).toFixed(1)}k` : type === 'bluesky' ? `❤️ ${hl.item.likeCount}` : type === 'youtube' ? `👁 ${(hl.item.viewCount / 1000).toFixed(1)}k` : ''
                    const leaderCount = type === 'github' ? (hl.item.starredBy?.split(',').length || 1) : 1
                    
                    const description = type === 'github' ? hl.item.description : type === 'bluesky' ? hl.item.content : type === 'youtube' ? hl.item.description : (hl.item as any).summary
                    
                    return (
                      <div key={i} className="group flex flex-col">
                          <div className="flex sm:items-center flex-col sm:flex-row gap-1 sm:gap-2">
                              <span className={`${type === 'github' ? 'text-gray-500' : type === 'bluesky' ? 'text-blue-400' : type === 'youtube' ? 'text-red-400' : 'text-emerald-400'} w-6 shrink-0 flex justify-center`} title={type}>
                                  {type === 'github' ? <Github className="w-4 h-4" /> : type === 'bluesky' ? <MessageSquare className="w-4 h-4" /> : type === 'youtube' ? <Youtube className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                              </span>
                              <a href={url} target="_blank" rel="noopener noreferrer" className="text-gray-200 group-hover:text-orange-400 cursor-pointer transition-colors truncate max-w-sm sm:max-w-md">
                                  {title}
                              </a>
                              <div className="flex items-center gap-2">
                                  {stats && <span className="text-orange-400/80 sm:mx-2 whitespace-nowrap">{stats}</span>}
                                  <span className="text-gray-500 whitespace-nowrap"># {leaderCount} leader{leaderCount > 1 ? 's' : ''}</span>
                              </div>
                          </div>
                          {description && (
                              <div className="overflow-hidden max-h-0 group-hover:max-h-[350px] group-hover:overflow-y-auto overscroll-contain transition-all duration-500 ease-in-out">
                                  <div className="text-gray-400 text-xs sm:ml-8 max-w-2xl border-l-2 border-white/10 pl-3 py-1 my-2 pr-2 whitespace-pre-wrap font-sans opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                      {description}
                                  </div>
                              </div>
                          )}
                      </div>
                    )
                  })}
                </div>
            </motion.div>
          )}

          {/* Data Log */}
          <div className="space-y-4 text-sm mt-12">
              {/* Top Signals (Warning style - Digest) */}
              {latestDigest && sourceFilter === 'all' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <WeeklyDigestAlert digest={latestDigest} />
                </motion.div>
              )}

              {/* Table Header */}
              {filteredDates.length > 0 && (
                <div className="flex text-[10px] text-gray-600 border-b border-white/10 pb-2 uppercase tracking-widest mb-4 mt-8 hidden sm:flex">
                    <div className="w-32">DATE</div>
                    <div className="flex-1">ACTIVITY_METRICS</div>
                    <div className="w-24 text-right">ACTION</div>
                </div>
              )}

              {/* Rows */}
              {filteredDates.length === 0 ? (
                <div className="text-gray-500 text-sm font-mono mt-8">No content matches criteria.</div>
              ) : (
                filteredDates.map((item, idx) => {
                  const isLatest = idx === 0;
                  
                  return (
                    <motion.div
                      key={item.date}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 + Math.min(idx, 20) * 0.05 }}
                    >
                      <Link href={`/stars/${item.date}/`} className="flex flex-col sm:flex-row sm:items-center py-2 hover:bg-white/[0.03] transition-colors group gap-2 sm:gap-0 -mx-4 px-4 sm:mx-0 sm:px-0 rounded sm:rounded-none">
                          <div className={`w-32 transition-colors ${isLatest ? 'text-orange-400' : 'text-gray-400 group-hover:text-gray-200'}`}>
                              {item.date}
                          </div>
                          <div className={`flex-1 flex flex-wrap gap-4 text-xs transition-colors ${isLatest ? 'text-gray-400' : 'text-gray-500'}`}>
                              {item.githubCount > 0 && <span className="flex items-center gap-1.5"><Github className="w-3.5 h-3.5" /> {item.githubCount}</span>}
                              {item.blueskyCount > 0 && <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> {item.blueskyCount}</span>}
                              {item.youtubeCount > 0 && <span className="flex items-center gap-1.5"><Youtube className="w-3.5 h-3.5" /> {item.youtubeCount}</span>}
                              {item.blogCount > 0 && <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> {item.blogCount}</span>}
                          </div>
                          <div className={`w-24 sm:text-right transition-colors hidden sm:block ${isLatest ? 'text-gray-600 group-hover:text-orange-400' : 'text-gray-600 group-hover:text-white'}`}>
                              cat &gt;
                          </div>
                      </Link>
                    </motion.div>
                  )
                })
              )}

              {/* EOF Marker */}
              {filteredDates.length > 0 && (
                <div className="mt-8 text-gray-600 text-[10px] uppercase tracking-widest pt-4 border-t border-white/10">
                    -- END OF LOG --
                </div>
              )}
          </div>

        </div>
      </div>
    </>
  )
}
