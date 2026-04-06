## Context

Blog 同步已重构为 API-based 单脚本 (`scripts/sync-yuque.ts`)，用 `YUQUE_TOKEN` + 语雀 REST API v2，无 elog 依赖。Work 同步仍在旧架构（elog + convert 两步流水线）。需对齐到同一模式。

语雀 Work 知识库（repo: `sh4e9k`）的 TOC 结构：
- **一级目录（TITLE 节点）**→ `section`（如 "独立项目"、"企业微信"）
- **二级文档（DOC 节点）**→ 每个项目一个 Markdown 文件

现有参考实现：`scripts/sync-yuque.ts`（blog 版），约 525 行。

## Goals / Non-Goals

**Goals:**
- 单脚本 `scripts/sync-yuque-work.ts` 完成全流程
- 零 elog 依赖，`YUQUE_TOKEN` 认证
- TOC 一级目录 → `section`，出现顺序 → `order`（确定性，不靠 LLM）
- `updated_at` 增量判断，减少 DeepSeek API 调用
- 输出与现有 `Project` interface 完全兼容
- 删除旧的 elog-based 文件

**Non-Goals:**
- 不改动 `website/lib/data.ts` 的 Project 接口
- 不改动 Work 页面组件
- 不处理 GitHub 开源项目扫描（另一个 change）

## Decisions

### D1: 复用 blog sync 的 API client 模式

直接 `fetch` 调用语雀 API v2，`X-Auth-Token` 头认证。与 `sync-yuque.ts` 保持一致的 `yuqueGet<T>()` 封装。

**放弃方案：** elog CLI → 多一个依赖、需要 npm build、中间文件落盘。

### D2: TOC → section/order 映射

```
TOC 节点类型    depth=1, type=TITLE  →  section 名
TOC 节点类型    type=DOC             →  项目文档
全局递增 index                       →  order
```

`section` 和 `order` 由 TOC 结构确定性赋值，不传给 DeepSeek。DeepSeek 只负责语义字段（title 翻译、achievements、tech_stack 等）。

### D3: DeepSeek prompt 精简

从 prompt 中移除 `section`、`order`、`featured` 的推断。这些由脚本逻辑确定：
- `section`: TOC 一级目录名
- `order`: TOC 全局顺序
- `featured`: 每个 section 前 N 个（默认 3 个 featured）
- `id`/`slug`: 从文档 slug 或标题 slugify

### D4: 增量判断用 `updated_at`

语雀 API `/repos/:namespace/toc` 不返回 `updated_at`，但 `/repos/:namespace/docs/:slug` 返回。策略：
1. 先 fetch TOC 获取文档列表
2. 逐个 fetch doc，比对 `updated_at` 与 sync-state 中的记录
3. 未变更则跳过 DeepSeek 调用，直接复用上次结果

State 文件：`tools/yuque-sync/work-sync-state.json`

### D5: 图片处理

与 blog 一致：正则匹配 markdown 图片 URL → fetch → 本地保存到 `website/public/work/images/` → 替换路径为 `/work/images/xxx`。

### D6: Workflow 简化

```yaml
steps:
  - checkout
  - setup node
  - npm install tsx
  - npx tsx scripts/sync-yuque-work.ts
  - check changes + commit + push
```

环境变量：`YUQUE_TOKEN`, `YUQUE_LOGIN`, `YUQUE_WORK_REPO`, `DEEPSEEK_API_KEY`

触发：每周一 UTC 01:00 + workflow_dispatch (force_sync)

### D7: featured 判断策略

默认前 3 个项目为 featured（按 TOC 全局 order）。可通过文档中添加 `featured: true` 标记覆盖。

## Risks / Trade-offs

- **[语雀 API 限流]** → 每个 doc fetch 间隔 500ms，与 blog sync 一致
- **[DeepSeek 提取不稳定]** → temperature=0.2，few-shot 示例，JSON 解析失败时 retry 一次
- **[旧数据迁移]** → 首次运行全量 sync，覆盖现有手写 JSON/MD。语雀知识库需先填入项目文档
