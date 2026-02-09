import { useEffect } from 'react'
import { animateOnScroll } from '@/utils/animations'

// SVG Icons
const BuildingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
)

const AcademicIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422m-6.16 3.422v7.055" />
  </svg>
)

const CodeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
)

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const TargetIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

export default function Experience() {
  useEffect(() => {
    animateOnScroll('.experience-header')
    animateOnScroll('.experience-card')
  }, [])

  const experiences = [
    {
      type: 'work',
      icon: <BuildingIcon />,
      company: {
        zh: '腾讯 - 企业微信',
        en: 'Tencent - WeCom'
      },
      position: '全栈开发工程师',
      period: '2022.07 - Present',
      location: 'Guangzhou, China',
      roles: [
        { title: 'AI Agent 架构师', color: 'blue' },
        { title: 'RAG 系统专家', color: 'emerald' },
        { title: '分布式系统', color: 'purple' },
        { title: '图数据库', color: 'orange' }
      ],
      highlights: [
        '独立设计 AI Agent 审核系统 V1→V4 架构演进，准确率从 70% 提升至 90%+',
        '架构设计 10 亿级画像中台，支持 200+ 标签 5 分钟复杂分析',
        '主导反作弊治理系统，识别违规服务商 820 家，年化收益近 4000 万',
        '修复 PKV 分布式序列化缺陷，写入性能提升 130 倍'
      ],
      metrics: [
        { value: '90%+', label: 'AI 准确率' },
        { value: '4000万', label: '年化收益' },
        { value: '130x', label: '性能提升' }
      ]
    },
    {
      type: 'indie',
      icon: <CodeIcon />,
      company: {
        zh: '独立开发者',
        en: 'Independent Developer'
      },
      position: '全栈 iOS 开发',
      period: '2025.09 - Present',
      location: 'Side Project',
      roles: [
        { title: 'iOS 开发', color: 'pink' },
        { title: 'AI 模型训练', color: 'blue' },
        { title: 'DevOps', color: 'emerald' }
      ],
      highlights: [
        '从 0 到 1 独立完成磕线 App 全流程：产品/UI/前后端/AI/DevOps',
        '设计 VideoMind Chain-of-Roles 工作流，成本优化 39%，准确率 92%',
        '训练 YOLO11m + MobileNet V3，CoreML 导出实现 300x 加速',
        '自研 MCP Server（25 个运维工具）实现 AI Agent 远程服务器控制'
      ],
      metrics: [
        { value: '300x', label: 'AI 加速' },
        { value: '92%', label: '识别准确率' },
        { value: '39%', label: '成本优化' }
      ]
    },
    {
      type: 'education',
      icon: <AcademicIcon />,
      company: {
        zh: '华南理工大学',
        en: 'South China University of Technology'
      },
      position: '计算机科学与技术硕士',
      period: '2019.09 - 2022.06',
      location: 'Guangzhou, China',
      highlights: [
        '发表 CCF-C 类学术论文：UAV Visual Navigation System based on Digital Twin',
        '研究方向：数字孪生、深度神经网络、无人机视觉导航'
      ],
      skills: ['分布式系统', '深度学习', '计算机视觉', '数据挖掘', '软件工程']
    }
  ]

  return (
    <section id="experience" className="py-20 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="experience-header text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
              CAREER TIMELINE
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Experience
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              专注于 AI Agent 系统、RAG 架构设计与全栈独立开发
            </p>
          </div>

          {/* Experience Cards */}
          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <div
                key={index}
                className="experience-card group relative overflow-hidden rounded-2xl bg-gray-900/50 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-500 hover:bg-gray-900/70"
              >
                {/* Header */}
                <div className="px-8 pt-8 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-gray-700/50 flex items-center justify-center text-blue-400 flex-shrink-0">
                      {exp.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                        {exp.company.zh}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {exp.company.en}
                      </p>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-blue-400 font-semibold">
                      {exp.position}
                    </div>
                    <div className="text-sm text-gray-500">
                      {exp.period}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="px-8 pb-8">
                  {/* Roles Tags (for work experience) */}
                  {exp.roles && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {exp.roles.map((role, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 text-xs font-medium bg-gray-800/60 text-gray-300 rounded-full border border-gray-700/50"
                        >
                          {role.title}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Highlights */}
                  <ul className="space-y-2 mb-6">
                    {exp.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Skills Tags (for education) */}
                  {exp.skills && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {exp.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 text-xs bg-gray-800/60 text-gray-300 rounded-full border border-gray-700/50"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Metrics (for work experience) */}
                  {exp.metrics && (
                    <div className="flex flex-wrap gap-6 pt-6 border-t border-gray-800/50">
                      {exp.metrics.map((metric, idx) => (
                        <div key={idx} className="text-center">
                          <div className="text-2xl font-bold text-blue-400">
                            {metric.value}
                          </div>
                          <div className="text-xs text-gray-500">
                            {metric.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            ))}
          </div>

          {/* Skills Summary */}
          <div className="mt-16 rounded-2xl bg-gray-900/50 border border-gray-800/50 p-8">
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              Core Competencies
            </h3>

            <div className="grid sm:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4 text-blue-400 group-hover:scale-110 transition-transform">
                  <CodeIcon />
                </div>
                <h4 className="font-semibold text-white mb-2">Tech Stack</h4>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Go · Swift · Python · TypeScript<br/>
                  SwiftUI · CoreML · Docker
                </p>
              </div>

              <div className="text-center group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400 group-hover:scale-110 transition-transform">
                  <TargetIcon />
                </div>
                <h4 className="font-semibold text-white mb-2">Expertise</h4>
                <p className="text-sm text-gray-400 leading-relaxed">
                  AI Agent · RAG 系统<br/>
                  分布式架构 · 图数据库
                </p>
              </div>

              <div className="text-center group sm:col-span-1">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4 text-purple-400 group-hover:scale-110 transition-transform">
                  <ChartIcon />
                </div>
                <h4 className="font-semibold text-white mb-2">Indie Dev</h4>
                <p className="text-sm text-gray-400 leading-relaxed">
                  0 到 1 全栈开发<br/>
                  产品/UI/AI/DevOps
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}