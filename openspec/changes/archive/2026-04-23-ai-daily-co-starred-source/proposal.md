## Why

**实测数据事实**：2026-04-23 扫描 `profile-data/github-stars/` 得到——

| 窗口 | total repos | count≥2 | count≥3 |
|---|---:|---:|---:|
| 7d | 13 | 1 | **0** |
| 14d | 25 | 1 | **0** |
| 30d | 33 | 2 | **0** |
| 60d | 33 | 2 | **0** |

ROADMAP 原条目预设"≥3 个 AI leader 共同 star"——**全数据集 count≥3 = 0**，这个门槛不现实。Stars 板块本身用的 `computeCoStarredRepos` 默认 `minCount=2`，和 `/stars/[date]` 的 Co-Starred 卡片一致。采用 **minCount=2 + 30d 窗口**，实测稳定产出 2 条高质量候选：

- `huggingface/ml-intern` (score=7, 688★, Python): open-source ML engineer agent
- `mattmireles/gemma-tuner-multimodal` (score=8, 1202★, Python): Gemma 4 multimodal fine-tune

这两条的共同特征是**独立信号叠加 = 质量判断**——两个不同 leader 在不同日期独立 star 同一个 repo 比单人 star 强得多，且 RSS/Exa 几乎不可能报道这种"研究者实验室类"repo。正是 AI Daily 覆盖盲区。

Stars 侧的 `computeCoStarredRepos` + `getCoStarredForDate` API 已经存在（`website/lib/social-feeds.ts` L680-786），但在 website/lib 是构建态 SSG 环境，不能跨 import 进 scripts/ 的 AI Daily pipeline。**按 `ai-daily-ingest.ts` 的现有对称模式**（Code 周报侧独立实现而不跨 import），在 AI Daily scripts 侧做轻量版。

## What Changes

- **新增 AI Daily source 模块** `scripts/ai-daily/sources/stars-co-starred.ts`：
  - 从 `profile-data/github-stars/YYYY-MM-DD.json` 读 30 天滚动数据
  - 聚合 `starredBy` → Set → 过滤 `size >= 2`
  - 输出 `RawNewsItem[]` with `sourceType: 'rss'` + `sourceName: 'Co-Starred'`
  - title = `<repo>` (e.g. `huggingface/ml-intern`)
  - summary = `Starred by <N> leaders (<handle1>, <handle2>): <description>`
  - url = `https://github.com/<repo>`
  - publishedAt = `latestDate`（最晚一次 star 的日期）
- **主管线集成** `scripts/ai-daily/fetch-ai-daily.ts`：
  - Promise.allSettled 加一项 `fetchCoStarredItems(projectRoot)`
  - 与其他 source 合并进 `allRaw`（放在 `socialItems` 之后、`horizonItems` 之前）
  - 主管线已有 URL canonical dedup（`deduplicateByUrl`），重复与 RSS/Exa 的 repo 会自动去重
- **扩展 metrics schema**：`SourceBreakdown` 加 `coStarred?: number`；`RunRecord.sources.coStarred?: number`
- **前端可视化**：`/ai-daily/metrics` 的 `SourceStackChart` 加 lime 色段

## Capabilities

### New Capabilities

- `ai-daily-co-starred-source`：AI Daily 管线接入 Stars co-starred 信号——读 github-stars 30 天滚动窗口 + `starredBy` 去重 `size≥2` 过滤 + 输出 RawNewsItem 合成 title/summary 让 DeepSeek 照常 scoring/tagging

### Modified Capabilities

- `ai-daily-metrics`：`RunRecord.sources` schema 扩字段 `coStarred?: number`；`SourceStackChart` 加 lime 色段 + legend

## Impact

- **修改文件**：
  - `scripts/ai-daily/fetch-ai-daily.ts`（+1 source Promise）
  - `scripts/ai-daily/metrics.ts`（`SourceBreakdown` +`coStarred`）
  - `website/lib/ai-daily-metrics.ts`（`RunRecord.sources.coStarred?`）
  - `website/pages/ai-daily/metrics.tsx`（`SourceStackChart` +`coStarred` 色段 + legend）
  - `ROADMAP.md`（跨板块 `📐 Stars → AI Daily` → ✅，附数据事实修正说明）
- **新增文件**：`scripts/ai-daily/sources/stars-co-starred.ts`（~150 行）
- **依赖**：零新增 npm 依赖（纯 fs 读已有 JSON）
- **数据消耗**：扫 30 个 github-stars JSON 一次；当前每文件 1-2 条 star，I/O 成本毫秒级
- **首批覆盖**：明天 CI 运行时预计 2 条进入 AI Daily 管线（ml-intern + gemma-tuner-multimodal），经过 DeepSeek scoring 后自然进入 research / engineering section
- **风险**：
  - Stars 板块未来大幅扩展（追踪 20+ AI leaders），co-starred 数可能激增—— `coStarred` 输出 cap 10 条，防止管线被灌满
  - 与主管线 `deduplicateByUrl` 可能因 URL 规范化把 `https://github.com/X/Y` 和 `https://github.com/X/Y/tree/main` 视为不同——接受现状，概率低
