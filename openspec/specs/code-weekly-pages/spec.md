# code-weekly-pages Specification

## Purpose
TBD - created by archiving change code-weekly-tracker. Update Purpose after archive.
## Requirements
### Requirement: Code weekly list page
系统 SHALL 在 `/code` 路由提供周报列表页，展示所有已发布的 Code Weekly 周报，按时间倒序排列。每项显示：
- ISO 周标识和日期范围
- weekSummary 摘要文本（截断显示）
- 点击跳转到 `/code/[week]` 详情页

页面底部 SHALL 提供到 `/code/benchmarks` 评测页面的入口链接。

#### Scenario: List page with multiple weeks
- **WHEN** 用户访问 `/code`
- **THEN** 页面按时间倒序展示所有周报条目，最新的在最上方

#### Scenario: List page with no data
- **WHEN** `profile-data/code-weekly/` 目录为空
- **THEN** 页面展示空状态提示

### Requirement: Code weekly detail page with tabs
系统 SHALL 在 `/code/[week]` 路由提供周报详情页，使用 Tab 切换展示三块内容：
- **编辑器动态 Tab**: 按 IDE / CLI 分组展示 EditorCard 组件
- **模型评测 Tab**: 展示 BenchmarkTable（Arena、Aider 排名表格）
- **公司博客 Tab**: 展示 BlogCard 列表

默认显示"编辑器动态"Tab。Tab 切换 MUST 不触发页面刷新（客户端状态管理）。

#### Scenario: View editor updates tab
- **WHEN** 用户访问 `/code/2026-W16` 或切换到编辑器动态 Tab
- **THEN** 页面按 IDE 和 CLI 两组展示 EditorCard，每张卡片显示编辑器名称、版本、highlights 列表和 AI 摘要

#### Scenario: Switch to benchmarks tab
- **WHEN** 用户点击"模型评测"Tab
- **THEN** 页面展示本周评测数据表格，包含排名、模型名、分数、变化值

#### Scenario: Switch to blogs tab
- **WHEN** 用户点击"公司博客"Tab
- **THEN** 页面展示本周公司博客文章卡片列表，每张含公司名、标题、摘要和链接

### Requirement: Week navigation
详情页 SHALL 提供前一周/后一周的导航链接，与现有 Stars/AI Daily 的 DateNav 模式一致。

#### Scenario: Navigate between weeks
- **WHEN** 用户在 `/code/2026-W16` 点击"上一周"
- **THEN** 跳转到 `/code/2026-W15`

#### Scenario: Oldest week
- **WHEN** 当前是最早的周报
- **THEN** "上一周"链接不显示或禁用

### Requirement: Navigation integration
主导航 Header SHALL 新增 "Code" tab，href 为 `/code`，位于现有导航项之后。

#### Scenario: Code tab in header
- **WHEN** 用户在任意页面查看导航栏
- **THEN** 导航栏包含 "Code" 选项

#### Scenario: Active state on code pages
- **WHEN** 用户在 `/code`、`/code/2026-W16` 或 `/code/benchmarks` 页面
- **THEN** Header 中 "Code" tab 显示为激活状态

### Requirement: Data loading functions
`website/lib/code-weekly.ts` SHALL 导出以下函数：
- `getAllCodeWeeks()`: 返回所有周报摘要列表（按周倒序）
- `getCodeWeekByWeek(week: string)`: 返回指定周报完整数据
- `getAdjacentWeeks(week: string)`: 返回前后周的 week 标识
- `getLatestBenchmarks()`: 返回最新评测数据

#### Scenario: Load weekly data
- **WHEN** `getStaticProps` 调用 `getCodeWeekByWeek("2026-W16")`
- **THEN** 返回 `profile-data/code-weekly/2026-W16.json` 的解析结果，不存在时返回 null

#### Scenario: Load all weeks for list
- **WHEN** `getStaticProps` 调用 `getAllCodeWeeks()`
- **THEN** 返回按周倒序排列的摘要数组

