import { Github, Linkedin, Mail, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="text-gray-300 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/3 to-purple-500/3 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">K</span>
                </div>
                <span className="text-xl font-bold text-white">Kylin 苗静思</span>
              </div>
              <p className="text-gray-400 max-w-md mb-4">
                腾讯高级后端工程师，反作弊技术专家，专注于大规模系统架构设计与图数据库应用。
                致力于通过技术创新解决复杂业务问题。
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-md">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary-400">10亿+</div>
                  <div className="text-xs text-gray-500">数据处理</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-accent-400">300万+</div>
                  <div className="text-xs text-gray-500">项目收益</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">99.9%</div>
                  <div className="text-xs text-gray-500">系统成功率</div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">快速导航</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#about" className="hover:text-primary-400 transition-colors">
                    关于我
                  </a>
                </li>
                <li>
                  <a href="#skills" className="hover:text-primary-400 transition-colors">
                    技术技能
                  </a>
                </li>
                <li>
                  <a href="#projects" className="hover:text-primary-400 transition-colors">
                    核心项目
                  </a>
                </li>
                <li>
                  <a href="#experience" className="hover:text-primary-400 transition-colors">
                    工作经历
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-primary-400 transition-colors">
                    联系我
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact & Social */}
            <div>
              <h3 className="text-white font-semibold mb-4">联系方式</h3>
              <div className="space-y-2 mb-6">
                <div className="text-sm">
                  <span className="text-gray-400">邮箱: </span>
                  <a 
                    href="mailto:miaojsi@outlook.com" 
                    className="hover:text-primary-400 transition-colors"
                  >
                    miaojsi@outlook.com
                  </a>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">电话: </span>
                  <span>+86 175 1209 0401</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">位置: </span>
                  <span>广州, China</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-3">
                <a
                  href="mailto:miaojsi@outlook.com"
                  className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all duration-300 hover:scale-110 border border-gray-700/50 hover:border-gray-600/50 hover:text-red-400"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all duration-300 hover:scale-110 border border-gray-700/50 hover:border-gray-600/50 hover:text-gray-100"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all duration-300 hover:scale-110 border border-gray-700/50 hover:border-gray-600/50 hover:text-blue-400"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700/30 mt-12 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              {/* Copyright */}
              <div className="text-sm text-gray-400 mb-4 sm:mb-0">
                © {new Date().getFullYear()} 苗静思 Kylin. All rights reserved.
              </div>

              {/* Tech Stack */}
              <div className="flex items-center text-sm text-gray-400">
                <span>Built with</span>
                <Heart className="w-4 h-4 mx-2 text-red-500" />
                <span>using</span>
                <div className="flex items-center ml-2 space-x-2">
                  <span className="px-2 py-1 bg-gray-800/50 border border-gray-700/50 rounded text-xs">Next.js</span>
                  <span className="px-2 py-1 bg-gray-800/50 border border-gray-700/50 rounded text-xs">TypeScript</span>
                  <span className="px-2 py-1 bg-gray-800/50 border border-gray-700/50 rounded text-xs">Tailwind CSS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              专注于反作弊技术、大规模系统架构设计、图数据库应用 | 
              腾讯科技高级后端工程师 | 
              华南理工大学计算机科学与技术硕士
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}