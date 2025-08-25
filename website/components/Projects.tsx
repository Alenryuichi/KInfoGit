// Featured projects data
const featuredProjects = [
  {
    id: 1,
    title: "Anti-Fraud Strategy Management System",
    description: "Enterprise-level strategy management platform enabling full lifecycle automation from R&D to operations. Achieved 60% efficiency improvement through intelligent optimization.",
    image: "/projects/strategy-system.jpg",
    tags: ["Go", "Vue.js", "ClickHouse", "Microservices"],
    status: "Live",
    year: "2024",
    metrics: [
      { label: "Efficiency Boost", value: "60%" },
      { label: "False Positive Reduction", value: "40%" },
      { label: "Coverage Increase", value: "50%" }
    ],
    link: "#",
    featured: true
  },
  {
    id: 2,
    title: "Billion-Scale Graph Database Platform",
    description: "Built from 0 to 1, processing 10+ billion data points with 5-minute complex analysis capability. Supports real-time relationship network analysis.",
    image: "/projects/graph-db.jpg",
    tags: ["Python", "Graph Database", "Big Data", "Analytics"],
    status: "Live",
    year: "2023",
    metrics: [
      { label: "Data Scale", value: "10B+" },
      { label: "Query Speed", value: "5min" },
      { label: "Accuracy", value: "99.5%" }
    ],
    link: "#",
    featured: true
  },
  {
    id: 3,
    title: "Real-time Risk Control Engine",
    description: "High-performance risk assessment system processing millions of transactions daily. Identified 50,000+ fraudulent enterprises with zero false positives.",
    image: "/projects/risk-engine.jpg",
    tags: ["Go", "Redis", "Machine Learning", "Real-time"],
    status: "Live",
    year: "2023",
    metrics: [
      { label: "Fraud Detection", value: "50K+" },
      { label: "Revenue Impact", value: "$3M+" },
      { label: "False Positives", value: "0" }
    ],
    link: "#",
    featured: false
  },
  {
    id: 4,
    title: "Modern Portfolio Website",
    description: "Responsive portfolio built with Next.js, featuring dark mode, blog system, and modern animations. Optimized for performance and SEO.",
    image: "/projects/portfolio.jpg",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "MDX"],
    status: "Live",
    year: "2025",
    metrics: [
      { label: "Performance", value: "98/100" },
      { label: "Accessibility", value: "100/100" },
      { label: "SEO", value: "100/100" }
    ],
    link: "#",
    featured: false
  }
]

import { useEffect } from 'react'
import { animateOnScroll, animateProjectCards } from '@/utils/animations'

export default function Projects() {
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
              A collection of projects that showcase my expertise in building scalable,
              high-performance applications and solving complex technical challenges.
            </p>
          </div>

          {/* Projects Grid */}
          <div className="projects-container grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredProjects.map((project, index) => (
              <div
                key={project.id}
                className={`project-card group relative overflow-hidden rounded-2xl bg-gray-900/50 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-500 hover:bg-gray-900/70 ${
                  project.featured ? 'lg:col-span-2' : ''
                }`}
              >
                {/* Project Image */}
                <div className="aspect-video relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl opacity-20">🚀</div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      {project.status}
                    </span>
                  </div>

                  {/* Year Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800/80 text-gray-300 border border-gray-700/50">
                      {project.year}
                    </span>
                  </div>
                </div>

                {/* Project Content */}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>

                  <p className="text-gray-400 leading-relaxed mb-6">
                    {project.description}
                  </p>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {project.metrics.map((metric, idx) => (
                      <div key={idx} className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                        <div className="text-xs text-gray-500">{metric.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-xs bg-gray-800/60 text-gray-300 rounded-full border border-gray-700/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Project Link */}
                  <a
                    href={project.link}
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors group/link"
                  >
                    View Project
                    <svg className="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
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
              Let's create something amazing together.
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
              <a
                href="/projects"
                className="inline-flex items-center px-8 py-4 border border-gray-600 text-gray-300 font-semibold rounded-full hover:border-gray-400 hover:text-white transition-all duration-300"
              >
                See More Projects
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}