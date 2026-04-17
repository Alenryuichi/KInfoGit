import {
  useState, useEffect, useRef, useCallback,
  Children, isValidElement, cloneElement,
  type ReactNode, type ReactElement,
} from 'react'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import type { Components } from 'react-markdown'

interface MarkdownRendererProps {
  content: string
  className?: string
}

// ─── Language Utilities ─────────────────────────────────────

type AlertType = 'note' | 'tip' | 'important' | 'warning' | 'caution'

const LANG_ALIASES: Record<string, string> = {
  plain: 'text', plaintext: 'text', txt: 'text',
  sh: 'bash', zsh: 'bash', shell: 'shellscript',
  js: 'javascript', ts: 'typescript',
  py: 'python', rb: 'ruby', yml: 'yaml', md: 'markdown',
}

const LANG_DISPLAY: Record<string, string> = {
  javascript: 'JavaScript', typescript: 'TypeScript', python: 'Python',
  bash: 'Bash', json: 'JSON', css: 'CSS', html: 'HTML',
  tsx: 'TSX', jsx: 'JSX', yaml: 'YAML', sql: 'SQL',
  go: 'Go', rust: 'Rust', java: 'Java', c: 'C', cpp: 'C++',
  markdown: 'Markdown', text: 'Plain Text', diff: 'Diff', xml: 'XML',
  shellscript: 'Shell', ruby: 'Ruby', php: 'PHP', swift: 'Swift',
  kotlin: 'Kotlin', dockerfile: 'Dockerfile', graphql: 'GraphQL',
  toml: 'TOML', vue: 'Vue', svelte: 'Svelte',
}

function normalizeLang(lang: string): string {
  const lower = lang.toLowerCase()
  return LANG_ALIASES[lower] || lower || 'text'
}

function displayLang(lang: string): string {
  const n = normalizeLang(lang)
  return LANG_DISPLAY[n] || lang.toUpperCase()
}

// ─── Text Extraction ────────────────────────────────────────

function extractText(children: ReactNode): string {
  if (typeof children === 'string') return children
  if (typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(extractText).join('')
  if (children && typeof children === 'object' && 'props' in children) {
    return extractText((children as ReactElement).props.children)
  }
  return ''
}

function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fff-]/g, '')
    .replace(/\s+/g, '-')
}

// ─── Alert Detection ────────────────────────────────────────

const ALERT_RE = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/

function detectAlert(children: ReactNode): { type: AlertType; content: ReactNode } | null {
  const text = extractText(children)
  const m = text.match(ALERT_RE)
  if (!m) return null
  return { type: m[1].toLowerCase() as AlertType, content: stripAlertMarker(children) }
}

function stripAlertMarker(children: ReactNode): ReactNode {
  const arr = Children.toArray(children)
  return arr.map((child, i) => {
    if (i === 0 && isValidElement(child)) {
      const gc = Children.toArray(child.props.children)
      const cleaned = gc
        .map((c, j) => {
          if (j === 0 && typeof c === 'string') {
            const s = c.replace(ALERT_RE, '').replace(/^\s*\n?/, '')
            return s || null
          }
          return c
        })
        .filter(Boolean)
      if (cleaned.length === 0) return null
      return cloneElement(child as ReactElement, {}, ...cleaned)
    }
    return child
  }).filter(Boolean)
}

const ALERT_CFG: Record<AlertType, { label: string; border: string; bg: string; accent: string; icon: ReactNode }> = {
  note: {
    label: 'Note', border: 'border-blue-500/50', bg: 'bg-blue-500/[0.06]', accent: 'text-blue-400',
    icon: (
      <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
        <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
      </svg>
    ),
  },
  tip: {
    label: 'Tip', border: 'border-green-500/50', bg: 'bg-green-500/[0.06]', accent: 'text-green-400',
    icon: (
      <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
        <path d="M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8 8 0 0 0-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.751.751 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM6 15.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z" />
      </svg>
    ),
  },
  important: {
    label: 'Important', border: 'border-purple-500/50', bg: 'bg-purple-500/[0.06]', accent: 'text-purple-400',
    icon: (
      <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
        <path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
      </svg>
    ),
  },
  warning: {
    label: 'Warning', border: 'border-amber-500/50', bg: 'bg-amber-500/[0.06]', accent: 'text-amber-400',
    icon: (
      <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
        <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
      </svg>
    ),
  },
  caution: {
    label: 'Caution', border: 'border-red-500/50', bg: 'bg-red-500/[0.06]', accent: 'text-red-400',
    icon: (
      <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
        <path d="M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
      </svg>
    ),
  },
}

// ─── Mermaid Component ──────────────────────────────────────

function MermaidDiagram({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const renderIdRef = useRef(0)

  useEffect(() => {
    const currentRenderId = ++renderIdRef.current

    const renderMermaid = async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
      const container = containerRef.current
      if (!container || currentRenderId !== renderIdRef.current) return

      try {
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({ startOnLoad: false, theme: 'dark' })
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`
        const { svg } = await mermaid.render(id, chart)
        if (containerRef.current && currentRenderId === renderIdRef.current) {
          containerRef.current.innerHTML = svg
        }
      } catch (error) {
        if (containerRef.current && currentRenderId === renderIdRef.current) {
          containerRef.current.innerHTML = `<pre class="text-red-400 text-sm">Diagram rendering error: ${error}</pre>`
        }
      }
    }

    renderMermaid()
  }, [chart])

  return (
    <div
      ref={containerRef}
      className="my-8 flex justify-center bg-gray-900/50 rounded-lg p-6 overflow-x-auto border border-white/[0.06]"
    >
      <div className="text-gray-500 text-sm animate-pulse">Loading diagram...</div>
    </div>
  )
}

// ─── CodeBlock with Shiki ───────────────────────────────────

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [html, setHtml] = useState('')
  const [copied, setCopied] = useState(false)
  const lang = normalizeLang(language)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { codeToHtml } = await import('shiki')
        const result = await codeToHtml(code, {
          lang,
          theme: 'github-dark-dimmed',
        })
        if (!cancelled) setHtml(result)
      } catch {
        try {
          const { codeToHtml } = await import('shiki')
          const result = await codeToHtml(code, { lang: 'text', theme: 'github-dark-dimmed' })
          if (!cancelled) setHtml(result)
        } catch {
          /* fallback to plain text rendering */
        }
      }
    })()
    return () => { cancelled = true }
  }, [code, lang])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard API unavailable */ }
  }, [code])

  return (
    <div className="code-block group relative my-10 rounded-xl overflow-hidden border border-white/[0.06] bg-[#0a0a0a]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-[#0a0a0a]">
        <span className="text-xs font-medium text-gray-500 font-mono tracking-wide">
          {displayLang(language)}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-all px-2.5 py-1 rounded-md hover:bg-white/[0.06]"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code area */}
      {html ? (
        <div
          className="shiki-output overflow-x-auto text-[13px] leading-[1.7] [&>pre]:!bg-transparent [&>pre]:!m-0 [&>pre]:!rounded-none [&>pre]:px-5 [&>pre]:py-4 [&_code]:!bg-transparent"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="bg-transparent px-5 py-4 overflow-x-auto m-0">
          <code className="text-[13px] leading-[1.7] font-mono text-[#adbac7]">{code}</code>
        </pre>
      )}
    </div>
  )
}

// ─── Heading with Anchor ────────────────────────────────────

function HeadingWithAnchor({ level, children }: { level: 2 | 3 | 4; children: ReactNode }) {
  const text = extractText(children)
  const id = generateHeadingId(text)
  const Tag = `h${level}` as keyof JSX.IntrinsicElements

  return (
    <Tag id={id} className="group/heading relative scroll-mt-24">
      <a
        href={`#${id}`}
        className="anchor-link absolute -left-7 top-1/2 -translate-y-1/2 opacity-0 group-hover/heading:opacity-100 transition-opacity duration-200 text-gray-600 hover:text-blue-400 no-underline"
        aria-label={`Link to section: ${text}`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </a>
      {children}
    </Tag>
  )
}

// Tracks how many EmbedIframe instances are currently fullscreen.
// Only reset body overflow when the last one exits.
let fullscreenCount = 0

// ─── Embed Iframe with Fullscreen & Auto-resize ────────────

function EmbedIframe({ src, ...props }: React.IframeHTMLAttributes<HTMLIFrameElement> & { src: string }) {
  const [loaded, setLoaded] = useState(false)
  const [height, setHeight] = useState(800)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Listen for postMessage resize from embedded HTML
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === 'iframe-resize' && typeof e.data.height === 'number') {
        // Verify the message is from our iframe
        if (iframeRef.current && e.source === iframeRef.current.contentWindow) {
          setHeight(e.data.height)
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])

  // Close overlay on ESC
  useEffect(() => {
    if (!isFullscreen) return
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isFullscreen])

  // Lock body scroll when fullscreen (ref-counted for multiple instances)
  useEffect(() => {
    if (isFullscreen) {
      fullscreenCount++
      document.body.style.overflow = 'hidden'
    }
    return () => {
      if (isFullscreen) {
        fullscreenCount--
        if (fullscreenCount <= 0) {
          fullscreenCount = 0
          document.body.style.overflow = ''
        }
      }
    }
  }, [isFullscreen])

  const containerClass = isFullscreen
    ? 'fixed inset-0 z-[9999] bg-black flex flex-col'
    : 'relative my-10'

  return (
    <div
      className={containerClass}
      style={isFullscreen ? { width: '100vw', height: '100vh' } : undefined}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0a0a0a] border border-white/[0.06] rounded-t-xl flex-shrink-0">
        <span className="text-xs text-gray-500 truncate max-w-[70%]">
          {src.split('/').pop()}
        </span>
        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-md transition-all"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
              </svg>
              Exit
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
              Fullscreen
            </>
          )}
        </button>
      </div>

      {/* Iframe container */}
      <div className={`relative ${isFullscreen ? 'flex-1 min-h-0' : ''} border border-t-0 border-white/[0.06] rounded-b-xl overflow-hidden bg-[#0a0a0a]`}>
        {/* Loading skeleton */}
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
              <span className="text-xs text-gray-500">Loading...</span>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={src}
          width="100%"
          height={isFullscreen ? '100%' : height}
          onLoad={() => setLoaded(true)}
          className={`border-0 block transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${isFullscreen ? 'w-full h-full' : ''}`}
          loading="lazy"
          {...props}
        />
      </div>
    </div>
  )
}

// ─── Custom Components ──────────────────────────────────────

const components: Components = {
  h2({ children }) {
    return <HeadingWithAnchor level={2}>{children}</HeadingWithAnchor>
  },
  h3({ children }) {
    return <HeadingWithAnchor level={3}>{children}</HeadingWithAnchor>
  },
  h4({ children }) {
    return <HeadingWithAnchor level={4}>{children}</HeadingWithAnchor>
  },

  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '')
    if (match || className) {
      return (
        <code className={className} data-language={match?.[1] || ''} {...props}>
          {children}
        </code>
      )
    }
    return (
      <code
        className="inline-code bg-white/5 text-white/80 px-1.5 py-0.5 rounded-md text-[0.85em] font-mono border border-white/10"
        {...props}
      >
        {children}
      </code>
    )
  },

  pre({ children }) {
    const childArray = Children.toArray(children)
    const codeChild = childArray.find(
      (child) => isValidElement(child) && (child as ReactElement<Record<string, unknown>>).props?.className
    ) as ReactElement<Record<string, unknown>> | undefined

    if (codeChild) {
      const codeProps = codeChild.props
      const className = String(codeProps.className || '')
      const language =
        String(codeProps['data-language'] || '') ||
        /language-(\w+)/.exec(className)?.[1] ||
        ''
      const code = String(codeProps.children).replace(/\n$/, '')

      if (language === 'mermaid') return <MermaidDiagram chart={code} />
      return <CodeBlock code={code} language={language} />
    }

    return (
      <pre className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-5 overflow-x-auto my-10 text-[13px] leading-[1.7]">
        {children}
      </pre>
    )
  },

  blockquote({ children, ...props }) {
    const alert = detectAlert(children)

    if (alert) {
      const cfg = ALERT_CFG[alert.type]
      return (
        <div className={`my-8 rounded-lg border-l-4 ${cfg.border} ${cfg.bg} px-5 py-4`}>
          <div className={`flex items-center gap-2 font-semibold text-sm ${cfg.accent} mb-2`}>
            {cfg.icon}
            {cfg.label}
          </div>
          <div className="text-gray-300 text-[15px] leading-relaxed [&>p]:my-1.5 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
            {alert.content}
          </div>
        </div>
      )
    }

    return (
      <blockquote
        className="border-l-2 border-white/10 pl-6 py-2 my-10 text-white/50 italic text-[1.05em] tracking-tight [&>p]:my-2 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0"
        {...props}
      >
        {children}
      </blockquote>
    )
  },

  table({ children, ...props }) {
    return (
      <div className="overflow-x-auto my-10">
        <table className="min-w-full text-sm text-left" {...props}>
          {children}
        </table>
      </div>
    )
  },
  thead({ children, ...props }) {
    return <thead className="border-b border-white/10 text-gray-400" {...props}>{children}</thead>
  },
  th({ children, ...props }) {
    return (
      <th className="px-4 py-3 font-medium text-gray-300" {...props}>
        {children}
      </th>
    )
  },
  tr({ children, ...props }) {
    return (
      <tr className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors" {...props}>
        {children}
      </tr>
    )
  },
  td({ children, ...props }) {
    return <td className="px-4 py-3 text-gray-400" {...props}>{children}</td>
  },

  a({ children, href, ...props }) {
    const isExternal = href?.startsWith('http')
    return (
      <a
        href={href}
        className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/30 hover:decoration-blue-300/60 underline-offset-[3px] transition-all duration-200"
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...props}
      >
        {children}
        {isExternal && (
          <svg className="inline-block w-3.5 h-3.5 ml-0.5 -mt-0.5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        )}
      </a>
    )
  },

  img({ src, alt, ...props }) {
    return (
      <figure className="m-0 flex flex-col items-center justify-center w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt || ''}
          className="!m-0 rounded-xl border border-white/[0.08] w-full sm:w-[85%] max-w-3xl shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
          loading="lazy"
          {...props}
        />
        {alt && alt !== src && (
          <figcaption className="block mt-3 text-center text-[13px] text-gray-500 max-w-[80%] leading-relaxed">
            {alt}
          </figcaption>
        )}
      </figure>
    )
  },

  hr() {
    return (
      <div role="separator" className="my-12 flex items-center justify-center gap-1.5">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/[0.15]" />
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/[0.25]" />
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/[0.15]" />
      </div>
    )
  },

  p({ children, ...props }) {
    // If the paragraph contains an image, swap <p> for <div> to avoid HTML validation errors
    // and margin-collapse issues with block elements inside inline paragraphs.
    const childrenArray = Children.toArray(children)
    const hasImage = childrenArray.some(
      (child) => isValidElement(child) && (child.type === 'img' || child.props?.node?.tagName === 'img')
    )
    
    if (hasImage) {
      const isOnlyImage = childrenArray.length === 1
      if (isOnlyImage) {
        return <div className="!my-6 flex flex-col items-center justify-center w-full gap-4">{children}</div>
      }
      // Mixed content (text + image inline)
      return <div className="!mt-0 !mb-4 leading-[1.7] text-gray-300" {...props}>{children}</div>
    }

    return <p className="!mt-0 !mb-4 leading-[1.7] text-gray-300" {...props}>{children}</p>
  },

  input({ type, checked, ...props }) {
    if (type === 'checkbox') {
      return (
        <span
          className={`inline-flex items-center justify-center w-4 h-4 rounded border mr-2 align-text-bottom flex-shrink-0 ${
            checked
              ? 'bg-blue-500/20 border-blue-500/60 text-blue-400'
              : 'border-gray-600 bg-transparent'
          }`}
          role="checkbox"
          aria-checked={!!checked}
        >
          {checked && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
      )
    }
    return <input type={type} checked={checked} {...props} />
  },

  iframe(props: React.IframeHTMLAttributes<HTMLIFrameElement>) {
    const src = props.src
    // Use custom EmbedIframe for blog/work embeds, plain iframe for everything else
    if (src?.includes('/embeds/') && (src.startsWith('/blog/') || src.startsWith('/work/'))) {
      return <EmbedIframe src={src} {...props} />
    }
    return (
      <iframe
        className="my-10 rounded-xl border border-white/[0.06]"
        loading="lazy"
        {...props}
      />
    )
  },
}

// ─── Main Renderer ──────────────────────────────────────────

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div
      className={`markdown-body linear-docs w-full max-w-none
        prose prose-invert
        antialiased selection:bg-purple-500/30 selection:text-purple-200
        text-gray-300 leading-[1.7] font-normal
        [&>p]:!mt-0 [&>p]:!mb-3 [&_li>p]:!m-0
        prose-strong:text-white/90 prose-strong:font-medium
        prose-headings:text-white/90 prose-headings:font-medium prose-headings:tracking-tight
        prose-h1:text-3xl prose-h1:mt-0 prose-h1:mb-8
        prose-h2:text-2xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-white/5
        prose-h3:text-xl prose-h3:mt-12 prose-h3:mb-4
        prose-h4:text-lg prose-h4:mt-8 prose-h4:mb-2 prose-h4:text-white/80
        prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6 prose-ul:marker:text-gray-500
        prose-ol:my-6 prose-ol:pl-6
        prose-li:my-2 prose-li:leading-[1.7]
        prose-a:text-blue-400 prose-a:font-normal prose-a:no-underline hover:prose-a:text-blue-300
        prose-a:transition-colors
        [&_img]:!m-0
        [&_code]:before:!content-none [&_code]:after:!content-none
        [&_blockquote]:!quotes-none
        [&_table]:!m-0
        [&>*:first-child]:mt-0
        ${className}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
