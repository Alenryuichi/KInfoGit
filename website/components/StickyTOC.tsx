import { useEffect, useState } from 'react'

export interface TOCItem {
  /** 标题 ID（用于锚点跳转） */
  id: string
  /** 标题文本 */
  text: string
  /** 标题层级（2-4） */
  level: number
}

interface StickyTOCProps {
  /** 目录项列表 */
  items: TOCItem[]
  /** 可选的 CSS 类名 */
  className?: string
}

/**
 * Sticky Table of Contents 组件
 * 使用 IntersectionObserver 监听滚动并高亮当前区段
 */
export default function StickyTOC({ items, className = '' }: StickyTOCProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (items.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // 找到所有可见的标题
        const visibleEntries = entries.filter((entry) => entry.isIntersecting)
        
        if (visibleEntries.length > 0) {
          // 取最上方的可见标题
          const topEntry = visibleEntries.reduce((prev, curr) => {
            return prev.boundingClientRect.top < curr.boundingClientRect.top ? prev : curr
          })
          setActiveId(topEntry.target.id)
        }
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      }
    )

    // 观察所有标题元素
    items.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [items])

  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const yOffset = -100 // 偏移量，避免被固定头部遮挡
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
    <nav className={`sticky top-24 ${className}`}>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
        On this page
      </h4>
      <ul className="space-y-2 border-l border-gray-800">
        {items.map((item) => {
          const isActive = activeId === item.id
          const indent = item.level === 3 ? 'pl-4' : item.level === 4 ? 'pl-6' : ''

          return (
            <li key={item.id} className={indent}>
              <button
                onClick={() => handleClick(item.id)}
                className={`
                  block w-full text-left px-4 py-1.5 text-sm transition-colors duration-200
                  border-l-2 -ml-px
                  ${isActive
                    ? 'border-blue-500 text-blue-400 font-medium'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                  }
                `}
              >
                {item.text}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/**
 * 从 HTML 内容中提取标题生成 TOC
 * @param content - HTML 字符串或 Markdown 内容
 * @returns TOCItem 数组
 */
export function extractTOCFromContent(content: string): TOCItem[] {
  const items: TOCItem[] = []
  
  // 匹配 Markdown 标题 (## / ### / ####)
  const headingRegex = /^(#{2,4})\s+(.+)$/gm
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    // 生成 ID：转小写，空格替换为连字符，移除特殊字符
    const id = text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u4e00-\u9fa5-]/g, '')

    items.push({ id, text, level })
  }

  return items
}

