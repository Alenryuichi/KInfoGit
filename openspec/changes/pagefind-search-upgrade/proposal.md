## Why

当前站点搜索使用 Fuse.js 客户端模糊匹配 + 构建时生成的 JSON 索引。存在两个核心问题：
1. **搜索索引不完整** — 只索引 blog 和 projects，AI Daily 等新页面未被覆盖，需要手动维护索引生成脚本
2. **中文搜索质量差** — Fuse.js 是字符级模糊匹配，不做分词，中文搜索几乎不可用

Pagefind 是 Rust 构建的静态搜索引擎，直接索引 built HTML，天然支持 CJK 分词，是静态站点搜索的业界最佳实践。

## What Changes

- 移除 Fuse.js 依赖和手动索引生成脚本 (`generate-search-index.ts`, `search-index.json`)
- 集成 Pagefind：构建后自动索引所有 HTML 页面，新页面自动被收录
- 替换 Header.tsx 中的搜索逻辑，使用 Pagefind JS API，保留现有 UI 框架（modal、Cmd+K 快捷键）
- 通过 `data-pagefind-body` 标记主内容区域，排除 header/footer/nav 等无关内容
- 更新构建流程：`next build` 后运行 `pagefind --site out`

## Capabilities

### New Capabilities
- `pagefind-integration`: Pagefind 构建集成与搜索 API 对接，包括索引生成、JS API 调用、结果渲染
- `search-content-marking`: 页面内容标记策略，用 `data-pagefind-body` 控制哪些内容被索引

### Modified Capabilities

## Impact

- **依赖变更**: 移除 `fuse.js`，新增 `pagefind` (devDependency)
- **构建流程**: `package.json` build script 增加 Pagefind 索引步骤
- **组件**: `website/components/Header.tsx` 搜索逻辑重写
- **可删除文件**: `website/scripts/generate-search-index.ts`, `website/public/search-index.json`
- **CI**: `.github/workflows/deploy.yml` 可能无需改动（Pagefind 通过 npm script 集成）
