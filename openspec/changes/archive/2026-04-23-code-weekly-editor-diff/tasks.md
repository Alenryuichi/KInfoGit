## 1. 数据层 `website/lib/code-weekly.ts`

- [x] 1.1 新增 type `EditorTheme = 'release' | 'feature' | 'fix' | 'perf' | 'policy' | 'integration'`
- [x] 1.2 新增 type `EditorWowDelta = 'first' | 'silent' | 'accelerating' | 'slowing' | 'steady' | 'unknown'`
- [x] 1.3 新增 interface `EditorDiffRow`：`{ name, category, version, activityDots: 0|1|2|3|4|5, themes: EditorTheme[], wow: EditorWowDelta }`
- [x] 1.4 新增 interface `EditorDiffMatrix`：`{ ide, cli, hasPrevious }`
- [x] 1.5 常量 `THEME_KEYWORDS`：6 个 theme 各 6-8 个 CN+EN 关键词
- [x] 1.6 `classifyThemes(editor)` 对 highlights + aiSummary 做关键词匹配，命中 theme 进结果
- [x] 1.7 `computeActivityDots(editor)`：0 base + `highlights.length` mapping + version 非空 `+1` + stub aiSummary clamp 0
- [x] 1.8 `computeWow(current, previous)`：5 种情况判定，`previous === undefined` 返回 `unknown`
- [x] 1.9 `computeEditorDiffMatrix(current, previous?)`：组装 row、分组 ide/cli、各组内按 activityDots DESC 排序，name ASC 打破平局

## 2. 前端组件 `EditorDiffMatrix.tsx`

- [x] 2.1 新建 `website/components/code-weekly/EditorDiffMatrix.tsx`（180 行）
- [x] 2.2 `EditorDiffMatrix` 主组件 + 空数据兜底
- [x] 2.3 `ActivityDots` 子组件：5 个 ●/○，IDE emerald / CLI blue 分色
- [x] 2.4 `ThemeChips` 子组件：6 色 theme chips（release=rose / feature=emerald / fix=amber / perf=violet / policy=orange / integration=blue）
- [x] 2.5 `WowBadge` 子组件：5 种 delta 对应 glyph + label + 色
- [x] 2.6 `DiffBucket` 子组件：IDE/CLI 分组标题（沿用现有分色 emerald/blue）+ divide-y 竖列
- [x] 2.7 Legend 行：activity 色例 + WoW 色例 + `hasPrevious=false` 时追加 `(no previous week — WoW disabled)` 注解

## 3. 详情页集成 `website/pages/code/[week].tsx`

- [x] 3.1 import `computeEditorDiffMatrix` / `EditorDiffMatrix` 组件 + type
- [x] 3.2 `getStaticProps`：调 `getCodeWeekByWeek(prev)` 拿上周数据 + 调 `computeEditorDiffMatrix(current, prev?.editors)`，加进 props
- [x] 3.3 在 IDE/CLI card grid 之前插入 `<EditorDiffMatrix>` + `<h3>Week-over-Week Overview</h3>`
- [x] 3.4 矩阵在 `data.editors.length > 0` 时显示，否则不渲染（避免空状态重复出现）

## 4. 首批观察

- [x] 4.1 `npx next build` 成功，`/code/2026-W16` + `/code/2026-W15` 都正常 SSG
- [x] 4.2 `/code/2026-W16` HTML 验证：matrix 渲染正常，steady=18 / slowing=2 / new=2 / silent=1 / accel=1（对照预期数据）
- [x] 4.3 activity dots 合理（Gemini CLI 5 dots / Aider 0 dots）
- [x] 4.4 WoW 判定正确（OpenCode=first、CodeBuddy=slowing、Aider=steady 因为两周都空）
- [x] 4.5 `/code/2026-W15` fallback 验证：matrix 渲染，每行 WoW 列显示 `—`，legend 尾部追加 `(no previous week — WoW disabled)`

## 5. 验证 + 归档

- [x] 5.1 `npm run type-check` 无错误
- [x] 5.2 `npm run lint` 0 errors / 0 warnings
- [x] 5.3 `openspec validate code-weekly-editor-diff --strict` 通过
- [x] 5.4 更新 ROADMAP.md：Code P1 `💡 Editors diff-over-week` → `✅` + 顶部 Last updated 同步
- [x] 5.5 commit + push
- [x] 5.6 openspec archive
