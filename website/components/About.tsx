import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Code2, Sparkles, Terminal, Mail, Github, Linkedin, Briefcase, Cpu, Zap } from 'lucide-react'
import SpotlightCard from './SpotlightCard'
import TextReveal from './TextReveal'
import CountUp from './CountUp'

const PROFILE_IMAGES = [
  '/images/profile-1.jpg',
  '/images/profile-2.jpg',
  '/images/profile-3.jpg'
]

const STATS = [
  { label: 'Years Experience', value: 5, suffix: '+', icon: Briefcase, color: 'text-blue-400' },
  { label: 'Projects Completed', value: 20, suffix: '+', icon: Cpu, color: 'text-purple-400' },
  { label: 'Success Rate', value: 99, suffix: '%', icon: Zap, color: 'text-yellow-400' }
]

export default function About() {
  const [currentImageIdx, setCurrentImageIdx] = useState(0)

  // 3D Tilt Logic
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 })
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 })

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"])
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseXPos = e.clientX - rect.left
    const mouseYPos = e.clientY - rect.top
    const xPct = mouseXPos / width - 0.5
    const yPct = mouseYPos / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % PROFILE_IMAGES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section id="about" className="relative flex flex-col overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="mb-12">
            <p className="text-sm font-medium text-gray-400 mb-4 tracking-wider uppercase">
              MORE ABOUT ME
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            {/* Left Content */}
            <div className="space-y-8 z-10">
              {/* Main Title */}
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  <TextReveal text="I'm Kylin, a" delay={0.2} />
                  <span className="flex items-center gap-3 flex-wrap">
                    creative <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">engineer</span>
                  </span>
                </h1>
              </div>

              {/* Description */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="space-y-6 text-gray-300 text-lg leading-relaxed"
              >
                <p>
                  I&apos;m Kylin Miao, a proactive full-stack developer passionate
                  about creating dynamic web experiences. From frontend to
                  backend, I thrive on solving complex problems with clean,
                  efficient code. My expertise spans React, Next.js, and Node.js,
                  and I&apos;m always eager to learn more.
                </p>
                <p>
                  When I&apos;m not immersed in work, I&apos;m exploring new ideas and
                  staying curious. Life&apos;s about balance, and I love embracing
                  every part of it.
                </p>
              </motion.div>

              {/* Social Links & Contact */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
                id="contact" 
                className="flex items-center gap-4 scroll-mt-24"
              >
                {[
                  { icon: Mail, href: "mailto:miaojsi@outlook.com", color: "blue" },
                  { icon: Github, href: "https://github.com/Alenryuichi", color: "purple" },
                  { icon: Linkedin, href: "https://linkedin.com/in/kylinmiao", color: "blue" }
                ].map((item, i) => (
                  <a
                    key={i}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-12 h-12 rounded-2xl bg-gray-900/50 backdrop-blur-sm hover:bg-${item.color}-500/20 flex items-center justify-center transition-all duration-300 hover:scale-110 border border-gray-700/50 hover:border-${item.color}-500/50 group`}
                  >
                    <item.icon className={`w-5 h-5 text-gray-400 group-hover:text-${item.color}-400 transition-colors`} />
                  </a>
                ))}
              </motion.div>
            </div>

            {/* Right Content - 3D Tilt Card */}
            <div className="relative flex justify-center items-center perspective-1000">
              {/* Background Glows */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-blue-500/5 rounded-full blur-[120px] -z-10" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-purple-500/5 rounded-full blur-[100px] -z-10 animate-pulse" />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative w-full max-sm:px-4 max-w-sm"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  rotateX,
                  rotateY,
                  transformStyle: "preserve-3d"
                }}
              >
                {/* Main Glass Card */}
                <div
                  className="relative z-10 bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-2xl border border-gray-700/30 rounded-[2.5rem] p-4 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] group overflow-hidden transform-gpu"
                >
                  {/* Card Inner Glow/Glare */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  
                  <div className="aspect-[4/5] rounded-[2rem] overflow-hidden relative bg-gray-950 shadow-inner">
                    {/* Image Slideshow */}
                    <AnimatePresence mode="wait">
                      <motion.img 
                        key={currentImageIdx}
                        src={PROFILE_IMAGES[currentImageIdx]}
                        alt={`Kylin Miao ${currentImageIdx + 1}`}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7 }}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </AnimatePresence>

                    {/* Interactive Elements Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-60" />

                    {/* Content Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-8 pt-20">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">Kylin Miao</h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                              <Code2 className="w-4 h-4 text-blue-400" />
                            </div>
                            <p className="text-blue-400/90 font-medium text-sm uppercase tracking-widest">Full Stack Expert</p>
                          </div>
                          
                          {/* Image Indicators */}
                          <div className="flex gap-1.5">
                            {PROFILE_IMAGES.map((_, idx) => (
                              <div 
                                key={idx}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  idx === currentImageIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/30'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Floating Badge 1: Status */}
                <motion.div
                  initial={{ opacity: 0, x: 20, z: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  animate={{ y: [0, -12, 0] }}
                  // transition type mismatch
                  transition={{ 
                    delay: 0.6,
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                  }}
                  style={{ transform: "translateZ(50px)" }}
                  className="absolute -top-8 -right-6 z-20 pointer-events-none"
                >
                  <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 p-4 rounded-3xl shadow-2xl flex items-center gap-4">
                    <div className="relative flex items-center justify-center">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-20 animate-ping"></span>
                      <div className="relative h-3 w-3 rounded-full bg-green-500 border-2 border-green-200/50" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Status</p>
                      <p className="text-sm font-bold text-white">Available</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Badge 2: Tech Stack */}
                <motion.div
                  initial={{ opacity: 0, x: -20, z: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  animate={{ y: [0, 12, 0] }}
                  // transition type mismatch
                  transition={{ 
                    delay: 0.8,
                    y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                  }}
                  style={{ transform: "translateZ(50px)" }}
                  className="absolute -bottom-10 -left-6 z-20 pointer-events-none"
                >
                  <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 p-5 rounded-3xl shadow-2xl">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                        <Terminal className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Focus</p>
                        <p className="text-sm font-bold text-white">Next.js & AI</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Decorative Elements */}
                 <motion.div
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.6, 0.3],
                    rotate: [0, 90, 0]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute top-1/4 -left-12 text-yellow-500/20 pointer-events-none"
                >
                  <Sparkles className="w-12 h-12" />
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Stats Bar - Spotlight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-t border-gray-800/50">
            {STATS.map((stat, idx) => (
              <SpotlightCard
                key={idx}
                spotlightColor="rgba(59, 130, 246, 0.2)"
                className="h-full"
              >
                <div className="flex items-center gap-6 p-6 h-full">
                  <div className={`p-4 rounded-2xl bg-gray-800/50 group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white mb-1">
                      <CountUp end={stat.value} suffix={stat.suffix} />
                    </div>
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}