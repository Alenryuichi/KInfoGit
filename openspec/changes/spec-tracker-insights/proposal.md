## Why

Spec Tracker 页面目前只展示存量事实（绝对星数、下载量），缺乏趋势洞察。用户的核心需求是"从 spec 进展中发现未来趋势"，但页面上看不出哪个框架在加速增长、生态正在发生什么变化。需要两个增强：动量指标让数字会说话，AI 洞察摘要让页面会讲故事。

## What Changes

- 数据管道增加 **delta 计算**：对比昨日快照，计算 stars delta、npm downloads delta、新增/退出项目
- 数据管道增加 **AI 趋势摘要生成**：用 DeepSeek API 根据本周 delta + releases 生成 2-3 段中文趋势分析
- 页面 Hero Cards 增加 **▲/▼ 趋势指示**
- 页面新增 **Trend Insights 区域**（AI 生成的趋势分析文字）
- 页面新增 **Weekly Diff 区域**（最大涨幅、新进/退出项目）
- SpecSnapshot JSON 增加 delta + insights 字段

## Capabilities

### New Capabilities
- `spec-momentum`: 动量指标计算（stars delta, npm delta, weekly diff）和 AI 趋势洞察生成
- `spec-insights-ui`: 页面展示动量指标（Hero Cards ▲/▼、Trend Insights 区域、Weekly Diff 区域）

### Modified Capabilities
（无需修改现有 openspec/specs/）

## Impact

- **修改文件**: `scripts/spec-tracker/types.ts`（增加 delta 字段）、`scripts/spec-tracker/fetch-spec-data.ts`（增加 delta 计算 + AI 摘要）、4 个 website 组件
- **新增文件**: `scripts/spec-tracker/insights.ts`（AI 摘要生成）、`website/components/spec-tracker/TrendInsights.tsx`、`website/components/spec-tracker/WeeklyDiff.tsx`
- **API 依赖**: DeepSeek API（已有 key，复用 Code Weekly 的模式）
- **数据**: SpecSnapshot JSON 增加 `deltas` + `insights` 字段（向后兼容，旧快照无这些字段也能正常渲染）
