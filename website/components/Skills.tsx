import React, { useEffect, Children } from 'react'
import { motion } from 'framer-motion'
import { animateOnScroll, animateSkillTags } from '@/utils/animations'

// Animation variants for staggered entrance
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 20
    }
  }
}

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

const aiTech = [
  { name: 'Claude Code', icon: 'https://cdn.simpleicons.org/anthropic' },
  { name: 'Gemini CLI', icon: 'https://cdn.simpleicons.org/googlegemini' },
  { name: 'Auggie', icon: 'https://img.icons8.com/ios-filled/50/ffffff/robot-2.png' }, // Placeholder for Auggie
  { name: 'NotebookLM', icon: 'https://img.icons8.com/ios-filled/50/ffffff/notebook.png' }, // Placeholder for NotebookLM
  { name: 'BMAD', icon: 'https://img.icons8.com/ios-filled/50/ffffff/artificial-intelligence.png' }, // Placeholder for BMAD
  { name: 'Compound', icon: 'https://img.icons8.com/ios-filled/50/ffffff/network.png' }, // Placeholder for Compound
  { name: 'Agent', icon: 'https://img.icons8.com/ios-filled/50/ffffff/bot.png' },
  { name: 'Workflow', icon: 'https://img.icons8.com/ios-filled/50/ffffff/workflow.png' },
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

// Marquee component for animated tech stack - True Infinite Scroll
const Marquee = ({ children, reverse = false }: { children: React.ReactNode, reverse?: boolean }) => {
  // 将 children 复制多份以确保内容足够长，实现无缝滚动
  const items = Children.toArray(children);
  // 复制 4 份确保无缝
  const repeatedItems = [...items, ...items, ...items, ...items];

  return (
    <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)] group">
      <div
        className={`flex shrink-0 py-3 flex-row items-center ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'} group-hover:[animation-play-state:paused]`}
      >
        {repeatedItems.map((child, index) => (
          <div key={`marquee-1-${index}`} className="flex-shrink-0 mx-2">
            {child}
          </div>
        ))}
      </div>
      <div
        className={`flex shrink-0 py-3 flex-row items-center ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'} group-hover:[animation-play-state:paused]`}
        aria-hidden="true"
      >
        {repeatedItems.map((child, index) => (
          <div key={`marquee-2-${index}`} className="flex-shrink-0 mx-2">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

// Tech badge component with hover animation - refined and compact
const TechBadge = ({ tech }: { tech: { name: string, icon: string } }) => (
  <motion.div
    className="skill-tag inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-xs w-fit whitespace-nowrap shrink-0 gap-2 text-white/90 border-gray-700/80 bg-gray-800/40 transition-colors"
    whileHover={{
      scale: 1.03,
      backgroundColor: "rgba(59, 130, 246, 0.15)",
      borderColor: "rgba(59, 130, 246, 0.4)"
    }}
    whileTap={{ scale: 0.97 }}
    transition={{ type: "spring", stiffness: 400, damping: 20 }}
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      width="14"
      alt={tech.name}
      src={tech.icon}
      className="w-3.5 h-3.5 object-contain"
      onError={(e) => {
        // Fallback if icon fails to load
        e.currentTarget.style.display = 'none'
      }}
    />
    <span className="font-medium text-[11px]">{tech.name}</span>
  </motion.div>
)

export function Skills() {
  useEffect(() => {
    // 初始化滚动动画 (保留兼容性)
    animateOnScroll('.skills-header')
    animateSkillTags()
    animateOnScroll('.skills-strengths')
    animateOnScroll('.skills-cta')
  }, [])
  return (
    <section id="skills" className="py-20 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header with entrance animation */}
          <motion.div
            className="skills-header text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
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
          </motion.div>

          {/* Tech Stack Marquees */}
          <div className="skills-container space-y-12 mb-20">
            {/* Frontend Technologies */}
            <div className="skill-category">
              <h3 className="text-lg font-semibold text-gray-400 mb-2 text-center uppercase tracking-wider">Frontend</h3>
              <Marquee>
                {frontendTech.map((tech, index) => (
                  <TechBadge key={`frontend-${index}`} tech={tech} />
                ))}
              </Marquee>
            </div>

            {/* Backend Technologies */}
            <div className="skill-category">
              <h3 className="text-lg font-semibold text-gray-400 mb-2 text-center uppercase tracking-wider">Backend & Database</h3>
              <Marquee reverse>
                {backendTech.map((tech, index) => (
                  <TechBadge key={`backend-${index}`} tech={tech} />
                ))}
              </Marquee>
            </div>

            {/* AI & Agentic Engineering */}
            <div className="skill-category">
              <h3 className="text-lg font-semibold text-gray-400 mb-2 text-center uppercase tracking-wider">AI & Agentic Engineering</h3>
              <Marquee>
                {aiTech.map((tech, index) => (
                  <TechBadge key={`ai-${index}`} tech={tech} />
                ))}
              </Marquee>
            </div>

            {/* Tools & DevOps */}
            <div className="skill-category">
              <h3 className="text-lg font-semibold text-gray-400 mb-2 text-center uppercase tracking-wider">Tools & DevOps</h3>
              <Marquee reverse>
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
                <div key={`quality-${index}`} className="px-6 py-3 bg-gray-800/30 border border-gray-700/50 rounded-full text-gray-300 whitespace-nowrap hover:bg-gray-700/50 transition-colors">
                  {quality}
                </div>
              ))}
            </Marquee>
          </div>

          {/* Core Strengths with staggered entrance */}
          <motion.div
            className="skills-strengths grid md:grid-cols-3 gap-6 mb-32"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            <motion.div
              className="p-8 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] transition-colors duration-300"
              variants={cardVariants}
            >
              <div className="text-[11px] font-mono text-gray-500 tracking-widest mb-6 uppercase">
                01 / Domain
              </div>
              <h4 className="text-lg font-semibold text-gray-200 mb-3">
                Anti-fraud Expert
              </h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Identified 50,000+ fraudulent enterprises, generated 3M+ direct revenue with zero complaints operation.
              </p>
            </motion.div>

            <motion.div
              className="p-8 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] transition-colors duration-300"
              variants={cardVariants}
            >
              <div className="text-[11px] font-mono text-gray-500 tracking-widest mb-6 uppercase">
                02 / Architecture
              </div>
              <h4 className="text-lg font-semibold text-gray-200 mb-3">
                System Architect
              </h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Built billion-scale data platforms from 0 to 1, enabling complex analysis completion in 5 minutes.
              </p>
            </motion.div>

            <motion.div
              className="p-8 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] transition-colors duration-300"
              variants={cardVariants}
            >
              <div className="text-[11px] font-mono text-gray-500 tracking-widest mb-6 uppercase">
                03 / Engineering
              </div>
              <h4 className="text-lg font-semibold text-gray-200 mb-3">
                Full-Stack Developer
              </h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Proficient in both frontend and backend development with complete project delivery capabilities.
              </p>
            </motion.div>
          </motion.div>

          {/* CTA Section with entrance animation */}
          <motion.div
            className="skills-cta text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-100 mb-4">
              Ready to build something amazing?
            </h3>
            <p className="text-sm text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
              I&apos;m available for full-time roles & freelance projects.
              Let&apos;s collaborate and create exceptional digital experiences.
            </p>
            <motion.a
              href="#contact"
              className="inline-flex items-center px-6 py-3 bg-white/10 text-white text-sm font-medium rounded-xl border border-white/20 hover:bg-white/15 hover:border-white/30 transition-colors shadow-lg"
              whileTap={{ scale: 0.98 }}
            >
              Get In Touch
              <svg className="ml-2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
