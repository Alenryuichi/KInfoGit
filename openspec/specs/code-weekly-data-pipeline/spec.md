# code-weekly-data-pipeline Specification

## Purpose
TBD - created by archiving change code-weekly-tracker. Update Purpose after archive.
## Requirements
### Requirement: Multi-source data collection
系统 SHALL 从以下数据源并行采集 Code 编辑器生态信息：
- GitHub Releases API（开源编辑器版本和 changelog）
- RSS/Atom feeds（公司技术博客文章）
- Tavily Search API（英文编辑器动态搜索）
- 百炼 WebSearch API（中文编辑器动态搜索）
- Chatbot Arena / Aider Leaderboard（模型评测数据）

采集 MUST 使用 `Promise.allSettled` 并行执行，单源失败不阻塞其他数据源。

#### Scenario: All sources succeed
- **WHEN** 所有数据源 API 正常返回
- **THEN** 系统合并所有数据源结果，生成完整周报 JSON

#### Scenario: Partial source failure
- **WHEN** 某个数据源 API 返回错误或超时
- **THEN** 系统跳过该数据源，使用其余数据源继续生成周报，并在日志中记录失败源

### Requirement: Editor tracking configuration
系统 SHALL 在 `scripts/code-weekly/config.ts` 中集中管理编辑器追踪列表，包含以下字段：
- `name`: 编辑器名称
- `category`: `"ide"` | `"cli"`
- `sources`: 数据源配置（GitHub repo、RSS URL、搜索 query 模板）

初始追踪列表：
- IDE: Cursor, Windsurf, Trae, Augment
- CLI/Plugin: Claude Code, Gemini CLI, OpenCode, Aider, Copilot, CodeBuddy

#### Scenario: Add new editor
- **WHEN** 需要追踪新的编辑器
- **THEN** 只需在 config.ts 的编辑器数组中添加一项配置，无需修改采集逻辑

### Requirement: Tavily search for English sources
系统 SHALL 使用 Tavily Search API 搜索英文编辑器的最新功能更新，搜索 query 模板为 `"{editor name} new features this week"` 或类似模式。

#### Scenario: Tavily search returns results
- **WHEN** Tavily API 返回搜索结果
- **THEN** 系统提取标题、摘要、URL 作为原始数据传递给 AI 总结层

#### Scenario: Tavily API key missing
- **WHEN** 环境变量 `TAVILY_API_KEY` 未设置
- **THEN** 系统跳过 Tavily 搜索，使用其他数据源继续

### Requirement: Bailian search for Chinese sources
系统 SHALL 使用百炼 WebSearch API 搜索中文编辑器（Trae、CodeBuddy）的最新动态。

#### Scenario: Bailian search returns results
- **WHEN** 百炼 API 返回中文搜索结果
- **THEN** 系统提取标题、摘要、URL 作为原始数据

#### Scenario: Bailian API key missing
- **WHEN** 环境变量 `BAILIAN_API_KEY` 未设置
- **THEN** 系统跳过百炼搜索，使用其他数据源继续

### Requirement: DeepSeek AI summarization
系统 SHALL 调用 DeepSeek API 将多源原始数据聚合为结构化周报 JSON。Prompt MUST 要求：
- 基于提供的原始数据总结，不编造信息
- 为每个编辑器提取关键功能更新（highlights 数组）
- 生成每个编辑器的 AI 摘要（aiSummary 字段）
- 生成本周整体总结（weekSummary 字段）

#### Scenario: Successful summarization
- **WHEN** DeepSeek API 接收原始数据并返回结果
- **THEN** 输出包含 `editors`、`benchmarks`、`blogs`、`weekSummary` 四个顶级字段的结构化 JSON

#### Scenario: DeepSeek API failure
- **WHEN** DeepSeek API 调用失败
- **THEN** 系统使用原始数据直接生成 JSON（无 AI 摘要），周报仍可正常发布

### Requirement: Weekly JSON output format
系统 SHALL 将周报数据写入 `profile-data/code-weekly/YYYY-WXX.json`，文件包含：
- `week`: ISO 周标识（如 "2026-W16"）
- `dateRange`: 日期范围字符串
- `generatedAt`: ISO 8601 时间戳
- `editors`: 编辑器更新数组，每项含 name、category、version、highlights、source、sourceUrl、aiSummary
- `benchmarks`: 评测数据对象（arenaRanking、aiderLeaderboard 数组及 notable 摘要）
- `blogs`: 公司博客文章数组，每项含 company、title、url、publishedAt、summary、tags
- `weekSummary`: 本周整体总结文本

#### Scenario: Generate weekly report
- **WHEN** 采集脚本执行完毕
- **THEN** 在 `profile-data/code-weekly/` 目录生成以当前 ISO 周命名的 JSON 文件

### Requirement: Benchmark data collection
系统 SHALL 独立采集模型评测数据，存储为：
- `profile-data/benchmarks/latest.json`: 最新评测排名
- `profile-data/benchmarks/history/YYYY-MM-DD.json`: 历史快照

评测数据 MUST 包含：
- Chatbot Arena Elo 排名（model、elo、rank、org）
- Aider code editing 通过率（model、passRate）
- 排名变化 delta 值（与上次快照对比）

#### Scenario: Daily benchmark update
- **WHEN** 评测采集脚本每天执行
- **THEN** 更新 latest.json 并在 history/ 目录新增当天快照

#### Scenario: First run without history
- **WHEN** history/ 目录为空（首次运行）
- **THEN** delta 值为 null，latest.json 正常生成

