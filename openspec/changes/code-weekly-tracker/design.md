## Context

站点已有 AI Daily（Horizon 聚合每日 AI 新闻）和 Stars（GitHub stars + Bluesky 动态），均采用 SSG + GitHub Actions cron + JSON 数据文件模式。Code Weekly 是第三个信息聚合分区，追踪 AI Code 编辑器生态，复用相同的架构模式。

现有技术栈：Next.js 16 Pages Router、React 19、TypeScript、Tailwind CSS、`output: 'export'` 静态导出、GitHub Pages 部署。数据采集脚本使用 `tsx` 运行 TypeScript，AI 总结使用 DeepSeek API。

## Goals / Non-Goals

**Goals:**
- 每周自动采集 10 款 Code 编辑器的功能更新动态
- 每天自动采集模型评测排名（Chatbot Arena、Aider Leaderboard、SWE-Bench）
- 每周自动采集 AI 公司技术博客新文章
- 使用 Tavily（英文）+ 百炼 WebSearch（中文）双搜索引擎覆盖中英文信息源
- 用 DeepSeek 将多源原始数据聚合为结构化周报
- 提供 `/code` 列表页、`/code/[week]` 详情页（三 Tab）、`/code/benchmarks` 独立评测页

**Non-Goals:**
- 不做实时数据（构建时静态生成）
- 不做用户评论或互动功能
- 不替代 AI Daily（两者定位不同：AI Daily 是每日广泛 AI 新闻，Code Weekly 是每周 Code 工具生态专题）
- 不做编辑器的深度评测（只追踪功能更新动态）
- 评测历史趋势图第一版不做，后续迭代

## Decisions

### 1. 数据采集分层架构

**决策**: 采用三层采集策略——确定性 API → 搜索补充 → AI 总结。

**Layer 1 - 确定性数据源（免费、可靠）:**
- GitHub Releases API: Claude Code, Gemini CLI, OpenCode, Aider（开源项目）
- RSS/Atom Feeds: anthropic.com, openai.com, cursor.com, blog.google 等公司博客
- Chatbot Arena API / Aider Leaderboard 页面: 模型评测数据

**Layer 2 - 搜索补充（覆盖无 API 的闭源产品）:**
- Tavily Search API: 英文搜索（Cursor, Windsurf, Augment, Copilot 等）
- 百炼 WebSearch API: 中文搜索（Trae 字节系、CodeBuddy 腾讯系）

**Layer 3 - AI 总结:**
- DeepSeek API: 将多源原始数据聚合为结构化 JSON

**理由**: 确定性数据源最可靠且免费，搜索 API 补充覆盖面，AI 做最后的结构化和摘要。分层设计使得任一层失败不会阻塞整个流水线（`Promise.allSettled`）。

**替代方案**: 全部用搜索 API → 成本高、结果不稳定；全部手动维护 → 不可持续。

### 2. 双搜索引擎策略

**决策**: Tavily 负责英文源，百炼负责中文源。

| 维度 | Tavily | 百炼 |
|------|--------|------|
| 用途 | 英文编辑器动态、英文评测 | Trae、CodeBuddy 中文公告 |
| 预估调用量 | ~15-20 次/周 | ~5-8 次/周 |
| 特点 | Extract API 可直接抓网页内容 | 国内源覆盖好 |

**理由**: Trae（字节）和 CodeBuddy（腾讯）的更新信息主要在中文平台发布，百炼对中文源搜索质量明显优于 Tavily。月总调用量 ~100 次，在免费/低成本额度内。

### 3. 数据存储格式

**决策**: 周报数据按 ISO 周存储为 `profile-data/code-weekly/YYYY-WXX.json`，评测数据存储为 `profile-data/benchmarks/latest.json` + `profile-data/benchmarks/history/YYYY-MM-DD.json`。

**理由**: 与现有 Stars（`profile-data/github-stars/YYYY-MM-DD.json`）和 AI Daily（`profile-data/ai-daily/YYYY-MM-DD.json`）模式一致。评测数据独立存储是因为更新频率不同（每天 vs 每周），且 benchmarks 页面需要快速加载最新数据。

### 4. 页面布局：Tab 切换

**决策**: `/code/[week]` 详情页使用 Tab 切换（编辑器动态 / 模型评测 / 公司博客），而非纵向排列。

**理由**: 用户明确要求 Tab 形式。三块内容相互独立，Tab 切换减少信息过载，用户可以直达关心的部分。

### 5. 评测独立页面

**决策**: `/code/benchmarks` 作为独立页面存在，不仅是周报的一个 Tab。

**理由**: 评测排名是每天更新的实时数据，用户可能随时想查最新排名而不是翻周报。独立页面提供"当前最新"的视图，周报中的评测 Tab 展示的是"本周变化"。

### 6. 编辑器分类

**决策**: 编辑器分为两类展示——IDE（Cursor, Windsurf, Trae, Augment）和 CLI/Plugin（Claude Code, Gemini CLI, OpenCode, Aider, Copilot, CodeBuddy）。

**理由**: 两类产品形态不同，用户关注点不同。分类展示便于对比同类产品。

### 7. 脚本结构

**决策**: 采集脚本拆分为模块化结构 `scripts/code-weekly/sources/`，每个数据源一个文件，主入口 `scripts/fetch-code-weekly.ts` 编排调用。

**理由**: 符合现有 `scripts/fetch-stars.ts` 的模式，但因为数据源更多（6 种），拆分模块避免单文件过大。每个 source 模块可独立测试和调试。

## Risks / Trade-offs

- **搜索结果质量不稳定** → 对每个编辑器设置 fallback 搜索 query；DeepSeek 总结时 prompt 要求忽略无关结果；Layer 1 确定性数据源保底
- **RSS feed 格式变化或下线** → 采集脚本对每个源 try/catch，单源失败不影响整体；定期检查 RSS 可用性
- **Chatbot Arena API 无官方稳定 API** → 使用 Tavily 搜索 lmarena.ai 作为备选；或直接抓取排行榜页面
- **Aider Leaderboard 无 API** → 抓取 aider.chat/docs/leaderboards 页面；Tavily Extract 可直接提取页面内容
- **百炼 API 可能有调用限制** → 调用量很低（~8 次/周），不太可能触发限制；设置重试逻辑
- **DeepSeek 总结可能幻觉** → prompt 中明确要求基于提供的原始数据总结，不要编造；保留 sourceUrl 供人工验证
- **编辑器列表需要维护** → config.ts 集中管理，新增/移除编辑器只需改配置文件
