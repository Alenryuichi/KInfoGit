import React, { useEffect, Children } from 'react'
import { motion } from 'framer-motion'
import { Terminal, Database, Cpu, Wrench } from 'lucide-react'

// Modern tech stack with animated marquee
const frontendTech = [
  { name: 'React', icon: 'https://cdn.simpleicons.org/react' },
  { name: 'Next.js', icon: 'https://cdn.simpleicons.org/nextdotjs/white' },
  { name: 'TypeScript', icon: 'https://cdn.simpleicons.org/typescript' },
  { name: 'Tailwind CSS', icon: 'https://cdn.simpleicons.org/tailwindcss' },
  { name: 'Vue.js', icon: 'https://cdn.simpleicons.org/vuedotjs' },
  { name: 'Framer Motion', icon: 'https://cdn.simpleicons.org/framer' },
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
  { name: 'Claude Code', icon: 'https://cdn.simpleicons.org/anthropic/white' },
  { name: 'Gemini', icon: 'https://cdn.simpleicons.org/googlegemini' },
  { name: 'Cursor', icon: 'https://img.icons8.com/ios-filled/50/ffffff/cursor.png' },
  { name: 'OpenAI API', icon: 'https://cdn.simpleicons.org/openai/white' },
  { name: 'LangChain', icon: 'https://cdn.simpleicons.org/langchain/white' },
  { name: 'Pinecone', icon: 'https://img.icons8.com/ios-filled/50/ffffff/pine-tree.png' },
]

const toolsTech = [
  { name: 'Docker', icon: 'https://cdn.simpleicons.org/docker' },
  { name: 'Kubernetes', icon: 'https://cdn.simpleicons.org/kubernetes' },
  { name: 'AWS', icon: 'https://cdn.simpleicons.org/amazonwebservices' },
  { name: 'Git', icon: 'https://cdn.simpleicons.org/git' },
  { name: 'Vercel', icon: 'https://cdn.simpleicons.org/vercel/white' },
  { name: 'Linux', icon: 'https://cdn.simpleicons.org/linux' },
]

// Marquee component for animated tech stack - True Infinite Scroll
const Marquee = ({ children, reverse = false, speed = "normal" }: { children: React.ReactNode, reverse?: boolean, speed?: "normal" | "slow" }) => {
  const items = Children.toArray(children);
  const repeatedItems = [...items, ...items, ...items, ...items];
  const animationClass = reverse ? 'animate-marquee-reverse' : 'animate-marquee';

  return (
    <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)] group">
      <div
        className={`flex shrink-0 py-3 flex-row items-center ${animationClass} group-hover:[animation-play-state:paused]`}
        style={{ animationDuration: speed === 'slow' ? '60s' : '40s' }}
      >
        {repeatedItems.map((child, index) => (
          <div key={`marquee-1-${index}`} className="flex-shrink-0 mx-2 sm:mx-3">
            {child}
          </div>
        ))}
      </div>
      <div
        className={`flex shrink-0 py-3 flex-row items-center ${animationClass} group-hover:[animation-play-state:paused]`}
        style={{ animationDuration: speed === 'slow' ? '60s' : '40s' }}
        aria-hidden="true"
      >
        {repeatedItems.map((child, index) => (
          <div key={`marquee-2-${index}`} className="flex-shrink-0 mx-2 sm:mx-3">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

// Tech badge component with hover animation - terminal style
const TechBadge = ({ tech }: { tech: { name: string, icon: string } }) => (
  <motion.div
    className="inline-flex items-center justify-center rounded border border-white/10 bg-[#0a0a0a] px-4 py-2.5 text-sm w-fit whitespace-nowrap shrink-0 gap-3 text-white/70 transition-all shadow-lg"
    whileHover={{
      scale: 1.05,
      backgroundColor: "rgba(16, 185, 129, 0.05)",
      borderColor: "rgba(16, 185, 129, 0.4)",
      color: "rgba(255, 255, 255, 0.9)"
    }}
    whileTap={{ scale: 0.98 }}
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      width="16"
      alt={tech.name}
      src={tech.icon}
      className="w-4 h-4 object-contain opacity-80"
      onError={(e) => {
        e.currentTarget.style.display = 'none'
      }}
    />
    <span className="font-mono tracking-tight">{tech.name}</span>
  </motion.div>
)

export function Skills() {
  const [mounted, setMounted] = React.useState(false)

  useEffect(() => {
    // SSR/CSR hydration gate to avoid framer-motion SSR mismatch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section id="skills" className="py-20 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="mb-6 inline-block">
                <p className="font-mono text-emerald-400/80 text-[10px] sm:text-xs uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981] animate-pulse"></span>
                    System.Arsenal
                </p>
                <div className="h-px w-full bg-gradient-to-r from-emerald-500/30 to-transparent"></div>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                Stack & <span className="font-serif italic font-light text-white/70">Tooling</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden group"
          >
            {/* Subtle hover gradient inside card */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

            <div className="space-y-12 relative z-10">
                {/* AI & Agentic Engineering */}
                <div>
                  <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                    <Cpu className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-mono text-white tracking-tight">~/ai_and_agents</h3>
                  </div>
                  <Marquee speed="slow">
                    {aiTech.map((tech, index) => (
                      <TechBadge key={`ai-${index}`} tech={tech} />
                    ))}
                  </Marquee>
                </div>

                {/* Frontend Technologies */}
                <div>
                  <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                    <Terminal className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-mono text-white tracking-tight">~/frontend_stack</h3>
                  </div>
                  <Marquee reverse speed="slow">
                    {frontendTech.map((tech, index) => (
                      <TechBadge key={`frontend-${index}`} tech={tech} />
                    ))}
                  </Marquee>
                </div>

                {/* Backend Technologies */}
                <div>
                  <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                    <Database className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-mono text-white tracking-tight">~/backend_systems</h3>
                  </div>
                  <Marquee speed="slow">
                    {backendTech.map((tech, index) => (
                      <TechBadge key={`backend-${index}`} tech={tech} />
                    ))}
                  </Marquee>
                </div>

                {/* Tools & DevOps */}
                <div>
                  <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                    <Wrench className="w-5 h-5 text-orange-400" />
                    <h3 className="text-lg font-mono text-white tracking-tight">~/infrastructure</h3>
                  </div>
                  <Marquee reverse speed="slow">
                    {toolsTech.map((tech, index) => (
                      <TechBadge key={`tools-${index}`} tech={tech} />
                    ))}
                  </Marquee>
                </div>
            </div>
            
            {/* Decorative bottom bar */}
            <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/30">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></span>
                    ALL SYSTEMS NOMINAL
                </div>
                <div className="uppercase tracking-widest">ENV: PRODUCTION</div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  )
}
