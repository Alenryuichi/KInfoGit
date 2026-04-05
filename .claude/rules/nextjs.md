---
paths:
  - "website/**"
---

# Next.js 开发规范

- **Pages Router** — 不使用 App Router（无 `app/` 目录）
- **SSG only** — 所有页面通过 `getStaticProps` / `getStaticPaths` 预渲染
- 配置 `output: 'export'`，不可使用 API Routes、SSR、ISR
- 图片使用 `unoptimized: true`（GitHub Pages 限制）
- 自定义域名 `kylinmiao.me`，无需 basePath / assetPrefix
- MDX 支持已配置，博客内容源在 `profile-data/blog/`
- 修改 `next.config.js` 时注意 withMDX 包装
