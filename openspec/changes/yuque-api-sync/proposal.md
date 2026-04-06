## Why

当前博客同步使用 elog + `yuque-pwd` 模式（账号密码模拟登录），存在随时失效、安全风险高、丢失语雀目录结构等问题。用户已将语雀知识库按「文章/随笔/分享」三个一级目录组织内容，希望博客的 theme tabs 能自动跟随语雀目录结构，新增目录时零代码改动即可出现新 tab。

## What Changes

- **替换 elog**：移除 `@elog/cli` 依赖，新建同步脚本直接调用语雀 API（token 认证），从 `Crafted-blog` 知识库拉取 TOC + 文档内容
- **目录驱动分类**：一级目录名 = `category` 字段，不再依赖 DeepSeek 猜测 category
- **动态 tabs**：`blog.tsx` 的 theme tabs 从文章数据动态生成，移除硬编码的 `THEMES` 数组和 `mapCategoryToTheme` 映射
- **tabs 排序**：按语雀目录在 TOC 中的出现顺序排列
- **日期改用语雀 `created_at`**：替代同步时间作为博客的 `date` 字段
- **图片本地化**：下载语雀文章中的图片到 `website/public/blog/images/`
- **保留 AI tags**：DeepSeek 继续生成 tags + excerpt
- **增量同步**：通过 `sync-state.json` 缓存文档的 `updated_at`，只处理新增/更新的文档
- **删除手写英文博客**：清理 `profile-data/blog/` 中现有的手写文章
- **清理 GitHub Actions**：更新 `sync-yuque.yml` 使用新脚本，移除 elog 相关步骤和 `YUQUE_USERNAME`/`YUQUE_PASSWORD` secrets

## Capabilities

### New Capabilities
- `yuque-api-sync`: 语雀 API 同步引擎 — TOC 解析、文档拉取、图片下载、增量缓存、frontmatter 生成

### Modified Capabilities
- `blog-list-view`: theme tabs 从硬编码改为数据驱动动态生成，移除 category mapping 逻辑

## Impact

- `scripts/convert-to-blog.ts` — 重写为独立同步脚本（或替换）
- `tools/yuque-sync/` — elog 相关代码可废弃
- `website/pages/blog.tsx` — tabs 动态化，移除 `mapCategoryToTheme`
- `website/lib/data.ts` — `BlogPost.category` 语义变更：从 AI 猜测 → 语雀目录名
- `.github/workflows/sync-yuque.yml` — 更新认证方式和脚本调用
- `profile-data/blog/` — 清空现有内容，由新同步脚本重新生成
