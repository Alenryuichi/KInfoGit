## 1. 页面重写

- [x] 1.1 重写 `pages/blog.tsx`：移除 BlogCard/FilterBar/FloatingLines 导入，改为单列摘要列表 + 年份分区布局
- [x] 1.2 实现主题 Tab 组件（全部/文章/随笔/分享），使用 framer-motion layoutId 做滑动指示器
- [x] 1.3 实现 category → 主题映射函数（AI/Engineering → 文章，其他 → 随笔）
- [x] 1.4 实现年份分组逻辑：按年份降序，每年内按日期降序
- [x] 1.5 实现单篇文章行：标题（链接到 /blog/slug/）、日期（MM/DD）、摘要（line-clamp-2）、tags（最多4个）

## 2. 响应式与样式

- [x] 2.1 内容区 max-w-3xl 居中，适配暗色主题
- [x] 2.2 移动端 Tab 栏可横向滚动
- [x] 2.3 年份标题 + 分隔线样式
- [x] 2.4 文章行 hover 效果（标题变色等微交互）

## 3. 清理

- [x] 3.1 确认 FilterBar 仅被 blog.tsx 使用后删除 `components/FilterBar.tsx`
- [x] 3.2 确认 BlogCard 在其他页面无引用后决定是否删除

## 4. 验证

- [x] 4.1 dev 模式下访问 /blog 页面无报错，文章按年份分区正确展示
- [x] 4.2 Tab 筛选功能正常，切换时文章列表正确过滤
- [x] 4.3 点击文章标题可正确跳转到详情页
- [x] 4.4 移动端布局正常，Tab 可横向滑动
