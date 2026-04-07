import { useState, useEffect, useRef, useMemo } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface TocHeading {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
  /** Which variant to render. Defaults to 'both'. */
  variant?: 'mobile' | 'desktop' | 'both'
}

/**
 * Extract h2/h3 headings from markdown content.
 */
function extractHeadings(content: string): TocHeading[] {
  const headings: TocHeading[] = []
  const lines = content.split('\n')

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      const id = text
        .toLowerCase()
        .replace(/[^\w\s\u4e00-\u9fff-]/g, '')
        .replace(/\s+/g, '-')
      headings.push({ id, text, level })
    }
  }

  return headings
}

export function TableOfContents({ content, variant = 'both' }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)
  const tocScrollRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const headings = useMemo(() => extractHeadings(content), [content])

  // Scroll-based active heading detection — more reliable than IntersectionObserver
  useEffect(() => {
    if (headings.length === 0) return

    function onScroll() {
      const scrollY = window.scrollY
      const offset = 100 // match header height

      // Find the last heading that has scrolled past the offset line
      let current = ''
      for (const h of headings) {
        const el = document.getElementById(h.id)
        if (el && el.offsetTop <= scrollY + offset) {
          current = h.id
        }
      }
      // If nothing passed the offset yet, highlight the first heading
      if (!current && headings.length > 0) {
        current = headings[0].id
      }
      setActiveId(current)
    }

    onScroll() // set initial state
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [headings])

  // Auto-scroll TOC sidebar to keep active item visible
  useEffect(() => {
    if (!activeId) return
    const btn = itemRefs.current.get(activeId)
    const container = tocScrollRef.current
    if (btn && container) {
      btn.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [activeId])

  if (headings.length < 2) {
    return null
  }

  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setActiveId(id)
    }
    setIsOpen(false)
  }

  const tocList = (
    <ul className="space-y-1 text-[13px] border-l border-white/[0.06]">
      {headings.map((heading) => (
        <li key={heading.id}>
          <button
            ref={(el) => { if (el) itemRefs.current.set(heading.id, el) }}
            onClick={() => handleClick(heading.id)}
            className={`block w-full text-left py-1.5 transition-colors border-l-2 -ml-px ${
              heading.level === 2 ? 'pl-4' : 'pl-6'
            } ${
              activeId === heading.id
                ? 'border-white/[0.3] text-gray-200 font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-white/[0.15]'
            }`}
          >
            {heading.text}
          </button>
        </li>
      ))}
    </ul>
  )

  const showMobile = variant === 'mobile' || variant === 'both'
  const showDesktop = variant === 'desktop' || variant === 'both'

  return (
    <>
      {/* Mobile: collapsible panel */}
      {showMobile && (
        <div className="xl:hidden mb-8">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-sm text-gray-300 hover:bg-white/[0.04] hover:text-white transition-colors"
          >
            <span className="font-medium">目录</span>
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {isOpen && (
            <div className="mt-2 px-4 py-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              {tocList}
            </div>
          )}
        </div>
      )}

      {/* Desktop: sticky sidebar positioned in the right margin */}
      {showDesktop && (
        <aside className="hidden xl:block absolute top-0 bottom-0 left-full ml-8 w-56">
          <div
            ref={tocScrollRef}
            className="sticky top-32 max-h-[calc(100vh-10rem)] overflow-y-auto overflow-x-hidden scrollbar-hide"
          >
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-3 pl-1">
              目录
            </p>
            {tocList}
          </div>
        </aside>
      )}
    </>
  )
}
