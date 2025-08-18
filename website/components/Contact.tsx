import { Mail, Phone, MapPin, Github, Linkedin, Download } from 'lucide-react'

export default function Contact() {
  const contactInfo = [
    {
      icon: Mail,
      label: '邮箱',
      value: 'miaojsi@outlook.com',
      href: 'mailto:miaojsi@outlook.com',
      color: 'text-blue-600'
    },
    {
      icon: Phone, 
      label: '电话',
      value: '+86 175 1209 0401',
      href: 'tel:+8617512090401',
      color: 'text-green-600'
    },
    {
      icon: MapPin,
      label: '位置',
      value: '广州, China',
      color: 'text-red-600'
    }
  ]

  const socialLinks = [
    {
      icon: Github,
      label: 'GitHub',
      href: '#',
      color: 'hover:text-gray-900 dark:hover:text-white'
    },
    {
      icon: Linkedin,
      label: 'LinkedIn', 
      href: '#',
      color: 'hover:text-blue-600'
    },
    {
      icon: Mail,
      label: 'Email',
      href: 'mailto:miaojsi@outlook.com',
      color: 'hover:text-red-600'
    }
  ]

  return (
    <section id="contact" className="bg-gray-50 dark:bg-gray-800/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-heading-1 gradient-text mb-4">
              联系我 Contact Me
            </h2>
            <p className="text-body text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              如果您对我的经历和技能感兴趣，欢迎随时联系交流合作机会
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-heading-3 text-gray-900 dark:text-white mb-6">
                  联系方式
                </h3>
                
                <div className="space-y-4">
                  {contactInfo.map((contact, index) => {
                    const IconComponent = contact.icon
                    const content = (
                      <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors">
                        <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 ${contact.color}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {contact.label}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            {contact.value}
                          </div>
                        </div>
                      </div>
                    )

                    return contact.href ? (
                      <a key={index} href={contact.href} className="block">
                        {content}
                      </a>
                    ) : (
                      <div key={index}>{content}</div>
                    )
                  })}
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-heading-3 text-gray-900 dark:text-white mb-6">
                  社交媒体
                </h3>
                
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => {
                    const IconComponent = social.icon
                    return (
                      <a
                        key={index}
                        href={social.href}
                        className={`p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 ${social.color} transition-all hover:border-primary-300 dark:hover:border-primary-600 hover:transform hover:-translate-y-1`}
                        aria-label={social.label}
                      >
                        <IconComponent className="w-5 h-5" />
                      </a>
                    )
                  })}
                </div>
              </div>

              {/* Download Resume */}
              <div>
                <h3 className="text-heading-3 text-gray-900 dark:text-white mb-6">
                  简历下载
                </h3>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="flex items-center justify-center gap-3 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors">
                    <Download className="w-5 h-5" />
                    下载中文简历
                  </button>
                  <button className="flex items-center justify-center gap-3 border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white px-6 py-3 rounded-lg transition-colors">
                    <Download className="w-5 h-5" />
                    Download English CV
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Form or Additional Info */}
            <div className="card p-8">
              <h3 className="text-heading-3 text-gray-900 dark:text-white mb-6">
                关于合作
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    💼 工作机会
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    对反作弊技术、大规模系统架构、图数据库等领域的技术挑战充满热情，
                    欢迎讨论相关的工作机会和技术合作。
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    🤝 技术交流
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    乐于分享在反作弊、系统架构设计方面的经验，
                    也希望与同行交流学习新的技术和思路。
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    📚 知识分享
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    可以分享大规模数据处理、图数据库应用、
                    反作弊算法等方面的实战经验和最佳实践。
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">响应时间</span>
                    <span className="text-primary-600 dark:text-primary-400 font-medium">通常24小时内</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">工作时间</span>
                  <span className="text-primary-600 dark:text-primary-400 font-medium">周一至周五 9:00-18:00</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">时区</span>
                  <span className="text-primary-600 dark:text-primary-400 font-medium">UTC+8 北京时间</span>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="card p-8 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border-primary-200 dark:border-primary-700">
              <h3 className="text-heading-3 text-gray-900 dark:text-white mb-4">
                期待与您的合作
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                如果您正在寻找具有反作弊技术专长和大规模系统架构经验的工程师，
                或者希望在相关技术领域进行交流合作，请随时联系我。
              </p>
              <a
                href="mailto:miaojsi@outlook.com"
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg transition-colors"
              >
                <Mail className="w-5 h-5" />
                立即联系
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}