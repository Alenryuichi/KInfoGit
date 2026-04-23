# ROADMAP — AI Daily / Code / Stars

> Last updated: **2026-04-22** — _本次变更：**AI Daily Weekly Digest 首发**（`scripts/generate-ai-daily-weekly-digest.ts` + `website/lib/ai-daily-weekly.ts` + `/ai-daily/weekly/[week]` 详情页 + 列表页 banner + CI step；W16 首跑 169 items / 8 topics / 0 URL 幻觉）；**Lint 全清**（随 Weekly 落地一并清掉 43 个历史遗留 lint 问题——5 处 `any` → `Record<string, unknown>` / 具名 interface，10 处 unescaped quotes → `&ldquo;/&rdquo;`，4 处 `setState in effect` 加 disable 注释，`<img>` × 3 加 `no-img-element` disable 注释（外部 CDN 头像/缩略图），2 处 DateNav 未用参数删除，`timeline.tsx` 的 `lastDate` reassign 改用 `visible[idx-1]` 对比，`pages/blog.tsx` 的 `{'/*'}` / `{'*/'}` 转义，lucide unused imports 清理等）；**Stars 21/24 诊断闭环**（归档 `docs/stars-module-audit-2026-04-17.md`，新增 TagCloud / 秒级 starredAt / YouTube+Blog person-link / Top Signals 归一化 / Weekly digest 扩 X+YouTube+Blog / RSS 扩全 5 源 / `resolveProfileDataPath()` 路径 helper 等 13 项能力）；**Code 跨板块打通**（`ai-daily-ingest.ts` 把 coding-agents 话题注入 Code 周报生态卡片）；**Code 周报时间窗收口**（`getWeekBoundsInShanghai()` 硬边界 + 二次 leakFilter）；**Benchmark 健康检查**（`benchmarks-health.ts` 落地，critical 源全空 refuseWrite + 历史月度 log）；**AI Daily v2 词表 6 天观察数据落位**（planning/tool-use 虽最低但 ≥13 命中，均健康）_
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

### 现状 (2026-04-22)

- ✅ 每日 cron pipeline（**5 个源模块**：RSS × 10 + Tavily × 4 + Exa allowlist × 13 域 + GitHub trending + HN Algolia，落 `profile-data/ai-daily/YYYY-MM-DD.json`）
- ✅ 日报详情页 `/ai-daily/[date]`（headlines / research / engineering / insights 分区 + 顶部 focusTopic filter chips）
- ✅ **v2 focus-topic 词表**（`coding-agents` / `agent-harness` / `context-engineering` / `post-training` / `model-release` / `evals` / `planning` / `tool-use`）+ 旧 v1 anchor 降级展示
- ✅ **Topic Health dashboard** `/ai-daily/metrics`（7/14/30d 命中、healthy/watch/stale/dead/legacy 5 档分类、recent examples）
- ✅ Observability metrics：每日 run 落 `_meta/YYYY-MM.json`（items/dedup/scoring/anchors 计数）
- ✅ HN Algolia `front_page` API（`sources/hn.ts`，4/17 切换）+ markdown parser fallback

### 近期路线 (4-6 周)

#### P0 — 稳定性与观测收尾

- ✅ **v2 词表观察期**（2026-04-17 → 04-22，6 天数据已闭环）：7d 命中分布为 agent-harness=78 / coding-agents=52 / model-release=19 / context-engineering=post-training=17 / evals=16 / planning≈14 / tool-use≈13。**全部 ≥13 条 / 30d → 无 "dead" topic**；原 ROADMAP 担心 `planning` 为 0 的判断不成立（实际是 v2 切换当日 legacy item 未重打而已）。`post-training` 与 `model-release` 的合并讨论**推迟**——两者虽常共现但语义独立，拆开更利于搜索与归档。
- ✅ **OpenAI RSS 403 → 隐性选方案 (b)**（接受现状）：`rss-feeds.ts` L39 Mozilla UA 硬上 OpenAI 源仍 403，但近一周 `OpenAI News` 条目 0；Exa allowlist（`openai.com` 域）在 4/21–4/22 `2026-04-22.json` 里稳定覆盖 GPT-Image-2 发布、Latent Space 的 AINews OpenAI 专题等 4+ 条。**不再尝试 TLS fingerprint 方案**，保留 RSS 源作为"未来若解封即生效"的占位。
- ✅ **`RunRecord.sources` schema 补 `github` 字段**（2026-04-22 落地）：`ai-daily-metrics.ts` schema 新增 `github?: number`；`/ai-daily/metrics` 的 `SourceStackChart` 把 github 纳入 stack 累加、新增 violet 色段 + 图例；anomaly 规则保持"rss+search 双 0 告警"不变并加注释说明 github/horizon 作为窄源不纳入告警阈值。

#### P1 — 内容质量与发现力

- 📐 **Topic discovery 面板**（Topic Health v3）：扫所有 item 的自由 tags → 按频次聚类 → 展示 "Top 10 frequent unsorted tags this week"，人工决定哪个晋升为 focusTopic。目标是形成**自动提示"该加什么主题"**的闭环，不再靠肉眼翻数据。
- ✅ **Weekly digest for AI Daily**（2026-04-22 落地）：`scripts/generate-ai-daily-weekly-digest.ts`（320 行）参考 stars-weekly-digest 模式实现——读 `profile-data/ai-daily/YYYY-MM-DD.json` 7 天文件 → `MIN_SCORE_WEEKLY=6.0` + URL canonical 去重（同 URL 留高分）→ 按 `focusTopic` v2 8 项词表分桶（`PER_TOPIC_TOP=8`）→ DeepSeek 生成 `overview`/`topStoriesByTopic`/`trendingTopics`/`keyReads` → URL post-validation 护栏（`isRealUrl` + whitelist + by-title 回填）。数据层 `website/lib/ai-daily-weekly.ts`（5 函数）+ 详情页 `website/pages/ai-daily/weekly/[week].tsx`（Bento Grid：Stats 条 / Top Stories by Topic / Key Reads / Trending / Topic Spread / Daily Logs）+ 列表页 banner（`website/pages/ai-daily.tsx` 顶部虚线蓝框入口卡片）。CI `sync-ai-daily.yml` 新增 "Generate AI Daily weekly digest" step 跟 daily 同跑并一起 commit。首跑 W16：169 items / 8 v2 topics / 20 stories / 4 trends / 4 key reads / URL 0 次幻觉。W15 仅 2 天数据自动跳过（`MIN_DAYS_WITH_CONTENT=4` 门槛）。
- 💡 **真正的中文/英文分流**：现在 `translations` 字段已经存在，但列表页仍混排。可考虑给用户一个开关，或者双列展示。优先级不高。

#### P2 — 内容扩展

- 💡 **加 Anthropic / DeepMind 官方 feed**：Anthropic 确认无 RSS（4/17 验证），DeepMind 有 `https://deepmind.com/blog/feed.xml` 但节奏慢。Anthropic 已通过 Exa allowlist 覆盖，DeepMind 性价比待评估。
- 💡 **Reddit `/r/LocalLLaMA` + `/r/MachineLearning`**：社区信号，但噪声大，需要专门的 scoring 权重调整。

### 观察指标（每月回看）

- 每日 final items 中位数（4/17–4/22 实测：53，range 31–62，目标 ≥45；< 30 异常）
- focusTopic 命中率（4/17 基线 56%，目标 ≥50%）
- v2 词表内无 "dead" topic（30d < 6 视为 dead，除 legacy 外全部绿 · 4/22 实测全部 ≥13 ✅）
- **RSS 源当日 0 条告警**（4/19=4 / 4/20=2 两天异常低，关注是否周末 ArXiv 断档还是 fetch 超时）
- `_meta` 月度文件里无"连续 3 天异常告警"的 streak

---

## 💻 Code — `/code`

**定位**：AI Code 工具生态的系统化追踪。每周一份周报 + 随时可查的 benchmark 趋势。面向读者："我想知道 Cursor / Claude Code / Copilot 这周发了什么、哪个模型在 SWE-Bench 上最强"。

### 现状 (2026-04-22)

- ✅ 周报列表页 `/code` + 详情页 `/code/[week]`（三 Tab：编辑器动态 / 模型评测 / 公司博客）+ **"Coding Agents Ecosystem" 区块**（4/17 随 AI Daily 打通）
- ✅ Benchmark 独立页 `/code/benchmarks`（Arena Coding / SWE-bench / Aider / LiveCodeBench **4 源**表格 + Hero Cards + "Arms Race" 厂商趋势图 + 3-way 视图切换 Chart/Trend/Table）
- ✅ 数据采集 **6 源**：GitHub Releases + RSS + Tavily + 百炼 WebSearch + **npm-registry**（Claude Code / CodeBuddy）+ **changelog-page**（Windsurf / Trae / Augment / Claude Code）
- ✅ 编辑器覆盖扩展到 **10 个**：Cursor / Windsurf / Trae / Augment / Claude Code / Gemini CLI / OpenCode / Aider / Copilot / CodeBuddy
- ✅ DeepSeek 周报生成层
- ✅ GitHub Actions 工作流（周报每周一 12:00 京 + 评测每天 13:00 京）
- ✅ 主导航 "Code" tab
- ✅ 三次已归档迭代：`2026-04-13-code-weekly-more-editors`、`2026-04-13-code-weekly-visualization`（含 Hero Cards / Trend Line / Rank Bump / Org Arms Race 图表）
- 🪦 **2026-04-17 retired BigCodeBench (frozen 366d) and EvalPlus (frozen 478d) from live pipeline**. 数据冻结在 `profile-data/benchmarks/latest.json` 的 `bigCodeBenchRetiredAt` / `evalPlusRetiredAt` 字段下作为历史存档。

### 近期路线 (4-6 周)

#### P0 — 数据健全性

- ✅ **周报去重 + 时间窗收口**（2026-04-17 落地）：`scripts/code-weekly/config.ts` L145–251 `getWeekBoundsInShanghai()` 实现 Asia/Shanghai 周一 00:00 ~ 下周一 00:00 硬边界（UTC+8 固定偏移，无 DST），所有 source 接收 `bounds` 参数；主脚本 `fetch-code-weekly.ts` L117–150 做**二次防御性 `leakFilter`**（github / rss / npm / changelog 四源），日期缺失或不可解析的条目按白名单通过（Tavily/Bailian 无日期字段）。
- ✅ **Benchmark 数据源健康检查**（2026-04-17 落地，主体完工）：`scripts/code-weekly/benchmarks-health.ts` 实现 critical/auxiliary 分级 + `refusedWrite` 护栏（Arena + Aider 都为空时拒绝覆盖 `latest.json`）+ auxiliary fallback（单源空时沿用上次快照）+ thin/stale/empty 状态标签；每日健康记录持久化到 `profile-data/benchmarks/_health/YYYY-MM.json`。
- 🚧 **Benchmark 告警 hook**（残余项）：上述健康检查已把失败写入 log，但**没有主动通知**（Slack/issue/workflow fail）。添加告警是本项收尾。

#### P1 — 与 AI Daily 的打通

- ✅ **AI Daily → Code 周报候选池**（2026-04-17 落地）：`scripts/code-weekly/sources/ai-daily-ingest.ts` 243 行完整实现 `ingestAiDailyEcosystem`——扫 `profile-data/ai-daily/YYYY-MM-DD.json` → 按 `focusTopic=coding-agents` + `score≥6` 过滤 → bounds 过滤 → URL canonical 去重（含 `excludeUrls` 接口避免与 editors/blogs 重复）→ 按分数截断 top 20。主脚本 L240–265 调用；前端 `website/components/code-weekly/EcosystemCard.tsx` + `/code/[week].tsx` L217–243 渲染"Coding Agents Ecosystem" 分节（有数据才显示，legacy 周兼容）。
- 💡 **周报里加一个 "Editors diff-over-week" 视图**：Cursor / Claude Code / Copilot 本周新 changelog 的对齐视图，比 3 个 Tab 单看更有对比价值。

#### P2 — 内容扩展

- 💡 **补齐 Cline / Continue / Codeium 独立 release 追踪**：Aider 已覆盖，剩余这三个常被 mention 但未独立追踪（Windsurf = Codeium 的 IDE 产品，不能替代 Codeium plugin）。
- 💡 **LLM coding 能力实战对比**：每周抽一个真实小 PR，用 3 个头部 coding agent 各做一次，给读者看 diff。**差异化**内容，但工作量大。

### 观察指标

- 每周 `/code/[week]` PV（当前站点尚未埋点，先放 placeholder）
- Live benchmark 源抓取成功率（4 源：Arena / Aider / SWE-bench / LiveCodeBench；目标 ≥ 95%/月。BigCodeBench / EvalPlus 已退役为冻结档，不纳入指标）
- 周报生成耗时（DeepSeek 调用，目标 < 2 分钟）
- **Benchmarks `_health` 月度文件中 `refusedWrite=true` 的天数**（目标 < 3 天/月 → 多了说明 Arena 或 Aider 抓取链路有系统问题）
- **Ecosystem 条目周均数**（来自 AI Daily ingest，反映两板块联动是否有料 · 4/17 首次上线）

---

## ⭐ Stars — `/stars`

**定位**：追踪 AI 领军人物（Karpathy / Howard / Kilcher 等）的 GitHub Stars / Bluesky posts / **X posts** / YouTube videos / **Blog articles**，聚合成"AI 圈风向标"。

### 现状 (2026-04-22)

- ✅ Daily feed 页 `/stars/[date]`（**5 类卡片混排** github / bluesky / x / youtube / blog + **Co-Starred 7 天滚动窗口 signal 卡片** + Score/Time 排序切换 + URL query `?topic=&source=` 水化过滤态）
- ✅ 人物 profile 页 `/stars/people/[handle]`（每个关注对象独立页面 + 历史数据 + Source 筛选 UI + 时间排序）
- ✅ Topic filter（按 AI subdomain 过滤，**覆盖 star + bluesky + x + youtube + blog 全 5 源**；Blog 的 tags 管线已接入，数据侧 tag 待补齐）
- ✅ RSS feed `/stars/feed.xml`（**覆盖全 5 源**，含 X posts / YouTube videos / Blog articles）
- ✅ Weekly digest `/stars/weekly/YYYY-WXX/`（**schema 扩展覆盖 X / YouTube / Blog** · `notableVideos` + `notableBlogs` + `notableXPosts` + 扩展 stats；URL post-validation 拦截 hallucinated URL；Co-Starred 视图主列 accent 形态；20 个历史 digest 已 `--force` 全量重生）
- ✅ YouTube feed 集成（`stars-youtube-feed`）+ **YouTube channelTitle → /stars/people/ 跳转**
- ✅ Bluesky posts 已稳定抓取
- ✅ Blog feed 集成 + **Blog author → /stars/people/ 跳转**
- ✅ X signal 深度集成（fetch → 日报渲染 → topic filter → RSS → Weekly digest → Top Signals → personMap）
- ✅ Pagefind 全文搜索已覆盖 stars 条目
- ✅ **诊断报告归档**：`docs/stars-module-audit-2026-04-17.md` 24 项问题 21 项闭环（P0 4/4 · P1 5/5 · P2 12/15 · 剩余 3 项 D2/E2/F2 标注"行为合理"搁置）

### 近期路线 (4-6 周)

#### P0 — 已知缺口（全部关闭 ✅）

- ✅ 空 URL / 无效卡片清理（降级为 P2 防御护栏 → 见下文 pre-digest URL 校验）
- ✅ YouTube → topic filter 管线打通（2026-04-17）

#### P1 — 信号质量（全部关闭 ✅）

- ✅ **Stars 打分**（2026-04-17 落地）：`fetch-stars.ts` DeepSeek prompt 输出 `score 0-10` + `scoreReason`，三维 rubric（freshness / relevance / concreteness）。`[date].tsx` GitHub 卡片 `▲ N/10` badge + Score/Time sort 切换；`CoStarredBlock` 按 `maxScore` 次级排序。历史 21 条 backfill，`score≥7` 占比 ≈ 38%。
- ✅ **"今天谁被多人 star" 视图**（2026-04-17 落地）：`computeCoStarredRepos` / `getCoStarredForDate` + `CoStarredBlock`（accent/compact 双形态）；日报顶部 7 天窗口 accent 卡片；weekly 主列 accent。
- ✅ **Top Signals engagement 归一化**（2026-04-22 落地，G2）：`getTopHighlights` 重写——per-source `log1p` 归一化 + recency boost（≤3d +0.20, ≤7d +0.10）+ blog typeFloor +0.05 + **每源保底 1 位**，避免 YouTube/GitHub 天然高量级垄断 top。

#### P2 — 关注列表维护 & 数据护栏

- ✅ **pre-digest 数据校验护栏**（2026-04-22 随 E1 顺带强化）：`generate-weekly-digest.ts` L469–516 实现 URL post-validation——`isRealUrl()` 拒绝占位符（`.../\.\.\.$` / `youtube.com/\.\.\.` 等）；`videoByUrl` / `blogByUrl` / `xByUrl` / `repoByName` 白名单比对；hallucinated URL 尝试 by-title 回填，失败则过滤。**比原 ROADMAP 计划的 `.filter(x => x.url?.trim())` 强得多**。
- 💡 **关注对象的自动增删**：每半年回看谁还在活跃、是否有新的上升人物该加入。做一个"候选人物面板"，按发言量 + 被其他已关注人互动的频次自动提名。
- ✅ ~~**加 X/Twitter signal**~~：已完全集成（fetch → 渲染 → topic filter → RSS → Weekly digest → Top Signals → personMap 全链路）。

#### 诊断报告遗留的打磨项（非阻塞，见 `docs/stars-module-audit-2026-04-17.md`）

- D2 · Timeline 分组跨日对齐（当前按 `YYYY-MM-DD` 分组 UI 上更自然，搁置）
- E2 · "当前 ISO 周排除" 依赖时间（build 缓存期间短暂缺席可接受，搁置）
- F2 · RSS `MAX_ITEMS` 基于日期粒度（跨平台爆发日挤出概率极低，搁置）

### 观察指标

- 每日 feed item 数（当前 ≈ 15-30，< 5 说明全平台抓取异常）
- YouTube 抓取 quota（每日 API 调用 < 100 单位）
- Weekly digest 生成成功率
- **Tag 覆盖率**：star / bluesky / x / youtube / blog 五源各自 "有 ≥1 tag 的条目占比"（4/17 youtube 基线 25/30 ≈ 83%，目标各源 ≥ 70%）
- **Star score 分布**（4/17 基线 n=21）：2–3 (7) · 5–7 (12) · 8 (2)，中位数 6。监测 `score≥7` 占比（当前 ≈ 38%），目标稳定在 30–50%。
- **Weekly digest URL post-validation fallthrough 率**（L481–503 "by-title 修复" 触发次数，4/22 首批 20 个 digest 观察）

---

## 🔗 三板块协同

三个板块不是孤岛，未来 6-12 个月要逐步打通的**跨板块联动**：

```
  ┌──────────────┐   "coding-agents" topic 的高分 items (score ≥ 6)
  │   AI Daily   │────────────────────────────────────────▶┌─────────┐
  └──────────────┘  ✅ 4/17 落地 ai-daily-ingest.ts       │  Code   │
       ▲                                                    │  周报   │
       │ stars-weekly-digest 里提及的 repo 注入当日 pool    └─────────┘
       │  📐 未落地                                              │
  ┌──────────────┐◀──── 周报中提到的 repo 自动加入 stars ─────────┘
  │    Stars     │      💡 待评估
  └──────────────┘
```

**具体联动项**：

1. ✅ **AI Daily → Code**：`focusTopic=coding-agents` 的高分 items 自动进入 Code 周报候选池（`ai-daily-ingest.ts` + EcosystemCard，2026-04-17）
2. 📐 **Stars → AI Daily**：被 ≥3 个 AI leader 共同 star 的 repo 以独立卡片形式进入当日 AI Daily。`computeCoStarredRepos` 已存在，接口已具备。
3. 💡 **统一 scoring anchors**：三板块各自维护 `scoring-anchors`（AI Daily 的 DeepSeek rubric / Stars 的三维打分 / Code 的 benchmark health），未来合并为一份"本站点的分数基准"。
4. 💡 **统一搜索入口**：Pagefind 已覆盖 stars/blog，下一步覆盖 AI Daily + Code 详情页，实现"一个搜索框查全站"。

---

## 📝 维护约定

- 每次完成一项 P0/P1 就在本文件打勾（✅），不删行，保留历史
- 每周五盘点一次：看哪些 🚧 该晋升为 ✅，哪些 📐 该晋升为 🚧
- 每 4 周回看一次"观察指标"小节，有数据异常就开新 change
- **openspec 才是单一来源**：ROADMAP 只做导航，**不复制技术细节**。具体方案写在 `openspec/changes/<id>/proposal.md` + `design.md` 里
- **大型模块诊断**：归档到 `docs/<module>-audit-YYYY-MM-DD.md`（参考 `docs/stars-module-audit-2026-04-17.md` 的进度追踪 + 结案格式），ROADMAP 对应板块加一行"诊断报告"指针
