import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Components } from 'react-markdown'
import MermaidDiagram from './MermaidDiagram'

interface MarkdownRendererProps {
  content: string
  className?: string
}

// Custom components for enhanced styling
const components: Components = {
  // Code blocks with syntax highlighting styling and Mermaid support
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : null
    const isInline = !match && !className

    // Mermaid 图表渲染
    if (language === 'mermaid') {
      // 安全地提取子元素文本内容
      const getTextContent = (node: React.ReactNode): string => {
        if (typeof node === 'string') return node
        if (typeof node === 'number') return String(node)
        if (Array.isArray(node)) return node.map(getTextContent).join('')
        if (node && typeof node === 'object' && 'props' in node) {
          return getTextContent((node as React.ReactElement).props.children)
        }
        return ''
      }
      const chart = getTextContent(children).replace(/\n$/, '')
      return <MermaidDiagram chart={chart} className="my-6" />
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
      prose-h1:text-4xl prose-h1:mt-12 prose-h1:mb-8
      prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-6
      prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
      prose-p:text-gray-300 prose-p:leading-relaxed
      prose-strong:text-white prose-strong:font-semibold
      prose-em:text-gray-300 prose-em:italic
      prose-li:text-gray-300 prose-li:marker:text-gray-500
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

