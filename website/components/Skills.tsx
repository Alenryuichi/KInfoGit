// Modern tech stack with animated marquee
const frontendTech = [
  { name: 'React', icon: 'https://cdn.simpleicons.org/react' },
  { name: 'Next.js', icon: 'https://cdn.simpleicons.org/nextdotjs/white' },
  { name: 'TypeScript', icon: 'https://cdn.simpleicons.org/typescript' },
  { name: 'Tailwind CSS', icon: 'https://cdn.simpleicons.org/tailwindcss' },
  { name: 'Vue.js', icon: 'https://cdn.simpleicons.org/vuedotjs' },
  { name: 'Motion', icon: 'https://cdn.simpleicons.org/framer' },
]

const backendTech = [
  { name: 'Node.js', icon: 'https://cdn.simpleicons.org/nodedotjs' },
  { name: 'Go', icon: 'https://cdn.simpleicons.org/go' },
  { name: 'Python', icon: 'https://cdn.simpleicons.org/python' },
  { name: 'PostgreSQL', icon: 'https://cdn.simpleicons.org/postgresql' },
  { name: 'MongoDB', icon: 'https://cdn.simpleicons.org/mongodb' },
  { name: 'Redis', icon: 'https://cdn.simpleicons.org/redis' },
]

const toolsTech = [
  { name: 'Docker', icon: 'https://cdn.simpleicons.org/docker' },
  { name: 'Kubernetes', icon: 'https://cdn.simpleicons.org/kubernetes' },
  { name: 'AWS', icon: 'https://cdn.simpleicons.org/amazonwebservices' },
  { name: 'Git', icon: 'https://cdn.simpleicons.org/git' },
  { name: 'Vercel', icon: 'https://cdn.simpleicons.org/vercel/white' },
  { name: 'Linux', icon: 'https://cdn.simpleicons.org/linux' },
]

const qualities = [
  'Accessible', 'Responsive', 'Dynamic', 'Scalable', 'Search Optimized',
  'Interactive', 'Secure', 'Reliable', 'Engaging', 'Fast'
]

// Marquee component for animated tech stack
const Marquee = ({ children, reverse = false }: { children: React.ReactNode, reverse?: boolean }) => (
  <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]">
    <div className={`flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row ${reverse ? '[animation-direction:reverse]' : ''}`} style={{ '--gap': '2rem' } as React.CSSProperties}>
      {children}
    </div>
    <div className={`flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row ${reverse ? '[animation-direction:reverse]' : ''}`} style={{ '--gap': '2rem' } as React.CSSProperties}>
      {children}
    </div>
  </div>
)

import { useEffect } from 'react'
import { animateOnScroll, animateSkillTags } from '@/utils/animations'

// Tech badge component
const TechBadge = ({ tech }: { tech: { name: string, icon: string } }) => (
  <div className="skill-tag inline-flex items-center justify-center rounded-lg border px-3 py-1 text-sm w-fit whitespace-nowrap shrink-0 gap-2 text-white border-gray-700 bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
    <img height="14" width="14" alt={tech.name} src={tech.icon} className="w-4" />
    <span>{tech.name}</span>
  </div>
)

export default function Skills() {
  useEffect(() => {
    // 初始化滚动动画
    animateOnScroll('.skills-header')
    animateSkillTags()
    animateOnScroll('.skills-strengths')
    animateOnScroll('.skills-cta')
  }, [])
  return (
    <section id="skills" className="py-20 bg-black text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="skills-header text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              My Skills
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                The Secret Sauce
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Passionate about cutting-edge technologies and building scalable,
              high-performance applications with modern tech stacks.
            </p>
          </div>

          {/* Tech Stack Marquees */}
          <div className="skills-container space-y-8 mb-20">
            {/* Frontend Technologies */}
            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-4 text-center">Frontend Technologies</h3>
              <Marquee>
                {frontendTech.map((tech, index) => (
                  <TechBadge key={`frontend-${index}`} tech={tech} />
                ))}
              </Marquee>
            </div>

            {/* Backend Technologies */}
            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-4 text-center">Backend & Database</h3>
              <Marquee reverse>
                {backendTech.map((tech, index) => (
                  <TechBadge key={`backend-${index}`} tech={tech} />
                ))}
              </Marquee>
            </div>

            {/* Tools & DevOps */}
            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-4 text-center">Tools & DevOps</h3>
              <Marquee>
                {toolsTech.map((tech, index) => (
                  <TechBadge key={`tools-${index}`} tech={tech} />
                ))}
              </Marquee>
            </div>
          </div>

          {/* Quality Attributes */}
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-center mb-8">
              Websites that stand out and make a difference
            </h3>
            <Marquee>
              {qualities.map((quality, index) => (
                <div key={`quality-${index}`} className="px-6 py-3 bg-gray-800/30 border border-gray-700/50 rounded-full text-gray-300 whitespace-nowrap">
                  {quality}
                </div>
              ))}
            </Marquee>
          </div>

          {/* Core Strengths */}
          <div className="skills-strengths grid md:grid-cols-3 gap-8 mb-16">
            <div className="group p-8 rounded-2xl bg-gray-900/50 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 hover:bg-gray-900/70">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">
                Anti-fraud Expert
              </h4>
              <p className="text-gray-400 leading-relaxed">
                Identified 50,000+ fraudulent enterprises, generated 3M+ direct revenue with zero complaints operation.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-gray-900/50 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 hover:bg-gray-900/70">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-2xl">🏗️</span>
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">
                System Architect
              </h4>
              <p className="text-gray-400 leading-relaxed">
                Built billion-scale data platforms from 0 to 1, enabling complex analysis completion in 5 minutes.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-gray-900/50 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 hover:bg-gray-900/70">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-2xl">🌐</span>
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">
                Full-Stack Developer
              </h4>
              <p className="text-gray-400 leading-relaxed">
                Proficient in both frontend and backend development with complete project delivery capabilities.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="skills-cta text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to build something amazing?
            </h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              I'm available for full-time roles & freelance projects.
              Let's collaborate and create exceptional digital experiences.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            >
              Get In Touch
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}