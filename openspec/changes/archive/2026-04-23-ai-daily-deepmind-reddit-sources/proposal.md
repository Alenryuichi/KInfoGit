## Why

AI Daily 当前 5 个 source 组（RSS / Tavily / Exa / social / github-trending / HN）覆盖了主流 lab 官方、独立 commentary、research arxiv、product trade press。仍有两块**实测有信号**的内容源未接入：

1. **DeepMind 官方 blog**：ROADMAP 2026-04 标记"性价比待评估"。本次探测 `https://deepmind.google/blog/rss.xml` 返回 200 OK / 100 entries，最近 5 条全部高质量 model-release 信号（Gemini 3.1 Flash TTS / Gemma 4 / Gemini Robotics-ER 1.6 / 与 industry leaders 合作）。节奏慢（~5-7 天一条）但条条落 focusTopic。**不加 = 丢了一个重要 frontier lab 的官方口径**。

2. **Reddit r/LocalLLaMA + r/MachineLearning**：社区信号，模型量化/推理经验/非论文级讨论。ROADMAP 标"噪声大，需要专门的 scoring 权重调整"。本次探测证实 `.rss` 端点可用（两个 sub 都 200 OK），且探测到当下实际内容里 `Qwen 3.6 27B is out` / `We benchmarked 18 LLMs on OCR (7k+ calls)` 这种**显然的高信号**和 megathread / self-promotion 这种**显然的噪声**共存，用**标题白名单 pattern 过滤**就能处理。

Anthropic 仍然无 RSS（本次再次验证 4 条候选 URL 全部 404）——维持现状，继续靠 Exa `anthropic.com` allowlist 覆盖，本次 scope 不动。

## What Changes

1. **新增 DeepMind RSS feed**（最小改动）：
   - `scripts/ai-daily/config.ts` `RSS_FEEDS` 追加一行 `{ name: 'DeepMind', url: 'https://deepmind.google/blog/rss.xml', category: 'release' }`
   - 现有 `sources/rss-feeds.ts` 的通用 parser 已兼容 Atom/RSS；本次验证 summary 干净、pubDate 规范、link 为正站 URL，零代码改动
   - 文档注释里把"Anthropic no RSS"的说明保留，再加一行"DeepMind added 2026-04-23"

2. **新增独立 Reddit source**（`scripts/ai-daily/sources/reddit.ts`）：
   - 原因：Reddit RSS **需要特有预过滤**（megathread / 月度定期帖 / self-promotion thread），不适合挤进通用 rss-feeds.ts
   - 实现：fetch 4 个 subreddit 的 `.rss` → Atom 解析 → **标题 blacklist pattern** 剔除固定 megathread → **HTML-entity 二次解码** summary（Reddit 的 description 是双重转义）→ **24h 时间窗** → 输出 `RawNewsItem` with `sourceType: 'rss'`（复用现有 type，不新增）
   - subreddit 清单：`LocalLLaMA`（模型/推理/量化实战）、`MachineLearning`（研究/实现讨论）。不加 `singularity` / `artificial` 因为噪声太大
   - 集成：`fetch-ai-daily.ts` 主管线新增一个 source 调用（与 rss/tavily/exa/social 并行）
   - metrics：`sources` schema 扩字段 `reddit?: number`（与之前 github 加字段同款模式）

3. **无词表变更 / 无 scoring 权重调整**：让 DeepSeek scoring 用现有规则处理新源——我们在 Reddit 源头就把低质 megathread 过滤掉了，剩下的内容让 scoring 照常走

## Capabilities

### New Capabilities

- `ai-daily-reddit-source`：Reddit 社区信号作为独立 source，带 subreddit allowlist、megathread pattern blacklist、HTML-entity 二次解码、24h 时间窗。记入 `RunRecord.sources.reddit` 做可观测性

### Modified Capabilities

- `ai-daily-rss-feeds`：curated RSS feed list 增加 DeepMind 官方 blog（1 个新源）
- `ai-daily-metrics`：`RunRecord.sources` schema 扩字段 `reddit?: number`，前端 `SourceStackChart` 新增一段可视化（色值选非 stack 已占用的 teal 或 lime）

## Impact

- **修改文件**：
  - `scripts/ai-daily/config.ts`（RSS_FEEDS 加 DeepMind）
  - `scripts/ai-daily/fetch-ai-daily.ts`（主管线加 reddit source 调用）
  - `scripts/ai-daily/metrics.ts`（如现有）或 `website/lib/ai-daily-metrics.ts`（`RunRecord.sources` schema 扩 `reddit?: number`）
  - `website/pages/ai-daily/metrics.tsx`（`SourceStackChart` 加 reddit 色段 + legend）
  - `ROADMAP.md`（P2 两项从 💡 变 ✅）
- **新增文件**：`scripts/ai-daily/sources/reddit.ts`（~150-180 行，结构与现有 rss-feeds.ts 对齐）
- **依赖**：零新增 npm 依赖（Reddit `.rss` 端点公开、无 auth）
- **密钥**：无
- **首批覆盖**：明天（4/24）的 daily run 可立即生效；DeepMind 预计平均每周带来 1-2 条 model-release / product 信号，Reddit 预计每天 10-20 条（过滤后）
- **风险**：
  - Reddit 可能限速（429）—— User-Agent 带项目标识 + 15s timeout + Promise.allSettled 降级同 rss-feeds 模式
  - Reddit RSS summary 的 HTML 深度转义可能产生 edge case（`&lt;!-- SC_OFF --&gt;` 这种 reddit 内部标注）—— 在 stripHtml 前先做一次 `decodeHtmlEntities`，再走现有 stripHtml
  - megathread pattern blacklist 可能误伤 —— 用标题起始的明确字符串（`[D] Self-Promotion Thread`、`[D] Monthly Who's Hiring`、`Best Local LLMs - `、`Megathread`）而非宽泛正则
