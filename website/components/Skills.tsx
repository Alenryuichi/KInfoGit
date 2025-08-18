import { useState } from 'react'

const skillCategories = [
  {
    id: 'programming',
    name: '编程语言',
    nameEn: 'Programming Languages',
    skills: [
      { name: 'Python', level: 95, years: '5+ years', color: 'from-blue-500 to-blue-600' },
      { name: 'Go', level: 90, years: '3+ years', color: 'from-cyan-500 to-cyan-600' },
      { name: 'C++', level: 85, years: '4+ years', color: 'from-purple-500 to-purple-600' },
      { name: 'TypeScript', level: 80, years: '3+ years', color: 'from-blue-600 to-blue-700' },
      { name: 'JavaScript', level: 80, years: '4+ years', color: 'from-yellow-500 to-yellow-600' },
      { name: 'SQL', level: 90, years: '5+ years', color: 'from-orange-500 to-orange-600' },
    ]
  },
  {
    id: 'backend',
    name: '后端架构',
    nameEn: 'Backend & Architecture',
    skills: [
      { name: 'gRPC/tRPC', level: 90, years: '3+ years', color: 'from-green-500 to-green-600' },
      { name: '微服务架构', level: 95, years: '专家级', color: 'from-emerald-500 to-emerald-600' },
      { name: 'OLAP/OLTP设计', level: 95, years: '专家级', color: 'from-teal-500 to-teal-600' },
      { name: '分布式系统', level: 95, years: '专家级', color: 'from-indigo-500 to-indigo-600' },
      { name: '高并发架构', level: 90, years: '3+ years', color: 'from-purple-500 to-purple-600' },
    ]
  },
  {
    id: 'antifraud',
    name: '反作弊安全',
    nameEn: 'Anti-fraud & Security',
    skills: [
      { name: '特征工程', level: 95, years: '专家级', color: 'from-red-500 to-red-600' },
      { name: '风险识别算法', level: 95, years: '专家级', color: 'from-pink-500 to-pink-600' },
      { name: '图数据建模', level: 95, years: '专家级', color: 'from-rose-500 to-rose-600' },
      { name: '策略生命周期管理', level: 90, years: '专家级', color: 'from-violet-500 to-violet-600' },
      { name: '关系网络分析', level: 90, years: '3+ years', color: 'from-fuchsia-500 to-fuchsia-600' },
    ]
  },
  {
    id: 'database',
    name: '数据库大数据',
    nameEn: 'Database & Big Data',
    skills: [
      { name: 'ClickHouse', level: 95, years: '专家级', color: 'from-orange-500 to-orange-600' },
      { name: 'MySQL/HBase', level: 85, years: '5+ years', color: 'from-blue-500 to-blue-600' },
      { name: 'Flink/Kafka', level: 85, years: '3+ years', color: 'from-purple-500 to-purple-600' },
      { name: '10亿级数据处理', level: 95, years: '专家级', color: 'from-emerald-500 to-emerald-600' },
      { name: 'Redis/TDW', level: 80, years: '3+ years', color: 'from-red-500 to-red-600' },
    ]
  },
  {
    id: 'frontend',
    name: '前端技术',
    nameEn: 'Frontend Technologies',
    skills: [
      { name: 'Vue.js', level: 85, years: '3+ years', color: 'from-green-500 to-green-600' },
      { name: 'HTML5/CSS3', level: 80, years: '4+ years', color: 'from-orange-500 to-orange-600' },
      { name: 'TypeScript', level: 80, years: '3+ years', color: 'from-blue-500 to-blue-600' },
      { name: 'Figma设计', level: 70, years: '2+ years', color: 'from-pink-500 to-pink-600' },
    ]
  }
]

export default function Skills() {
  const [activeCategory, setActiveCategory] = useState('programming')

  const currentCategory = skillCategories.find(cat => cat.id === activeCategory)

  return (
    <section id="skills">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-heading-1 gradient-text mb-4">
              技术技能 Technical Skills
            </h2>
            <p className="text-body text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              深度掌握反作弊技术、大规模系统架构、图数据库等核心技术栈，
              在企业级项目中积累了丰富的实战经验
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Category Tabs */}
            <div className="lg:col-span-1">
              <div className="space-y-2 sticky top-24">
                {skillCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      activeCategory === category.id
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="font-semibold font-zh">{category.name}</div>
                    <div className="text-sm opacity-75">{category.nameEn}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Skills Content */}
            <div className="lg:col-span-3">
              <div className="card p-8">
                <div className="mb-8">
                  <h3 className="text-heading-3 text-gray-900 dark:text-white mb-2 font-zh">
                    {currentCategory?.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {currentCategory?.nameEn}
                  </p>
                </div>

                <div className="grid gap-6">
                  {currentCategory?.skills.map((skill, index) => (
                    <div key={skill.name} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {skill.name}
                          </h4>
                          <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {skill.years}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {skill.level}%
                        </div>
                      </div>
                      
                      {/* Skill Bar */}
                      <div className="relative">
                        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${skill.color} transition-all duration-1000 ease-out`}
                            style={{
                              width: `${skill.level}%`,
                              animationDelay: `${index * 100}ms`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Category Stats */}
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {currentCategory?.skills.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">核心技能</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {Math.round((currentCategory?.skills.reduce((acc, skill) => acc + skill.level, 0) || 0) / (currentCategory?.skills.length || 1))}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">平均掌握度</div>
                    </div>
                    <div className="text-center col-span-2 sm:col-span-1">
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {currentCategory?.skills.filter(s => s.years.includes('专家') || s.level >= 90).length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">专家级技能</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Highlights */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="card card-hover p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                反作弊专家
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                识别违规企业5万+家，直接收益300万+，零投诉运营
              </p>
            </div>

            <div className="card card-hover p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl">🏗️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                架构设计师
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                从0到1构建10亿级数据平台，5分钟完成复杂分析
              </p>
            </div>

            <div className="card card-hover p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl">🌐</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                全栈开发
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                精通前后端开发，具备完整项目交付能力
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}