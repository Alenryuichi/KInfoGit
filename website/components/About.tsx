export default function About() {
  return (
    <section id="about" className="bg-gray-50 dark:bg-gray-800/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-heading-1 gradient-text mb-4">
              关于我 About Me
            </h2>
            <p className="text-body text-gray-600 dark:text-gray-300">
              深耕反作弊技术领域，专注大规模系统架构设计
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-heading-3 text-gray-900 dark:text-white">
                  🎯 专业专长
                </h3>
                <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-3 flex-shrink-0"></span>
                    <span><strong>反作弊技术专家：</strong>专注大规模数据分析和风控系统建设，成功识别违规企业5万+家，直接收益300万+</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-3 flex-shrink-0"></span>
                    <span><strong>系统架构师：</strong>从0到1构建多个核心系统，支撑10亿级数据处理，复杂分析时间压缩至5分钟内</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-3 flex-shrink-0"></span>
                    <span><strong>图数据库专家：</strong>构建包含20+实体类型、70+关系类型的复杂图数据库，支持多维度分析</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-3 flex-shrink-0"></span>
                    <span><strong>全栈开发：</strong>精通Python、Go、TypeScript等多语言，具备完整的前后端开发能力</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-heading-3 text-gray-900 dark:text-white">
                  🚀 技术价值观
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="card p-4">
                    <div className="text-primary-600 dark:text-primary-400 font-semibold mb-2">
                      效率优先
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      策略研发效率提升60%，上线时间缩短至2天
                    </div>
                  </div>
                  <div className="card p-4">
                    <div className="text-primary-600 dark:text-primary-400 font-semibold mb-2">
                      质量至上
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      大规模系统成功率99.9%，零投诉运营
                    </div>
                  </div>
                  <div className="card p-4">
                    <div className="text-primary-600 dark:text-primary-400 font-semibold mb-2">
                      持续创新
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      算法优化降低误伤率40%，覆盖率提升50%
                    </div>
                  </div>
                  <div className="card p-4">
                    <div className="text-primary-600 dark:text-primary-400 font-semibold mb-2">
                      团队协作
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      跨部门协作专家，独立主导复杂项目
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Timeline */}
            <div className="space-y-6">
              <h3 className="text-heading-3 text-gray-900 dark:text-white">
                🎓 成长轨迹
              </h3>
              
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 to-accent-500"></div>
                
                <div className="space-y-8">
                  {/* 2022-现在 */}
                  <div className="relative flex items-start gap-6">
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">T</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="card p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">腾讯科技</h4>
                          <span className="text-sm text-gray-500">2022 - 现在</span>
                        </div>
                        <div className="text-sm text-primary-600 dark:text-primary-400 mb-2">高级后端工程师</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          反作弊技术专家，系统架构师，主导多个从0到1的核心项目建设
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2019-2022 */}
                  <div className="relative flex items-start gap-6">
                    <div className="w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">🎓</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="card p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">华南理工大学</h4>
                          <span className="text-sm text-gray-500">2019 - 2022</span>
                        </div>
                        <div className="text-sm text-accent-600 dark:text-accent-400 mb-2">计算机科学与技术硕士</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          专注于数据结构算法、机器学习领域研究，发表CCF-C类论文
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}