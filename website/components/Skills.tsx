const skillCategories = [
  {
    name: '编程语言',
    nameEn: 'Programming Languages',
    icon: '💻',
    skills: [
      { name: 'Python', years: '5+ years', level: 'expert' },
      { name: 'Go', years: '3+ years', level: 'expert' },
      { name: 'C++', years: '4+ years', level: 'proficient' },
      { name: 'TypeScript', years: '3+ years', level: 'proficient' },
      { name: 'JavaScript', years: '4+ years', level: 'proficient' },
      { name: 'SQL', years: '5+ years', level: 'expert' },
    ]
  },
  {
    name: '后端架构',
    nameEn: 'Backend & Architecture',
    icon: '🏗️',
    skills: [
      { name: 'gRPC/tRPC', years: '3+ years', level: 'expert' },
      { name: '微服务架构', years: '专家级', level: 'expert' },
      { name: 'OLAP/OLTP设计', years: '专家级', level: 'expert' },
      { name: '分布式系统', years: '专家级', level: 'expert' },
      { name: '高并发架构', years: '3+ years', level: 'expert' },
    ]
  },
  {
    name: '反作弊安全',
    nameEn: 'Anti-fraud & Security',
    icon: '🛡️',
    skills: [
      { name: '特征工程', years: '专家级', level: 'expert' },
      { name: '风险识别算法', years: '专家级', level: 'expert' },
      { name: '图数据建模', years: '专家级', level: 'expert' },
      { name: '策略生命周期管理', years: '专家级', level: 'expert' },
      { name: '关系网络分析', years: '3+ years', level: 'expert' },
    ]
  },
  {
    name: '数据库大数据',
    nameEn: 'Database & Big Data',
    icon: '📊',
    skills: [
      { name: 'ClickHouse', years: '专家级', level: 'expert' },
      { name: 'MySQL/HBase', years: '5+ years', level: 'proficient' },
      { name: 'Flink/Kafka', years: '3+ years', level: 'proficient' },
      { name: '10亿级数据处理', years: '专家级', level: 'expert' },
      { name: 'Redis/TDW', years: '3+ years', level: 'proficient' },
    ]
  },
  {
    name: '前端技术',
    nameEn: 'Frontend Technologies',
    icon: '🎨',
    skills: [
      { name: 'Vue.js', years: '3+ years', level: 'proficient' },
      { name: 'HTML5/CSS3', years: '4+ years', level: 'proficient' },
      { name: 'React/Next.js', years: '2+ years', level: 'intermediate' },
      { name: 'Figma设计', years: '2+ years', level: 'intermediate' },
    ]
  }
]

// 获取技能等级的样式
const getSkillLevelStyle = (level: string) => {
  switch (level) {
    case 'expert':
      return 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
    case 'proficient':
      return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
    case 'intermediate':
      return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
    default:
      return 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
  }
}

// 获取技能等级的中文标签
const getSkillLevelLabel = (level: string) => {
  switch (level) {
    case 'expert':
      return '专家'
    case 'proficient':
      return '熟练'
    case 'intermediate':
      return '一般'
    default:
      return '了解'
  }
}

export default function Skills() {

  return (
    <section id="skills">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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

          {/* Skills Grid */}
          <div className="grid gap-8">
            {skillCategories.map((category, categoryIndex) => (
              <div key={category.name} className="card p-8">
                {/* Category Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl">{category.icon}</div>
                  <div>
                    <h3 className="text-heading-3 text-gray-900 dark:text-white font-zh">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {category.nameEn}
                    </p>
                  </div>
                </div>

                {/* Skills Tags */}
                <div className="flex flex-wrap gap-3">
                  {category.skills.map((skill, skillIndex) => (
                    <div
                      key={skill.name}
                      className={`group relative px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg ${getSkillLevelStyle(skill.level)}`}
                      style={{
                        animationDelay: `${categoryIndex * 200 + skillIndex * 100}ms`
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{skill.name}</span>
                        <span className="text-xs opacity-90 bg-white/20 px-2 py-1 rounded-full">
                          {getSkillLevelLabel(skill.level)}
                        </span>
                      </div>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        经验: {skill.years}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Technical Highlights */}
          <div className="mt-16">
            <h3 className="text-heading-2 text-center text-gray-900 dark:text-white mb-8">
              核心优势 Core Strengths
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card card-hover p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl">🎯</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  反作弊专家
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  识别违规企业5万+家，直接收益300万+，零投诉运营
                </p>
              </div>

              <div className="card card-hover p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl">🏗️</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  架构设计师
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  从0到1构建10亿级数据平台，5分钟完成复杂分析
                </p>
              </div>

              <div className="card card-hover p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl">🌐</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  全栈开发
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  精通前后端开发，具备完整项目交付能力
                </p>
              </div>
            </div>
          </div>

          {/* Skills Legend */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-6 bg-gray-50 dark:bg-gray-800 px-6 py-3 rounded-full">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">专家级</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">熟练</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">一般</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}