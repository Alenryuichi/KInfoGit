## Context

本站是 Next.js 16 Pages Router 纯静态站点（`output: 'export'`），部署到 GitHub Pages。已有类似的 `ai-daily` 功能：构建时从 `profile-data/ai-daily/` 读 JSON → `getStaticProps` → 页面渲染。Stars 功能完全复用此模式。

现有导航 4 个 tab：Home / About / Work / Blog。Header 使用 pill-style 动画导航。

## Goals / Non-Goals

**Goals:**
- 构建时拉取 GitHub starred repos 并用 DeepSeek 生成 AI 点评，按天归档
- 提供 `/stars/` 列表页 + `/stars/[date]/` 详情页
- 支持多用户 starred 源（自己 + AI 大佬）
- 主导航可达

**Non-Goals:**
- 不做运行时 API 调用（纯 SSG）
- 不做 starred 项目的全量历史同步（只拉最近/当天）
- 不做用户交互（评论、额外 star 等）
- 不做 DeepSeek 的 streaming 或高级对话

## Decisions

### 1. 数据架构：参照 ai-daily 的 JSON-per-day 模式

**选择**: `profile-data/github-stars/YYYY-MM-DD.json`，每天一个文件。

**替代方案**: 单个大 JSON 或数据库 → 不符合 SSG 静态站模式。

**理由**: 与 ai-daily 完全一致，增量友好，文件级缓存天然有效。

### 2. DeepSeek 集成：构建时脚本调用

**选择**: `scripts/fetch-stars.ts` 在构建前运行，通过 `DEEPSEEK_API_KEY` 环境变量调用 DeepSeek Chat API。

**理由**: 纯 SSG 无法运行时调 API。构建时调用 → 结果缓存为静态 JSON → 零运行时开销。无 key 时优雅降级（只存 repo 信息，不生成 AI 点评）。

### 3. 多用户 starred 源

**选择**: 脚本顶部常量数组 `GITHUB_USERS = ['Alenryuichi', 'karpathy', 'yironghuang']`。

**理由**: 简单直接，改配置只需编辑一行。无需复杂配置系统。

### 4. GitHub API：使用 REST API + star timestamp

**选择**: `GET /users/{user}/starred` with `Accept: application/vnd.github.v3.star+json` header，获取 `starred_at` 时间戳用于按天分组。

**理由**: 不需要 GraphQL 的复杂度，REST API 即可获取 star 时间。匿名 60 req/hr 足够（3 用户各 1 请求）。

### 5. 导航：扩展 Header navigation 数组为 5 tabs

**选择**: 直接在 `navigation` 数组加 `{ name: 'Stars', href: '/stars' }`。

**影响**: nav pill 宽度需从 4×80px 调整，或 tab 宽度从 80px 缩到 72px 以适配 5 个。

## Risks / Trade-offs

- **GitHub API 限流** → 匿名 60 req/hr。缓解：已有 JSON 则跳过；可加 `GITHUB_TOKEN` 提升到 5000/hr。
- **DeepSeek API 成本** → 每个 repo 一次调用。缓解：已有点评则跳过；无 key 时降级。
- **大佬 starred 量可能很大** → 只取第一页（最近 30 个），按当天过滤。
- **5 tab 导航可能拥挤** → 可缩小 tab 宽度或响应式隐藏到 "More" 菜单（v2）。
