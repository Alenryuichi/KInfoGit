import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, RadioReceiver, GitCommit } from 'lucide-react'

export interface ReadingIssue {
  id: number
  number: number
  title: string
  body: string | null
  html_url: string
  state: string
  created_at: string
  updated_at: string
}

interface ReadingListProps {
  initialIssues?: ReadingIssue[]
  className?: string
}

// Fallback data if GitHub doesn't have the reading-list issues yet
const fallbackIssues: ReadingIssue[] = [
  {
    id: 1,
    number: 101,
    title: "Dive into Deep Learning (动手学深度学习)",
    body: "Deepening AI/ML fundamentals and mathematical intuitions. https://zh.d2l.ai/",
    html_url: "https://zh.d2l.ai/",
    state: "open",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export function ReadingList({ initialIssues = [], className = '' }: ReadingListProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    // SSR/CSR hydration gate for time-based rendering
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const displayIssues = initialIssues.length > 0 ? initialIssues : fallbackIssues

  return (
    <section className={`py-12 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <div className="mb-6 inline-block">
                <p className="font-mono text-blue-400/80 text-[10px] sm:text-xs uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
                    <RadioReceiver className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                    Data.Ingestion_Pipeline
                </p>
                <div className="h-px w-full bg-gradient-to-r from-blue-500/30 to-transparent"></div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                Knowledge <span className="font-serif italic font-light text-white/70">Intake</span>
            </h2>
          </motion.div>

          <div className="flex flex-col">
            {displayIssues.map((issue, idx) => (
              <motion.a
                key={issue.id}
                href={issue.html_url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-6 py-4 border-b border-white/5 hover:border-white/20 transition-colors"
              >
                {/* Left side: Meta & Title */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-grow min-w-0">
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-xs text-white/30 w-24">
                      {mounted ? new Date(issue.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' }) : '..../../..'}
                    </span>
                    {issue.state === 'open' ? (
                       <span className="flex items-center gap-1.5 text-[10px] font-mono text-blue-400 w-20">
                         <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_5px_currentColor]"></span>
                         INGESTING
                       </span>
                    ) : (
                       <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 w-20">
                         <GitCommit className="w-3 h-3" />
                         PROCESSED
                       </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-sm sm:text-base font-medium text-white/90 group-hover:text-blue-400 transition-colors truncate">
                      {issue.title}
                    </h3>
                    {issue.body && (
                      <p className="text-xs sm:text-sm text-white/40 truncate">
                        {issue.body.replace(/\*\*Link \/ Source\*\*:\s*https?:\/\/[^\s]+/g, '').replace(/\*\*Notes\*\*:\s*-?/g, '').trim()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right side: Icon */}
                <div className="shrink-0 text-white/20 group-hover:text-blue-400 transition-colors hidden sm:block">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </motion.a>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] sm:text-xs text-white/30"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white/30 rounded-full"></span>
              Auto-synced from GitHub Issues with label <code className="bg-white/10 px-1 py-0.5 rounded text-white/50">reading-list</code>
            </div>
            
            <div className="flex items-center gap-3">
              <a 
                href="https://github.com/Alenryuichi/KInfoGit/issues/new?labels=reading-list&template=reading-list.md" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/50 hover:text-emerald-400 transition-colors px-3 py-1.5 rounded-md border border-white/10 hover:border-emerald-400/30 hover:bg-emerald-400/10"
              >
                [ + Add_Log ]
              </a>
              <a 
                href="https://github.com/Alenryuichi/KInfoGit/issues?q=label%3Areading-list" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/50 hover:text-blue-400 transition-colors px-3 py-1.5 rounded-md border border-white/10 hover:border-blue-400/30 hover:bg-blue-400/10"
              >
                [ View_All_Logs ] <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
