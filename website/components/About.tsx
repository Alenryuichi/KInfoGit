import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Github, Linkedin, FileDown, Users } from 'lucide-react'

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
  mediaType: 'video' | 'image'
  src: string
  poster?: string
  colorTheme: {
    text: string
    bg: string
    border: string
  }
  hudCode: string
}

const HIGHLIGHTS: HighlightItem[] = [
  {
    id: 'athlete',
    label: 'Athlete',
    title: 'Global Top 4',
    description: '2023 Pro Bodybuilding C Class',
    mediaType: 'video',
    src: '/videos/athlete.mp4',
    poster: '/images/athlete-poster.jpg',
    colorTheme: { text: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
    hudCode: 'ATH_01'
  },
  {
    id: 'maker',
    label: 'Maker',
    title: 'Betaline App',
    description: 'Indie iOS Climbing App',
    mediaType: 'video',
    src: '/videos/app-demo.mp4',
    poster: '/images/app-poster.jpg',
    colorTheme: { text: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/20' },
    hudCode: 'MKR_02'
  }
]

// --- Sub-component: MediaCard ---
const MediaCard = ({ item }: { item: HighlightItem }) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] rounded-2xl overflow-hidden group border border-white/10 bg-gray-900">
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
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={item.src} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100" 
          />
        )}
      </div>

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* HUD Corners */}
      <div className="absolute inset-[10px] border border-white/10 pointer-events-none z-20 transition-all duration-500 ease-out group-hover:inset-[15px] group-hover:border-blue-400/40 group-hover:bg-blue-400/5 rounded-xl" />

      {/* Content Layer */}
      <div className="absolute bottom-6 left-6 z-20 font-mono transform transition-transform duration-500 group-hover:-translate-y-2">
        <div className={`text-[10px] ${item.colorTheme.text} ${item.colorTheme.bg} ${item.colorTheme.border} px-2 py-0.5 rounded inline-block mb-3 uppercase tracking-widest border`}>
            [{item.label}]
        </div>
        <h3 className="text-3xl font-bold text-white mb-1 tracking-tight group-hover:text-white transition-colors">
          {item.title}
        </h3>
        <p className="text-xs text-white/50 group-hover:text-white/70 transition-colors">
          {item.description}
        </p>
      </div>

      {/* Decorative HUD Elements */}
      <div className="absolute top-6 right-6 z-20 font-mono text-[9px] text-white/30 text-right opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
        DAT: {item.hudCode}<br/>
        STS: ACTIVE
      </div>
    </div>
  )
}

// --- Sub-component: ProfileSlideshow ---
const ProfileSlideshow = () => {
  const [currentIdx, setCurrentIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % PROFILE_IMAGES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] rounded-2xl overflow-hidden group border border-white/10 bg-gray-900">
      <AnimatePresence mode="wait">
        <motion.img 
          key={currentIdx}
          src={PROFILE_IMAGES[currentIdx]}
          alt="Kylin Miao Profile"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 w-full h-full object-cover filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* HUD Corners */}
      <div className="absolute inset-[10px] border border-white/10 pointer-events-none z-20 transition-all duration-500 ease-out group-hover:inset-[15px] group-hover:border-emerald-400/40 group-hover:bg-emerald-400/5 rounded-xl" />

      {/* Content */}
      <div className="absolute bottom-6 left-6 z-20 font-mono transform transition-transform duration-500 group-hover:-translate-y-2">
        <div className="flex gap-2 mb-3">
          <div className="text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded inline-block uppercase tracking-widest">
            [ Operator ]
          </div>
          <div className="text-[10px] text-white/50 bg-white/5 border border-white/10 px-2 py-0.5 rounded flex items-center gap-1.5 uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></div>
            Online
          </div>
        </div>
        <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">Kylin Miao</h3>
        <p className="text-xs text-white/50 font-mono">Location: China</p>
      </div>

      <div className="absolute top-6 right-6 z-20 font-mono text-[9px] text-white/30 text-right opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
        SYS_ID: K_001<br/>
        ACC: AUTHORIZED
      </div>
    </div>
  )
}

export function About() {
  return (
    <section id="about" className="relative pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10 relative h-full max-w-7xl">
        
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
            
            {/* LEFT: Sticky Bio & Photo */}
            <div className="w-full lg:w-5/12 lg:sticky lg:top-24 space-y-8 z-20">
                <div>
                    <motion.p 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="font-mono text-emerald-400 text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-4 flex items-center gap-2"
                    >
                        <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981] animate-pulse"></span>
                        Identity.Log
                    </motion.p>
                    <motion.h1 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 }}
                      className="text-5xl sm:text-6xl font-bold tracking-tight text-white mb-6"
                    >
                        Kylin <span className="font-serif italic font-light text-white/60">Miao</span>
                    </motion.h1>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="font-mono text-sm text-white/60 space-y-5 border-l-2 border-white/10 pl-6 relative"
                >
                    {/* Simulated typing cursor */}
                    <div className="absolute -left-[2px] top-1 w-[2px] h-4 bg-emerald-400 animate-[blink_1s_step-end_infinite]"></div>
                    
                    <p className="leading-relaxed">
                        <span className="text-white/90 font-medium">ROLE:</span> AI Agent Engineer @ Tencent WeCom<br/>
                        <span className="text-white/90 font-medium">STACK:</span> Prompt <span className="text-blue-400 mx-1">→</span> Context <span className="text-blue-400 mx-1">→</span> Harness
                    </p>
                    <p className="leading-relaxed">
                        Now orchestrating <span className="text-white/90 font-medium">multi-agent collaboration</span> — agents that plan, execute, review, and compound their own work.
                    </p>
                    <p className="border-l-2 border-emerald-500/30 pl-4 py-1 italic bg-emerald-500/5">
                        <span className="text-blue-400 not-italic font-medium">Beyond the terminal:</span> Passionate about extreme sports.<br/>
                        <span className="text-purple-400 not-italic font-medium">Bouldering (V3) / Snowboarding / Bodybuilding / Kitesurfing</span>
                    </p>
                    <p className="text-emerald-400">
                        &gt; Building infrastructure for AI teams to operate autonomously.
                    </p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap gap-3 font-mono text-xs pt-4 mb-8"
                >
                    <a href="mailto:miaojsi@outlook.com" className="border border-white/20 hover:border-white/60 hover:text-white text-white/60 px-4 py-2 rounded transition-colors flex items-center gap-2 group/btn">
                      <Mail className="w-3.5 h-3.5 group-hover/btn:text-white transition-colors" /> [ Email ]
                    </a>
                    <a href="https://github.com/Alenryuichi" target="_blank" rel="noopener noreferrer" className="border border-white/20 hover:border-white/60 hover:text-white text-white/60 px-4 py-2 rounded transition-colors flex items-center gap-2 group/btn">
                      <Github className="w-3.5 h-3.5 group-hover/btn:text-white transition-colors" /> [ GitHub ]
                    </a>
                    <a href="https://www.linkedin.com/in/jingsi-miao-b67ba33ab/" target="_blank" rel="noopener noreferrer" className="border border-white/20 hover:border-white/60 hover:text-white text-white/60 px-4 py-2 rounded transition-colors flex items-center gap-2 group/btn">
                      <Linkedin className="w-3.5 h-3.5 group-hover/btn:text-white transition-colors" /> [ LinkedIn ]
                    </a>
                    <a href="https://maimai.cn/contact/share/card?u=n5xkqwimcgvt&_share_channel=copy_link" target="_blank" rel="noopener noreferrer" className="border border-white/20 hover:border-white/60 hover:text-white text-white/60 px-4 py-2 rounded transition-colors flex items-center gap-2 group/btn">
                      <Users className="w-3.5 h-3.5 group-hover/btn:text-white transition-colors" /> [ 脉脉 ]
                    </a>
                    <a href="/kylin-resume.pdf" download="Kylin-Miao-Resume.pdf" className="border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-400/50 text-blue-400 px-4 py-2 rounded transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                      <FileDown className="w-3.5 h-3.5" /> [ Resume ]
                    </a>
                </motion.div>

                {/* Profile Slideshow moved to Left Column */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                >
                  <ProfileSlideshow />
                </motion.div>
            </div>

            {/* RIGHT: Scrolling Media Array */}
            <div className="w-full lg:w-7/12 space-y-6 sm:space-y-12">
                
                {/* Highlights */}
                {HIGHLIGHTS.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 + 0.3 }}
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
