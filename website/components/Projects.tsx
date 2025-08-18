export default function Projects() {
  return (
    <section id="projects" className="bg-gray-50 dark:bg-gray-800/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-heading-1 gradient-text mb-4">
              核心项目 Core Projects
            </h2>
            <p className="text-body text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              主导多个从0到1的企业级项目，在反作弊、系统架构、图数据库等领域积累了丰富经验
            </p>
          </div>

          {/* Featured Project */}
          <div className="card card-hover p-8 mb-12">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="status-badge status-ongoing">进行中</span>
                  <span className="text-sm text-gray-500">2024 - 至今</span>
                </div>
                
                <h3 className="text-heading-2 text-gray-900 dark:text-white">
                  安全策略全生命周期管理系统
                </h3>
                
                <p className="text-body text-gray-600 dark:text-gray-300">
                  作为架构师主导设计的企业级策略管理平台，实现了从策略研发到上线运营的全流程自动化管理。
                  通过智能化优化和实时效果评估，显著提升了策略研发效率。
                </p>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">核心成果：</h4>
                    <ul className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-center gap-2">
                        <span className="text-accent-500">▲</span>
                        研发效率提升60%
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-accent-500">▼</span>
                        误伤率降低40%
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-accent-500">▲</span>
                        覆盖率提升50%
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-accent-500">⚡</span>
                        上线时间压缩至2天
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {['Python', 'Go', 'C++', '机器学习平台', 'Flink', 'Kafka'].map(tech => (
                      <span key={tech} className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-4xl mb-4">🎯</div>
                    <div className="text-xl font-bold mb-2">策略管理系统</div>
                    <div className="text-sm opacity-90">全生命周期自动化</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Project 1 */}
            <div className="card card-hover p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white">📊</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">画像中台系统</h3>
                    <span className="text-sm text-gray-500">2022-2024 • 项目负责人</span>
                  </div>
                </div>
                <span className="status-badge status-completed">已完成</span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                从0到1构建10亿级数据分析平台，支持200+标签维度分析，复杂分析5分钟内完成，刷单欺诈行为下降30%
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">数据处理规模</span>
                  <span className="font-semibold text-primary-600">10亿级</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">分析维度</span>
                  <span className="font-semibold text-primary-600">200+</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">欺诈行为下降</span>
                  <span className="font-semibold text-accent-600">30%</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mt-4">
                {['Python', 'Golang', 'ClickHouse', 'Vue.js'].map(tech => (
                  <span key={tech} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Project 2 */}
            <div className="card card-hover p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                    <span className="text-white">🛡️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">反作弊治理系统</h3>
                    <span className="text-sm text-gray-500">2023-2024 • 项目负责人</span>
                  </div>
                </div>
                <span className="status-badge status-completed">已完成</span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                识别违规服务商820家、企业52683家，项目收益300万+，实现零投诉运营
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">违规服务商</span>
                  <span className="font-semibold text-red-600">820家</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">违规企业</span>
                  <span className="font-semibold text-red-600">52,683家</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">直接收益</span>
                  <span className="font-semibold text-accent-600">300万+</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mt-4">
                {['Python', 'Go', 'C++', '反作弊算法'].map(tech => (
                  <span key={tech} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Project 3 */}
            <div className="card card-hover p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white">🌐</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">反垃圾图应用平台</h3>
                    <span className="text-sm text-gray-500">2021-2023 • 项目负责人</span>
                  </div>
                </div>
                <span className="status-badge status-completed">已完成</span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                构建包含20余种实体、70余种关系的图数据库，支持4种扩散分析、4种溯源分析
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">实体类型</span>
                  <span className="font-semibold text-purple-600">20+种</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">关系类型</span>
                  <span className="font-semibold text-purple-600">70+种</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">分析类型</span>
                  <span className="font-semibold text-accent-600">8种</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mt-4">
                {['图数据库', 'Python', '关系网络分析'].map(tech => (
                  <span key={tech} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Project 4 */}
            <div className="card card-hover p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white">⚡</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">快速回滚系统</h3>
                    <span className="text-sm text-gray-500">2023-2024 • 项目负责人</span>
                  </div>
                </div>
                <span className="status-badge status-completed">已完成</span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                支持33种封禁类型回滚，秒级精确回滚，大规模回滚成功率99.9%
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">封禁类型</span>
                  <span className="font-semibold text-green-600">33种</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">回滚速度</span>
                  <span className="font-semibold text-green-600">秒级</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">成功率</span>
                  <span className="font-semibold text-accent-600">99.9%</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mt-4">
                {['Go', 'Vue.js', '分布式系统', '微服务'].map(tech => (
                  <span key={tech} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}