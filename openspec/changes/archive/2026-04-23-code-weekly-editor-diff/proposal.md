## Why

`/code/[week]` 周报详情页的 "Editors" 分区当前把 10 个 editor 并列渲染成 10 张 `EditorCard`，每张卡片独立展示 highlights + aiSummary + 源链接。对单个 editor 的深入阅读很好，但**横向对比"这周哪家动了什么"**必须**肉眼轮询 10 张卡片**。

这正是 ROADMAP 所指 "Editors diff-over-week"——**差异化**的内容价值本来就在"三家对比"而非"三家单看"：

- 看 Cursor vs Windsurf 谁这周节奏更快
- 看 Claude Code 是功能周还是补丁周
- 看 Aider 是不是又掉线了（上周有这周无）

此外 `profile-data/code-weekly/2026-W15.json` + `2026-W16.json` 两周数据都已完整（10 editors 对齐），构造 week-over-week delta 的基础设施**零新增**。

## What Changes

- **新增数据层函数** `computeEditorDiffMatrix(current, previous)` 在 `website/lib/code-weekly.ts`：输入当前周 + 相邻周的 `EditorUpdate[]`，输出每个 editor 的预计算 row（activity score / theme tags / WoW delta kind）
- **新增前端组件** `website/components/code-weekly/EditorDiffMatrix.tsx`：横向对齐矩阵视图（IDE 和 CLI 分组），每行一个 editor，4 列（name / activity / themes / WoW）
- **更新详情页** `website/pages/code/[week].tsx`：
  - `getStaticProps` 额外拉上一周的数据传给详情页
  - "Editors" section 顶部先显示新的 `EditorDiffMatrix`，**原有的 10 张 `EditorCard` 保留在矩阵下方**（深读入口不动）
  - 这是**增量增强**，不是替换

## Capabilities

### New Capabilities

- `code-weekly-editor-diff`：Editor 周报横向对齐矩阵，支持 activity level 量化（由 highlights 数 + 版本号存在性 + stub 检测三维合成）、theme 分类（5 类：feature / fix / policy / integration / perf，纯关键词匹配）、WoW delta（↑ 爆发 / → 稳定 / ↓ 减少 / ✨ 首次 / ⚠ 掉线）

### Modified Capabilities

<!-- 保留现有 EditorCard 行为不变 -->

## Impact

- **修改文件**：
  - `website/lib/code-weekly.ts`（新增函数 + 类型）
  - `website/pages/code/[week].tsx`（getStaticProps 取上一周 + 插入 EditorDiffMatrix）
  - `ROADMAP.md`（Code P1 `💡 Editors diff-over-week` → ✅）
- **新增文件**：`website/components/code-weekly/EditorDiffMatrix.tsx`（~150-200 行）
- **依赖**：零新增 npm 依赖
- **数据层**：零新增数据产物，仅做纯计算。计算成本：2 周 × 10 editor × 3 highlights = O(60) 字符串匹配，对 SSG build 时间影响可忽略
- **向后兼容**：当只有一周数据时（cold repo 或首周），fall back 到只显示 activity / themes，WoW delta 显示为 `—`。旧周报 JSON schema 不需要改
- **风险**：
  - Theme 关键词匹配是启发式的——可能把"新增 xxx 集成"归到 integration 而不是 feature。接受此不精确性，边界 case 影响小
  - Activity level 量化基于"highlights 数"，可能对那些写得简洁但内容重要的更新偏低。mitigated：同时标注版本号和是否有 aiSummary
