## 1. 同步脚本支持二级目录

- [ ] 1.1 修改 `scripts/sync-yuque.ts` — `DocWithCategory` 接口添加 `subcategory?: string`
- [ ] 1.2 修改 `parseToc()` — 追踪 depth=2 TITLE 节点为 currentSubcategory，depth=1 时重置
- [ ] 1.3 修改 `SyncState` 接口 — docs 条目添加 `subcategory?: string`
- [ ] 1.4 修改 `formatFrontmatter()` — 有 subcategory 时输出 `subcategory: "xxx"` 行
- [ ] 1.5 修改增量同步逻辑 — subcategory 变更也触发 frontmatter 更新

## 2. 数据层更新

- [ ] 2.1 修改 `website/lib/data.ts` — `BlogPost` 接口添加 `subcategory?: string`
- [ ] 2.2 修改 `getAllBlogPosts()` / `getBlogPost()` — 读取 `data.subcategory`

## 3. Popover 子筛选 UI

- [ ] 3.1 新增 popover 组件逻辑 — open/close state, click outside 监听, framer-motion 动画
- [ ] 3.2 修改 ThemeTabs — 有子分类的 tab 显示 ▾ 箭头，点击打开 popover
- [ ] 3.3 实现 tab 标签更新 — 选中子分类后显示「分类 · 子分类 ▾」
- [ ] 3.4 实现过滤逻辑 — category + subcategory 双重筛选
- [ ] 3.5 交互细节 — 切换 tab 关闭 popover 并重置 subcategory，点外部关闭

## 4. 验证

- [ ] 4.1 语雀添加二级目录，运行同步脚本，检查 frontmatter 包含 subcategory
- [ ] 4.2 `npm run build` 构建成功
- [ ] 4.3 本地 dev 验证 popover 交互：打开/关闭/选中/重置
