# STARS 模块问题诊断报告

- 归档日期：2026-04-17
- 触发背景：用户反馈
  1. `http://localhost:3001/stars/` 每日行不包含 X 的内容
  2. `http://localhost:3001/stars/people/karpathy/` 内容未按时间排序，且不支持筛选
- 本文件是**诊断 + 进度追踪**（最初只做诊断，后续在 2026-04-21 逐项修复）。
- 相关代码基准：`master` 分支 `HEAD`（2026-04-17 的快照）。

---

## 进度追踪

### 2026-04-21 · 第一轮修复（已合并到 master）

| 项目 | 状态 | 主要改动文件 |
|---|---|---|
| C3 · personMap 前缀协议对齐 | ✅ | `lib/people.ts`、`pages/stars/[date].tsx`、`components/stars/{RepoCard,BlueskyPostCard,XPostCard,CoStarredBlock}.tsx` |
| B1 · `/stars/` 列表补全 X 入口 | ✅ | `pages/stars.tsx` |
| B2 · Top Signals 对 X 的 title/icon 错位 | ✅ | `pages/stars.tsx` |
| H1 · stars 主列表 meta description / STATUS 文案陈旧 | ✅ | `pages/stars.tsx` |
| C5 · `PersonActivity.xPosts?` 可选性收敛 | ✅ | `lib/people.ts`（归一化 + 改成必填） |
| C1 · People 详情页按时间倒序 | ✅ | `lib/social-feeds.ts`（StarredRepo.starredAt?）、`scripts/generate-people-data.ts`（回填 starredAt）、`pages/stars/people/[handle].tsx`（getSortTime + 稳定排序） |
| C2 · People 详情页加 Source 筛选 UI | ✅ | `pages/stars/people/[handle].tsx` |
| A2 · `/stars/{date}` Time 模式真实按时间排序 | ✅ | `pages/stars/[date].tsx` |
| A3 · YouTube 卡片补 tag 渲染 | ✅ | `pages/stars/[date].tsx` |
| A4 · Blog 增加可选 tags + Topic 过滤不再误伤 blog | ✅ | `lib/social-feeds.ts`、`pages/stars/[date].tsx` |
| A5 · YouTube description 按词边界智能截断 | ✅ | `pages/stars/[date].tsx`（新增 `smartTruncate`） |
| A6 · Topic×Source 空态提示 | ✅（随 A4 间接解决） | `pages/stars/[date].tsx` |
| F1 · RSS feed 扩展覆盖 X / YouTube / Blog | ✅ | `scripts/generate-stars-rss.ts`（整体重写） |

**数据回填提醒**：`StarredRepo.starredAt` 是本轮新增字段，现有 `profile-data/people-activity/*.json` 需重跑
`npx tsx scripts/generate-people-data.ts` 才会写入。未回填前 stars 会稳定沉到列表尾部（不会乱序）。

### 仍未处理（未来单独排期）

| 项目 | 原因 |
|---|---|
| B3 · TagCloud 对 X 可视化 | 非阻塞，UI 微调 |
| C4 · `PersonActivity.stars` 真实 `starred_at`（秒级精度） | 需抓取脚本支持 GitHub `Accept: application/vnd.github.star+json` 并回填历史数据 |
| C6 · `getHandleToPersonMap` 覆盖 YouTube/Blog 作者 | key 空间差异大（channelTitle vs displayName），需要更谨慎的匹配策略 |
| D2 · Timeline 分组 key 使用 `sortTime` 跨日对齐 | UX 影响需再评估 |
| E1 · Weekly Digest schema 扩展覆盖 X/YouTube/Blog | 需重构 digest 生成脚本 + AI prompt |
| E2 · "当前周排除" 依赖时间 | 当前行为合理 |
| F2 · RSS `MAX_ITEMS` 改为 item 粒度 | 低收益 |
| G2 · `getTopHighlights` engagement 口径不均衡 | 需要体验调参 |
| G3 · `process.cwd()` 双路径兜底重复 | 纯重构 |

---

## 目录

- [A. 日报详情页 `/stars/{date}/`](#a-日报详情页-starsdate)
- [B. Stars 主列表 `/stars/`](#b-stars-主列表-stars)
- [C. People 详情页 `/stars/people/{handle}/`](#c-people-详情页-starspeoplehandle)
- [D. Timeline 页与 Card 组件](#d-timeline-页与-card-组件)
- [E. Weekly Digest `/stars/weekly/{week}/`](#e-weekly-digest-starsweeklyweek)
- [F. RSS Feed `/stars/feed.xml`](#f-rss-feed-starsfeedxml)
- [G. 数据/lib 层](#g-数据lib-层)
- [H. SEO / Meta](#h-seo--meta)
- [总结：优先级建议](#总结优先级建议)

---

## A. 日报详情页 `/stars/{date}/`

### A1. 【高】`x` 类型内容在日报详情页被"视觉吞噬"
- 文件：`website/pages/stars/[date].tsx` L256–316：已为 `item.type === 'x'` 实现渲染分支（`ItemCard`），并统计了 `xCount`/`xPosts`（L458、L471–478），从行为看**应能展示 X**。
- `profile-data/x-signals/` 存在 `2026-04-14.json`、`2026-04-15.json` 且 `getFeedByDate` 正确合并 `xPosts`（`social-feeds.ts` L466）。
- 真正导致用户"看不到 x"的更可能根因是下面 B1/B2：列表入口 `/stars/` 根本没有给出"该日有 X 内容"的视觉线索、没有 X 筛选；`itemCount` 的分项 UI 没把 X 纳入。用户在进入详情页前就已经以为"没 x"。

### A2. 【中】"Sort by Time" 并不是真正按时间排序
- 文件：`website/pages/stars/[date].tsx` L492–505。`sortMode === 'time'` 时直接用 `filteredItems`（保留原数组顺序）。但该数组顺序是 `getFeedByDate` 里写死的 `[...github, ...bluesky, ...x, ...youtube, ...blog]`（`social-feeds.ts` L466），与真实时间无关。
- 用户看到的 "Time" 排序实际上是"按来源分组"，与 Bluesky/X 的 `createdAt`、YouTube 的 `publishedAt`、Blog 的 `publishedAt` 都不挂钩。

### A3. 【中】YouTube 分支缺少 tag 列表渲染
- `ItemCard` 中，Bluesky / X / GitHub 都渲染了 `item.tags`（L119–128、L176–186、L296–305），**YouTube 分支没有**（L213–217）。
- 数据侧 `loadYouTubeVideos` 已做 `tags: video.tags ?? []`（`social-feeds.ts` L294）。

### A4. 【低】Blog 分支没展示 `tags`，且 `BlogPost` 接口也无 `tags` 字段
- `social-feeds.ts` L56–65 `BlogPost` 没 `tags`，但过滤逻辑 L485 使用 `'tags' in item ? (item.tags ?? []) : []`。
- 选中某 Topic 后，Blog 永远被过滤掉（即使 blog 实际涉及该 topic 也无法命中）。一致性问题。

### A5. 【低】YouTube description 粗暴 `.slice(0, 150) + '...'`
- L211。对长 description 会拦腰截断；karpathy 视频 description 带大量链接和章节标记，截断结果很丑。

### A6. 【低】`Topic` × `Source` 组合过滤的空态提示不够细
- 选 `source=blog` 再选 topic 时，由于 A4 永远 0 结果，只会弹 `"No content matches criteria."`；实际上 blog 没有打 tag，不该和 topic 联动。

---

## B. Stars 主列表 `/stars/`（与反馈 #1 最直接相关）

### B1. 【高】列表完全遗漏 X 相关的所有 UI
文件：`website/pages/stars.tsx`
- L62–67 `hasSources` 只列了 `github / bluesky / youtube / blog`，**没有 `x`**。
- L132 筛选按钮 `['all','github','bluesky','youtube','blog']`，**没有 X 按钮**。
- L70–78 `filteredDates` 的 filter 分支同样没有 `x` 分支。
- L255–259 每行 ACTIVITY_METRICS 图标列表只画了 github/bluesky/youtube/blog 四种计数图标，**完全忽略 `item.xCount`**。

结论：用户在 `/stars/` 上看日期行"只有 4 个图标"，感觉 X 不存在；而 `DailyFeedSummary.xCount`（`social-feeds.ts` L143、L446）已经有数据。

### B2. 【中】Top Signals（Highlights）对 X 的处理有两处错位
`stars.tsx` L178–199（消费 `getTopHighlights`）：
- L179–181 `title`/`url` 分支没有 X 专支：X 走 `else → (hl.item as any).title`，而 `XPost` 没有 `title`，**标题会渲染成 `undefined`**。
- L182 `stats` 同理没有 X 专支，X 走 else 返回空字符串。
- L190–191 `icon` 分支也没有 X，X 掉到 `FileText` 里（被画成 Blog 图标）。

注：`social-feeds.ts` L755–762 `getItemEngagement` 已对 X 做处理，所以 X 有机会进 Top，但进去之后页面展示错乱。

### B3. 【中】TagStats 已含 X 标签，但列表页没做 X 分桶可视化
- 观察层面的小缺口，不阻塞，但和 "X 不被看见" 方向一致。

---

## C. People 详情页 `/stars/people/{handle}/`（与反馈 #2 直接相关）

### C1. 【高】合并后的 `allItems` 完全没有时间排序
文件：`website/pages/stars/people/[handle].tsx` L39–45：
```ts
const allItems: FeedItem[] = [
  ...activity.stars, ...activity.posts, ...activity.videos, ...activity.blogs, ...activity.xPosts
]
```
- 直接 `concat`，**没有任何 `.sort`**。
- 渲染时 L145 `allItems.map(...)` 原样输出 → `karpathy` 页面先把 YouTube（2022–2025 老视频）列前面，再列 X 帖（2026），体感就是"没按时间排"。
- 理想做法：每类有自己的"时间字段"（注意：`stars` 大多无 `starredAt`、`posts.createdAt`、`videos.publishedAt`、`blogs.publishedAt`、`xPosts.createdAt`）。应像 `getAllFeedItems` 那样做 `sortTime` 归一化再倒序。

### C2. 【高】PersonDetail 页**完全没有筛选 UI**
- 整个页面就是"头像 + 兴趣总结 + sparkline + 一个大列表"。没有 Source 过滤（GH/Bluesky/X/YouTube/Blog）、没有 Topic 过滤、没有分页/Load more。
- 对照 `/stars/{date}/` 和 `/stars/timeline/` 都有 Source filter，这里缺失明显。
- 与用户反馈"不支持筛选"吻合。

### C3. 【高】`getHandleToPersonMap` key 前缀协议不一致，导致日报页/时间轴上的"作者名→详情页"跳转大面积失效
- `lib/people.ts` L149–166 生成 `map["github:<h>"] = id`、`map["bluesky:<h>"] = id`、`map["x:<h>"] = id`。
- 消费端只有 X 遵守前缀协议：
  - `stars/[date].tsx` L103（GitHub `starredBy`）：`personMap[trimmed.toLowerCase()]` **没加 `github:` 前缀** → 永远查不到。
  - `stars/[date].tsx` L157（Bluesky author）：`personMap[item.author.handle.toLowerCase()]` **没加 `bluesky:` 前缀** → 永远查不到。
  - `stars/[date].tsx` L276（X）：`personMap[\`x:${item.author.handle}\`]` ✅ 唯一正确。
  - `components/stars/RepoCard.tsx`、`components/stars/BlueskyPostCard.tsx` 同类错误的可能性很高（见 D1，需核查）。
- 结果：日报页里 GitHub 和 Bluesky 的作者名不会变成链接，用户点不到 people 详情页。

### C4. 【中】`PersonActivity.stars` 没有时间维度，无法真正"按时间排序"
- `PersonActivity`（`people.ts` L25–34）里 `stars: StarredRepo[]` 来自 `loadGitHubStars`，而 `StarredRepo`（`social-feeds.ts` L6–20）没有 `starredAt`/date 字段。
- 归并到 timeline 时没有 time key 可排 → 只能退回"按日文件名"；但 `activity.stars` 是合并数组，也丢了 per-file 的日期来源。
- 这是 C1 排序修复的深层阻塞点：需在 `profile-data` 构造阶段补 `starredAt`，或在 `PersonActivity` 里同时保留 `(star, date)` 对。

### C5. 【低】`PersonActivity.xPosts` 仍是 `optional`，前端处处 `xPosts || []`
- `people.ts` L31：`xPosts?: XPost[]`。fallback 散落在 L47、L126、L168。
- 数据写入端已稳定输出，建议收敛成必填或在 `loadPersonActivity` 里填默认值。

### C6. 【低】`getHandleToPersonMap` 不含 `youtubeChannel`、`blogAuthor`
- 即便前缀协议修正后，YouTube 作者名和 Blog 作者名也无法解析成 people 链接。

---

## D. Timeline 页与 Card 组件

### D1. 【中】需核查 `RepoCard` / `BlueskyPostCard` / `XPostCard` 对 `personMap` 的 key 前缀是否一致
- Timeline 页 L32–34 把 `personMap` 传给这些 Card。如果这些 Card 内部也像 `[date].tsx` 那样**不带前缀**查，就会整片 person-link 失效。
- 这是 C3 的衍生检查项，未在本次诊断里逐个展开，留作后续跟进。

### D2. 【低】Timeline 分组 key 用 `tItem.date`（YYYY-MM-DD），不按 `sortTime`
- 同一天跨来源"看起来"还好，但按 `createdAt` 真实排序和日期标签不完全对应（尤其 Bluesky 凌晨跨日）。

---

## E. Weekly Digest `/stars/weekly/{week}/`

### E1. 【中】Weekly 完全不反映 X 的信号
- `WeeklyDigest` 数据类型（`social-feeds.ts` L90–113）只有 GitHub + Bluesky 维度：`notableRepos`、`keyDiscussions`、`stats.totalPosts`。X、YouTube、Blog 都没进入 digest stats/展示。
- 属于数据生成脚本层面问题，前端 `[week].tsx` 只是如实渲染。影响面：用户在 `/stars/` 看到的 `WeeklyDigestAlert` 和 `/stars/weekly/..` 的 Authors/Posts 统计都偏少。

### E2. 【低】`getAllWeeklyDigests` 用"当前 ISO 周排除"逻辑
- 依赖当前时间，在 build 缓存下刚跨入新周时"最新完整周"可能短暂缺席。

---

## F. RSS Feed `/stars/feed.xml`

### F1. 【高】RSS 完全缺失 X / YouTube / Blog
文件：`scripts/generate-stars-rss.ts`
- L6–9 只读 `github-stars` 和 `bluesky-posts` 两个目录。
- L49–96 只定义了 `StarData` 和 `PostData`。
- L112–146 `buildItemDescription` 只处理 GitHub + Bluesky。
- L38 `collectAllDates` 只扫这两个目录 → 如果某一天**只有 X 内容没有 github/bluesky**，整天被 RSS 完全忽略。
- Feed Title 仍写 "GitHub starred repos and Bluesky posts"，描述未更新。

### F2. 【低】`MAX_ITEMS = 30` 基于日期粒度，不是 item 粒度
- 跨平台爆发日被挤出的可能性小但存在。

---

## G. 数据/lib 层

### G1. 【中】`getAllFeedDates` 的 `itemCount` 在前端没被正确使用
- `social-feeds.ts` L441 `itemCount: counts.github + counts.bluesky + counts.blog + counts.youtube + counts.x` 本身是对的。
- 但 `stars.tsx` 列表行没有一处使用 `itemCount`，而是再次独立展示 4 个分项图标却漏掉 X，形成"总量对、分项 UI 不对"的分裂。

### G2. 【低】`getTopHighlights` 的 engagement 口径不均衡
- Bluesky：`like + repost`（没算 reply）
- X：`like + retweet`（没算 reply）
- YouTube：`viewCount`（数量级大得多）
- Blog：`highlights ? 10 : 0`（粗糙）
- GitHub：`stargazersCount`（累积量）
- 结果：YouTube/GitHub 天然占优，X/Bluesky/Blog 基本进不去 top。

### G3. 【低】多处 `process.cwd()` 双路径兜底（`../profile-data` vs `./profile-data`）已在各 lib 里重复实现 6+ 次
- 后续加目录容易漏写。

---

## H. SEO / Meta

### H1. 【低】文案信息陈旧
- `/stars/` 的 meta description 只提到 "GitHub repos and Bluesky posts"，没覆盖 X/YouTube/Blog。
- `feed.xml` 的 `<description>` 同样陈旧。

---

## 总结：优先级建议

### P0（影响用户可见行为，且与反馈直接对应）
- **B1**：`/stars/` 列表完全缺失 X（#1 的直接根因）
- **C1**：`/stars/people/{handle}/` 时间未排序（#2 左半）
- **C2**：`/stars/people/{handle}/` 缺筛选 UI（#2 右半）
- **C3**：`personMap` 前缀协议不一致 → 日报页作者名普遍无法点击

### P1（数据完整性 / 一致性）
- **A2**：Time 排序名不副实
- **B2**：Top Signals 对 X 的标题/图标错误
- **F1**：RSS 缺失 X / YouTube / Blog
- **E1**：Weekly Digest 数据结构未覆盖 X/YouTube/Blog

### P2（打磨项）
- A3、A4、A5、A6、C4、C5、C6、D1、D2、G2、G3、H1 等

---

## 附：后续动手建议

- 从 UI 层能低风险快速收敛的一组：**C3（前缀协议）+ B1（列表 X 入口）+ C1（人物页排序）+ C2（人物页筛选）** 可一并修复，立刻覆盖用户当前看到的两个问题。
- `F1`（RSS 覆盖 X/YouTube/Blog）与 `E1`（Weekly Digest 扩展）涉及脚本/数据 schema 变更，建议独立任务。
- `C4`（给 `PersonActivity.stars` 补时间字段）是 `C1` 彻底解决的前置，评估是"折中（只排有 `createdAt`/`publishedAt` 的 4 类，stars 用当前合成字段）"还是"正根（数据层补 `starredAt`）"。
