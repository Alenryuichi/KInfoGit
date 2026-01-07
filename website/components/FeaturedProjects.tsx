import Link from 'next/link'
import { useEffect } from 'react'
import type { Project } from '@/lib/projects'
import { animateOnScroll } from '@/utils/animations'

interface FeaturedProjectsProps {
  projects: Project[]
}

export default function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  useEffect(() => {
    animateOnScroll('.featured-projects-header')
    animateOnScroll('.featured-project-card')
  }, [])

  return (
    <section id="featured-projects" className="py-20 bg-black text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="featured-projects-header text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
              FEATURED PROJECTS
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Selected Work
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Core projects from Tencent anti-fraud and large-scale data systems.
            </p>
          </div>

          {/* Projects Grid - Responsive (max 3 for balanced layout) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 3).map((project) => (
              <Link
                key={project.id}
                href={`/work/${project.id}`}
                className="featured-project-card group block"
              >
                <div className="h-full p-6 rounded-xl bg-gray-900/50 border border-gray-800/50 hover:border-purple-500/30 hover:bg-gray-900/70 transition-all duration-300">
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {project.category ?? 'Project'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {project.period}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-800/60 text-gray-300 rounded-full border border-gray-700/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* View Link */}
                  <div className="flex items-center text-purple-400 text-sm group-hover:text-purple-300 transition-colors">
                    <span>View details</span>
                    <svg
                      className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* View All Link */}
          <div className="text-center mt-10">
            <Link
              href="/work#projects"
              className="inline-flex items-center px-6 py-3 border border-gray-600 text-gray-300 font-medium rounded-full hover:border-purple-500/50 hover:text-white transition-all duration-300"
            >
              View All Projects
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

