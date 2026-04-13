import { useEffect, useCallback, useRef } from 'react'
import Giscus from '@giscus/react'

/**
 * Giscus 评论区组件
 * 基于 GitHub Discussions，适合静态站点
 *
 * 通过监听 giscus:discussion-reactions-updated 和自定义逻辑
 * 在评论提交后自动刷新 iframe
 */
export function BlogComments() {
  const containerRef = useRef<HTMLDivElement>(null)

  const refreshGiscus = useCallback(() => {
    const iframe = containerRef.current?.querySelector<HTMLIFrameElement>(
      'iframe.giscus-frame'
    )
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        { giscus: { setConfig: { term: window.location.pathname } } },
        'https://giscus.app'
      )
    }
  }, [])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://giscus.app') return

      const data = event.data?.giscus
      if (!data) return

      // 当评论创建或 Discussion 首次建立时，刷新以展示最新内容
      if (data.discussion || data.error === 'Discussion not found') {
        setTimeout(refreshGiscus, 500)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [refreshGiscus])

  return (
    <section
      ref={containerRef}
      className="mt-16 pt-8 border-t border-white/[0.06]"
      data-pagefind-ignore
    >
      <h2 className="text-lg font-semibold text-gray-200 mb-6">评论</h2>
      <Giscus
        repo="Alenryuichi/KInfoGit"
        repoId="R_kgDOPgClOw"
        category="General"
        categoryId="DIC_kwDOPgClO84C6uaE"
        mapping="pathname"
        strict="1"
        reactionsEnabled="1"
        emitMetadata="1"
        inputPosition="top"
        theme="transparent_dark"
        lang="zh-CN"
        loading="lazy"
      />
    </section>
  )
}
