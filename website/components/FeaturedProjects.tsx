import Link from 'next/link'
import { useEffect } from 'react'
import type { Project } from '@/lib/data'
import { animateOnScroll } from '@/utils/animations'

interface FeaturedProjectsProps {
  projects: Project[]
}

interface ProjectProcessMetric {
    label: string
    value: string
    percent: number
}

interface ProjectProcessData {
    pid: string
    metrics: ProjectProcessMetric[]
    logs: string[]
}

function getProjectProcessData(id: string) {
    const data: Record<string, ProjectProcessData> = {
        'betaline': {
            pid: '00001',
            metrics: [
                { label: 'EDGE_ACCEL', value: '300x', percent: 95 },
                { label: 'DETECTION', value: '92%', percent: 92 },
            ],
            logs: [
                '▸ [SYS] Compressing model for CoreML...',
                '▸ [OK] Edge inference latency dropped to 12ms.'
            ]
        },
        'openmemory-plus': {
            pid: '90210',
            metrics: [
                { label: 'RETENTION', value: '95%+', percent: 95 },
                { label: 'REDUNDANCY', value: '-40%', percent: 40 },
            ],
            logs: [
                '▸ [INFO] Compacting redundant memory vectors...',
                '▸ [OK] Context retention stable at 95%+.'
            ]
        },
        'anti-fraud-governance': {
            pid: '11032',
            metrics: [
                { label: 'BANNED_SVCS', value: '820+', percent: 85 },
                { label: 'ANNUAL_REV', value: '3M+', percent: 90 },
            ],
            logs: [
                '▸ [SYS] Executing Label Propagation...',
                '▸ [OK] 820+ malicious providers isolated.'
            ]
        },
        'portrait-platform': {
            pid: '82194',
            metrics: [
                { label: 'USERS', value: '1B+', percent: 100 },
                { label: 'WRITE_PERF', value: '130x', percent: 95 },
            ],
            logs: [
                '▸ [INFO] Rewriting PKV serialization protocol...',
                '▸ [OK] Write throughput skyrocketed to 12M/s.'
            ]
        },
        'ai-agent-review': {
            pid: '44910',
            metrics: [
                { label: 'ACCURACY', value: '90%+', percent: 90 },
                { label: 'AUTO_CLOSE', value: '300+/d', percent: 85 },
            ],
            logs: [
                '▸ [INFO] Injecting BM25 retrieved rules...',
                '▸ [OK] Complex review ticket resolved.'
            ]
        }
    }

    return data[id] || {
        pid: Math.floor(Math.random() * 90000 + 10000).toString(),
        metrics: [
            { label: 'HEALTH', value: '100%', percent: 100 },
            { label: 'UPTIME', value: '99.9%', percent: 99 },
        ],
        logs: [
            '▸ [INFO] Loading modules...',
            '▸ [OK] System is running normally.'
        ]
    }
}

function renderTuiBar(percent: number) {
    const totalBlocks = 12
    const filledBlocks = Math.round((percent / 100) * totalBlocks)
    const emptyBlocks = totalBlocks - filledBlocks
    
    return (
        <span className="tui-bar flex-1 mx-2 text-[0.55rem] tracking-widest font-mono hidden sm:inline-block">
            <span className="tui-fill">{'■'.repeat(filledBlocks)}</span>
            <span className="tui-empty text-white/15">{'■'.repeat(emptyBlocks)}</span>
        </span>
    )
}

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  useEffect(() => {
    animateOnScroll('.featured-projects-header')
    animateOnScroll('.featured-project-card')
  }, [])

  return (
    <section id="featured-projects" className="py-20 text-white">
      <style dangerouslySetInnerHTML={{__html: `
          @keyframes log-scroll { to { transform: translateY(0); opacity: 1; } }
      `}} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto w-full">
          
          {/* Section Header */}
          <div className="featured-projects-header mb-12 border-b border-white/10 pb-4">
            <h2 className="text-2xl font-mono text-purple-400">~/projects/selected_processes</h2>
            <p className="text-sm text-white/40 mt-2 font-sans font-light">
              Monitoring core background tasks from Tencent anti-fraud cluster and independent edge deployments.
            </p>
          </div>

          {/* Projects Grid - Responsive 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 3).map((project) => {
              const isIndie = project.section === '独立项目'
              const themeColor = isIndie ? 'text-purple-400' : 'text-emerald-400'
              const themeColorHex = isIndie ? '#a855f7' : '#34d399'
              const themeHoverBorder = isIndie ? 'hover:border-purple-500/50' : 'hover:border-emerald-500/50'
              const themeHoverShadow = isIndie ? 'hover:shadow-[inset_0_0_20px_rgba(0,0,0,1),0_0_30px_rgba(168,85,247,0.1)]' : 'hover:shadow-[inset_0_0_20px_rgba(0,0,0,1),0_0_30px_rgba(52,211,153,0.1)]'
              const prefix = isIndie ? '~/' : './'
              
              const processData = getProjectProcessData(project.id)

              return (
                <Link
                  key={project.id}
                  href={project.hasDetailPage === false ? '#' : `/work/${project.id}`}
                  className={`featured-project-card group block relative bg-[#050505] border border-white/10 rounded-md overflow-hidden transition-all duration-300 ${themeHoverBorder} ${themeHoverShadow} shadow-[inset_0_0_20px_rgba(0,0,0,1)] hover:-translate-y-0.5 flex flex-col`}
                >
                  <style dangerouslySetInnerHTML={{__html: `
                      .card-${project.id} .tui-fill { color: ${themeColorHex}; }
                      .card-${project.id} .log-highlight { color: ${themeColorHex}; }
                  `}} />

                  {/* Header (Status Bar) */}
                  <div className="bg-[#0a0a0a] border-b border-white/10 px-3 py-2 flex justify-between items-center font-mono text-[0.6rem]">
                      <div className="flex items-center gap-2">
                          <span 
                              className="inline-block w-1.5 h-1.5 animate-[blink_2s_step-end_infinite]" 
                              style={{ backgroundColor: themeColorHex, boxShadow: `0 0 6px ${themeColorHex}` }}
                          ></span>
                          <span className={`${themeColor} font-bold tracking-widest uppercase`}>
                              {isIndie ? 'DEPLOYED' : 'RUNNING'}
                          </span>
                      </div>
                      <div className="text-white/40">
                          PID: <span className="text-white/80">{processData.pid}</span>
                      </div>
                  </div>

                  <div className={`p-5 relative z-10 flex-1 flex flex-col card-${project.id}`}>
                      {/* Title & Desc */}
                      <div className="mb-4 border-b border-white/5 pb-4">
                          <h3 className={`text-base font-mono text-white/90 tracking-tight group-hover:${themeColor} transition-colors mb-2 truncate`}>
                              <span className="text-white/30 mr-1 select-none">{prefix}</span>
                              {project.slug || project.id}
                          </h3>
                          <p className="text-[0.8rem] text-white/50 font-light leading-relaxed font-sans line-clamp-2">
                              {project.highlights?.zh || project.description?.zh || `${project.company} · ${project.role.zh}`}
                          </p>
                      </div>

                      {/* Hardcore TUI Metrics */}
                      <div className="space-y-2.5 font-mono text-[0.6rem] mb-4">
                          {processData.metrics.map((m, i) => (
                              <div key={i} className="flex items-center justify-between">
                                  <span className="text-white/50 w-20 truncate">{m.label}</span>
                                  {renderTuiBar(m.percent)}
                                  <span className="text-white/90 text-right shrink-0">{m.value}</span>
                              </div>
                          ))}
                      </div>

                      {/* Stdout Log Window */}
                      <div className={`bg-black border border-white/5 rounded p-2.5 font-mono text-[0.55rem] leading-relaxed text-white/40 h-14 overflow-hidden relative group-hover:border-${isIndie ? 'purple' : 'emerald'}-500/30 transition-colors mb-4 mt-auto`}>
                          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none"></div>
                          {processData.logs.map((log: string, i: number) => {
                              const isLast = i === processData.logs.length - 1
                              return (
                                  <span 
                                      key={i} 
                                      className={`block transform translate-y-2 opacity-0 group-hover:animate-[log-scroll_0.3s_forwards_ease-out] ${isLast ? 'log-highlight opacity-100' : ''}`}
                                      style={{ animationDelay: `${i * 0.15}s`, opacity: isLast ? 1 : 0.7 }}
                                  >
                                      {log}
                                  </span>
                              )
                          })}
                      </div>

                      {/* Footer Tags */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                          <div className="flex gap-1.5 font-mono text-[0.55rem] text-white/40">
                              {project.tech_stack.slice(0, 2).map((tag) => (
                                  <span key={tag} className="bg-white/5 px-1.5 py-0.5 rounded border border-white/5 truncate max-w-[60px]">
                                      {tag}
                                  </span>
                              ))}
                          </div>
                          {project.hasDetailPage !== false && (
                              <span className={`font-mono text-[0.6rem] text-white/20 group-hover:${themeColor} transition-colors select-none whitespace-nowrap`}>
                                  [ Execute ] -&gt;
                              </span>
                          )}
                      </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* View All Link */}
          <div className="mt-12 text-center md:text-left">
            <Link
              href="/work#projects"
              className="inline-flex items-center text-sm font-mono text-white/40 hover:text-white/80 transition-colors group"
            >
              &gt; list --all-processes
              <span className="inline-block w-1.5 h-3 bg-white/60 align-middle ml-1.5 animate-[blink_1s_step-end_infinite]"></span>
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
