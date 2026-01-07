import { useRef, useState, MouseEvent, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Mail, Github, Linkedin, Trophy, Smartphone, Mountain } from 'lucide-react'
import SpotlightCard from './SpotlightCard'
import TextReveal from './TextReveal'

const PROFILE_IMAGES = [
  '/images/profile-1.jpg',
  '/images/profile-2.jpg',
  '/images/profile-3.jpg'
]

interface HighlightItem {
  id: string
  label: string
  title: string
  description: string
  icon: any
  mediaType: 'video' | 'image'
  src: string
  poster?: string
  color: string
}

const HIGHLIGHTS: HighlightItem[] = [
  {
    id: 'athlete',
    label: 'Athlete',
    title: 'Global Top 4',
    description: '2023 Pro Bodybuilding',
    icon: Trophy,
    mediaType: 'video',
    src: '/videos/athlete.mp4',
    poster: '/images/athlete-poster.jpg',
    color: 'text-yellow-400'
  },
  {
    id: 'maker',
    label: 'Maker',
    title: 'Kexian App',
    description: 'Indie iOS Developer',
    icon: Smartphone,
    mediaType: 'video',
    src: '/videos/app-demo.mp4',
    poster: '/images/app-poster.jpg',
    color: 'text-pink-400'
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    title: '10+ Years',
    description: 'Fitness & Climbing',
    icon: Mountain,
    mediaType: 'video',
    src: '/videos/lifestyle.mp4',
    poster: '/images/lifestyle-poster.jpg',
    color: 'text-blue-400'
  }
]

// --- Sub-component: MediaCard (Cinematic Video/Image Card) ---
const MediaCard = ({ item }: { item: HighlightItem }) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleMouseEnter = () => {
    // Optional: Speed up video or unmute on hover? For now, just brightness.
    if (videoRef.current) {
      // videoRef.current.playbackRate = 1.5 // Example: Speed up
    }
  }

  const handleMouseLeave = () => {
    if (videoRef.current) {
      // videoRef.current.playbackRate = 1.0
    }
  }

  return (
    <div 
      className="relative h-64 lg:h-80 rounded-3xl overflow-hidden group border border-white/10 bg-gray-900"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Media Layer */}
      <div className="absolute inset-0 z-0">
        {item.mediaType === 'video' ? (
          <video
            ref={videoRef}
            src={item.src}
            poster={item.poster}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100"
          />
        ) : (
          <img 
            src={item.src} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100" 
          />
        )}
      </div>

      {/* Dark Gradient Overlay (Always visible for text readability) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-80" />

      {/* Content Layer */}
      <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end">
        <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
          {/* Icon & Label */}
          <div className="flex items-center gap-2 mb-2 opacity-80 group-hover:opacity-100">
            <div className={`p-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 ${item.color}`}>
              <item.icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white/80 uppercase tracking-widest">{item.label}</span>
          </div>
          
          {/* Main Title */}
          <h3 className="text-3xl font-bold text-white mb-1 leading-tight group-hover:text-white/100 transition-colors">
            {item.title}
          </h3>
          
          {/* Description */}
          <p className="text-sm text-gray-400 font-medium group-hover:text-gray-300 transition-colors">
            {item.description}
          </p>
        </div>
      </div>

      {/* Spotlight Border Effect (Simple CSS) */}
      <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 rounded-3xl transition-colors duration-300 pointer-events-none z-30" />
    </div>
  )
}

// --- Sub-component: GlareCard (Kept for Profile Photo) ---
const GlareCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const cardRef = useRef<HTMLDivElement>(null)
  
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const rotateX = (y - centerY) / 15 // Reduced rotation sensitivity
    const rotateY = (centerX - x) / 15
    
    cardRef.current.style.setProperty('--rotate-x', `${rotateX}deg`)
    cardRef.current.style.setProperty('--rotate-y', `${rotateY}deg`)
    cardRef.current.style.setProperty('--glare-x', `${(x / rect.width) * 100}%`)
    cardRef.current.style.setProperty('--glare-y', `${(y / rect.height) * 100}%`)
    cardRef.current.style.setProperty('--glare-opacity', '0.4') // Subtler glare
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    cardRef.current.style.setProperty('--rotate-x', `0deg`)
    cardRef.current.style.setProperty('--rotate-y', `0deg`)
    cardRef.current.style.setProperty('--glare-opacity', '0')
  }

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative transition-transform duration-300 ease-out perspective-1000 ${className}`}
      style={{
        transform: 'rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg))',
        transformStyle: 'preserve-3d'
      } as any}
    >
      <div className="relative z-10 w-full h-full rounded-[2.5rem] overflow-hidden border border-white/10 bg-gray-900/40 backdrop-blur-2xl shadow-2xl">
        {/* Glare Overlay */}
        <div 
          className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-500"
          style={{
            background: 'radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255,0.3) 0%, transparent 50%)',
            opacity: 'var(--glare-opacity, 0)',
            mixBlendMode: 'overlay'
          } as any}
        />
        {children}
      </div>
    </div>
  )
}

export default function About() {
  const [currentImageIdx, setCurrentImageIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % PROFILE_IMAGES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section id="about" className="relative py-20 overflow-hidden bg-black">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="mb-16">
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-xs font-bold text-blue-500 mb-4 tracking-[0.3em] uppercase"
            >
              Beyond the Code
            </motion.p>
            <h2 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
              <TextReveal text="Crafting Digital" delay={0.1} />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 animate-gradient-x">
                Experiences.
              </span>
            </h2>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            
            {/* Bio Card (Occupies 7 cols) */}
            <SpotlightCard className="lg:col-span-7 flex flex-col justify-center p-8 lg:p-12 group min-h-[400px]">
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <Terminal className="w-6 h-6 text-blue-400" />
                    Who is Kylin?
                  </h3>
                  <div className="space-y-4 text-gray-400 text-lg leading-relaxed">
                    <p>
                      I&apos;m Kylin Miao, a proactive <span className="text-white font-medium">full-stack developer</span> passionate
                      about creating dynamic web experiences. I thrive on solving complex problems with clean,
                      efficient code.
                    </p>
                    <p>
                      My expertise spans <span className="text-blue-400">React</span>, <span className="text-purple-400">Next.js</span>, and <span className="text-pink-400">Node.js</span>. I believe in software that doesn&apos;t just work, but feels <span className="italic text-white">magical</span>.
                    </p>
                  </div>
                </motion.div>

                {/* Social Links */}
                <motion.div 
                  id="contact"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-4 pt-4 scroll-mt-24"
                >
                  {[
                    { icon: Mail, href: "mailto:miaojsi@outlook.com", color: "blue", label: "Email" },
                    { icon: Github, href: "https://github.com/Alenryuichi", color: "purple", label: "GitHub" },
                    { icon: Linkedin, href: "https://linkedin.com/in/kylinmiao", color: "blue", label: "LinkedIn" }
                  ].map((item, i) => (
                    <a
                      key={i}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group/link"
                    >
                      <item.icon className={`w-4 h-4 text-gray-400 group-hover/link:text-white transition-colors`} />
                      <span className="text-sm font-medium text-gray-500 group-hover/link:text-white transition-colors">{item.label}</span>
                    </a>
                  ))}
                </motion.div>
              </div>
            </SpotlightCard>

            {/* Profile Photo Card (Occupies 5 cols) */}
            <div className="lg:col-span-5 h-[400px] lg:h-auto">
              <GlareCard className="h-full group">
                <div className="relative w-full h-full overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={currentImageIdx}
                      src={PROFILE_IMAGES[currentImageIdx]}
                      alt="Kylin Miao"
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </AnimatePresence>
                  
                  {/* Indicators Overlay */}
                  <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2 z-30">
                    {PROFILE_IMAGES.map((_, idx) => (
                      <div 
                        key={idx}
                        className={`h-1 rounded-full transition-all duration-500 ${
                          idx === currentImageIdx ? 'w-8 bg-blue-500' : 'w-2 bg-white/20'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Glass Label */}
                  <div className="absolute top-6 right-6 z-30 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Available</span>
                  </div>
                </div>
              </GlareCard>
            </div>
          </div>

          {/* Highlights Gallery (Video Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HIGHLIGHTS.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 + 0.5 }}
              >
                <MediaCard item={item} />
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
