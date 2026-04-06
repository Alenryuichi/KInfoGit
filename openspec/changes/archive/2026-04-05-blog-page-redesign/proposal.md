## Why

当前博客页面使用卡片网格布局（3列 BlogCard + 封面图），存在严重可读性问题：语雀同步来的文章标题包含 Markdown 标记（`###`），碎片化笔记被当完整文章展示，封面图在 dev 模式下 404。需要重新设计为以内容为核心的摘要列表视图，提升信息密度和扫描效率。

## What Changes

- 将博客列表从卡片网格改为**单列摘要列表**，按年份分区展示
- 顶部新增**主题 Tab 筛选**（全部/文章/随笔/分享），替换现有的 category + tag 双重筛选
- 移除 BlogCard 组件和封面图依赖，改为纯文字排版
- 移除 FilterBar 组件（用更简洁的 Tab 替代）
- 移除页面顶部的 FloatingLines 背景动画（减少视觉噪音）
- BlogPost 的 `category` 字段语义改为主题分类（文章/随笔/分享）
- 每篇文章展示：标题、日期、摘要（1-2行）、tags

## Capabilities

### New Capabilities
- `blog-list-view`: 年份分区 + 摘要列表的博客列表页布局，包含主题 Tab 筛选

### Modified Capabilities
（无现有 spec 需修改）

## Impact

- `website/pages/blog.tsx` — 完全重写列表页
- `website/components/BlogCard.tsx` — 不再被列表页使用（保留供博客详情页引用，或删除）
- `website/components/FilterBar.tsx` — 不再被使用，可删除
- `website/lib/data.ts` — BlogPost.category 字段含义不变但值需规范化
- `profile-data/blog/*.md` — 现有文章的 frontmatter category 需映射到新分类体系
