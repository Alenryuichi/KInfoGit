import { useEffect, useState } from 'react'
import Script from 'next/script'
import { Github, Mail, Linkedin, Users, Zap } from 'lucide-react'

export function Footer() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  return (
    <>
      {/* Busuanzi Analytics Script */}
      <Script
        src="//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js"
        strategy="lazyOnload"
      />

      {/* Floating Command Bar Footer */}
      <div className="w-full flex justify-center pb-8 pt-12 relative z-50 px-4">
        <footer className="bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.8)] font-mono text-[11px] text-gray-400 flex items-stretch overflow-hidden max-w-full overflow-x-auto [&::-webkit-scrollbar]:hidden">
          
          {/* Identity & Links */}
          <div className="flex items-center divide-x divide-white/10 border-r border-white/10">
            <div className="px-4 py-2.5 flex items-center gap-1.5 hover:bg-white/5 transition-colors cursor-default whitespace-nowrap">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-gray-300">Kylin Miao</span>
            </div>
            
            <a href="mailto:miaojsi@outlook.com" className="px-3.5 py-2.5 hover:bg-white/5 hover:text-white transition-colors flex items-center justify-center" title="Email">
              <Mail className="w-3.5 h-3.5" />
            </a>
            <a href="https://github.com/Alenryuichi" target="_blank" rel="noopener noreferrer" className="px-3.5 py-2.5 hover:bg-white/5 hover:text-white transition-colors flex items-center justify-center" title="GitHub">
              <Github className="w-3.5 h-3.5" />
            </a>
            <a href="https://www.linkedin.com/in/jingsi-miao-b67ba33ab/" target="_blank" rel="noopener noreferrer" className="px-3.5 py-2.5 hover:bg-white/5 hover:text-white transition-colors flex items-center justify-center" title="LinkedIn">
              <Linkedin className="w-3.5 h-3.5" />
            </a>
            <a href="https://maimai.cn/contact/share/card?u=n5xkqwimcgvt" target="_blank" rel="noopener noreferrer" className="px-3.5 py-2.5 hover:bg-white/5 hover:text-white transition-colors flex items-center justify-center" title="脉脉">
              <Users className="w-3.5 h-3.5" />
            </a>
          </div>
          
          {/* Telemetry & Tech */}
          <div className="flex items-center divide-x divide-white/10 bg-white/[0.02]">
            {mounted ? (
              <>
                <div className="px-3.5 py-2.5 flex gap-1.5 items-center hover:bg-white/5 transition-colors cursor-default whitespace-nowrap" title="Total Views">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 relative flex items-center justify-center">
                    <span className="absolute w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-50"></span>
                  </span>
                  <span className="text-white/30 hidden sm:inline">Total:</span> 
                  <span id="busuanzi_value_site_pv" className="text-gray-300 font-medium">--</span>
                </div>
                <div className="px-3.5 py-2.5 flex gap-1.5 items-center hover:bg-white/5 transition-colors cursor-default whitespace-nowrap" title="Unique Visitors">
                  <span className="text-white/30 hidden sm:inline">UV:</span> 
                  <span id="busuanzi_value_site_uv" className="text-gray-300 font-medium">--</span>
                </div>
                <div className="px-3.5 py-2.5 flex gap-1.5 items-center hover:bg-white/5 transition-colors cursor-default whitespace-nowrap" title="Page Views">
                  <span className="text-white/30 hidden sm:inline">Page:</span> 
                  <span id="busuanzi_value_page_pv" className="text-gray-300 font-medium">--</span>
                </div>
              </>
            ) : (
              <>
                <div className="px-3.5 py-2.5 flex gap-1.5 items-center whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 relative"></span>
                  <span className="text-white/30 hidden sm:inline">Total:</span> 
                  <span className="text-gray-300 font-medium">--</span>
                </div>
                <div className="px-3.5 py-2.5 flex gap-1.5 items-center whitespace-nowrap">
                  <span className="text-white/30 hidden sm:inline">UV:</span> 
                  <span className="text-gray-300 font-medium">--</span>
                </div>
                <div className="px-3.5 py-2.5 flex gap-1.5 items-center whitespace-nowrap">
                  <span className="text-white/30 hidden sm:inline">Page:</span> 
                  <span className="text-gray-300 font-medium">--</span>
                </div>
              </>
            )}
            <div className="px-4 py-2.5 text-white/20 hidden md:block whitespace-nowrap hover:bg-white/5 transition-colors cursor-default">
              © {new Date().getFullYear()} Next.js
            </div>
          </div>
          
        </footer>
      </div>
    </>
  )
}
