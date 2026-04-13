import Link from 'next/link'
import { useEffect } from 'react'
import { animateOnScroll } from '@/utils/animations'

export function HomeCTA() {
  useEffect(() => {
    animateOnScroll('.home-cta-content')
  }, [])

  return (
    <section className="py-24 text-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="home-cta-content max-w-3xl mx-auto text-center">
          <div className="mb-6 inline-block">
            <p className="font-mono text-emerald-400/80 text-[10px] sm:text-xs uppercase tracking-[0.4em] mb-2">System Ready</p>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
          </div>

          {/* Heading */}
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            Let&apos;s Build <span className="font-serif italic font-light text-white/70">Something</span> Together
          </h2>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-white/50 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Explore my complete <span className="text-white/80 font-medium">portfolio</span> or learn more about my <span className="text-white/80 font-medium">background</span> and expertise.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 font-mono text-sm">
            {/* Primary CTA - View All Projects */}
            <Link
              href="/work"
              className="w-full sm:w-auto group flex items-center justify-center px-8 py-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-400/50 hover:shadow-[0_0_20px_rgba(52,211,153,0.2)] rounded-xl transition-all duration-300 min-w-[220px]"
            >
              [ View_Projects ]
              <svg
                className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>

            {/* Secondary CTA - Learn More */}
            <Link
              href="/about"
              className="w-full sm:w-auto group flex items-center justify-center px-8 py-4 bg-white/[0.02] text-white/60 border border-white/10 hover:bg-white/[0.05] hover:border-white/30 hover:text-white rounded-xl transition-all duration-300 min-w-[220px]"
            >
              [ About_Me ]
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

