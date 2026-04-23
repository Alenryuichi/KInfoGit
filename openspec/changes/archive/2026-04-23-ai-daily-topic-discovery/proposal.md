## Why

`/ai-daily/metrics` 的 **Topic Health** 面板只回答"已登记的 focusTopic 现在还活着吗"——数据进来了就能看到 healthy/watch/stale/dead 分类。但**反方向的闭环**——"**哪些未登记的 tag 正在热起来，该不该升级成 focusTopic？**"——目前还靠**人肉翻数据**：ad-hoc 跑 python 脚本 `Counter` 全量 tags，然后肉眼判断"mcp 出现了 6 次，要不要加？rag 5 次，现在还是太边缘？"

这不是一次性决策。v2 词表（2026-04-12 定稿）运行 11 天已经出现明显变化：实测 7d 窗口里未受控 tags `mcp=6` / `fine-tuning=7` / `multimodal-ai=6` / `llm-reasoning=6` / `rag=5` 都在临界。AI 社区迭代快，**词表需要每月回看一次**，而每月手动扫一次的成本太高——ROADMAP 估这一项"形成自动提示'该加什么主题'的闭环"。

同时，Weekly Digest 刚落地（2026-04-22），为"每周一次的词表审视"提供了天然节奏：**和 Weekly Digest 同屏**展示一周新升温的 tag 候选，就能把"词表升级决策"嵌入周会级别的节奏。

## What Changes

- **扩展 `website/lib/ai-daily-metrics.ts`**：新增 `computeTopicDiscovery()` 函数——扫最近 30 天的 `item.tags[]`（非 `focusTopics[]`），排除已在 `TOPIC_VOCAB` + `LEGACY_TOPIC_VOCAB` 内的、排除明显的 entity tags（公司名/产品名 blacklist），按频次输出候选 tag + 分类（rising / persistent / sporadic）+ 最近示例
- **扩展 `/ai-daily/metrics` 页**：在现有 Topic Health section 后新增 "Topic Discovery (v3)" section，三栏并列展示 rising / persistent / sporadic 的 top 候选 tags，每个候选显示 7d/14d/30d 频次 + 最近 3 个 example + "Promote candidate" 指引（markdown 片段告诉编辑如何手动加入 `FOCUS_TOPICS`）
- **不自动修改词表**：所有 promotion 都要人工改 `scripts/ai-daily/config.ts` `FOCUS_TOPICS`。面板只是把"该看什么"推给编辑，决策权留给人

## Capabilities

### New Capabilities

- `ai-daily-topic-discovery`：扫自由 tag 字段的频次分布，分类成 rising/persistent/sporadic 三档，在 metrics 面板展示候选 tag 列表 + 示例，形成"该加什么 topic"的视觉提示闭环

### Modified Capabilities

<!-- 不修改已有 spec。Topic Health 面板行为不变，只是下方新增一个 section -->

## Impact

- **修改文件**：`website/lib/ai-daily-metrics.ts`（新增函数 + 类型 + entity blacklist 常量），`website/pages/ai-daily/metrics.tsx`（新增 `TopicDiscoveryTable` 组件 + props extension + `getStaticProps` 新字段），`ROADMAP.md`（AI Daily P1 `📐 Topic discovery 面板` → `✅`）
- **新增文件**：无（不开新页面，不动新数据产物）
- **依赖**：零新增 npm 依赖
- **数据消耗**：构建期扫 30 天 `profile-data/ai-daily/YYYY-MM-DD.json`（最多 30 个文件），已经是 Topic Health 现有扫描路径的附带计算——I/O 零新增
- **数据质量**：首批展示（基于 7 天实测）最可能进入 rising 的候选：`mcp` / `fine-tuning` / `multimodal-ai` / `llm-reasoning` / `rag`；进入 persistent 的：`ai-agents` / `open-source` / `llm`
- **边界**：entity tag blacklist 初期硬编码 ~15 个常见公司/产品名（openai/anthropic/google/claude/cursor/meta/xai/spacex 等），后续发现误伤或漏网可手动扩充
