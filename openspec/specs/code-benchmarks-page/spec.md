# code-benchmarks-page Specification

## Purpose
TBD - created by archiving change code-weekly-tracker. Update Purpose after archive.
## Requirements
### Requirement: Benchmarks overview page
系统 SHALL 在 `/code/benchmarks` 路由提供独立的评测对比页面，展示最新模型评测排名。该页面与周报独立，展示"当前最新"数据而非某一周的快照。

页面 MUST 显示最后更新时间。

#### Scenario: View latest benchmarks
- **WHEN** 用户访问 `/code/benchmarks`
- **THEN** 页面展示最新的评测排名表格，包含 Chatbot Arena 和 Aider Leaderboard 两个区块

### Requirement: Chatbot Arena ranking table
页面 SHALL 展示 Chatbot Arena Elo 排名表格，包含列：排名、模型名、Elo 分数、变化值（Δ）、所属公司。

排名变化 MUST 用颜色区分：正值绿色、负值红色、无变化灰色。

#### Scenario: Display arena rankings
- **WHEN** benchmarks 数据包含 arenaRanking 数组
- **THEN** 渲染排名表格，Δ 列按正负值显示绿/红色

#### Scenario: No arena data
- **WHEN** arenaRanking 数组为空
- **THEN** 展示"暂无数据"提示

### Requirement: Aider leaderboard table
页面 SHALL 展示 Aider Code Editing 排行表格，包含列：模型名、通过率（%）、变化值（Δ）。

#### Scenario: Display aider leaderboard
- **WHEN** benchmarks 数据包含 aiderLeaderboard 数组
- **THEN** 渲染 Aider 排行表格

### Requirement: Benchmark entry from list page
`/code` 列表页 SHALL 提供明显的入口链接到 `/code/benchmarks`，文案如"查看最新评测排名"。

#### Scenario: Navigate to benchmarks
- **WHEN** 用户在 `/code` 列表页点击评测入口链接
- **THEN** 跳转到 `/code/benchmarks`

