## 1. 数据类型与数据层

- [x] 1.1 在新文件 `website/lib/ai-daily-weekly.ts` 定义 `AiDailyWeeklyDigest` / `AiDailyWeeklySummary` / `TopStory` / `TopicBucket` 接口（见 design.md §1）
- [x] 1.2 用 `resolveProfileDataPath('ai-daily-weekly')` 实现 `getDir()`
- [x] 1.3 实现 `getAllAiDailyWeeklies(): AiDailyWeeklySummary[]`（读目录 → 过滤 `YYYY-WXX.json` → 返回 summary 列表，按 week desc 排序）
- [x] 1.4 实现 `getAiDailyWeeklyByWeek(week: string): AiDailyWeeklyDigest | null`
- [x] 1.5 实现 `getAdjacentAiDailyWeeks(week: string): { prev, next }`
- [x] 1.6 实现 `getLatestAiDailyWeekly(): AiDailyWeeklyDigest | null`（列表页 banner 用）

## 2. 周报生成脚本

- [x] 2.1 新建 `scripts/generate-ai-daily-weekly-digest.ts`，抄 `generate-weekly-digest.ts` 的 header / config / ISO 周助手（`getISOWeek` / `collectWeekDays` / `formatWeek`）
- [x] 2.2 常量：`MIN_SCORE_WEEKLY = 6.0`、`PER_TOPIC_TOP = 8`、`MIN_DAYS_WITH_CONTENT = 4`
- [x] 2.3 实现 `loadWeekAiDailyContent(dates: string[])`：遍历 7 天 `profile-data/ai-daily/YYYY-MM-DD.json` → 展平所有 `sections[].items` → 按 `score >= MIN_SCORE_WEEKLY` 过滤 → URL canonical 去重（同 URL 留最高分）
- [x] 2.4 实现 `bucketByTopic(items)`：按 `focusTopics[]` 展开（一个 item 可能属 ≤2 个 topic），每桶 `sort((a,b) => b.score - a.score)` 并 `slice(0, PER_TOPIC_TOP)`；保留 FOCUS_TOPIC_META 里的 8 个 v2 topic，legacy topic 归并到 `other` 桶（不进 prompt，但计入 `stats.topicCounts`）
- [x] 2.5 实现 `buildPromptContent(buckets)`：每 topic 一段，格式 `=== TOPIC: coding-agents (52 this week, top 8) ===` + 逐行 `- [8.5] <title> — <summary120> <url>`
- [x] 2.6 实现 `generateWeeklyDigest(week, dateRange, content, stats)`：组 prompt → 调 DeepSeek `response_format: json_object` → 解析
- [x] 2.7 Prompt 强约束：明确 schema + "use the topic ids verbatim from input headers" + "Never invent URLs; copy verbatim from angle brackets" + "Each topic in topStoriesByTopic is a separate group, don't merge"
- [x] 2.8 实现 URL post-validation：抄 stars E1 的 `isRealUrl()` + whitelist (`urlWhitelist: Set<string>`) + by-title 回填（`itemByTitle: Map<string, WeekItem>`），覆盖 `topStoriesByTopic[].stories[].url` 和 `keyReads[].url`
- [x] 2.9 实现 `main()` 循环：`getWeeksToProcess()` 排除当前周 → 逐周检查 `profile-data/ai-daily-weekly/YYYY-WXX.json` 存在即跳过（除非 `--force`）→ `daysWithContent < 4` 跳过并 log `skipped: insufficient data` → 调用生成 → 写文件
- [x] 2.10 本地跑通：`npx tsx scripts/generate-ai-daily-weekly-digest.ts` 生成 `2026-W16.json`（W15 因只有 2/4 天数据被跳过 ✓），169 items · 8 topics · 20 stories · 4 trends · 4 key reads；URL guard 0 次修复触发

## 3. 列表页 banner

- [x] 3.1 `website/pages/ai-daily.tsx` `getStaticProps` 里新增调 `getLatestAiDailyWeekly()`，props 加 `latestWeekly: AiDailyWeeklyDigest | null`
- [x] 3.2 在 header motion.div 和 `[Metrics →]` 按钮之后、日志列表 table header 之前插入 banner 块（dashed 蓝色边框 + mono 字体，与现站风格一致）
- [x] 3.3 banner 内容：`[WEEKLY] 2026-W16 • Apr 13 – Apr 19` 标签行 + overview 前 220 字截断 + `[Read full digest →]` 链接指向 `/ai-daily/weekly/${week}/`
- [x] 3.4 `latestWeekly === null` 时 banner 不渲染（SSR 已有数据的本地开发兜底）

## 4. 详情页 `/ai-daily/weekly/[week]`

- [x] 4.1 新建 `website/pages/ai-daily/weekly/[week].tsx`，`getStaticPaths` 枚举 `getAllAiDailyWeeklies()` 的所有 week
- [x] 4.2 `getStaticProps` 加载 digest + 相邻周 + `dailyDatesInRange`（过 `getAllDailyDates()` filter）
- [x] 4.3 顶部 header 卡片：`← Back to AI Daily` / 相邻周导航 / `Week NN` 标题 / 日期范围，蓝色 accent（不沿用 stars 的 purple）
- [x] 4.4 Stats 条：total items / unique topics / days with content 三个大数字 + 前 3 topic 着色大数字
- [x] 4.5 Bento Grid — 左列 3/5：Overview 卡 / **Top Stories by Topic** 卡（子卡片按 `topicCounts` 降序，每 topic 2–4 条 story，story 行 `▲ score` badge + title + oneLiner + sources meta）/ Key Reads 卡
- [x] 4.6 Bento Grid — 右列 2/5：Trending Topics 卡 / Topic Spread 卡（含 legacy 半透明标注）/ Daily Logs 卡（7 天链接 → `/ai-daily/YYYY-MM-DD/`）
- [x] 4.7 Footer：条目统计 mono 行 + `Powered by DeepSeek`

## 5. CI 集成

- [x] 5.1 `.github/workflows/sync-ai-daily.yml` 在 `Run AI Daily pipeline` 后加 `Generate AI Daily weekly digest` step
- [x] 5.2 `Check for changes` step 的 `git add` 扩展到 `profile-data/ai-daily/ profile-data/ai-daily-weekly/`
- [x] 5.3 `Commit` message 更新为 `data(ai-daily): automated daily + weekly digest [skip ci]`
- [x] 5.4 Summary step 加一行 weekly digest 状态（list ai-daily-weekly/*.json 最近 4 个）

## 6. 验证

- [x] 6.1 `npm run type-check` 无错误
- [x] 6.2 `npm run lint` 本次新增/修改文件 clean（预先存在的 43 个问题全部在无关文件）
- [x] 6.3 `npx next build` SSG 成功生成 `/ai-daily/weekly/2026-W16/`
- [x] 6.4 本地 `npm run dev` 手动验证：`/ai-daily` 显示 banner、`/ai-daily/weekly/2026-W16/` 渲染正确（overview / topStoriesByTopic 8 桶 / trending / key reads / daily logs 全部有内容）
- [x] 6.5 URL post-validation 日志：W16 fallthrough 0 次（0 个 URL 修复触发，远低于 <15% 目标）
- [x] 6.6 ROADMAP.md：AI Daily P1 的 `📐 Weekly digest for AI Daily` 改 `✅`，追加落地摘要（+ 顶部 Last updated 摘要同步）
