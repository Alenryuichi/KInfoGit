## ADDED Requirements

### Requirement: Pagefind build-time indexing
构建流程 SHALL 在 `next build` 完成后自动运行 Pagefind CLI 对 `website/out/` 目录中的 HTML 文件生成搜索索引。

#### Scenario: Successful index generation
- **WHEN** 执行 `npm run build`
- **THEN** `website/out/pagefind/` 目录被创建，包含索引文件和 JS/WASM 资源

#### Scenario: Index covers all page types
- **WHEN** 构建完成后检查索引
- **THEN** blog 文章、projects、AI Daily 页面的内容均被索引

### Requirement: Pagefind JS API search
搜索功能 SHALL 使用 Pagefind JS API (`import('/pagefind/pagefind.js')`) 执行搜索查询，替代 Fuse.js。

#### Scenario: User performs search
- **WHEN** 用户在搜索框输入查询词
- **THEN** 系统通过 `pagefind.search(query)` 返回匹配结果，包含标题、高亮摘要和 URL

#### Scenario: Chinese content search
- **WHEN** 用户搜索中文关键词（如"能力"、"Embedding"）
- **THEN** 系统返回包含该关键词的页面，支持正确的中文分词匹配

### Requirement: Search UI preservation
搜索 UI SHALL 保留现有的 modal 弹窗、Cmd+K / Ctrl+K 快捷键和实时搜索体验。

#### Scenario: Open search with keyboard
- **WHEN** 用户按下 Cmd+K 或 Ctrl+K
- **THEN** 搜索 modal 弹出，输入框获得焦点

#### Scenario: Real-time results
- **WHEN** 用户在搜索框中输入文字
- **THEN** 搜索结果实时更新（含 debounce），显示标题、高亮摘要片段和分类

#### Scenario: Navigate to result
- **WHEN** 用户点击搜索结果
- **THEN** 页面导航到对应 URL，搜索 modal 关闭

### Requirement: Fuse.js removal
系统 SHALL 移除 Fuse.js 依赖和手动索引生成脚本。

#### Scenario: Clean dependency removal
- **WHEN** 升级完成后
- **THEN** `package.json` 不再包含 `fuse.js` 依赖，`generate-search-index.ts` 和 `search-index.json` 被移除
