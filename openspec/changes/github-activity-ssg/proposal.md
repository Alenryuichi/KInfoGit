## Why

`react-github-calendar` 依赖第三方服务 `github-contributions-api.jogruber.de` 在客户端运行时获取 GitHub contribution 数据。该服务不稳定（当前完全无响应），导致 About 页面持续显示 "Error – Fetching GitHub contribution data for Alenryuichi failed"。需要改为构建时通过 GitHub 官方 GraphQL API 获取数据，符合 SSG 架构。

## What Changes

- 在 `getStaticProps` 中通过 GitHub GraphQL API（`contributionsCollection`）获取 contribution calendar 数据
- 将 `react-github-calendar` 替换为直接使用 `react-activity-calendar`（前者的底层渲染库），传入预获取的数据
- 移除 `react-github-calendar` 依赖
- GitHub Actions 需配置 `GITHUB_TOKEN`（`read:user` scope）

## Capabilities

### New Capabilities
- `github-contribution-ssg`: 构建时获取 GitHub contribution calendar 数据并静态渲染，不依赖运行时第三方 API

### Modified Capabilities

## Impact

- `website/pages/about.tsx` — `getStaticProps` 新增 GraphQL 查询
- `website/components/GitHubActivity.tsx` — 接收 contribution 数据 prop，替换 `react-github-calendar` 为 `react-activity-calendar`
- `website/package.json` — 移除 `react-github-calendar`，添加 `react-activity-calendar`
- GitHub Actions secrets — 需要 `GITHUB_TOKEN`（`read:user` scope）
