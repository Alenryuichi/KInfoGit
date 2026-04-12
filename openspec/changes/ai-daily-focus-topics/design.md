## Context

AI Daily 页面已实现基本功能：Horizon 采集 → Markdown → `convert-horizon.ts` 转 JSON → Next.js SSG 渲染。当前有 3 个粗粒度 section 分类（Headlines/Research/Engineering），通过关键词匹配 `classifyItem()` 实现。每条新闻已有 Horizon 生成的 `tags` 字段。

用户需要在 Agent 研究方向维度上快速筛选内容，这是一个正交于现有 section 分类的新维度。

## Goals / Non-Goals

**Goals:**
- 为每条新闻自动检测 Agent 研究方向标签（Memory, Self-Evolution, Multi-Agent, Planning, Reflection, Tool Use）
- 详情页提供交互式 filter chips，按 focus topic 过滤新闻
- 列表页快速展示每日涉及的 focus topics
- 向后兼容：旧 JSON 无 `focusTopics` 字段时正常降级

**Non-Goals:**
- 不替换现有的 3 大 section 分类体系
- 不使用 LLM API 做实时分类（保持纯静态构建）
- 不支持用户自定义 topic（硬编码的预设列表）
- 不做跨日期的 topic 聚合页面（本次不做）

## Decisions

### 1. 关键词匹配 vs LLM 分类
选择 **关键词匹配**。理由：
- 转换脚本在 CI 构建时运行，不应依赖外部 API
- 关键词列表可快速迭代调整
- Horizon 已生成 tags，组合标题+摘要+tags 的匹配足够准确
- 备选：让 Horizon 的 DeepSeek prompt 直接输出分类 → 需要改上游，不在本次范围

### 2. 过滤在客户端 vs 构建时预生成
选择 **客户端过滤**（useState）。理由：
- 数据量小（每天 5-15 条），无性能问题
- 避免为每个 topic 组合生成静态页面（组合爆炸）
- 交互更自然（即时切换，无页面跳转）

### 3. Focus Topics 作为独立字段 vs 复用 tags
选择 **独立 `focusTopics` 字段**。理由：
- Horizon 的 tags 粒度不固定、命名不统一
- Focus topics 是策划好的固定维度，需要稳定的关键词映射
- 两者可以共存，互不干扰

### 4. Filter UI 位置
放在 **日期导航下方、sections 上方**。理由：
- 全局过滤器应在内容之前
- 不侵入现有 DateNav 组件

## Risks / Trade-offs

- [关键词漏匹配] → 保持关键词列表可扩展，后续可根据实际数据调优
- [某天所有 focus topics 为空] → UI 不渲染 filter bar，优雅降级
- [JSON 体积微增] → `focusTopics` 是短字符串数组，影响可忽略
