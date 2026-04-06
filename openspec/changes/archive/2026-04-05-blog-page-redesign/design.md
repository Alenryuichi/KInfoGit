## Context

当前博客列表页 (`pages/blog.tsx`) 使用 3 列卡片网格 + 封面图 + FilterBar（category tabs + tag dropdown）布局。数据源为 `profile-data/blog/*.md`，由语雀自动同步（GitHub Actions 每天运行）。

现有问题：
- 卡片+封面图模式依赖 `just build` 生成封面，dev 模式下图片 404
- 语雀同步来的碎片文章在大卡片中显得空洞
- FilterBar 的 category 是从文章自动提取的（如 "AI"、"Engineering"、"Recently Updated"），不统一
- 信息密度低，13 篇文章需要大量滚动

站点暗色主题（bg-gray-950/black），使用 Tailwind CSS + framer-motion，Pages Router SSG。

## Goals / Non-Goals

**Goals:**
- 替换为单列摘要列表 + 年份分区，提升信息密度和可扫描性
- 主题 Tab 筛选（全部/文章/随笔/分享），语义清晰
- 保持暗色主题，适配桌面和移动端
- 每篇文章展示：标题、日期、1-2 行摘要、tags
- 移除封面图依赖，dev 和 prod 体验一致

**Non-Goals:**
- 不改动博客详情页 (`pages/blog/[slug].tsx`)
- 不改动语雀同步流程（`sync-yuque.yml`、`convert-to-blog.ts`）
- 不改动 BlogPost 数据结构（`lib/data.ts`）
- 不做全文搜索
- 不修改 FloatingLines 组件本身（只是不再在博客页使用）

## Decisions

### 1. 列表布局：单列摘要列表 + 年份分区

**选择**：单列，每年一个 section，年份标题带分隔线。
**理由**：年份分区让时间线清晰，单列阅读流自然，参考 lotse/brianlovin 的成熟模式。
**替代方案**：卡片网格（现有，信息密度低）、双列（中文标题宽度不稳定）。

### 2. 主题筛选：顶部 Tab 而非 Sidebar

**选择**：顶部一行 Tab 按钮（全部/文章/随笔/分享），复用 framer-motion layoutId 做滑动指示器。
**理由**：Tab 比 Sidebar 更轻量，3-4 个分类不需要折叠结构。与现有 FilterBar 的 category tabs 样式一致但更简化。
**映射**：现有 category → 新主题的映射在 `getStaticProps` 中硬编码，不改 data.ts。

### 3. 摘要行数：限制 1-2 行

**选择**：`line-clamp-2`，excerpt 超长时截断。
**理由**：保持列表紧凑，避免某些语雀同步文章摘要过长撑开布局。

### 4. 移除的组件

- `FloatingLines` — 不在博客页使用（其他页面仍用）
- `BlogCard` — 不再被博客列表导入（保留文件，博客详情页 related posts 可能用）
- `FilterBar` — 完全被 Tab 替代，可删除（当前只被 blog.tsx 使用）

### 5. Category 映射策略

现有文章的 category 值不统一（"AI"、"Engineering"、"Recently Updated"等）。在页面层做映射：
- 含 "AI"、"Engineering"、技术关键词 → `文章`
- "Recently Updated" 或未匹配 → `随笔`（默认）
- 无现有文章属于 `分享`，但预留 Tab

长期应在 `convert-to-blog.ts` 中规范 category，但这次不改同步脚本。

## Risks / Trade-offs

- **[现有文章分类不准]** → category 映射是临时方案，后续应在 frontmatter 中规范化。本次先做 UI，数据改善作为后续任务。
- **[FilterBar 删除影响]** → 确认只被 blog.tsx 使用后再删除。Tag 筛选功能暂时移除，如果需要可后续加回。
- **[文章数量少]** → 目前仅 13 篇，年份分区可能某些年只有 1-2 篇。这是数据问题不是 UI 问题，随着内容积累会改善。
