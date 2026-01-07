import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { profileData } from '@/lib/config'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import ProjectHeader from '@/components/ProjectHeader'
import StickyTOC, { extractTOCFromContent, type TOCItem } from '@/components/StickyTOC'
import { getCoreProjects, getProjectById, getProjectDetailContent, type Project } from '@/lib/data'

interface ProjectPageProps {
  project: Project
  detailContent: string | null
  tocItems: TOCItem[]
}

export default function ProjectPage({ project, detailContent, tocItems }: ProjectPageProps) {
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
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
        </div>

        <section className="py-16 md:py-20 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* 2-Column Layout: Content + Sidebar */}
            <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-[1fr_280px] lg:gap-12">
              {/* Main Content Column */}
              <div className="max-w-4xl">
                {/* Project Header */}
                <ProjectHeader
                  title={project.title.zh}
                  titleEn={project.title.en}
                  category={project.category}
                  company={project.company}
                  role={project.role.zh}
                  period={project.period}
                  highlights={project.highlights?.zh}
                  impact={project.impact}
                  tags={project.tech_stack}
                />

                {/* Project Snapshot Card */}
                <section id="snapshot" className="mb-10">
                  <h2 className="text-xl font-semibold mb-4">Project Snapshot</h2>
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
                      <p className="text-sm text-gray-200">{project.category?.replace(/-/g, ' ') ?? 'Core Project'}</p>
                    </div>
                  </div>
                </section>

                {/* Overview */}
                <section id="overview" className="mb-10">
                  <h2 className="text-xl font-semibold mb-4">Overview</h2>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    This project took place during {project.period} at {project.company}. I worked as
                    <span className="mx-1 font-medium text-white">{project.role.zh}</span>
                    and was mainly responsible for
                    <span className="mx-1">{responsibilitiesZh.slice(0, 3).join('、')}</span>
                    {responsibilitiesZh.length > 3 ? ' and more.' : '.'}
                  </p>
                  {achievementsZh.length > 0 && (
                    <div className="mt-4 p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                      <h3 className="text-sm font-medium text-gray-400 mb-3">Key Outcomes</h3>
                      <ul className="space-y-2">
                        {achievementsZh.slice(0, 4).map((item) => (
                          <li key={item} className="flex items-start gap-2 text-gray-300">
                            <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>

                {/* Responsibilities */}
                <section id="responsibilities" className="mb-10">
                  <h2 className="text-xl font-semibold mb-4">我的角色与职责</h2>
                  <ul className="space-y-2">
                    {project.responsibilities.zh.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-gray-300">
                        <span className="text-blue-400 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Achievements */}
                <section id="achievements" className="mb-10">
                  <h2 className="text-xl font-semibold mb-4">关键成果与指标</h2>
                  <ul className="space-y-2">
                    {project.achievements.zh.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-gray-300">
                        <span className="text-green-400 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Background/Goals */}
                {project.description?.zh && (
                  <section id="background" className="mb-10">
                    <h2 className="text-xl font-semibold mb-4">项目背景与目标</h2>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                      {project.description.zh}
                    </p>
                  </section>
                )}

                {/* MDX Detail Content */}
                {detailContent && (
                  <section id="details" className="mb-10">
                    <MarkdownRenderer content={detailContent} />
                  </section>
                )}

                {/* Footer */}
                <footer className="pt-6 border-t border-gray-800 mt-12 flex items-center justify-between text-sm text-gray-500">
                  <span>Last updated: {project.period}</span>
                  <Link
                    href="/work"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Back to all projects
                  </Link>
                </footer>
              </div>

              {/* Sidebar - TOC (Hidden on mobile) */}
              <aside className="hidden lg:block">
                <StickyTOC items={tocItems} />
              </aside>
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

  const detailContent = await getProjectDetailContent(id)

  // 生成 TOC 项目
  // 预定义的固定区块 + 从 MDX 内容提取的标题
  const baseTocItems: TOCItem[] = [
    { id: 'snapshot', text: 'Project Snapshot', level: 2 },
    { id: 'overview', text: 'Overview', level: 2 },
    { id: 'responsibilities', text: '角色与职责', level: 2 },
    { id: 'achievements', text: '成果与指标', level: 2 },
  ]

  // 如果有背景描述，添加到 TOC
  if (project.description?.zh) {
    baseTocItems.push({ id: 'background', text: '项目背景', level: 2 })
  }

  // 从 MDX 内容提取标题
  const contentTocItems = detailContent ? extractTOCFromContent(detailContent) : []

  // 如果有 MDX 内容，添加 "Details" 父项
  if (detailContent && contentTocItems.length > 0) {
    baseTocItems.push({ id: 'details', text: 'Details', level: 2 })
  }

  const tocItems = [...baseTocItems, ...contentTocItems]

  return {
    props: {
      project,
      detailContent,
      tocItems,
    },
  }
}
