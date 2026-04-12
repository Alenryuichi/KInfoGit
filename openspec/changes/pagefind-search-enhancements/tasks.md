## 1. Pagefind 索引标记

- [x] 1.1 在 `blog/[slug].tsx` 添加 `data-pagefind-meta="type:Blog"` 和 `data-pagefind-meta="date:..."` 到内容容器
- [x] 1.2 在 `stars/[date].tsx` 添加 `data-pagefind-meta="type:Stars"`
- [x] 1.3 在 `ai-daily/[date].tsx` 添加 `data-pagefind-meta="type:AI Daily"`
- [x] 1.4 在 `work/[id].tsx` 添加 `data-pagefind-meta="type:Work"`
- [x] 1.5 在 `about.tsx` 添加 `data-pagefind-meta="type:About"`
- [x] 1.6 在 `blog/[slug].tsx` 的上一篇/下一篇导航区域添加 `data-pagefind-ignore`

## 2. 搜索结果分类标签

- [x] 2.1 更新 `SearchResult` 接口，添加 `type` 和 `date` 字段
- [x] 2.2 在 `performSearch` 中从 `result.meta.type` 和 `result.meta.date` 读取元数据
- [x] 2.3 搜索结果渲染中添加分类标签样式（右侧小标签，不同类型不同颜色）

## 3. 键盘导航

- [x] 3.1 添加 `selectedIndex` state，默认值 -1
- [x] 3.2 在搜索 modal 中监听 ↑↓ 键盘事件，更新 selectedIndex（循环滚动）
- [x] 3.3 Enter 键跳转到 selectedIndex 对应结果（-1 时跳转第一个）
- [x] 3.4 搜索结果列表中高亮 selectedIndex 对应项（背景色区分）
- [x] 3.5 searchQuery 变化时重置 selectedIndex 为 -1

## 4. 搜索历史

- [x] 4.1 创建 `useSearchHistory` hook：读写 localStorage，限制 5 条，去重
- [x] 4.2 用户选择搜索结果时调用 saveHistory 保存当前搜索词
- [x] 4.3 modal 打开时无输入状态下显示历史列表，点击历史词填入搜索框并搜索
- [x] 4.4 try/catch 包装 localStorage 操作，隐私模式下静默降级

## 5. 空状态引导

- [x] 5.1 无输入且无历史时显示引导提示（搜索范围说明 + 快捷键提示）
- [x] 5.2 有历史时显示历史列表（替代引导提示）

## 6. 预加载优化

- [x] 6.1 将 Pagefind 加载逻辑提取为独立函数 `loadPagefind()`
- [x] 6.2 搜索按钮（Desktop + Mobile）添加 `onMouseEnter` / `onFocus` 触发 `loadPagefind()`
- [x] 6.3 确保 loadPagefind 幂等——多次调用只加载一次

## 7. 验证

- [x] 7.1 `npm run build` 验证 Pagefind 索引包含 type/date meta
- [ ] 7.2 本地 serve 测试：搜索结果显示分类标签
- [ ] 7.3 测试键盘导航：↑↓ 选择、Enter 跳转
- [ ] 7.4 测试搜索历史：保存、显示、点击回填
- [ ] 7.5 测试预加载：hover 后首次搜索无延迟
