## Context

当前站点使用 Fuse.js v7.1.0 + 构建时 JSON 索引实现客户端搜索。索引由 `website/scripts/generate-search-index.ts` 在 prebuild 阶段生成，仅覆盖 blog 和 projects。搜索 UI 在 `website/components/Header.tsx` 中实现，包括 modal、Cmd+K 快捷键、Fuse.js 实时匹配。

站点使用 Next.js 16 SSG (`output: 'export'`) 导出到 `website/out/`，部署到 GitHub Pages。

## Goals / Non-Goals

**Goals:**
- 全站搜索覆盖所有页面（blog、projects、AI Daily 及未来新增页面）
- 中文搜索质量显著提升（真正的分词而非字符模糊匹配）
- 零维护成本：新页面自动被索引，无需手动更新脚本
- 保留现有 UX：Cmd+K 快捷键、modal 弹窗、实时搜索

**Non-Goals:**
- 不引入后端搜索服务（保持纯静态部署）
- 不自定义 Pagefind UI 组件（使用 Pagefind JS API + 现有 modal 样式）
- 不做搜索分析/统计

## Decisions

### 1. Pagefind JS API vs Pagefind Default UI
**选择**: 使用 Pagefind JS API（`pagefind.search()`）而非内置 UI 组件。
**原因**: 现有搜索 modal 样式与站点整体设计一致，只需替换底层搜索引擎，不需要 Pagefind 的默认 UI。

### 2. 内容标记策略
**选择**: 在各页面模板的主内容区域添加 `data-pagefind-body`，而非使用全局排除规则。
**原因**: 白名单策略更精确，避免索引 header/footer/nav 中的重复内容。需要在 blog 详情页、项目页、AI Daily 页面的主内容容器上添加标记。

### 3. 构建集成方式
**选择**: 在 `package.json` 的 `postbuild` script 中运行 Pagefind CLI。
**原因**: 最简单的集成方式，不需要修改 CI workflow，`npm run build` 自动完成索引生成。

### 4. Pagefind 输出目录
**选择**: 默认输出到 `website/out/pagefind/`（与 Next.js export 目录一致）。
**原因**: Pagefind 资源需要与站点一起部署，放在 `out/` 下自然被 GitHub Pages 提供服务。

## Risks / Trade-offs

- **[Pagefind JS 动态加载]** Pagefind 的 JS/WASM 资源需要从 `/pagefind/` 路径加载 → 确保 `out/pagefind/` 目录被正确部署
- **[开发环境搜索不可用]** `next dev` 模式下没有 built HTML，Pagefind 索引不存在 → 搜索功能仅在 build 后可用，开发时显示提示信息
- **[首次搜索延迟]** Pagefind 需要加载 WASM + 索引文件（通常 <100KB） → 首次搜索可能有 100-200ms 延迟，后续搜索即时
