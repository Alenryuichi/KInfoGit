import { useState, useEffect } from 'react'
import { ChevronDown, Download, ExternalLink, Github, Linkedin, Mail } from 'lucide-react'

const titles = [
  '全栈反作弊技术专家',
  'Full-stack Anti-fraud Expert',
  '系统架构师',
  'System Architect',
  '全栈开发工程师',
  'Full-stack Developer'
]

export default function Hero() {
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTitleIndex((prev) => (prev + 1) % titles.length)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="home" className="min-h-screen flex items-center justify-center pt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          {/* Avatar */}
          <div className="relative mx-auto w-32 h-32 sm:w-40 sm:h-40">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-1">
              <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <span className="text-4xl sm:text-5xl font-bold text-primary-600 dark:text-primary-400">
                  苗
                </span>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🚀</span>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              <span className="font-zh">苗静思</span>{' '}
              <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                Kylin
              </span>
            </h1>
            
            {/* Dynamic Title */}
            <div className="h-16 flex items-center justify-center">
              <h2 className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 font-medium transition-all duration-500">
                {titles[currentTitleIndex]}
              </h2>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">10亿+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">数据处理规模</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">300万+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">项目直接收益</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">5+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">核心项目</div>
            </div>
          </div>

          {/* Description */}
          <p className="max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            腾讯高级后端工程师，专注于反作弊技术、大规模分布式系统架构设计与优化。
            擅长从 0 到 1 构建企业级平台，在风控系统、图数据库应用领域有丰富实战经验。
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/kylin-resume.pdf"
              download="苗静思-Kylin-Resume.pdf"
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              下载简历 Resume
            </a>
            <a
              href="#projects"
              className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 hover:border-primary-600 dark:hover:border-primary-400 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              查看项目 Projects
            </a>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-4">
            <a
              href="mailto:miaojsi@outlook.com"
              className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Email"
            >
              <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </a>
            <a
              href="#"
              className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </a>
            <a
              href="#"
              className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </a>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="animate-bounce">
              <ChevronDown className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}