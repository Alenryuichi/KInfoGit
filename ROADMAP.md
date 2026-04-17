# ROADMAP — AI Daily / Code / Stars

> Last updated: **2026-04-17** — _本次变更：Stars P0 全部关闭（空 URL 验证无问题 → 降级护栏；YouTube topic filter 管线打通 + 历史 30 条 backfill）；**P1 "Co-Starred 视图" 落地并双端接入**；**P1 "Stars 打分" 落地，历史 21 条 backfill 分布 2–8/10**；**AI Daily P0 "Horizon / HN 当日可用性" 关闭（换直连 HN Algolia front_page API，去掉对 markdown 文件节奏的依赖）**；**Code benchmarks 退役 BigCodeBench (frozen 366d) + EvalPlus (frozen 478d)，数据冻结为历史存档、live pipeline 收敛到 Arena / Aider / SWE-bench / LiveCodeBench 4 源**_
>
> 本文档只覆盖站点上三个**持续更新型内容板块**（AI Daily、Code、Stars）的演进规划。
> 简历、博客、Work 等静态内容演进请见各自的 openspec change；构建/部署流程见 `docs/guides/DEPLOYMENT_GUIDE.md`。
>
> 约定：
> - ✅ = 已上线跑通  · 🚧 = 进行中  · 📐 = 已设计未开工  · 💡 = 想法待验证
> - 每个板块的"现状"只列**影响用户能看到什么**的能力，不列内部细节
> - 具体技术方案用 `openspec/changes/<id>/proposal.md` 的链接指向，避免重复

---

## 📰 AI Daily — `/ai-daily`

**定位**：每日 AI 圈新闻 + 研究精选，带 LLM 打分 / 去重 / 分类 / topic 标签。读者一天花 3 分钟看完即可对齐 AI 行业动态。

### 现状 (2026-04-17)

- ✅ 每日 cron pipeline（5 源抓取 → dedup → DeepSeek 打分 → 写 `profile-data/ai-daily/YYYY-MM-DD.json`）
- ✅ 日报详情页 `/ai-daily/[date]`（headlines / research / engineering / insights 分区 + 顶部 focusTopic filter chips）
- ✅ **v2 focus-topic 词表**（`coding-agents` / `agent-harness` / `context-engineering` / `post-training` / `model-release` / `evals` / `planning` / `tool-use`）+ 旧 v1 anchor 降级展示
- ✅ **Topic Health dashboard** `/ai-daily/metrics`（7/14/30d 命中、status 分类、recent examples、legacy 区）
- ✅ Observability metrics：每日 run 落 `_meta/YYYY-MM.json`（items/dedup/scoring/anchors 计数 + 异常告警）
- ✅ **扩抓取源到 10 RSS + 4 Tavily wide-funnel + Exa allowlist + GitHub trending**（首次在 4/17 重跑跑通，raw 36→65, tagged 39%→56%）

### 近期路线 (4-6 周)

#### P0 — 稳定性与观测收尾

- 🚧 **v2 词表观察期**（7 天）：等到 4/24 回看 7d 命中分布，定是否淘汰 `planning`（目前 0 命中），是否再合并 `post-training`+`model-release`（两者常在同一条 release 新闻里）
- 📐 **OpenAI RSS 403 修复或下线**：当前换浏览器 UA 后 curl OK 但 Node fetch 仍 403，疑 Cloudflare TLS fingerprint。两条路：(a) 用 `undici` 自定义 TLS ciphers；(b) 接受现状，因为 Exa allowlist 已覆盖 `openai.com` → **倾向 (b)，1 周后若 Exa 漏采再回头**
- ✅ **Horizon / HN 源当日可用性**（2026-04-17 落地）：原依赖 `tools/horizon/repo/data/summaries/horizon-YYYY-MM-DD-en.md`，文件生成节奏不稳（4/17 当天没生成 → HN=0）。已换成直连 HN Algolia `front_page` API（`scripts/ai-daily/sources/hn.ts`，无 key / 无配额 / ~30 条 live hits），`priorScore = clamp(points/500, 0, 1)`，下游 `sourceType='horizon'` 字段保持不变以兼容历史 metrics / dashboard。旧 markdown parser 保留为 fallback 分支。Smoke test 30 条，顶部全 AI（Claude Opus 4.7 / Qwen3.6 / Codex）。

#### P1 — 内容质量与发现力

- 📐 **Topic discovery 面板**（Topic Health v3）：扫所有 item 的自由 tags → 按频次聚类 → 展示 "Top 10 frequent unsorted tags this week"，人工决定哪个晋升为 focusTopic。目标是形成**自动提示"该加什么主题"**的闭环，不再靠肉眼翻数据。
- 📐 **Weekly digest for AI Daily**：参考 stars-weekly-digest 模式，周末生成 `/ai-daily/weekly/YYYY-WXX/`，用 DeepSeek 写出"本周 3 条最值得关注"。比 7 条日报堆在一起的信息密度高得多。
- 💡 **真正的中文/英文分流**：现在 `translations` 字段已经存在，但列表页仍混排。可考虑给用户一个开关，或者双列展示。优先级不高。

#### P2 — 内容扩展

- 💡 **加 Anthropic / DeepMind 官方 feed**：Anthropic 确认无 RSS（4/17 验证），DeepMind 有 `https://deepmind.com/blog/feed.xml` 但节奏慢，性价比待评估
- 💡 **Reddit `/r/LocalLLaMA` + `/r/MachineLearning`**：社区信号，但噪声大，需要专门的 scoring 权重调整

### 观察指标（每月回看）

- 每日 final items 中位数（当前 ≈ 45-55，<30 说明抓取或 dedup 异常）
- focusTopic 命中率（当前 56%，目标 ≥ 50%）
- v2 词表内无 "dead" topic（30d < 6 视为 dead，除 legacy 外全部绿）
- `_meta` 月度文件里无"连续 3 天异常告警"的 streak

---

## 💻 Code — `/code`

**定位**：AI Code 工具生态的系统化追踪。每周一份周报 + 随时可查的 benchmark 趋势。面向读者："我想知道 Cursor / Claude Code / Copilot 这周发了什么、哪个模型在 SWE-Bench 上最强"。

### 现状 (2026-04-17)

- ✅ 周报列表页 `/code` + 详情页 `/code/[week]`（Tab：编辑器动态 / 模型评测 / 公司博客）
- ✅ Benchmark 独立页 `/code/benchmarks`（Chatbot Arena / Aider / SWE-Bench，含历史趋势）
- ✅ 数据采集：GitHub Releases API + RSS + Tavily + 百炼 WebSearch（已在 `scripts/fetch-code-weekly.ts` 落地）
- ✅ DeepSeek 周报生成层
- ✅ GitHub Actions 工作流（周报每周一次 + 评测每天一次）
- ✅ 主导航 "Code" tab
- ✅ 两次历史迭代：`2026-04-13-code-weekly-more-editors`（覆盖更多编辑器）、`2026-04-13-code-weekly-visualization`（加图表）
- 🪦 **2026-04-17 retired BigCodeBench (frozen 366d) and EvalPlus (frozen 478d) from live pipeline**. 两源 upstream 已事实死亡，再继续抓只是每天把死快照在 health log 里过一遍。数据以 `bigCodeBenchRetiredAt` / `evalPlusRetiredAt` 字段冻结在 `profile-data/benchmarks/latest.json` 作为历史存档；source 文件保留供未来复活或他人复用，但已从 `fetch-benchmarks.ts` 的 import 移除。前端 `/code/benchmarks` 本来就未渲染这两源，用户无感。

### 近期路线 (4-6 周)

#### P0 — 数据健全性

- 📐 **周报去重 + 时间窗收口**：当前偶有周报收到跨 2 周的内容（Tavily `days` 参数不够精确）。统一用 Asia/Shanghai 的 "周一 00:00 ~ 周日 23:59" 硬边界，在聚合层做二次过滤。
- 📐 **Benchmark 数据源健康检查**：Chatbot Arena 前端经常改版导致抓取失败。为 3 个 benchmark 源各写一个 "smoke test"（每天跑，失败即告警），避免读者看到的是上周的缓存数据。

#### P1 — 与 AI Daily 的打通

- 📐 **从 AI Daily 中 "Coding Agents" topic 沉淀到 Code 周报**：刚上线的 v2 topic 有 `coding-agents`（4/17 命中 8 条），这些条目天然是 Code 周报的一级素材。做一个"AI Daily → Code 周报候选池"的流转链路，避免 Code 周报完全重新抓一遍。
- 💡 **周报里加一个 "Editors diff-over-week" 视图**：Cursor / Claude Code / Copilot 本周新 changelog 的对齐视图，比 3 个 Tab 单看更有对比价值

#### P2 — 内容扩展

- 💡 **加 Aider / Cline / Continue / Codeium 独立 release 追踪**（目前只有头部 3-4 个）
- 💡 **LLM coding 能力实战对比**：每周抽一个真实小 PR，用 3 个头部 coding agent 各做一次，给读者看 diff。这是**差异化**内容，但工作量大

### 观察指标

- 每周 `/code/[week]` PV（当前站点尚未埋点，先放 placeholder）
- Live benchmark 源抓取成功率（4 源：Arena / Aider / SWE-bench / LiveCodeBench；目标 ≥ 95%/月。BigCodeBench / EvalPlus 已退役为冻结档，不纳入指标）
- 周报生成耗时（DeepSeek 调用，目标 < 2 分钟）

---

## ⭐ Stars — `/stars`

**定位**：追踪 AI 领军人物（Karpathy / Howard / Kilcher 等）的 GitHub Stars / Bluesky posts / YouTube videos，聚合成"AI 圈风向标"。

### 现状 (2026-04-17)

- ✅ Daily feed 页 `/stars/[date]`（star / bluesky / youtube 三类卡片混排 + **Co-Starred 7 天滚动窗口 signal 卡片**，4/17 上线）
- ✅ 人物 profile 页（每个关注对象独立页面 + 历史数据）
- ✅ Topic filter（按 AI subdomain 过滤，**4/17 起覆盖 star + bluesky + youtube + x 全源**）
- ✅ RSS feed（用户可订阅 `/stars/rss.xml`）
- ✅ Blog-style digest RSS
- ✅ Weekly digest `/stars/weekly/YYYY-WXX/`（已落地 → 见 `stars-weekly-digest` change；**4/17 起 Co-Starred 视图升格为主列 accent 卡片**）
- ✅ YouTube feed 集成（`stars-youtube-feed`）
- ✅ Bluesky posts 已稳定抓取
- ✅ Pagefind 全文搜索已覆盖 stars 条目

### 近期路线 (4-6 周)

#### P0 — 已知缺口

- ✅ ~~**空 URL / 无效卡片的彻底清理**~~：2026-04-17 复查数据（122 条 bluesky posts 全部 URL 有效），`fetch-bluesky.ts` 已从 `handle + uri` 拼 URL，结构性风险消除。**降级为 P2 防御护栏**（见下）。
- ✅ **YouTube → topic filter 管线打通**（2026-04-17）：原 ROADMAP 以为"description 没抓"，实查 30 条 video 的 `description` 平均 2000+ 字符早已落盘。真正缺口是 **YouTube 无 tag 抽取、getTagStats 跳过 youtube**。已修复：
    1. `fetch-youtube.ts` DeepSeek prompt 改为输出 `{highlights, worthReading, tags}`，复用与 bluesky 同一份 `VALID_TAGS`
    2. `YouTubeVideo` interface 加 `tags: string[]`
    3. `loadYouTubeVideos` map 补 `tags: video.tags ?? []`
    4. `getTagStats()` 加 YouTube 分支
    5. 历史 30 条 video 已一次性 backfill tags

#### P1 — 信号质量

- ✅ **Stars 打分**（2026-04-17 落地）：`fetch-stars.ts` 的 DeepSeek prompt 扩展为输出 `score 0-10` + `scoreReason`，采用三维 rubric（freshness / relevance / concreteness）。`StarredRepo` interface 加 `score + scoreReason`；`/stars/[date]` GitHub 卡片加 `▲ N/10` badge（tooltip = scoreReason）+ **Sort: Score / Time 切换**（默认 Score）；`CoStarredBlock` 按 `maxScore` 做次级排序并展示 badge。历史 21 条已 backfill，分布：2–3/10 (7 条 noise) · 5–7/10 (12 条合格) · 8/10 (2 条顶级 MemPalace + gemma-tuner-multimodal)。新抓取的 star 自动打分，已有记录缺 score 时走统一 backfill 分支。
- ✅ **"今天谁被多人 star" 视图**（2026-04-17 落地）：新增 `computeCoStarredRepos` / `getCoStarredForDate`（`website/lib/social-feeds.ts`）+ `CoStarredBlock` 组件（accent/compact 双形态）。`/stars/[date]` 加顶部 accent 卡片（7 天滚动窗口 + ×2/×3 阈值切换），`/stars/weekly/[week]` 把 Cross-Refs 从右列 compact 升格为主列 accent，覆盖完整 ISO 周。当前数据 window=W15 仅 1 条（`mattmireles/gemma-tuner-multimodal`，simonw + minimaxir 共同 star）；关注人增多后自然会更有信号。

#### P2 — 关注列表维护 & 数据护栏

- 💡 **pre-digest 数据校验护栏**（原 P0-1 降级）：在 `generate-weekly-digest.ts` 的 `loadStarsForDate` / `loadPostsForDate` 里 `.filter(x => x.url && x.url.trim())`，防止未来新源引入空字段时悄无声息污染 digest。当前无需修，留作预防。
- 💡 **关注对象的自动增删**：每半年回看谁还在活跃、是否有新的上升人物该加入。做一个"候选人物面板"，按发言量 + 被其他已关注人互动的频次自动提名。
- 💡 **加 X/Twitter signal**：已有 `fetch-x-signals.ts`，但集成到 stars 的路径尚未设计

### 观察指标

- 每日 feed item 数（当前 ≈ 15-30，< 5 说明全平台抓取异常）
- YouTube 抓取 quota（每日 API 调用 < 100 单位）
- Weekly digest 生成成功率
- **Tag 覆盖率**：star / bluesky / youtube 三源各自 "有 ≥1 tag 的条目占比"（4/17 基线：youtube 25/30 ≈ 83%，bluesky / star 待测），目标各源 ≥ 70%
- **Star score 分布**（4/17 基线 n=21）：2–3 (7) · 5–7 (12) · 8 (2)，中位数 6。监测 `score≥7` 占比（当前 ≈ 38%），目标稳定在 30–50%（过低说明 prompt 过严；过高说明 prompt 放水）

---

## 🔗 三板块协同

三个板块不是孤岛，未来 6-12 个月要逐步打通的**跨板块联动**：

```
  ┌──────────────┐   "coding-agents" topic 的高分 items
  │   AI Daily   │────────────────────────────────────────▶┌─────────┐
  └──────────────┘                                          │  Code   │
       ▲                                                    │  周报   │
       │ stars-weekly-digest 里提及的 repo 注入当日 pool    └─────────┘
       │                                                         │
  ┌──────────────┐◀──── 周报中提到的 repo 自动加入 stars ─────────┘
  │    Stars     │
  └──────────────┘
```

**具体联动项（未落地）**：

1. 📐 **AI Daily → Code**：`focusTopic=coding-agents` 的高分 items 自动进入 Code 周报候选池
2. 📐 **Stars → AI Daily**：被 ≥3 个 AI leader 共同 star 的 repo 以独立卡片形式进入当日 AI Daily
3. 💡 **统一 scoring anchors**：三板块各自维护 `scoring-anchors`，未来合并为一份"本站点的分数基准"，避免同一个 repo 在 3 个地方打出 3 个不同分
4. 💡 **统一搜索入口**：Pagefind 已覆盖 stars/blog，下一步覆盖 AI Daily + Code 详情页，实现"一个搜索框查全站"

---

## 📝 维护约定

- 每次完成一项 P0/P1 就在本文件打勾（✅），不删行，保留历史
- 每周五盘点一次：看哪些 🚧 该晋升为 ✅，哪些 📐 该晋升为 🚧
- 每 4 周回看一次"观察指标"小节，有数据异常就开新 change
- **openspec 才是单一来源**：ROADMAP 只做导航，**不复制技术细节**。具体方案写在 `openspec/changes/<id>/proposal.md` + `design.md` 里
