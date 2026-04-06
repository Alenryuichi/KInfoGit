## 1. 清理现有内容

- [x] 1.1 删除 `profile-data/blog/` 下所有现有 markdown 文件
- [x] 1.2 删除 `website/public/blog/images/` 下所有现有图片

## 2. 新建同步脚本

- [x] 2.1 创建 `scripts/sync-yuque.ts`：Yuque API 客户端（token 认证、GET /toc、GET /docs/:slug）
- [x] 2.2 实现 TOC 解析：提取 depth=1 的 TITLE 节点作为 category，记录 categoryOrder
- [x] 2.3 实现文档内容拉取：遍历 TOC 中的 DOC 节点，调用 API 获取 body，附加 created_at
- [x] 2.4 实现 HTML 清理：复用/迁移现有 `cleanHtmlTags()` 逻辑
- [x] 2.5 实现图片下载：扫描 markdown 中的图片 URL，下载到 `website/public/blog/images/`，替换路径
- [x] 2.6 实现 DeepSeek 生成 tags + excerpt（复用现有逻辑，移除 category 生成）
- [x] 2.7 实现 frontmatter 生成：title, date(created_at), tags, category(TOC), categoryOrder, readTime, featured, excerpt
- [x] 2.8 实现增量同步：`sync-state.json` 缓存 doc_id → updated_at 映射，跳过未变更文档
- [x] 2.9 实现 blog 文件写入：生成文件名、写入 `profile-data/blog/`

## 3. 更新 blog 页面

- [x] 3.1 修改 `website/pages/blog.tsx`：tabs 从 posts 数据动态生成，按 categoryOrder 排序
- [x] 3.2 移除 `mapCategoryToTheme()` 函数和硬编码的 `THEMES` / `Theme` 类型
- [x] 3.3 更新 `BlogPost` 类型（`website/lib/data.ts`）：添加可选 `categoryOrder` 字段

## 4. 更新 CI/CD

- [x] 4.1 修改 `.github/workflows/sync-yuque.yml`：替换 elog 步骤为 `npx tsx scripts/sync-yuque.ts`
- [x] 4.2 更新 workflow 环境变量：移除 `YUQUE_USERNAME`/`YUQUE_PASSWORD`，添加 `YUQUE_TOKEN`
- [x] 4.3 移除 elog 相关 steps（install yuque-sync deps、build yuque-sync）

## 5. 清理废弃代码

- [x] 5.1 删除 `scripts/convert-to-blog.ts`
- [x] 5.2 评估 `tools/yuque-sync/` 是否仍需保留（elog 依赖已不再使用）

## 6. 验证

- [x] 6.1 本地运行 `npx tsx scripts/sync-yuque.ts`，验证从语雀拉取文章、生成正确的 frontmatter
- [x] 6.2 验证 blog 页面 tabs 动态显示，排序与语雀目录一致
- [x] 6.3 验证增量同步：二次运行跳过已同步文档
- [x] 6.4 `npm run build` 构建成功
