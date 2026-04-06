## Why

语雀知识库已按一级目录（文章/随笔/分享）驱动 blog tabs。用户希望二级目录也能参与筛选——比如「文章」下的「AI」「工程化」子目录。需要同步脚本支持二级目录，并在 blog 页面提供 popover 子筛选 UI。

## What Changes

- **同步脚本支持二级目录**：`scripts/sync-yuque.ts` 的 TOC 解析识别 depth=2 TITLE 节点，映射为 `subcategory` 字段写入 frontmatter
- **Popover 子筛选 UI**：有子分类的 tab 显示 `▾` 箭头，点击弹出 popover 选择子分类，选中后 tab 文字变为「文章 · AI ▾」
- **数据层更新**：`BlogPost` 类型和数据读取增加 `subcategory` 字段

## Capabilities

### New Capabilities
- `subcategory-popover`: blog 页面的 popover 子分类筛选组件

### Modified Capabilities
- `yuque-api-sync`: TOC 解析增加二级目录 → subcategory 映射
- `blog-list-view`: tab 增加 popover 子筛选交互

## Impact

- `scripts/sync-yuque.ts` — parseToc() 增加 depth=2 追踪，frontmatter 增加 subcategory 字段
- `website/pages/blog.tsx` — ThemeTabs 组件重构，新增 popover 交互
- `website/lib/data.ts` — BlogPost 接口添加 subcategory
- `profile-data/blog/*.md` — 重新同步后 frontmatter 增加 subcategory 字段
