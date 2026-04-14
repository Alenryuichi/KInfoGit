import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticProps } from 'next'
import { getAllCodeWeeks, type CodeWeeklySummary } from '@/lib/code-weekly'
import { motion } from 'framer-motion'

interface CodeListProps {
  weeks: CodeWeeklySummary[]
}

export const getStaticProps: GetStaticProps<CodeListProps> = async () => {
  const weeks = getAllCodeWeeks()
  return { props: { weeks } }
}

export default function CodeList({ weeks }: CodeListProps) {
  return (
    <>
      <Head>
        <title>Code Weekly — Kylin Miao</title>
        <meta name="description" content="Weekly digest of AI Code editor ecosystem: features, benchmarks, and company blogs." />
      </Head>

      <div className="min-h-screen bg-[#050505] text-white relative" data-pagefind-body data-pagefind-meta="type:Code">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 pt-32 pb-32 relative z-10">
          
          {/* Header Section */}
          <div className="pb-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-mono text-emerald-500/80 text-[10px] tracking-[0.2em] uppercase mb-4 flex items-center gap-2"
            >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Edition / Weekly
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
                Code Weekly
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-2xl mb-8"
            >
                AI Code 编辑器生态周报. Tracking the evolution of Cursor, Claude Code, Windsurf, Trae & more.
            </motion.p>
          </div>

          {/* LEADERBOARDS: The Inline Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="border-t border-b border-white/10 py-5 mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
                <Link href="/code/benchmarks/" className="group inline-flex items-center gap-3 bg-white text-black px-6 py-2.5 rounded-full hover:bg-emerald-400 transition-colors font-medium text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    View Leaderboards
                </Link>
            </div>
            <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                Arena · SWE-bench · LiveCodeBench
            </div>
          </motion.div>

          {/* Week list */}
          <div className="space-y-2">
            {weeks.length === 0 ? (
              <div className="py-20 text-center text-gray-500 text-sm font-mono uppercase tracking-widest">
                -- No Tracking Logs --
              </div>
            ) : (
              weeks.map(({ week, dateRange, weekSummary, editorCount }, idx) => {
                const isLatest = idx === 0;
                
                return (
                  <motion.div
                    key={week}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 + 0.4 }}
                  >
                    <Link href={`/code/${week}/`} className={`group flex flex-col md:flex-row gap-4 md:gap-8 p-6 -mx-6 rounded-2xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all items-start relative ${!isLatest ? 'opacity-80 hover:opacity-100' : ''}`}>
                      
                      {/* Timeline/Active indicator for the latest item */}
                      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 transition-all duration-300 rounded-r opacity-0 group-hover:opacity-100 hidden md:block ${isLatest ? 'bg-emerald-500 group-hover:h-1/2' : 'bg-white/20 group-hover:h-1/2'}`}></div>

                      <div className="md:w-48 shrink-0">
                          <div className={`text-2xl font-bold transition-colors ${isLatest ? 'text-white group-hover:text-emerald-400' : 'text-gray-400 group-hover:text-white'}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {week}
                          </div>
                          <div className="font-mono text-xs text-gray-500 mt-1">{dateRange}</div>
                          {isLatest && (
                            <div className="inline-block mt-3 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono rounded uppercase tracking-widest border border-emerald-500/20">
                              Latest
                            </div>
                          )}
                      </div>
                      
                      <div className="flex-1">
                          <h3 className={`text-[15px] font-serif font-light mb-4 leading-[1.8] tracking-widest transition-colors ${isLatest ? 'text-gray-300 group-hover:text-gray-100' : 'text-gray-400 group-hover:text-gray-200'}`}>
                              {weekSummary || "AI Code 编辑器生态周报汇总更新。"}
                          </h3>
                          <div className="font-mono text-[10px] text-gray-600 flex flex-wrap gap-4 uppercase tracking-widest mt-6 pt-4 border-t border-white/5 inline-flex">
                              <span className="flex items-center gap-1.5">
                                <span className={`w-1 h-1 rounded-full ${isLatest ? 'bg-emerald-500/50' : 'bg-gray-500'}`}></span> 
                                {editorCount} editors tracked
                              </span>
                          </div>
                      </div>
                    </Link>
                    
                    {/* Separator between items */}
                    {idx < weeks.length - 1 && (
                      <div className="h-px bg-white/5 w-full my-2"></div>
                    )}
                  </motion.div>
                )
              })
            )}
            
            {/* EOF Marker */}
            {weeks.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="mt-16 text-center font-mono text-[10px] text-gray-600 uppercase tracking-widest"
              >
                  -- End of Tracking Logs --
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
