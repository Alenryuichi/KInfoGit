import { useEffect } from 'react'
import { animateOnScroll, animateTimeline } from '@/utils/animations'

export default function Experience() {
  useEffect(() => {
    // 初始化滚动动画
    animateOnScroll('.experience-header')
    animateTimeline()
  }, [])

  return (
    <section id="experience">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="experience-header text-center mb-16">
            <h2 className="text-heading-1 gradient-text mb-4">
              工作经历 Experience
            </h2>
            <p className="text-body text-gray-600 dark:text-gray-300">
              在反作弊技术和系统架构领域的专业成长历程
            </p>
          </div>

          {/* Main Experience */}
          <div className="timeline-container relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 to-accent-500 hidden md:block"></div>

            {/* Tencent Experience */}
            <div className="timeline-item relative mb-12">
              <div className="md:flex items-start gap-8">
                {/* Timeline Dot */}
                <div className="hidden md:flex w-16 h-16 bg-primary-600 rounded-full items-center justify-center flex-shrink-0 relative z-10">
                  <span className="text-white text-xl font-bold">T</span>
                </div>
                
                {/* Content */}
                <div className="flex-1 card p-8">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                    <div>
                      <h3 className="text-heading-3 text-gray-900 dark:text-white font-zh">
                        腾讯科技 (广州) 有限公司
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">Tencent Technology (Guangzhou) Co., Ltd.</p>
                    </div>
                    <div className="text-right mt-2 sm:mt-0">
                      <div className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                        高级后端工程师
                      </div>
                      <div className="text-sm text-gray-500">2022.07 - 至今</div>
                    </div>
                  </div>

                  {/* Key Roles */}
                  <div className="grid sm:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            反作弊技术专家
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            主导反作弊治理全生命周期项目，识别违规服务商820家、企业52683家，
                            直接收益300+万（持续增长中）
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-accent-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            图数据库专家
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            主导反垃圾图应用开发，构建包含20余种实体、70余种关系的复杂图数据库
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            系统架构师
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            从0到1构建画像中台系统，支撑10亿级数据分析，
                            复杂分析耗时压缩至5分钟内
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            项目管理专家
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            独立主导多个核心项目，撰写技术文档10+篇，
                            跨部门协作推进项目落地
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Achievements */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">核心成就</h4>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg">
                        <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">
                          10亿级
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">数据分析平台</div>
                      </div>
                      
                      <div className="text-center p-4 bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20 rounded-lg">
                        <div className="text-2xl font-bold text-accent-600 dark:text-accent-400 mb-1">
                          300万+
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">直接收益</div>
                      </div>
                      
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                          5万+
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">识别违规企业</div>
                      </div>
                      
                      <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                          99.9%
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">系统成功率</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="relative">
              <div className="md:flex items-start gap-8">
                {/* Timeline Dot */}
                <div className="hidden md:flex w-16 h-16 bg-accent-500 rounded-full items-center justify-center flex-shrink-0 relative z-10">
                  <span className="text-white text-xl">🎓</span>
                </div>
                
                {/* Content */}
                <div className="flex-1 card p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                    <div>
                      <h3 className="text-heading-3 text-gray-900 dark:text-white font-zh">
                        华南理工大学
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">South China University of Technology</p>
                    </div>
                    <div className="text-right mt-2 sm:mt-0">
                      <div className="text-lg font-semibold text-accent-600 dark:text-accent-400">
                        计算机科学与技术硕士
                      </div>
                      <div className="text-sm text-gray-500">2019.09 - 2022.06</div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">主修课程</h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          '数据结构与算法',
                          '计算机网络', 
                          '数据库系统',
                          '软件工程',
                          '机器学习'
                        ].map(course => (
                          <span key={course} className="px-3 py-1 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded-full text-sm">
                            {course}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">学术成果</h4>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex items-center gap-2">
                          <span className="text-accent-500">•</span>
                          发表CCF-C类学术论文1篇
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-accent-500">•</span>
                          扎实的计算机基础理论
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-accent-500">•</span>
                          优秀的编程能力和系统设计思维
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Summary */}
          <div className="mt-16 card p-8">
            <h3 className="text-heading-3 text-gray-900 dark:text-white text-center mb-8">
              专业技能总结
            </h3>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-white text-xl">🔧</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">技术栈</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Python, Go, C++, TypeScript<br/>
                  Vue.js, ClickHouse, MySQL
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-white text-xl">🎯</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">专业领域</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  反作弊技术、系统架构<br/>
                  图数据库、大数据处理
                </p>
              </div>

              <div className="text-center sm:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-white text-xl">📈</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">项目经验</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  0到1系统建设<br/>
                  跨部门协作管理
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}