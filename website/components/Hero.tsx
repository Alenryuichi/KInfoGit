import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, ArrowRight, Users } from 'lucide-react'
import { animateHeroEntrance } from '@/utils/animations'
import Link from 'next/link'

export function Hero() {
  useEffect(() => {
    // 页面加载后启动Hero动画
    const timer = setTimeout(() => {
      animateHeroEntrance()
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden py-12 sm:py-20 lg:py-24">

      {/* Abstract Background Nodes (Agent Topology) */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        {/* Connecting Lines */}
        <div className="absolute top-[30%] left-[30%] w-64 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent rotate-45 origin-left"></div>
        <div className="absolute bottom-[35%] right-[20%] w-80 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent -rotate-12 origin-left"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 hero-title">
        
        <div className="mb-6 inline-block">
            <p className="font-mono text-blue-400/80 text-[10px] sm:text-xs uppercase tracking-[0.4em] mb-2">Architecting Autonomy</p>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-12 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            Harness <span className="font-serif italic font-light text-white/70">Engineering</span>
        </h1>

        {/* Blueprint Card */}
        <div className="hero-description bg-black/20 border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_20px_40px_-20px_rgba(0,0,0,0.5)] rounded-2xl p-6 sm:p-10 backdrop-blur-xl max-w-3xl mx-auto relative overflow-hidden group">
            
            {/* Subtle hover gradient inside card */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-8 relative z-10">
                <div className="w-16 h-16 rounded-full border-2 border-white/10 overflow-hidden grayscale hover:grayscale-0 transition-all duration-500 shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://github.com/Alenryuichi.png" alt="Kylin Miao" className="w-full h-full object-cover" />
                </div>
                <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl font-medium text-white/90 tracking-tight">Kylin Miao</h2>
                    <p className="text-xs sm:text-sm text-purple-400 font-mono mt-1">AI Agent Engineer @ Tencent WeCom</p>
                </div>
            </div>
            
            <p className="text-base sm:text-lg text-white/50 leading-relaxed font-light mb-10 relative z-10">
                Evolved through <span className="text-white/80 font-medium">Prompt</span> → <span className="text-white/80 font-medium">Context</span> → <span className="text-white/80 font-medium">Harness Engineering</span>.<br className="hidden sm:block" />
                Now orchestrating multi-agent systems that work while I sleep.<br />
                <span className="inline-block mt-3 text-sm sm:text-[15px] text-purple-400/80 font-medium tracking-wide">
                    Passionate about LLMs & Agents. The future is here, and I&apos;m fully embracing it.
                </span>
            </p>

            {/* Metrics & CTA Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center border-t border-white/[0.05] pt-8 relative z-10">
                <div className="flex flex-col justify-center">
                    <div className="text-white/80 mb-1 font-mono text-sm sm:text-base tracking-tight">LLM / RAG</div>
                    <div className="text-[9px] sm:text-[10px] text-white/30 uppercase tracking-[0.2em] font-medium">Core Stack</div>
                </div>
                <div className="flex flex-col justify-center">
                    <div className="text-white/80 mb-1 font-mono text-sm sm:text-base tracking-tight">Multi-Agent</div>
                    <div className="text-[9px] sm:text-[10px] text-white/30 uppercase tracking-[0.2em] font-medium">Architecture</div>
                </div>
                <div className="flex flex-col justify-center">
                    <div className="text-white/80 mb-1 font-mono text-sm sm:text-base tracking-tight">Full-Stack</div>
                    <div className="text-[9px] sm:text-[10px] text-white/30 uppercase tracking-[0.2em] font-medium">Development</div>
                </div>
                <div className="flex flex-col justify-center">
                    <Link href="/work#projects" className="h-full min-h-[50px] sm:min-h-[60px] flex items-center justify-center text-[10px] sm:text-xs font-mono text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all duration-300 border border-blue-500/20 hover:border-blue-400/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] group/btn">
                        [ Execute ] <ArrowRight className="w-3 h-3 ml-1.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Social Links inside the card */}
            <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-white/[0.02] relative z-10">
                <a href="mailto:miaojsi@outlook.com" className="p-2.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] hover:text-white transition-all duration-300 hover:-translate-y-1 border border-white/[0.05]" aria-label="Email">
                  <Mail className="w-4 h-4 text-gray-400 transition-colors" />
                </a>
                <a href="https://github.com/Alenryuichi" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] hover:text-white transition-all duration-300 hover:-translate-y-1 border border-white/[0.05]" aria-label="GitHub">
                  <Github className="w-4 h-4 text-gray-400 transition-colors" />
                </a>
                <a href="https://linkedin.com/in/kylinmiao" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] hover:text-white transition-all duration-300 hover:-translate-y-1 border border-white/[0.05]" aria-label="LinkedIn">
                  <Linkedin className="w-4 h-4 text-gray-400 transition-colors" />
                </a>
                <a href="https://maimai.cn/contact/share/card?u=n5xkqwimcgvt&_share_channel=copy_link" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] hover:text-white transition-all duration-300 hover:-translate-y-1 border border-white/[0.05]" aria-label="脉脉">
                  <Users className="w-4 h-4 text-gray-400 transition-colors" />
                </a>
            </div>
        </div>

      </div>
    </section>
  )
}
