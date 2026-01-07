import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Experience from '@/components/Experience'
import SpotlightCard from '@/components/SpotlightCard'
import { profileData } from '@/lib/config'
import { getAllProjects, type Project } from '@/lib/projects'

interface WorkPageProps {
  profileData: typeof profileData
  projects: Project[]
}

export default function WorkPage({ profileData, projects }: WorkPageProps) {
  return (
    <>
      <Head>
        <title>Work - {profileData.name}</title>
        <meta name="description" content={`Explore ${profileData.name}'s professional work, projects, and experience`} />
        <meta property="og:title" content={`Work - ${profileData.name}`} />
        <meta property="og:description" content={`Explore ${profileData.name}'s professional work, projects, and experience`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Work - ${profileData.name}`} />
        <meta name="twitter:description" content={`Explore ${profileData.name}'s professional work, projects, and experience`} />
      </Head>

      <main className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
        </div>

        {/* Bento Grid Projects Section */}
        <section id="projects" className="py-20 pt-32 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                  FEATURED CASE STUDIES
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold mb-6">Curated work</h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                  A collection of core projects from Tencent anti-fraud and large-scale
                  data systems, presented as concise case studies.
                </p>
              </div>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => {
                  // 根据 layout 确定 col-span
                  const colSpan =
                    project.layout === 'featured'
                      ? 'md:col-span-2 lg:col-span-2'
                      : project.layout === 'compact'
                        ? ''
                        : ''

                  return (
                    <SpotlightCard
                      key={project.id}
                      className={`group ${colSpan}`}
                      spotlightColor="rgba(59, 130, 246, 0.15)"
                    >
                      <div className="p-6 md:p-8 h-full flex flex-col">
                        {/* Meta band */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div>
                            <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">
                              {project.category.replace(/-/g, ' ')}
                            </span>
                            <p className="mt-1 text-sm text-gray-500">{project.role}</p>
                          </div>
                          <span className="shrink-0 px-3 py-1 rounded-full text-xs font-medium bg-gray-800/80 text-gray-300 border border-gray-700/50">
                            {project.period}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                          {project.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-400 leading-relaxed mb-4 flex-grow">
                          {project.description}
                        </p>

                        {/* Impact Badge */}
                        {project.impact && (
                          <div className="inline-flex items-center self-start px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 mb-4">
                            <svg className="w-3.5 h-3.5 mr-1.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span className="text-blue-300 font-medium text-xs">{project.impact}</span>
                          </div>
                        )}

                        {/* Tech Tags */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          {project.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-1 text-xs bg-gray-800/60 text-gray-400 rounded-full border border-gray-700/50"
                            >
                              {tag}
                            </span>
                          ))}
                          {project.tags.length > 4 && (
                            <span className="px-2.5 py-1 text-xs text-gray-500">
                              +{project.tags.length - 4}
                            </span>
                          )}
                        </div>

                        {/* View Link */}
                        <Link
                          href={project.hasDetailPage ? `/work/${project.slug}` : '#'}
                          className={`inline-flex items-center text-sm font-medium transition-colors group/link ${
                            project.hasDetailPage
                              ? 'text-blue-400 hover:text-blue-300'
                              : 'text-gray-600 cursor-not-allowed'
                          }`}
                        >
                          <span>{project.hasDetailPage ? 'View case study' : 'Coming soon'}</span>
                          {project.hasDetailPage && (
                            <svg className="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          )}
                        </Link>
                      </div>
                    </SpotlightCard>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section className="py-20 relative z-10">
          <Experience />
        </section>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps<WorkPageProps> = async () => {
  // 使用 lib/projects.ts 的 getAllProjects，按 order 排序
  const projects = getAllProjects().sort((a, b) => a.order - b.order)
  return {
    props: {
      profileData,
      projects,
    },
  }
}
