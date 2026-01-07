import Link from 'next/link'

interface ProjectHeaderProps {
  /** 项目标题（中文） */
  title: string
  /** 项目标题（英文，可选） */
  titleEn?: string
  /** 项目类别 */
  category?: string
  /** 公司名称 */
  company: string
  /** 担任角色 */
  role: string
  /** 项目时间段 */
  period: string
  /** 项目亮点描述 */
  highlights?: string
  /** 量化影响 */
  impact?: string
  /** 技术标签 */
  tags?: string[]
}

/**
 * 项目详情页标题组件
 * "Engineering Document" 风格的大标题区域
 */
export default function ProjectHeader({
  title,
  titleEn,
  category,
  company,
  role,
  period,
  highlights,
  impact,
  tags,
}: ProjectHeaderProps) {
  return (
    <header className="mb-10 md:mb-12">
      {/* Back Link */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          href="/work"
          className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors group"
        >
          <svg
            className="mr-2 w-4 h-4 transform group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Work</span>
        </Link>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800/80 text-gray-300 border border-gray-700/50">
          {period}
        </span>
      </div>

      {/* Category Badge */}
      {category && (
        <p className="text-sm text-blue-400 uppercase tracking-wider font-medium mb-4">
          {category.replace(/-/g, ' ')}
        </p>
      )}

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3">
        {title}
      </h1>
      {titleEn && (
        <p className="text-lg sm:text-xl text-gray-400 mb-4">{titleEn}</p>
      )}

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400 mb-6">
        <span>{company}</span>
        <span className="text-gray-600">·</span>
        <span>{role}</span>
      </div>

      {/* Impact Badge */}
      {impact && (
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 mb-6">
          <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span className="text-blue-300 font-medium text-sm">{impact}</span>
        </div>
      )}

      {/* Highlights */}
      {highlights && (
        <p className="text-gray-300 leading-relaxed text-lg mb-6">
          {highlights}
        </p>
      )}

      {/* Tech Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 text-xs font-medium bg-gray-800/60 text-gray-300 rounded-full border border-gray-700/50 hover:border-gray-600 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </header>
  )
}

