## Why

`/ai-daily` 每天产出约 53 条（4/17–4/22 实测 range 31–62）分散在 5 个源和 8 个 focus topics 里的高密度条目。一周 ≈ 370 条，**已到达"看不过来"的临界点**——weekend 读者想"回顾本周 AI 重点"没有入口，必须逐天点开 7 个 `/ai-daily/[date]`。

同时，`scripts/generate-weekly-digest.ts`（stars 周报）在 4/22 刚完成 E1（URL post-validation）+ G2（Top Signals 归一化）打磨，是一套**跑通两版迭代、有 URL 护栏、有跨文件聚合（`loadVideosInRange`）的成熟模板**。ROADMAP AI Daily P1 明确估"复用率 60–70%，1–1.5 小时落地"。

此时启动投入产出比最高：
- AI Daily v2 词表 6 天观察期刚结案（全部 8 topic ≥13 命中 / 30d），数据质量稳定
- 每条 `NewsItem` 已带 `score` + `focusTopics` + `tags`，可直接按 topic 分桶、按 score 截断，无需新打分
- stars-weekly-digest 的页面骨架（Bento Grid + 统计条 + prev/next + 日志跳转）可 1:1 挪用

## What Changes

- **新增构建期脚本** `scripts/generate-ai-daily-weekly-digest.ts`：聚合一个 ISO 周内 7 个 `profile-data/ai-daily/YYYY-MM-DD.json`，按 `focusTopic` 分桶 + `score ≥ 6` 截断，调 DeepSeek 产出结构化周报
- **新增数据目录** `profile-data/ai-daily-weekly/`，存放 `YYYY-WXX.json`（与 stars 的 `weekly-digests/` 物理分离，schema 不同）
- **新增数据层模块** `website/lib/ai-daily-weekly.ts`：提供 `getAllAiDailyWeeklies()` / `getAiDailyWeeklyByWeek()` / `getAdjacentAiDailyWeeks()`，全部走 `resolveProfileDataPath()`
- **新增周报详情页** `/ai-daily/weekly/[week]`：复用 stars-weekly `[week].tsx` 的 Bento Grid 骨架，适配 AI Daily 数据形态（Top Stories by Topic / Trending Topics / Key Reads / Daily Logs）
- **更新列表页** `/ai-daily`：顶部 header 下方加入最新周报 banner（类似 stars 的 "This Week" 卡片形态），有数据才显示
- **更新 CI workflow** `.github/workflows/sync-ai-daily.yml`：在 `fetch-ai-daily.ts` 跑完后加一步 `generate-ai-daily-weekly-digest.ts`（只在每周一 Asia/Shanghai 0:00 后首个调度 run 时实际生成新周）

## Capabilities

### New Capabilities

- `ai-daily-weekly-generation`：构建期脚本，聚合 7 天 AI Daily digest → 按 focusTopic 分桶 + 按 score 截断 → DeepSeek 写"本周最值得关注"结构化周报 → URL post-validation（参考 stars E1 的 `isRealUrl` + by-title 回填）→ 写入 `YYYY-WXX.json`
- `ai-daily-weekly-display`：列表页 banner + 详情页，展示 overview / top stories per topic / trending topics / key reads / 7 天日志导航

### Modified Capabilities

<!-- 不修改现有 spec。`ai-daily.ts` 数据层只新增 re-export，旧 API 行为不变。 -->

## Impact

- **新增文件**：`scripts/generate-ai-daily-weekly-digest.ts`、`website/lib/ai-daily-weekly.ts`、`website/pages/ai-daily/weekly/[week].tsx`、`profile-data/ai-daily-weekly/*.json`
- **修改文件**：`website/pages/ai-daily.tsx`（顶部加 banner）、`.github/workflows/sync-ai-daily.yml`（加一个 step）、ROADMAP.md（P1 📐 → ✅）
- **依赖**：零新增 npm 依赖（复用 `fetch` + `DEEPSEEK_API_KEY`）
- **密钥**：复用既有 `DEEPSEEK_API_KEY` secret
- **首批覆盖周**：W16（2026-04-13 → 2026-04-19，7 天完整）可立即生成；W15（2026-04-06 → 2026-04-12）只有 4/9 起的数据（4 天），按"`daysWithContent ≥ 4` 才生成"的门槛亦可生成；W17 为当前进行中周，脚本自动排除
