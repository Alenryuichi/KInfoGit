import { useEffect, useState } from 'react'
import Script from 'next/script'
import { Github, Mail, Linkedin, Users, Eye, UserCheck } from 'lucide-react'

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

      <footer className="relative z-10 border-t border-gray-800/50 bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Brand */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Kylin Miao</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  AI Agent Engineer & Harness Engineering Practitioner.
                  Building autonomous AI agent teams.
                </p>
              </div>

              {/* Links */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Connect</h4>
                <div className="flex flex-wrap gap-3">
                  {[
                    { icon: Mail, href: "mailto:miaojsi@outlook.com", label: "Email" },
                    { icon: Github, href: "https://github.com/Alenryuichi", label: "GitHub" },
                    { icon: Linkedin, href: "https://linkedin.com/in/kylinmiao", label: "LinkedIn" },
                    { icon: Users, href: "https://maimai.cn/contact/share/card?u=n5xkqwimcgvt", label: "脉脉" }
                  ].map((item, i) => (
                    <a
                      key={i}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 hover:border-gray-600 transition-all duration-300 group"
                      aria-label={item.label}
                    >
                      <item.icon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                      <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">{item.label}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Site Stats</h4>
                {mounted && (
                  <div className="flex flex-col gap-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-blue-400" />
                      <span>Total Views: </span>
                      <span id="busuanzi_value_site_pv" className="text-white font-medium">--</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-green-400" />
                      <span>Visitors: </span>
                      <span id="busuanzi_value_site_uv" className="text-white font-medium">--</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-800/50 pt-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Copyright */}
                <p className="text-sm text-gray-500">
                  © {new Date().getFullYear()} Kylin Miao. Built with Next.js & Tailwind CSS.
                </p>

                {/* Page View */}
                {mounted && (
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    This page: <span id="busuanzi_value_page_pv" className="text-gray-500">--</span> views
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}