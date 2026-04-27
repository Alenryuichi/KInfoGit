## Why

站点已有 AI Daily（每日 AI 新闻）和 Stars（GitHub 关注动态），但缺少对 **AI Code 工具生态**的系统化追踪。作为 AI Agent 工程师，需要一个专区持续跟踪 Code 编辑器功能演进、模型评测排名和厂商技术博客，为自己和访客提供每周一站式 Code 领域情报。

## What Changes

- 新增 `/code` 列表页和 `/code/[week]` 周报详情页，以 Tab 形式展示三块内容：编辑器动态、模型评测、公司博客
- 新增 `/code/benchmarks` 独立评测对比页，展示 Chatbot Arena / Aider Leaderboard / SWE-Bench 排名及历史趋势
- 新增数据采集脚本，分层使用 GitHub Releases API、RSS 解析、Tavily（英文搜索）、百炼 WebSearch（中文搜索）获取原始数据
- 新增 DeepSeek AI 总结层，将多源原始数据聚合为结构化周报 JSON
- 新增 GitHub Actions 工作流：周报每周运行一次，评测数据每天运行一次
- 主导航 Header 新增 "Code" tab

## Capabilities

### New Capabilities
- `code-weekly-data-pipeline`: 数据采集与 AI 聚合流水线——GitHub Releases、RSS、Tavily、百炼多源采集，DeepSeek 总结输出结构化周报 JSON
- `code-weekly-pages`: Code 周报页面——列表页 `/code`、详情页 `/code/[week]`（编辑器/评测/博客三 Tab）
- `code-benchmarks-page`: 独立评测对比页 `/code/benchmarks`——Chatbot Arena、Aider、SWE-Bench 排名表格及 Elo 历史趋势图
- `code-weekly-ci`: GitHub Actions 工作流——周报定时采集（每周）+ 评测数据定时采集（每天）

### Modified Capabilities

## Impact

- **新脚本**: `scripts/fetch-code-weekly.ts`, `scripts/fetch-benchmarks.ts`, `scripts/code-weekly/` 目录（sources/、config.ts、summarizer.ts）
- **新数据目录**: `profile-data/code-weekly/`, `profile-data/benchmarks/`
- **新页面**: `website/pages/code.tsx`, `website/pages/code/[week].tsx`, `website/pages/code/benchmarks.tsx`
- **新组件**: `website/components/code-weekly/`（EditorCard、BenchmarkTable、BlogCard、EloChart、WeeklyTabs）
- **新数据层**: `website/lib/code-weekly.ts`
- **修改文件**: `website/components/Header.tsx`（导航新增 Code）, `scripts/content.just`（新增 just 命令）
- **CI**: `.github/workflows/sync-code-weekly.yml`
- **环境变量**: 新增 `TAVILY_API_KEY`；复用已有 `DEEPSEEK_API_KEY`, `BAILIAN_API_KEY`, `GITHUB_TOKEN`
- **依赖**: 可能新增 RSS 解析库（如 `rss-parser`）
