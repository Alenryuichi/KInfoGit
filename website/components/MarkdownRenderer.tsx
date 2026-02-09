'use client'

import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Components } from 'react-markdown'

interface MarkdownRendererProps {
  content: string
  className?: string
}

// Mermaid component for rendering diagrams
function MermaidDiagram({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const renderIdRef = useRef(0)

  useEffect(() => {
    const currentRenderId = ++renderIdRef.current

    const renderMermaid = async () => {
      // Wait for next tick to ensure ref is attached
      await new Promise(resolve => setTimeout(resolve, 0))

      const container = containerRef.current
      if (!container) return

      // Check if this render is still current
      if (currentRenderId !== renderIdRef.current) return

      try {
        // Dynamically import mermaid
        const mermaid = (await import('mermaid')).default

        // Initialize with hand-drawn style
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
        })

        // Generate unique ID
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`

        // Render the diagram
        const { svg } = await mermaid.render(id, chart)

        // Double-check container still exists and render is current
        if (containerRef.current && currentRenderId === renderIdRef.current) {
          containerRef.current.innerHTML = svg
        }
      } catch (error) {
        console.error('Mermaid rendering error:', error)
        if (containerRef.current && currentRenderId === renderIdRef.current) {
          containerRef.current.innerHTML = `<pre class="text-red-400">Diagram rendering error: ${error}</pre>`
        }
      }
    }

    renderMermaid()
  }, [chart])

  return (
    <div
      ref={containerRef}
      className="my-6 flex justify-center bg-gray-900/50 rounded-lg p-4 overflow-x-auto"
    >
      <div className="text-gray-400 animate-pulse">Loading diagram...</div>
    </div>
  )
}

// Helper to generate heading id from text
function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fff-]/g, '')
    .replace(/\s+/g, '-')
}

// Custom components for enhanced styling
const components: Components = {
  // Headings with id for TOC navigation
  h2({ children, ...props }) {
    const text = String(children)
    const id = generateHeadingId(text)
    return <h2 id={id} {...props}>{children}</h2>
  },
  h3({ children, ...props }) {
    const text = String(children)
    const id = generateHeadingId(text)
    return <h3 id={id} {...props}>{children}</h3>
  },
  // Code blocks with syntax highlighting styling and Mermaid support
  code({ node, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : ''
    const isInline = !match && !className

    // Handle Mermaid diagrams
    if (language === 'mermaid') {
      const chart = String(children).replace(/\n$/, '')
      return <MermaidDiagram chart={chart} />
    }

    if (isInline) {
      return (
        <code
          className="bg-gray-800 text-pink-300 px-1.5 py-0.5 rounded text-sm font-mono"
          {...props}
        >
          {children}
        </code>
      )
    }

    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  },
  // Enhanced pre block
  pre({ children, ...props }) {
    return (
      <pre 
        className="bg-gray-900 border border-gray-700 rounded-lg p-4 overflow-x-auto my-6 text-sm"
        {...props}
      >
        {children}
      </pre>
    )
  },
  // Tables with dark theme styling
  table({ children, ...props }) {
    return (
      <div className="overflow-x-auto my-6">
        <table 
          className="min-w-full border border-gray-700 rounded-lg overflow-hidden"
          {...props}
        >
          {children}
        </table>
      </div>
    )
  },
  thead({ children, ...props }) {
    return (
      <thead className="bg-gray-800" {...props}>
        {children}
      </thead>
    )
  },
  th({ children, ...props }) {
    return (
      <th 
        className="px-4 py-3 text-left text-sm font-semibold text-white border-b border-gray-700"
        {...props}
      >
        {children}
      </th>
    )
  },
  tr({ children, ...props }) {
    return (
      <tr 
        className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
        {...props}
      >
        {children}
      </tr>
    )
  },
  td({ children, ...props }) {
    return (
      <td className="px-4 py-3 text-sm text-gray-300" {...props}>
        {children}
      </td>
    )
  },
  // Blockquotes
  blockquote({ children, ...props }) {
    return (
      <blockquote 
        className="border-l-4 border-blue-500 pl-4 py-2 my-6 bg-gray-800/50 rounded-r-lg italic text-gray-300"
        {...props}
      >
        {children}
      </blockquote>
    )
  },
  // Links
  a({ children, href, ...props }) {
    return (
      <a 
        href={href}
        className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    )
  },
  // Horizontal rule
  hr({ ...props }) {
    return <hr className="border-gray-700 my-8" {...props} />
  },
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-invert prose-lg max-w-none
      prose-headings:text-white prose-headings:font-bold
      prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4
      prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3
      prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2
      prose-p:text-gray-300 prose-p:leading-relaxed prose-p:my-2
      prose-strong:text-white prose-strong:font-semibold
      prose-em:text-gray-300 prose-em:italic
      prose-li:text-gray-300 prose-li:marker:text-gray-500 prose-li:my-0.5
      prose-ul:my-2 prose-ol:my-2
      prose-code:text-pink-300 prose-code:bg-gray-800
      ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

