import { useEffect } from 'react'
import { Github, Linkedin, Mail, ArrowRight } from 'lucide-react'
import { animateHeroEntrance, addButtonHoverEffects } from '@/utils/animations'

export default function Hero() {
  useEffect(() => {
    // 页面加载后启动Hero动画
    const timer = setTimeout(() => {
      animateHeroEntrance()
      addButtonHoverEffects()
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Main Heading */}
          <div className="hero-title space-y-6">
            <div className="space-y-2">
              <p className="text-gray-400 text-lg font-medium">
                I help founders turn ideas into
              </p>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="block mb-2">seamless digital</span>
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  experiences
                </span>
              </h1>
            </div>

            <div className="hero-subtitle space-y-4">
              <h2 className="text-2xl sm:text-3xl text-gray-300 font-light">
                Hello, I'm <span className="font-semibold text-white">Kylin Miao</span>
              </h2>
              <p className="text-lg text-gray-400">
                a Full Stack Developer
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="hero-description max-w-4xl mx-auto space-y-6">
            <p className="text-xl text-gray-300 leading-relaxed">
              Senior Backend Engineer at Tencent, specializing in anti-fraud technology and
              large-scale distributed system architecture. Expert in building enterprise platforms
              from 0 to 1, with rich experience in risk control systems and graph database applications.
            </p>

            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-gray-400">
              <a
                href="mailto:miaojsi@outlook.com"
                className="flex items-center hover:text-white transition-colors group"
              >
                <Mail className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                miaojsi@outlook.com
              </a>
              <div className="hidden sm:block w-1 h-1 bg-gray-600 rounded-full"></div>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Based in China
              </span>
            </div>
          </div>

	          {/* CTA Buttons */}
	          <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center items-center">
	            <a
	              href="/work#projects"
	              className="animated-button group inline-flex items-center px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
	            >
	              View My Work
	              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
	            </a>
            <a
              href="#contact"
              className="animated-button inline-flex items-center px-8 py-4 border border-gray-600 text-gray-300 font-semibold rounded-full hover:border-gray-400 hover:text-white transition-all duration-300"
            >
              Let's Connect
            </a>
          </div>

          {/* Social Links */}
          <div className="hero-social flex items-center justify-center gap-4 pt-8">
            <a
              href="mailto:miaojsi@outlook.com"
              className="p-3 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 hover:scale-110 border border-gray-700/50 hover:border-gray-600/50"
              aria-label="Email"
            >
              <Mail className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
            </a>
            <a
              href="https://github.com/kylinmiao"
              className="p-3 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 hover:scale-110 border border-gray-700/50 hover:border-gray-600/50"
              aria-label="GitHub"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
            </a>
            <a
              href="https://linkedin.com/in/kylinmiao"
              className="p-3 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 hover:scale-110 border border-gray-700/50 hover:border-gray-600/50"
              aria-label="LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="hero-scroll absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center animate-pulse">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  )
}