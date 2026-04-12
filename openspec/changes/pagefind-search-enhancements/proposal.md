## Why

Pagefind 基础搜索已集成，但搜索体验仍有较大提升空间：结果缺少分类标签、无法键盘导航、无搜索历史、空状态无引导、索引中混入导航噪音、缺少页面元数据、首次搜索有加载延迟。这 8 项优化将搜索从"能用"提升到"好用"。

## What Changes

**体验层：**
- 搜索结果显示来源分类标签（Blog / Stars / AI Daily / Work）
- 支持 ↑↓ 箭头键盘导航搜索结果，Enter 跳转
- localStorage 记录最近搜索词，打开 modal 时显示历史
- 空状态（未输入时）显示最近/热门文章引导

**索引层：**
- 用 `data-pagefind-filter` 给页面添加分类标签，支持按类型筛选
- 用 `data-pagefind-ignore` 排除导航链接（上一篇/下一篇）、代码块等噪音
- 用 `data-pagefind-meta` 为页面添加日期、分类等自定义元数据

**性能层：**
- 鼠标 hover 搜索按钮时预加载 Pagefind WASM，减少首次搜索延迟

## Capabilities

### New Capabilities
- `search-ux`: 搜索交互增强——键盘导航、搜索历史、空状态引导、分类标签展示
- `pagefind-indexing`: Pagefind 索引优化——filter/meta/ignore 标记策略
- `search-preload`: Pagefind WASM 预加载策略

### Modified Capabilities

## Impact

- **组件**: `website/components/Header.tsx` — 搜索 modal 逻辑大幅增强
- **页面模板**: `blog/[slug].tsx`, `stars/[date].tsx`, `ai-daily/[date].tsx`, `work/[id].tsx`, `about.tsx` — 添加 Pagefind 标记属性
- **无新增依赖**
