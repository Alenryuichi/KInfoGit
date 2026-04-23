import Link from 'next/link'
import { useEffect, useMemo } from 'react'
import type { Project } from '@/lib/data'
import { animateOnScroll, animateProjectCards } from '@/utils/animations'

interface ProjectsProps {
	projects: Project[]
}

interface ProjectProcessMetric {
    label: string
    value: string
    percent: number
}

interface ProjectProcessData {
    pid: string
    mem: string
    env: string
    metrics: ProjectProcessMetric[]
    logs: string[]
}

// 辅助函数：根据项目 ID 映射硬核监控数据和日志
function getProjectProcessData(id: string) {
    const data: Record<string, ProjectProcessData> = {
        'betaline': {
            pid: '00001',
            mem: '32MB',
            env: 'Production',
            metrics: [
                { label: 'EDGE_ACCEL', value: '300x', percent: 95 },
                { label: 'DETECTION', value: '92%', percent: 92 },
                { label: 'CLOUD_COST', value: '-39%', percent: 39 },
            ],
            logs: [
                '▸ [SYS] Initializing YOLO11m with MobileNet V3...',
                '▸ [SYS] Compressing model for CoreML deployment...',
                '▸ [OK] Edge inference latency dropped to 12ms.'
            ]
        },
        'openmemory-plus': {
            pid: '90210',
            mem: '128MB',
            env: 'Local/MCP',
            metrics: [
                { label: 'RETENTION', value: '95%+', percent: 95 },
                { label: 'REDUNDANCY', value: '-40%', percent: 40 },
                { label: 'E2E_TESTS', value: '15', percent: 100 },
            ],
            logs: [
                '▸ [SYS] Bootstrapping dual-layer memory context...',
                '▸ [INFO] Compacting redundant memory vectors in Qdrant...',
                '▸ [OK] Cross-session context retention stable at 95%+.'
            ]
        },
        'anti-fraud-governance': {
            pid: '11032',
            mem: '64.5G',
            env: 'Cluster',
            metrics: [
                { label: 'BANNED_SVCS', value: '820+', percent: 85 },
                { label: 'ANNUAL_REV', value: '3M+', percent: 90 },
                { label: 'AUTO_MODS', value: '30+', percent: 100 },
            ],
            logs: [
                '▸ [WARN] Anomalous sub-graph structure detected in WeCom network.',
                '▸ [SYS] Executing Label Propagation and Graph Convolution...',
                '▸ [OK] 820+ malicious service providers isolated and banned.'
            ]
        },
        'portrait-platform': {
            pid: '82194',
            mem: '128G',
            env: 'Production',
            metrics: [
                { label: 'USERS_SCALE', value: '1B+', percent: 100 },
                { label: 'WRITE_PERF', value: '130x', percent: 95 },
                { label: 'FRAUD_DROP', value: '-30%', percent: 30 },
            ],
            logs: [
                '▸ [WARN] High concurrency lock contention detected on PKV nodes.',
                '▸ [INFO] Rewriting distributed PKV serialization protocol...',
                '▸ [OK] Write throughput skyrocketed from 90k/s to 12M/s.'
            ]
        },
        'ai-agent-review': {
            pid: '44910',
            mem: '16.2G',
            env: 'Production',
            metrics: [
                { label: 'ACCURACY', value: '90%+', percent: 90 },
                { label: 'AUTO_CLOSE', value: '300+/d', percent: 85 },
                { label: 'RULE_TOKENS', value: '200', percent: 10 },
            ],
            logs: [
                '▸ [SYS] Initializing Phase-Gated Controlled ReAct engine...',
                '▸ [INFO] Routing to domain agent. Injecting BM25 retrieved rules...',
                '▸ [OK] Complex review ticket automatically resolved. Accuracy 90%+.'
            ]
        }
    }

    return data[id] || {
        pid: Math.floor(Math.random() * 90000 + 10000).toString(),
        mem: '512MB',
        env: 'Production',
        metrics: [
            { label: 'HEALTH', value: '100%', percent: 100 },
            { label: 'UPTIME', value: '99.9%', percent: 99 },
        ],
        logs: [
            '▸ [SYS] Bootstrapping process...',
            '▸ [INFO] Loading configuration and modules...',
            '▸ [OK] System is running normally.'
        ]
    }
}

// 生成 TUI 进度条
function renderTuiBar(percent: number) {
    const totalBlocks = 20
    const filledBlocks = Math.round((percent / 100) * totalBlocks)
    const emptyBlocks = totalBlocks - filledBlocks
    
    return (
        <span className="tui-bar flex-1 mx-2 text-[0.65rem] tracking-[1px] font-mono">
            <span className="tui-fill">{'■'.repeat(filledBlocks)}</span>
            <span className="tui-empty text-white/15">{'■'.repeat(emptyBlocks)}</span>
        </span>
    )
}

// 项目卡片组件 (Process Monitor Style)
function ProjectCard({ project }: { project: Project }) {
    const isIndie = project.section === '独立项目'
    const themeColor = isIndie ? 'text-purple-400' : 'text-emerald-400'
    const themeColorHex = isIndie ? '#a855f7' : '#34d399'
    const themeHoverBorder = isIndie ? 'hover:border-purple-500/50' : 'hover:border-emerald-500/50'
    const themeHoverShadow = isIndie ? 'hover:shadow-[inset_0_0_20px_rgba(0,0,0,1),0_0_30px_rgba(168,85,247,0.1)]' : 'hover:shadow-[inset_0_0_20px_rgba(0,0,0,1),0_0_30px_rgba(52,211,153,0.1)]'
    const prefix = isIndie ? '~/' : './'
    
    const processData = getProjectProcessData(project.id)

	return (
		<Link
            href={project.hasDetailPage === false ? '#' : `/work/${project.id}`}
			className={`block group relative bg-[#050505] border border-white/10 rounded-md overflow-hidden transition-all duration-300 ${themeHoverBorder} ${themeHoverShadow} shadow-[inset_0_0_20px_rgba(0,0,0,1)] hover:-translate-y-0.5`}
		>
            <style jsx>{`
                .card-${project.id} .tui-fill { color: ${themeColorHex}; }
                .card-${project.id} .log-highlight { color: ${themeColorHex}; }
            `}</style>

            {/* Header (Status Bar) */}
            <div className="bg-[#0a0a0a] border-b border-white/10 px-4 py-2.5 flex justify-between items-center font-mono text-[0.65rem]">
                <div className="flex items-center gap-2">
                    <span 
                        className="inline-block w-2 h-2 animate-[blink_2s_step-end_infinite]" 
                        style={{ backgroundColor: themeColorHex, boxShadow: `0 0 8px ${themeColorHex}` }}
                    ></span>
                    <span className={`${themeColor} font-bold tracking-widest uppercase`}>
                        {isIndie ? 'DEPLOYED' : 'RUNNING'}
                    </span>
                </div>
                <div className="text-white/40 flex gap-4 hidden sm:flex">
                    <span>PID: <span className="text-white/80">{processData.pid}</span></span>
                    <span>MEM: <span className="text-white/80">{processData.mem}</span></span>
                    <span>ENV: <span className="text-white/80">{processData.env}</span></span>
                </div>
            </div>

			<div className={`p-6 relative z-10 card-${project.id}`}>
                {/* Title & Desc */}
                <div className="mb-5 border-b border-white/5 pb-5">
                    <h3 className={`text-lg font-mono text-white/90 tracking-tight group-hover:${themeColor} transition-colors mb-2`}>
                        <span className="text-white/30 mr-1 select-none">{prefix}</span>
                        {project.slug || project.id}
                    </h3>
                    <p className="text-sm text-white/50 font-light leading-relaxed font-sans line-clamp-2">
                        {project.description?.zh || project.highlights?.zh || `${project.company} · ${project.role.zh}`}
                    </p>
                </div>

                {/* Hardcore TUI Metrics */}
                <div className="space-y-3 font-mono text-[0.65rem] mb-6">
                    {processData.metrics.map((m, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <span className="text-white/50 w-24 truncate">{m.label}</span>
                            {renderTuiBar(m.percent)}
                            <span className="text-white/90 w-12 text-right">{m.value}</span>
                        </div>
                    ))}
                </div>

                {/* Stdout Log Window */}
                <div className={`bg-black border border-white/5 rounded p-3 font-mono text-[0.6rem] leading-relaxed text-white/40 h-[4.5rem] overflow-hidden relative group-hover:border-${isIndie ? 'purple' : 'emerald'}-500/30 transition-colors`}>
                    <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none"></div>
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
                <div className="flex items-center justify-between pt-5 mt-2">
                    <div className="flex flex-wrap gap-2 font-mono text-[0.6rem] text-white/40">
                        {project.tech_stack.slice(0, 3).map((tag) => (
                            <span key={tag} className="bg-white/5 px-1.5 py-0.5 rounded border border-white/5 truncate max-w-[80px]">
                                {tag}
                            </span>
                        ))}
                    </div>
                    {project.hasDetailPage !== false && (
                        <span className={`font-mono text-[0.65rem] text-white/20 group-hover:${themeColor} transition-colors select-none whitespace-nowrap ml-2`}>
                            [ Execute ] -&gt;
                        </span>
                    )}
                </div>
            </div>
		</Link>
	)
}

export function Projects({ projects }: ProjectsProps) {
	useEffect(() => {
		animateOnScroll('.projects-header')
		animateProjectCards()
	}, [])

	const groupedProjects = useMemo(() => {
		const groups: Record<string, Project[]> = {}
		const sectionOrder = ['独立项目', '企业微信'] 

		projects.forEach((project) => {
			const section = project.section || '其他项目'
			if (!groups[section]) {
				groups[section] = []
			}
			groups[section].push(project)
		})

		const orderedSections = sectionOrder.filter(s => groups[s])
		const otherSections = Object.keys(groups).filter(s => !sectionOrder.includes(s))

		return [...orderedSections, ...otherSections].map(section => ({
			section,
			projects: groups[section]
		}))
	}, [projects])

	return (
		<section id="projects" className="py-20 text-white">
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes log-scroll { to { transform: translateY(0); opacity: 1; } }
            `}} />
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="max-w-5xl mx-auto w-full">
					{/* Section Header */}
					<div className="projects-header mb-16 border-b border-white/10 pb-4">
						<h2 className="text-2xl font-mono text-emerald-400">~/projects/curated_work</h2>
						<p className="text-sm text-white/40 mt-2 font-sans font-light">
							Executing core AI Agent systems, RAG architectures, and independent mobile applications.
						</p>
					</div>

					{/* Projects by Section */}
					<div className="space-y-16">
						{groupedProjects.map(({ section, projects: sectionProjects }) => (
							<div key={section}>
								{/* Section Divider */}
								<div className="flex items-center gap-4 mb-8">
									<h3 className="text-xs font-mono text-white/30 uppercase tracking-widest">
										[ {section} ]
									</h3>
									<div className="h-px flex-1 bg-white/5"></div>
								</div>

								{/* Projects Grid */}
								<div className="projects-container grid grid-cols-1 md:grid-cols-2 gap-6">
									{sectionProjects.map((project) => (
										<ProjectCard key={project.id} project={project} />
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}
