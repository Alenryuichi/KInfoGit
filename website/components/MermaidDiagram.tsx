import { useEffect, useRef, useState, useId } from 'react'

interface MermaidDiagramProps {
  /** Mermaid 图表定义字符串 */
  chart: string
  /** 可选的 CSS 类名 */
  className?: string
}

// 模块级别初始化标记，确保只初始化一次
let mermaidInitialized = false

/**
 * Mermaid 图表渲染组件
 * 使用 Mermaid.js 渲染 SVG 图表
 * 使用动态导入确保仅在客户端渲染
 */
export default function MermaidDiagram({ chart, className = '' }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const uniqueId = useId().replace(/:/g, '-')

  useEffect(() => {
    let isMounted = true

    const renderDiagram = async () => {
      try {
        // 动态导入 mermaid 以支持 SSR
        const mermaid = (await import('mermaid')).default

        // 只初始化一次（模块级别）
        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            themeVariables: {
              primaryColor: '#3b82f6',
              primaryTextColor: '#fff',
              primaryBorderColor: '#60a5fa',
              lineColor: '#6b7280',
              secondaryColor: '#1f2937',
              tertiaryColor: '#111827',
              background: '#111827',
              mainBkg: '#1f2937',
              nodeBorder: '#374151',
              clusterBkg: '#1f2937',
              clusterBorder: '#374151',
              titleColor: '#f3f4f6',
              edgeLabelBackground: '#1f2937',
            },
            securityLevel: 'loose',
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
          })
          mermaidInitialized = true
        }

        // 渲染图表
        const { svg: renderedSvg } = await mermaid.render(`mermaid-${uniqueId}`, chart)

        if (isMounted) {
          setSvg(renderedSvg)
          setError(null)
          setIsLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram')
          setIsLoading(false)
        }
      }
    }

    renderDiagram()

    return () => {
      isMounted = false
    }
  }, [chart, uniqueId])

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 bg-gray-900/50 rounded-lg border border-gray-800 ${className}`}>
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading diagram...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-900/20 border border-red-800 rounded-lg ${className}`}>
        <p className="text-red-400 text-sm">
          <span className="font-semibold">Diagram Error:</span> {error}
        </p>
        <pre className="mt-2 text-xs text-gray-500 overflow-auto max-h-32">
          {chart}
        </pre>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`mermaid-diagram overflow-auto rounded-lg bg-gray-900/30 p-4 border border-gray-800 ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

