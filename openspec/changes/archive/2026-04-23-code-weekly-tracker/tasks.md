## 1. 数据层基础设施

- [x] 1.1 创建 `profile-data/code-weekly/` 和 `profile-data/benchmarks/history/` 目录结构
- [x] 1.2 创建 `scripts/code-weekly/config.ts` — 编辑器列表、RSS URL、GitHub repo、搜索 query 模板配置
- [x] 1.3 创建 `website/lib/code-weekly.ts` — 数据加载函数（getAllCodeWeeks、getCodeWeekByWeek、getAdjacentWeeks、getLatestBenchmarks）及 TypeScript 类型定义

## 2. 数据采集脚本 — Sources

- [x] 2.1 创建 `scripts/code-weekly/sources/github-releases.ts` — GitHub Releases API 采集（Claude Code, Gemini CLI, OpenCode, Aider）
- [x] 2.2 创建 `scripts/code-weekly/sources/rss-feeds.ts` — RSS/Atom 解析（anthropic.com, openai.com, cursor.com, blog.google 等）
- [x] 2.3 创建 `scripts/code-weekly/sources/tavily-search.ts` — Tavily Search API 封装（英文编辑器动态搜索）
- [x] 2.4 创建 `scripts/code-weekly/sources/bailian-search.ts` — 百炼 WebSearch API 封装（中文编辑器动态搜索）
- [x] 2.5 创建 `scripts/code-weekly/sources/arena-rankings.ts` — Chatbot Arena 评测数据采集
- [x] 2.6 创建 `scripts/code-weekly/sources/aider-leaderboard.ts` — Aider Leaderboard 数据采集

## 3. 数据采集脚本 — 聚合与总结

- [x] 3.1 创建 `scripts/code-weekly/summarizer.ts` — DeepSeek API 调用，多源原始数据 → 结构化周报 JSON
- [x] 3.2 创建 `scripts/fetch-code-weekly.ts` — 周报采集主入口（编排 sources、合并去重、调用 summarizer、写入 JSON）
- [x] 3.3 创建 `scripts/fetch-benchmarks.ts` — 评测数据独立采集脚本（更新 latest.json + history 快照，计算 delta）

## 4. 前端页面 — 组件

- [x] 4.1 创建 `website/components/code-weekly/EditorCard.tsx` — 编辑器卡片组件（名称、版本、category 标签、highlights 列表、AI 摘要）
- [x] 4.2 创建 `website/components/code-weekly/BenchmarkTable.tsx` — 评测排名表格组件（排名、模型、分数、Δ 变化值颜色）
- [x] 4.3 创建 `website/components/code-weekly/BlogCard.tsx` — 公司博客文章卡片组件（公司名、标题、摘要、链接）
- [x] 4.4 创建 `website/components/code-weekly/WeeklyTabs.tsx` — Tab 切换组件（编辑器动态 / 模型评测 / 公司博客）

## 5. 前端页面 — 路由

- [x] 5.1 创建 `website/pages/code.tsx` — 周报列表页（getStaticProps 加载所有周报摘要，底部评测入口链接）
- [x] 5.2 创建 `website/pages/code/[week].tsx` — 周报详情页（getStaticPaths + getStaticProps，三 Tab 布局，周导航）
- [x] 5.3 创建 `website/pages/code/benchmarks.tsx` — 独立评测对比页（Arena + Aider 表格，最后更新时间）

## 6. 导航集成

- [x] 6.1 修改 `website/components/Header.tsx` — 导航数组新增 `{ name: 'Code', href: '/code' }`，更新 `getActiveTab()` 支持 `/code` 路径匹配

## 7. CI/CD 与本地命令

- [x] 7.1 创建 `.github/workflows/sync-code-weekly.yml` — 周报每周日 cron + 评测每天 cron + workflow_dispatch，配置 secrets
- [x] 7.2 修改 `scripts/content.just` — 新增 `fetch-code-weekly` 和 `fetch-benchmarks` 命令

## 8. 依赖与配置

- [x] 8.1 安装 RSS 解析依赖（如 `rss-parser`）并添加到 package.json
- [x] 8.2 验证 Tavily 和百炼 API key 可用，本地运行 `just fetch-code-weekly` 端到端测试
