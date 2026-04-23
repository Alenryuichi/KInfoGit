## Context

AI Daily pipeline（`scripts/ai-daily/fetch-ai-daily.ts`）每天 01:00 UTC 产出 `profile-data/ai-daily/YYYY-MM-DD.json`，结构为 `DailyDigest { date, itemCount, sections[], aiSummary? }`，每个 section 下的 `NewsItem` 已带 `score (0–10)` / `focusTopics[]`（v2 词表 8 项）/ `tags[]` / `sources[]`。数据层 `website/lib/ai-daily.ts` 提供 `getAllDailyDates()` / `getFilteredDailyDigest()`（MIN_SCORE=5）等。

Stars 侧的 `scripts/generate-weekly-digest.ts` + `website/pages/stars/weekly/[week].tsx` 在 4/22 完成两轮打磨：E1 URL post-validation（`isRealUrl()` + `videoByUrl`/`repoByName` 白名单 + by-title 回填）、Bento Grid 布局、prev/next 导航、7 天 Daily Logs 跳转。本 change 的核心是**复用 stars 那套骨架的 60–70%**，不是从零写。

**约束**：
- SSG only（Next.js Pages Router, `output: 'export'`）——周报必须在构建期落地为 JSON
- 复用 `DEEPSEEK_API_KEY`，不引新模型
- GitHub Pages 部署，无运行时 API
- 不动 `ai-daily.ts` 现有导出（MIN_SCORE / getFilteredDailyDigest 等保持行为）

## Goals / Non-Goals

**Goals：**
- 每周一自动生成上一个 ISO 周的 AI Daily 周报（周一 UTC 01:00 cron 已经在跑，顺势挂上）
- 按 **focusTopic 分桶** 呈现"本周 Top Stories by Topic"，这是 AI Daily 相对于 stars 的**独特信息结构**——不是简单复刻 `notableRepos/notableVideos/notableBlogs`
- 列表页有"本周回顾"入口，不必逐天点开
- 复用率 ≥ 60%（脚本骨架 / 页面 Bento Grid / data layer 模式）

**Non-Goals：**
- 不做月报（本 change 只做周）
- 不做 RSS/邮件推送
- 不做运行时筛选（周报页是纯静态）
- 不改 AI Daily 每日 pipeline 的打分或 focusTopic 词表
- 不合并 stars 与 ai-daily 的 `weekly-digests/` 目录（schema 差异大，合并反而增加判别成本）

## Decisions

### 1. 周报 JSON schema（与 stars weekly digest 刻意不同）

```typescript
interface AiDailyWeeklyDigest {
  week: string                      // "2026-W16"
  dateRange: { start: string; end: string }
  overview: string                  // 3-4 段叙事，引用具体 item 标题
  topStoriesByTopic: Array<{        // ★ 核心创新，AI Daily 特有
    topic: string                   // focusTopic id，如 "coding-agents"
    topicLabel: string              // UI label，如 "Coding Agents"
    stories: Array<{
      title: string
      url: string
      oneLiner: string              // 一句话为什么值得关注
      score: number                 // 原始 score，供 UI 显示
      sources: string[]             // 源 name 列表
    }>
  }>
  trendingTopics: Array<{           // 跨 topic 的文字性 trend（保留 stars 里这一字段）
    topic: string
    description: string
  }>
  keyReads: Array<{                 // 3-5 条"本周最该读的长内容"（研究/深度博客）
    title: string
    url: string
    summary: string
    why: string                     // 为什么值得花时间
  }>
  stats: {
    totalItems: number              // 一周所有 section 条目数（score ≥ MIN_SCORE=5 过滤后）
    uniqueTopics: number            // 本周出现 ≥1 条的 focusTopic 数
    daysWithContent: number         // 7 天里有数据的天数
    topicCounts: Record<string, number>  // 每 topic 本周命中数
  }
}
```

**与 stars `WeeklyDigest` 的差异点说明**：
- 去掉 `notableRepos/notableVideos/notableBlogs/notableXPosts/keyDiscussions/crossReferences`（这些是"who 做/说了什么"的视角，AI Daily 是"发生了什么事件"视角）
- 新增 `topStoriesByTopic`（以 focusTopic 为一级分组，正好对齐 `/ai-daily/[date]` 顶部的 filter chips）
- `keyReads` 替代 `notableBlogs`——不限定源是 blog，只要是长内容（研究论文、深度文章）都可入

### 2. 数据管线：按 focusTopic 分桶 + score 截断

```
7 个 profile-data/ai-daily/YYYY-MM-DD.json
  ↓ loadWeekAiDailyContent(dates)
    - 展开每个 DailyDigest.sections[].items
    - filter: score >= MIN_SCORE_WEEKLY (= 6.0，比日报 5.0 严一档)
    - URL canonical 去重（同一 URL 只保留 score 最高的一条）
  ↓ bucketByTopic(items)
    - 每 focusTopic 收集命中 items，按 score desc 排序
    - 每桶截断 top 8（进 prompt 的上限，避免把 planning 这种低频桶挤没）
  ↓ buildPromptSections(bucketed)
    - 每 topic 一个 === TOPIC: coding-agents (52 items, top 8 shown) === 段
    - 每行 `- [score] <title> — <oneLiner/summary> <url>` （URL 在 angle brackets，同 stars）
  ↓ DeepSeek → AiDailyWeeklyDigest JSON
  ↓ URL post-validation（复用 stars E1 的 isRealUrl + by-title 回填）
  ↓ 写 profile-data/ai-daily-weekly/YYYY-WXX.json
```

**为什么 MIN_SCORE_WEEKLY=6 而非沿用 5**：stars E1 观察 `score≥7` 占比 ≈ 38% 已足够支撑 top-N 选择；AI Daily 每周 370 条里 `score≥5` 可能有 ~250 条，进 prompt token 太贵。6.0 大约对应每周 ~120–150 条入选，分 8 桶后每桶平均 15–18 条，再截 top 8 刚好。

### 3. 周边界：沿用 stars 脚本的 `collectWeekDays(week)` 逻辑

ISO 8601 周一-周日，UTC 计算。**不引入 `getWeekBoundsInShanghai`**——stars / ai-daily 都按 UTC 日期文件名聚合，Asia/Shanghai cron（09:00 京）实际落的文件就是 UTC 当天，对齐无歧义。Code 周报那边引入 Shanghai bounds 是因为它要做 GitHub API 的 `since/until` 精确到时刻，AI Daily 是"按日文件聚合"不存在这个问题。

### 4. URL 护栏：复用 stars E1 的完整方案

脚本里实现：

```typescript
const isRealUrl = (u: string): boolean =>
  typeof u === 'string' &&
  /^https?:\/\//.test(u) &&
  !u.endsWith('/...') &&
  !/\/\.\.\.$/.test(u)

// 白名单 = 本周所有入 prompt 的 item URL
const urlWhitelist = new Set(weekItems.map(i => i.url))
const itemByTitle = new Map(weekItems.map(i => [i.title.toLowerCase(), i]))

// 对 topStoriesByTopic 的 stories / keyReads 做同样的 by-title 回填
```

**这是刚需不是可选**——AI Daily 很多 item 的 URL 带长 query string（`?utm_source=...`），LLM 更容易截断或幻觉。

### 5. 数据层 `website/lib/ai-daily-weekly.ts`

完全照搬 stars 的 `social-feeds.ts` 那 5 个函数的模式：

```typescript
import { resolveProfileDataPath } from './profile-data-paths'

function getDir() { return resolveProfileDataPath('ai-daily-weekly') }

export function getAllAiDailyWeeklies(): AiDailyWeeklySummary[]  // summary = {week, dateRange, stats}
export function getAiDailyWeeklyByWeek(week: string): AiDailyWeeklyDigest | null
export function getAdjacentAiDailyWeeks(week: string): { prev, next }
export function getLatestAiDailyWeekly(): AiDailyWeeklyDigest | null  // 供列表页 banner
```

**不 extend `ai-daily.ts`**——ai-daily.ts 是"daily"域，weekly 独立文件语义更清晰。

### 6. 列表页 banner（最小干扰式）

`/ai-daily` 当前是"终端风黑屏 hacker terminal"美学。周报 banner 插在 header 卡片和日志列表之间，**保持同款 mono 字体 + 蓝色高亮**，不引入 stars 那种 Bento Grid 的 purple accent（跨板块视觉一致性反而会造成混淆）。形态：

```
┌─────────────────────────────────────────┐
│ [WEEKLY]  2026-W16  ◉ Apr 13 – Apr 19  │
│ "This week: 8 focus topics, N signals.  │
│  Top: coding-agents (52), agent-harness │
│  (78). Sam Altman vs Anthropic drama... │
│  [Read full digest →]"                   │
└─────────────────────────────────────────┘
```

只展示 overview 前 200 字 + 入口链接。不做 expand/collapse，不分散列表页注意力。

### 7. 详情页 `/ai-daily/weekly/[week]`

Bento Grid 结构**借用 stars 的 left 3/5 + right 2/5 骨架**，但内容槽重排：

- **Left 3/5**：
  - Overview 卡片（蓝色 accent，不是 stars 的 purple）
  - **Top Stories by Topic**（按 `stats.topicCounts` desc 排序展示，每 topic 一个子卡片带 2–4 条 story）← 核心新内容
  - Key Reads 卡片
- **Right 2/5**：
  - Stats 卡（total / topics / days）
  - Trending Topics 卡
  - **Daily Logs 卡**（7 个 `/ai-daily/YYYY-MM-DD` 链接，复用 stars 那个）

不照抄 stars 的 CoStarredBlock/personMap（那些是 stars 域的 entity）。

### 8. CI 集成：在现有 workflow 末尾加一步

`.github/workflows/sync-ai-daily.yml` 在 `Run AI Daily pipeline` 之后加：

```yaml
- name: Generate AI Daily weekly digest
  env:
    DEEPSEEK_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}
  run: npx tsx scripts/generate-ai-daily-weekly-digest.ts
```

脚本天然幂等（存在即跳过，除非 `--force`），每天跑一次，实际产生新文件只在周一。commit step 的 `git add` 要同时覆盖 `profile-data/ai-daily/` 和 `profile-data/ai-daily-weekly/`。

## Risks / Trade-offs

- **DeepSeek 对 8 个 topic 分桶的 prompt 理解**：给的 prompt 里要明确"Each topic section is a separate group. Do NOT merge topics in your `topStoriesByTopic` output."。做法参考 stars prompt 里对 `source` 字段的强约束（"Set source to 'bluesky' or 'x' based on where..."）。
- **URL 幻觉率**：AI Daily item URL 比 stars 更杂乱（techcrunch/arxiv/substack/twitter/github 混排），E1 的 by-title 回填可能命中率下降。对策：生成后日志里打印 fallthrough 率，若 > 15% 则收紧 prompt。
- **周首不齐**（W15 只有 4 天数据）：设 `daysWithContent ≥ 4` 门槛，数据不足的周不生成（写一行 `skipped: insufficient data`）；不写半残的 digest。
- **列表页 banner 位置打架**：AI Daily 列表页上部已有 `[Metrics →]` 按钮。banner 要放在 header 和 `[Metrics →]` 之间，和 metrics 按钮**互不遮挡**（两者都是入口，banner 更显眼的处理靠 dashed border + 蓝色 accent）。
- **复用 vs 抽象**：**不把 stars/ai-daily 的 weekly 逻辑抽成共用 lib**。两者 schema 差异大，强行抽象会产生"既不像 A 也不像 B"的中间层。保持双份代码（~200 行各一份），未来再出第三个周报板块时再考虑抽象。
