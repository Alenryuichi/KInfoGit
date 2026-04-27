## Why

个人网站缺少展示技术品味与社区关注方向的板块。GitHub Stars 是一个天然的"我在关注什么"信号源，但裸列表缺乏解读。通过 DeepSeek API 在构建时为每个 starred 项目生成亮点摘要和推荐理由，让访客快速理解每个项目的价值。

## What Changes

- 新增构建时脚本，拉取多个 GitHub 用户（自己 + AI 大佬）最近 starred 的项目，按天归档为 JSON
- 新增 DeepSeek API 集成，为每个 starred repo 生成核心亮点和值得看的理由
- 新增 `/stars/` 列表页和 `/stars/[date]/` 详情页，展示按日期分组的 star 数据
- 主导航 Header 新增 "Stars" tab
- 新增 `just fetch-stars` 命令

## Capabilities

### New Capabilities
- `github-stars-fetch`: 构建时脚本，通过 GitHub API 拉取多用户 starred repos，调用 DeepSeek API 生成 AI 点评，按天存储为 JSON
- `github-stars-pages`: Stars 列表页和详情页，展示按日期分组的 starred 项目及 AI 点评
- `github-stars-nav`: 主导航集成 Stars tab

### Modified Capabilities

_无需修改现有 spec 级行为_

## Impact

- **新文件**: `scripts/fetch-stars.ts`, `website/lib/github-stars.ts`, `website/pages/stars.tsx`, `website/pages/stars/[date].tsx`
- **修改文件**: `website/components/Header.tsx`（导航数组 + 路由匹配）, `scripts/content.just`（新命令）
- **新数据目录**: `profile-data/github-stars/`
- **新依赖**: 无额外 npm 包（用 fetch 调 DeepSeek API）
- **环境变量**: `DEEPSEEK_API_KEY`（构建时可选，无 key 则跳过 AI 点评）
- **部署**: 纯 SSG，无运行时开销
