## Why

AI Daily 当前只有 3 个粗粒度分类（Headlines/Research/Engineering），用户无法按研究方向快速筛选感兴趣的内容。用户重点关注 Agent 领域的 Memory、Self-Evolution、Multi-Agent、Planning、Reflection、Tool Use 等方向，需要标签过滤功能来从每日新闻中快速定位相关文章。

## What Changes

- 转换脚本新增 **Focus Topics** 检测逻辑，为每条新闻打上研究方向标签（基于关键词匹配标题/摘要/tags）
- JSON 数据格式扩展 `focusTopics` 字段
- 详情页顶部新增 filter chips 交互组件，支持按 focus topic 过滤新闻
- 列表页每日条目旁显示 focus topic 标签，方便快速扫描哪天有感兴趣的内容
- NewsItemCard 组件展示匹配的 focus topic 小标签

## Capabilities

### New Capabilities
- `focus-topic-filter`: Focus Topics 标签检测与过滤系统，包括转换脚本中的关键词匹配、数据格式扩展、详情页过滤 UI、列表页标签展示

### Modified Capabilities

## Impact

- `scripts/convert-horizon.ts` — 新增 `FOCUS_TOPICS` 关键词映射和 `detectFocusTopics()` 函数
- `website/lib/ai-daily.ts` — TypeScript 接口扩展
- `website/pages/ai-daily/[date].tsx` — 详情页新增 filter chips + 客户端过滤
- `website/pages/ai-daily.tsx` — 列表页新增 topic 标签展示
- `profile-data/ai-daily/*.json` — 数据格式增加字段（向后兼容）
