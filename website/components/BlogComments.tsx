import Giscus from '@giscus/react'

/**
 * Giscus 评论区组件
 * 基于 GitHub Discussions，适合静态站点
 */
export function BlogComments() {
  return (
    <section className="mt-16 pt-8 border-t border-white/[0.06]" data-pagefind-ignore>
      <h2 className="text-lg font-semibold text-gray-200 mb-6">评论</h2>
      <Giscus
        repo="Alenryuichi/KInfoGit"
        repoId="R_kgDOPgClOw"
        category="General"
        categoryId="DIC_kwDOPgClO84C6uaE"
        mapping="pathname"
        strict="1"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="transparent_dark"
        lang="zh-CN"
        loading="lazy"
      />
    </section>
  )
}
