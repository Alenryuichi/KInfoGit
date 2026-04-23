## 1. 数据源模块 `scripts/ai-daily/sources/stars-co-starred.ts`

- [x] 1.1 新建 `scripts/ai-daily/sources/stars-co-starred.ts`（~155 行），export `fetchCoStarredItems(projectRoot): Promise<RawNewsItem[]>`
- [x] 1.2 常量：`LOOKBACK_DAYS = 30`, `MIN_COUNT = 2`, `MAX_ITEMS = 10`, `SUMMARY_MAX = 500`
- [x] 1.3 内部类型 `StarRecord` + `Aggregate`，宽松兼容 `starredBy: string | string[]`
- [x] 1.4 `loadDailyStars(dir, date)` fail-soft 读 JSON
- [x] 1.5 `fetchCoStarredItems` 遍历 30 天 → 聚合 `repoMap: Map<repo, Aggregate>`
- [x] 1.6 过滤 `starredBy.size >= MIN_COUNT`
- [x] 1.7 排序：count DESC, maxScore DESC, stargazersCount DESC
- [x] 1.8 `.slice(0, MAX_ITEMS)` 截断
- [x] 1.9 映射 RawNewsItem：title=repo / summary="Starred by N leaders (...): desc" / url=github.com/repo / sourceName='Co-Starred' / sourceType='rss' / publishedAt=latestDate
- [x] 1.10 console log 行

## 2. 主管线集成

- [x] 2.1 `scripts/ai-daily/fetch-ai-daily.ts` import `fetchCoStarredItems`
- [x] 2.2 Promise.allSettled 追加
- [x] 2.3 解构 + rejected 分支日志
- [x] 2.4 合并到 `allRaw`（放在 reddit 后面）
- [x] 2.5 Raw items 控制台行追加 `CoStarred=N`
- [x] 2.6 `metrics.recordSources` 加 `coStarred`

## 3. Metrics schema 扩展

- [x] 3.1 `scripts/ai-daily/metrics.ts` `SourceBreakdown` +`coStarred: number`
- [x] 3.2 `website/lib/ai-daily-metrics.ts` `RunRecord.sources.coStarred?: number`

## 4. 前端可视化

- [x] 4.1 `website/pages/ai-daily/metrics.tsx` `SourceStackChart`：totals 累加 + `colors.coStarred: '#a3e635'`
- [x] 4.2 parts array 加 `coStarred`
- [x] 4.3 legend 加 `<span className="text-lime-400">■ co-starred</span>`

## 5. 本地验证

- [x] 5.1 `npx tsx _probe-co-starred.ts` 真数据输出 2 items（gemma-tuner-multimodal + ml-intern），和 Python 验证一致
- [x] 5.2 summary 格式正确："Starred by 2 leaders (minimaxir, simonw): ..." / "Starred by 2 leaders (cfahlgren1, pcuenca): ..."
- [x] 5.3 `npx next build` SSG 成功

## 6. 验证 + 归档

- [x] 6.1 `npm run type-check` 无错误
- [x] 6.2 `npm run lint` 0 errors / 0 warnings
- [x] 6.3 `openspec validate ai-daily-co-starred-source --strict` 通过
- [x] 6.4 更新 ROADMAP.md：跨板块 `📐 Stars → AI Daily` → `✅` + 顶部 Last updated 同步本次
- [x] 6.5 commit + push
- [x] 6.6 openspec archive
