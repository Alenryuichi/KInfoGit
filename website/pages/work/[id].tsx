import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { profileData } from '@/lib/config'
import { getCoreProjects, getProjectById, type Project } from '@/lib/data'

interface ProjectPageProps {
	project: Project
}

export default function ProjectPage({ project }: ProjectPageProps) {
		const responsibilitiesZh = project.responsibilities.zh
		const achievementsZh = project.achievements.zh

	return (
		<>
			<Head>
				<title>{project.title.zh} - Case Study - {profileData.name}</title>
				<meta
					name="description"
					content={project.highlights?.zh ?? project.achievements.zh[0] ?? ''}
				/>
				<meta property="og:title" content={`${project.title.zh} - Case Study - ${profileData.name}`} />
				<meta
					property="og:description"
					content={project.highlights?.zh ?? project.achievements.zh[0] ?? ''}
				/>
				<meta property="og:type" content="article" />
			</Head>

			<main className="min-h-screen bg-black text-white relative overflow-hidden">
				{/* Background Effects - align with Work page */}
				<div className="absolute inset-0">
					<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
					<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
					<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
				</div>

				<section className="py-16 md:py-20 relative z-10">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8">
						<div className="max-w-4xl mx-auto">
							<div className="mb-8 flex items-center justify-between gap-4">
								<Link
									href="/work#projects"
									className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
								>
									<span className="mr-2">←</span>
									<span>Back to Work</span>
								</Link>
								<span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800/80 text-gray-300 border border-gray-700/50">
									{project.period}
								</span>
							</div>

							<header className="mb-8 md:mb-10 space-y-4">
								<p className="text-sm text-blue-400 uppercase tracking-wide">
									{project.category ?? 'Core Project'}
								</p>
								<h1 className="text-3xl sm:text-4xl font-bold text-white">
									{project.title.zh}
								</h1>
								{project.title.en && (
									<p className="text-lg text-gray-300">{project.title.en}</p>
								)}
								<p className="text-sm text-gray-400">
									{project.company} · {project.role.zh}
								</p>
								{project.highlights?.zh && (
									<p className="mt-4 text-gray-300 leading-relaxed">{project.highlights.zh}</p>
								)}
								{project.impact && (
									<p className="mt-2 text-sm text-blue-300">Impact: {project.impact}</p>
								)}
							</header>

							{/* Project overview */}
							<section className="mb-8">
								<h2 className="text-lg font-semibold mb-3">Project overview</h2>
								<p className="text-gray-300 leading-relaxed mb-4">
									This project took place during {project.period} at {project.company}. I worked as
									<span className="mx-1 font-medium">{project.role.zh}</span>
									and was mainly responsible for
									<span className="mx-1">
										{responsibilitiesZh.slice(0, 3).join('、')}
									</span>
									(and more).
								</p>
								{achievementsZh.length ? (
									<div>
										<h3 className="text-sm font-medium text-gray-400 mb-2">Key outcomes (snapshot)</h3>
										<ul className="list-disc list-inside text-gray-300 space-y-1">
											{achievementsZh.slice(0, 3).map((item) => (
												<li key={item}>{item}</li>
											))}
										</ul>
									</div>
								) : null}
							</section>

							{/* Snapshot card */}
							<section className="mb-8">
								<h2 className="text-lg font-semibold mb-3">Project snapshot</h2>
								<div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-6 grid gap-4 sm:grid-cols-2">
									<div>
										<p className="text-xs text-gray-500 mb-1">Company</p>
										<p className="text-sm text-gray-200">{project.company}</p>
									</div>
									<div>
										<p className="text-xs text-gray-500 mb-1">Role</p>
										<p className="text-sm text-gray-200">{project.role.zh}</p>
									</div>
									<div>
										<p className="text-xs text-gray-500 mb-1">Period</p>
										<p className="text-sm text-gray-200">{project.period}</p>
									</div>
									<div>
										<p className="text-xs text-gray-500 mb-1">Category</p>
										<p className="text-sm text-gray-200">{project.category ?? 'Core Project'}</p>
									</div>
									<div className="sm:col-span-2">
										<p className="text-xs text-gray-500 mb-2">Tech Stack</p>
										<div className="flex flex-wrap gap-2">
											{project.tech_stack.map((tag) => (
												<span
													key={tag}
													className="px-3 py-1 text-xs bg-gray-800/60 text-gray-300 rounded-full border border-gray-700/50"
												>
													{tag}
												</span>
											))}
										</div>
									</div>
								</div>
							</section>

							{/* Responsibilities */}
							<section className="mb-8">
								<h2 className="text-lg font-semibold mb-3">我的角色与职责</h2>
								<ul className="list-disc list-inside text-gray-300 space-y-1">
									{project.responsibilities.zh.map((item) => (
										<li key={item}>{item}</li>
									))}
								</ul>
							</section>

							{/* Achievements */}
							<section className="mb-8">
								<h2 className="text-lg font-semibold mb-3">关键成果与指标</h2>
								<ul className="list-disc list-inside text-gray-300 space-y-1">
									{project.achievements.zh.map((item) => (
										<li key={item}>{item}</li>
									))}
								</ul>
							</section>

							{/* Optional description as background/goal section */}
							{project.description?.zh && (
								<section className="mb-8">
									<h2 className="text-lg font-semibold mb-3">项目背景与目标</h2>
									<p className="text-gray-300 leading-relaxed whitespace-pre-line">
										{project.description.zh}
									</p>
								</section>
							)}

							<footer className="pt-4 border-t border-gray-800 mt-8 flex items-center justify-between text-sm text-gray-500">
								<span>
									Last updated: {project.period}
								</span>
								<Link
									href="/work#projects"
									className="text-blue-400 hover:text-blue-300"
								>
									Back to all projects
								</Link>
							</footer>
						</div>
					</div>
				</section>
			</main>
		</>
	)
}

export const getStaticPaths: GetStaticPaths = async () => {
	const projects = await getCoreProjects()
	if (!projects) {
		return { paths: [], fallback: false }
	}

	const paths = projects.map((project) => ({
		params: { id: project.id },
	}))

	return {
		paths,
		fallback: false,
	}
}

export const getStaticProps: GetStaticProps<ProjectPageProps> = async (context) => {
	const id = context.params?.id as string
	const project = await getProjectById(id)

	if (!project) {
		return {
			notFound: true,
		}
	}

	return {
		props: {
			project,
		},
	}
}
