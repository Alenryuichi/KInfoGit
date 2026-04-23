## 1. DeepMind RSS 集成

- [x] 1.1 `scripts/ai-daily/config.ts` `RSS_FEEDS` 追加 `{ name: 'DeepMind', url: 'https://deepmind.google/blog/rss.xml', category: 'release' }`（插在 Google AI Blog 下方保持逻辑分组）
- [x] 1.2 更新顶部文档注释：Anthropic 404 的说明更新到 2026-04-23 再次验证，新增 "DeepMind RSS added 2026-04-23" 条目
- [x] 1.3 Probe 验证：`https://deepmind.google/blog/rss.xml` 返回 200 OK / 100 entries，最近 5 条全部高质量 model-release 信号（Gemini 3.1 Flash TTS / Gemma 4 / Gemini Robotics-ER 1.6）

## 2. Reddit source 模块

- [x] 2.1 新建 `scripts/ai-daily/sources/reddit.ts`（~200 行），export `fetchRedditItems()`, `isMegathread()`, `cleanRedditSummary()`
- [x] 2.2 常量：`REDDIT_SUBREDDITS = ['LocalLLaMA', 'MachineLearning']`，`REDDIT_TITLE_BLACKLIST_PREFIXES` 含 6 条 megathread 前缀
- [x] 2.3 `fetchSubreddit(sub, cutoff)` 带 UA header + 15s timeout
- [x] 2.4 Atom parser：本地实现 `parseAtomEntries`（没 import rss-feeds.ts 的私有函数，保持模块自包含）
- [x] 2.5 `decodeEntities`：处理命名实体 + 十进制/十六进制数字实体（`&#32;` 等）
- [x] 2.6 `cleanRedditSummary`：decodeEntities → strip tags → SC_OFF/SC_ON 标记 → "submitted by /u/user" → `[link] [comments]` 首尾全部清理 → collapse 空白 → slice(500)
- [x] 2.7 `isMegathread(title)` prefix-match
- [x] 2.8 24h 时间窗过滤（与 rss-feeds 一致 cutoff）
- [x] 2.9 输出 `RawNewsItem` with `sourceType: 'rss'`, `sourceName: 'Reddit r/<sub>'`
- [x] 2.10 console log：`[reddit] Reddit r/<sub>: N items (M filtered, K truncated)`

## 3. 主管线集成

- [x] 3.1 `scripts/ai-daily/fetch-ai-daily.ts` 在 Promise.allSettled 里加入 `fetchRedditItems()`
- [x] 3.2 扩展 `SourceBreakdown` 加 `reddit: number`（`scripts/ai-daily/metrics.ts` interface + initial value）
- [x] 3.3 扩展 `RunRecord.sources` 加 `reddit?: number`（`website/lib/ai-daily-metrics.ts`）
- [x] 3.4 `anomaly` 规则保持原样（rss + search 双 0 才告警，reddit 是窄源）

## 4. 前端 metrics 可视化

- [x] 4.1 `website/pages/ai-daily/metrics.tsx` `SourceStackChart` 加 `reddit` 色段 `#2dd4bf` (teal)
- [x] 4.2 legend 加 `■ reddit`
- [x] 4.3 stack 累加 order：rss + search + social + horizon + github + reddit

## 5. 首批观察

- [x] 5.1 本地 probe 跑通，25 items 从 2 个 subreddit 抓到（r/LocalLLaMA 15 + r/MachineLearning 10，r/LocalLLaMA 还有 8 条被 truncate 因为 MAX_ITEMS_PER_SUBREDDIT=15）
- [x] 5.2 megathread 过滤生效：24h 窗口自然过掉旧 megathread；若 `[D] Self-Promotion Thread` 当天发则走 blacklist 拦截
- [x] 5.3 抽样 10 条 Reddit 输出的 title + summary 清洁无残留（首轮有 `&#32;` / `submitted by /u/x [link] [comments]` 残留，加 numeric-entity decoder + submitted-by strip 后完全干净）
- [x] 5.4 DeepMind RSS 探测已抓到 100 entries（主管线跑就会拿 last-24h 的截断切片）

## 6. 验证 + 归档

- [x] 6.1 `npm run type-check` 无错误
- [x] 6.2 `npm run lint` 0 errors / 0 warnings
- [x] 6.3 `openspec validate ai-daily-deepmind-reddit-sources --strict` 通过
- [x] 6.4 `npx next build` SSG 成功
- [x] 6.5 更新 ROADMAP.md：P2 两项从 💡 → ✅，附落地摘要 + 顶部 Last updated 同步本次
- [x] 6.6 commit + push
- [x] 6.7 openspec archive
