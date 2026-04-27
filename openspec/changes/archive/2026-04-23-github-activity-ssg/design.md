## Context

About 页面的 GitHub Activity 区域包含三块数据：repos（REST API, 构建时获取 ✅）、PRs（REST API, 构建时获取 ✅）、contribution calendar（`react-github-calendar` 运行时获取 ❌）。前两者已在 `getStaticProps` 中获取，只有 contribution calendar 仍依赖运行时第三方服务。

## Goals / Non-Goals

**Goals:**
- Contribution calendar 数据在构建时通过 GitHub GraphQL API 获取
- 使用 `react-activity-calendar` 直接渲染（已是 `react-github-calendar` 的底层依赖）
- 移除对第三方服务 `github-contributions-api.jogruber.de` 的依赖
- 无 `GITHUB_TOKEN` 时优雅降级（隐藏 calendar 区域）

**Non-Goals:**
- 不改动 repos / PRs 的获取逻辑
- 不改动 calendar 的视觉样式

## Decisions

### D1: 使用 GitHub GraphQL API `contributionsCollection`

```graphql
query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            color
          }
        }
      }
    }
  }
}
```

需要 `GITHUB_TOKEN`（`read:user` scope）。返回最近一年的每日 contribution 数据。

### D2: 数据转换为 `react-activity-calendar` 格式

GraphQL 返回 `weeks[].contributionDays[]`，需要 flatten 为 `Activity[]`:
```ts
interface Activity {
  date: string      // "YYYY-MM-DD"
  count: number
  level: 0 | 1 | 2 | 3 | 4
}
```

`level` 根据 `contributionCount` 分档：0=0, 1=1-3, 2=4-6, 3=7-9, 4=10+。

### D3: 数据通过 props 传入组件

`getStaticProps` 获取数据 → `about.tsx` 传给 `GitHubActivity` → 内部用 `ActivityCalendar` 渲染。

### D4: 无 token 时降级

构建时如果 `GITHUB_TOKEN` 未设置，跳过 GraphQL 查询，传空数组。组件检测到空数据时隐藏 calendar 区域（不显示错误）。

## Risks / Trade-offs

- **[Token 权限]** `read:user` scope 即可，不需要 repo 访问权限
- **[构建时数据]** Contribution 数据在每次构建时刷新。GitHub Actions 的 `GITHUB_TOKEN` 自动可用，无需额外配置 secret
- **[react-activity-calendar 版本]** 已作为 `react-github-calendar` 的传递依赖安装，移除后需显式安装
