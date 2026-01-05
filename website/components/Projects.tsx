import Link from 'next/link'
import { useEffect } from 'react'
import type { Project } from '@/lib/data'
import { animateOnScroll, animateProjectCards } from '@/utils/animations'

interface ProjectsProps {
	projects: Project[]
}

export default function Projects({ projects }: ProjectsProps) {
	useEffect(() => {
		// 初始化滚动动画
		animateOnScroll('.projects-header')
		animateProjectCards()
	}, [])

	return (
		<section id="projects" className="py-20 bg-black text-white">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					{/* Section Header */}
					<div className="projects-header text-center mb-16">
						<div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
							FEATURED CASE STUDIES
						</div>
						<h2 className="text-4xl sm:text-5xl font-bold mb-6">
							Curated work
						</h2>
						<p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
							A collection of core projects from Tencent anti-fraud and large-scale
							data systems, presented as concise case studies.
						</p>
					</div>

					{/* Projects Grid */}
					<div className="projects-container grid grid-cols-1 lg:grid-cols-2 gap-8">
						{projects.map((project) => (
							<div
								key={project.id}
								className="project-card group relative overflow-hidden rounded-2xl bg-gray-900/50 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-500 hover:bg-gray-900/70"
							>
								{/* Meta band */}
								<div className="px-8 pt-8 pb-4 flex items-center justify-between gap-4">
									<div className="flex flex-col text-left">
										<span className="text-xs font-medium text-blue-400 uppercase tracking-wide">
											{project.category ?? 'Core Project'}
										</span>
										<span className="mt-1 text-sm text-gray-400">
											{project.company} · {project.role.zh}
										</span>
									</div>
									<span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800/80 text-gray-300 border border-gray-700/50">
										{project.period}
									</span>
								</div>

								{/* Project Content */}
								<div className="px-8 pb-8">
									<h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
										{project.title.zh}
									</h3>
									{project.title.en && (
										<p className="text-sm text-gray-400 mb-3">
											{project.title.en}
										</p>
									)}

									{project.highlights?.zh && (
										<p className="text-gray-300 leading-relaxed mb-4">
											{project.highlights.zh}
										</p>
									)}

									{project.impact && (
										<p className="text-sm text-blue-300 mb-4">
											Impact: {project.impact}
										</p>
									)}

									{/* Achievements preview */}
									{project.achievements?.zh?.length ? (
										<ul className="list-disc list-inside text-sm text-gray-400 space-y-1 mb-4">
											{project.achievements.zh.slice(0, 3).map((item) => (
												<li key={item}>{item}</li>
											))}
										</ul>
									) : null}

									{/* Tech Stack */}
									<div className="flex flex-wrap gap-2 mb-6">
										{project.tech_stack.map((tag) => (
											<span
												key={tag}
												className="px-3 py-1 text-xs bg-gray-800/60 text-gray-300 rounded-full border border-gray-700/50"
											>
												{tag}
											</span>
										))}
									</div>

									{/* Project Link */}
									<Link
										href={`/work/${project.id}`}
										className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors group/link"
									>
										<span>View full case study</span>
										<svg className="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
										</svg>
									</Link>
								</div>

								{/* Hover Effect */}
								<div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
							</div>
						))}
					</div>

					{/* CTA Section */}
					<div className="text-center mt-16">
						<h3 className="text-2xl font-bold text-white mb-4">
							Interested in working together?
						</h3>
						<p className="text-gray-400 mb-8 max-w-2xl mx-auto">
							I'm always open to discussing new opportunities and interesting projects.
							Let's create something meaningful together.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<a
								href="#contact"
								className="inline-flex items-center px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
							>
								Start a Project
								<svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
								</svg>
							</a>
							<Link
								href="/work#projects"
								className="inline-flex items-center px-8 py-4 border border-gray-600 text-gray-300 font-semibold rounded-full hover:border-gray-400 hover:text-white transition-all duration-300"
							>
								See More Projects
							</Link>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}