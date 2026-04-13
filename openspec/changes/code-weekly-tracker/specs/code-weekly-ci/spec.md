## ADDED Requirements

### Requirement: Weekly report workflow
系统 SHALL 提供 GitHub Actions 工作流 `sync-code-weekly.yml`，每周日 UTC 时间自动运行 `scripts/fetch-code-weekly.ts` 采集并生成周报数据。

工作流 MUST 支持 `workflow_dispatch` 手动触发。

#### Scenario: Scheduled weekly run
- **WHEN** 每周日 cron 触发
- **THEN** 工作流执行采集脚本，生成周报 JSON，若有变更则 commit 并 push

#### Scenario: Manual trigger
- **WHEN** 用户在 GitHub Actions 页面手动触发
- **THEN** 工作流正常执行，与定时触发行为一致

#### Scenario: No new data
- **WHEN** 采集结果与现有数据无差异
- **THEN** 工作流不创建新 commit

### Requirement: Daily benchmarks workflow
系统 SHALL 在同一工作流或独立 job 中每天运行 `scripts/fetch-benchmarks.ts`，更新评测排名数据。

#### Scenario: Daily benchmark update
- **WHEN** 每天 cron 触发 benchmarks 采集
- **THEN** 更新 `profile-data/benchmarks/latest.json` 和历史快照

### Requirement: Environment secrets
工作流 MUST 配置以下 secrets：
- `TAVILY_API_KEY`: Tavily 搜索 API
- `DEEPSEEK_API_KEY`: DeepSeek AI 总结（已有）
- `BAILIAN_API_KEY`: 百炼 WebSearch（已有）
- `GITHUB_TOKEN`: GitHub Releases API（已有）

#### Scenario: Missing optional API key
- **WHEN** 某个搜索 API key 未配置
- **THEN** 工作流仍可成功完成，仅跳过对应搜索源

### Requirement: Just command integration
`scripts/content.just` SHALL 新增以下命令：
- `just fetch-code-weekly`: 运行周报采集脚本
- `just fetch-benchmarks`: 运行评测数据采集脚本

#### Scenario: Run locally
- **WHEN** 开发者执行 `just fetch-code-weekly`
- **THEN** 本地运行采集脚本（需要环境变量设置 API keys）
