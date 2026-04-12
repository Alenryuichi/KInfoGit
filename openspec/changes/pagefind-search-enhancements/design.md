## Context

Pagefind 已集成为站点搜索引擎（替代 Fuse.js），基本搜索功能工作正常。当前搜索 modal 在 `Header.tsx` 中实现，支持 Cmd+K 打开、实时搜索、结果点击导航。本次在此基础上做 8 项增强。

## Goals / Non-Goals

**Goals:**
- 搜索结果带分类标签，用户一眼看出结果来源
- 键盘操作完整闭环（↑↓选择、Enter跳转、Esc关闭）
- 搜索历史提升回访效率
- 空状态有引导，不浪费展示空间
- 索引更干净（排除噪音、丰富元数据）
- 首次搜索感知延迟接近零

**Non-Goals:**
- 不做搜索结果排序自定义 UI
- 不做 filter 筛选面板（仅在结果中展示标签）
- 不做搜索分析/埋点

## Decisions

### 1. 分类标签来源
**选择**: 用 Pagefind 的 `data-pagefind-meta="type:blog"` 在每个页面模板中声明类型，搜索结果从 `result.meta.type` 读取。
**原因**: 比 URL 路径解析更可靠，且与 Pagefind 生态一致。

### 2. 键盘导航状态管理
**选择**: 用 `selectedIndex` state + `useEffect` 监听键盘事件，在现有 searchResults 数组上做索引操作。
**原因**: 简单直接，不需要引入额外状态管理。

### 3. 搜索历史存储
**选择**: `localStorage` 存最近 5 条搜索词，key 为 `pagefind-search-history`。
**原因**: 纯客户端，无隐私问题，5 条足够且不占空间。

### 4. 预加载时机
**选择**: 搜索按钮 `onMouseEnter` / `onFocus` 时触发 Pagefind 加载，而非页面加载时。
**原因**: 不影响首屏性能，但在用户有搜索意图时提前加载。

### 5. 噪音排除策略
**选择**: 在「上一篇/下一篇」导航区域添加 `data-pagefind-ignore`。
**原因**: 这些内容会导致搜索文章标题时匹配到其他文章的导航链接。

## Risks / Trade-offs

- **[localStorage 不可用]** 隐私模式下 localStorage 可能不可用 → try/catch 包装，降级为无历史功能
- **[键盘导航与 modal 关闭冲突]** Esc 键同时用于关闭 modal 和清除选中 → Esc 始终关闭 modal（优先级最高）
