## Why

Code Weekly 已有 editors 和 benchmarks 追踪，但缺少对 AI Coding Spec 框架生态的追踪。2026 年 Spec-Driven Development 迅速崛起（Spec-Kit 88k★, BMAD 45k★, OpenSpec 40k★），已成为 AI 编程的核心方法论层。需要一个独立页面深度追踪这些框架的 stars 趋势、npm 下载量、版本更新和生态动态，同时具备自动发现新兴项目的能力。

## What Changes

- 新增独立数据管道 `scripts/spec-tracker/`，每日采集 8 个固定追踪项目的 GitHub stats + npm downloads + changelog
- 新增探索机制（GitHub Search API + npm search），自动发现新兴 spec 框架
- 新增数据目录 `profile-data/specs/`，存储每日快照（latest.json + history/）
- 新增独立 GitHub Action `fetch-specs.yml`，每日 UTC 05:23 触发
- 新增页面 `/code/specs/`，展示 Hero Cards、Stars 趋势图、npm 下载量图、对比表格、Recent Activity、Emerging 区域
- 新增 website 数据层 `lib/spec-tracker.ts` 和 5+ 个可视化组件

## Capabilities

### New Capabilities
- `spec-data-pipeline`: 独立数据采集管道，支持 GitHub stats（stars/forks/releases/commits）、npm downloads、changelog 抓取，以及基于 GitHub Search + npm search 的新项目发现
- `spec-tracker-page`: `/code/specs/` 独立页面，包含 Hero Cards、Stars Arms Race 趋势图、npm 周下载量柱状图、框架对比表格、Recent Activity 和 Emerging Specs 六个区域

### Modified Capabilities
（无需修改现有 capabilities）

## Impact

- **新文件**: ~12 个新文件（scripts 4-5, profile-data 目录, website lib 1, page 1, components 5-6）
- **GitHub Action**: 新增独立 workflow，需要 GITHUB_TOKEN 权限（已有）
- **依赖**: 无新依赖，复用现有 fetch + framer-motion
- **现有代码**: 不修改任何现有文件，完全独立管道
