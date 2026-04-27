# github-contribution-ssg Specification

## Purpose
TBD - created by archiving change github-activity-ssg. Update Purpose after archive.
## Requirements
### Requirement: Build-time contribution data fetching
About 页面 SHALL 在构建时通过 GitHub GraphQL API 获取 contribution calendar 数据，不依赖运行时第三方服务。

#### Scenario: 正常获取（有 GITHUB_TOKEN）
- **WHEN** 构建时 `GITHUB_TOKEN` 环境变量已设置
- **THEN** 通过 GraphQL `contributionsCollection` 获取最近一年的每日 contribution 数据，转换为 `Activity[]` 格式传入组件

#### Scenario: Token 未设置
- **WHEN** 构建时 `GITHUB_TOKEN` 未设置
- **THEN** 跳过 contribution 数据获取，传空数组，组件隐藏 calendar 区域，不显示错误

#### Scenario: GraphQL 请求失败
- **WHEN** GitHub GraphQL API 返回错误
- **THEN** 打印警告，传空数组，组件隐藏 calendar 区域，不阻断构建

### Requirement: Static rendering with react-activity-calendar
组件 SHALL 使用 `react-activity-calendar` 直接渲染预获取的 contribution 数据，替代 `react-github-calendar`。

#### Scenario: 有 contribution 数据
- **WHEN** 组件收到非空 `Activity[]`
- **THEN** 渲染 contribution calendar，样式与现有一致（深色主题）

#### Scenario: 无 contribution 数据
- **WHEN** 组件收到空数组
- **THEN** 隐藏 contribution calendar 区域（不显示 loading 或错误）

