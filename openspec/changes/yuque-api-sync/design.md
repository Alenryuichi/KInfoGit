## Context

当前博客同步链路：elog (`yuque-pwd` 模式，账号密码模拟登录) → `tools/yuque-sync/docs/` → `scripts/convert-to-blog.ts` (DeepSeek 猜 category + tags) → `profile-data/blog/*.md` → SSG build。

问题：pwd 模式不稳定（验证码/IP 封禁风险）、语雀目录结构在 elog 阶段被丢弃、category 靠 AI 猜测导致映射脆弱、blog.tsx 中 theme tabs 硬编码。

用户已将语雀 `Crafted-blog` 知识库（`qd9got`）按「文章/随笔/分享」三个一级目录组织。API token 已创建并写入 `.elog.env`。

## Goals / Non-Goals

**Goals:**
- 使用语雀 API (token 认证) 替代 elog pwd 模式，稳定可靠
- 一级目录名直接作为 `category`，消除 AI 猜测的不确定性
- blog 页面 tabs 从文章数据动态生成，新增语雀目录自动出现新 tab
- 增量同步，避免每次全量拉取
- 图片下载到本地，不依赖语雀 CDN

**Non-Goals:**
- 不同步语雀小记（小记无 API）
- 不实现双向同步（只从语雀 → 博客）
- 不重构 `tools/yuque-sync/` 的 CLI 工具（直接废弃 elog 依赖）
- 不迁移其他知识库（仅 `Crafted-blog`）

## Decisions

### Decision 1: 去掉 elog，自建同步脚本

**选择**: 新建 `scripts/sync-yuque.ts` 直接调用语雀 API，替代 elog + convert-to-blog.ts

**替代方案**: 保留 elog 换 token 模式 + 补一层 TOC 查询

**理由**: elog 的核心价值是帮拉内容，但它丢失目录信息——而目录正是本次最需要的。直接调 API 只需 3 个接口（GET /toc, GET /docs, GET /docs/:slug），代码量不大，且减少一个第三方依赖故障点。

### Decision 2: 同步脚本放在 `scripts/sync-yuque.ts`

**选择**: 替换现有的 `scripts/convert-to-blog.ts`

**理由**: 合并"拉取"和"转换"为一个脚本，单一职责更清晰。原脚本的 `cleanHtmlTags()`、`calculateReadTime()` 等工具函数可复用。

### Decision 3: TOC depth=1 的 TITLE 节点作为 category

**选择**: 遍历 TOC，找所有 `type=TITLE && depth=1` 的节点作为一级目录。每个 DOC 的 category = 其最近的祖先 TITLE 节点的 title。

**理由**: 已验证语雀 API 返回的 TOC 结构中，一级目录 depth=1，文档 depth=2。

### Decision 4: 增量同步用 `sync-state.json`

**选择**: 在 `tools/yuque-sync/sync-state.json` 中缓存每篇文档的 `doc_id`、`updated_at`、`blogFile` 映射。同步时对比 `updated_at`，只处理变更的。

**理由**: 避免每次调用 DeepSeek API 生成 tags（有成本+限流），也加快同步速度。

### Decision 5: blog.tsx tabs 动态化

**选择**: 从 `posts` 数据中 `new Set(posts.map(p => p.category))` 提取 categories，tabs = `['全部', ...categories]`。

**替代方案**: 在 `getStaticProps` 中额外传递一个 `categories` 数组（带排序信息）

**理由**: 为了保持 tabs 排序与语雀一致，同步脚本在 frontmatter 中增加 `categoryOrder: number` 字段，blog.tsx 按此排序。

### Decision 6: 图片处理策略

**选择**: 下载语雀文章中的图片到 `website/public/blog/images/`，替换 markdown 中的 URL 为本地路径 `/blog/images/<filename>`。

**理由**: 用户明确要求本地化，不依赖语雀 CDN。图片文件名用 `<doc_slug>-<hash>.<ext>` 避免冲突。

## Risks / Trade-offs

- **[语雀 API 速率限制]** 200 req/min → 对于少量文章足够；如果文章量增大，需加 delay。**Mitigation**: 增量同步大幅减少请求量。
- **[DeepSeek 生成 tags 不一致]** 同一篇文章多次同步可能得到不同 tags → **Mitigation**: 只在首次同步时生成，之后从缓存读取。
- **[sync-state.json 丢失]** 导致全量重新同步 → **Mitigation**: 可接受，相当于 force sync。
- **[语雀 TOC 结构变化]** 用户移动文档到不同目录 → category 自动更新，但文件名不变（slug 基于标题），旧 URL 不受影响。
