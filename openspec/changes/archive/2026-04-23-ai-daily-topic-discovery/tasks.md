## 1. 数据层 `ai-daily-metrics.ts`

- [x] 1.1 新增 `ENTITY_TAG_BLACKLIST` 常量（23 个公司/产品名），放在文件顶部与 `TOPIC_VOCAB` 相邻
- [x] 1.2 新增 `TopicCandidate` interface：`{ tag, hits7d, hits14d, hits30d, coverage30d, classification: 'rising'|'persistent'|'sporadic', recentExamples: TopicExample[] }`
- [x] 1.3 新增 `TopicDiscoveryResult` interface：`{ rising: TopicCandidate[], persistent: TopicCandidate[], sporadic: TopicCandidate[] }`（各 cap 10）
- [x] 1.4 实现 `computeTopicDiscovery(): TopicDiscoveryResult`：复用 `recentDateKeys()` / `getDigestDir()` / `RawDigestFile` 现有基础设施，新计数器按 `item.tags[]` 累加（区别于 Topic Health 按 `focusTopics[]`）
- [x] 1.5 过滤规则：跳过已在 `TOPIC_VOCAB ∪ LEGACY_TOPIC_VOCAB` 内的 tag，跳过 `ENTITY_TAG_BLACKLIST` 内的 tag，跳过 `hits30d < 3` 的
- [x] 1.6 分类规则：rising (`hits7d >= 5 && hits7d >= hits30d * 0.4`) / persistent (`hits30d >= 10 && coverage30d >= 0.3`) / sporadic (其他)。rising 和 persistent 互斥时以 rising 优先
- [x] 1.7 每 bucket 内按 `hits30d` DESC 排序，cap 10 条
- [x] 1.8 example 收集：复用 `TopicExample` 类型，newest-first，cap 3
- [x] 1.9 额外改进：空格规整（`.replace(/\s+/g, '-')`）把 `machine learning` 合并进 `machine-learning`

## 2. Metrics 页面集成 `pages/ai-daily/metrics.tsx`

- [x] 2.1 import `computeTopicDiscovery` / `TopicDiscoveryResult` / `TopicCandidate`
- [x] 2.2 `getStaticProps` 调用 `computeTopicDiscovery()`，新字段加进 `MetricsPageProps`
- [x] 2.3 在 Topic Health section 之后新增 `<section>` "Topic Discovery (v3)"，附简短说明文字
- [x] 2.4 实现 `TopicDiscoveryPanel` 组件：三栏网格（`grid-cols-1 md:grid-cols-3`），每栏一个 `CandidateBucket` 子组件
- [x] 2.5 `CandidateBucket` 展示：bucket 标题（🚀 Rising / 📈 Persistent / 💫 Sporadic）+ 候选列表（tag code + 7/14/30 tabular-nums + 最近 example 一行）
- [x] 2.6 空数据兜底：某 bucket 为空时显示 "No candidates in this tier yet."

## 3. 首批数据观察

- [x] 3.1 本地 `npx next build` 成功，SSG `/ai-daily/metrics` 照常生成
- [x] 3.2 访问 `/ai-daily/metrics` 预览页，确认 Topic Discovery section 渲染、rising 10 条 + sporadic 10 条（persistent 0 条，30d 数据不足属预期）
- [x] 3.3 观察 rising 候选符合常识：open-source/ai-agents/llm/developer-tools/ai-coding/ai-safety/cybersecurity/optimization/medical-ai/multimodal-ai
- [x] 3.4 entity tags 不泄漏：页面 HTML 中 openai/claude/cursor/anthropic/google/xai/meta 匹配 0 次

## 4. 验证 + 归档

- [x] 4.1 `npm run type-check` 无错误
- [x] 4.2 `npm run lint` 0 errors / 0 warnings
- [x] 4.3 `openspec validate ai-daily-topic-discovery --strict` 通过
- [x] 4.4 更新 ROADMAP.md：AI Daily P1 `📐 Topic discovery 面板` → `✅`（附落地摘要）+ 顶部 Last updated 同步本次
- [x] 4.5 commit + push
- [x] 4.6 openspec archive
