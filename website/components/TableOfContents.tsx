import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
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
  const observerRef = useRef<IntersectionObserver | null>(null)

  const headings = useMemo(() => extractHeadings(content), [content])

  const setupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    const headingElements = headings
      .map(h => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[]

    if (headingElements.length === 0) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(e => e.isIntersecting)
        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id)
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      }
    )

    for (const el of headingElements) {
      observerRef.current.observe(el)
    }
  }, [headings])

  useEffect(() => {
    const timer = setTimeout(setupObserver, 100)
    return () => {
      clearTimeout(timer)
      observerRef.current?.disconnect()
    }
  }, [setupObserver])

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
    <ul className="space-y-1 text-sm border-l border-gray-800">
      {headings.map((heading) => (
        <li key={heading.id}>
          <button
            onClick={() => handleClick(heading.id)}
            className={`block w-full text-left py-1.5 transition-colors border-l-2 -ml-px ${
              heading.level === 2 ? 'pl-4' : 'pl-6'
            } ${
              activeId === heading.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'
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
        <div className="lg:hidden mb-8">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <span className="font-medium">目录</span>
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {isOpen && (
            <div className="mt-2 px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800">
              {tocList}
            </div>
          )}
        </div>
      )}

      {/* Desktop: sticky sidebar */}
      {showDesktop && (
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-32 max-h-[calc(100vh-10rem)] overflow-y-auto">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              目录
            </p>
            {tocList}
          </div>
        </aside>
      )}
    </>
  )
}
