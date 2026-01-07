# Story 6.4: Blog 页面优化

Status: done

## Story

As a 访问者,
I want Blog 页面有更好的文章列表展示,
so that 我能快速浏览和找到感兴趣的文章。

## Acceptance Criteria

1. **Given** 用户访问 Blog 页面
   **When** 页面加载完成
   **Then** Blog 页面内的搜索框已被删除（使用全局搜索即可）

2. **And** 文章以卡片形式展示，包含标题、日期、摘要

3. **When** 鼠标悬停在文章卡片上
   **Then** 卡片有轻微上浮效果和阴影变化

4. **And** 文章卡片显示相关标签（如有）

5. **And** 页面在移动端响应式布局正常

## Tasks / Subtasks

- [x] Task 1: 删除 Blog 页面内的搜索框 (AC: #1)
  - [x] 移除 SearchBox 组件和相关 state
  - [x] 调整布局 - 类别按钮居中显示
- [x] Task 2: 优化文章卡片样式 (AC: #2, #4)
  - [x] 已有标题、日期、摘要、封面图
  - [x] 标签显示已存在
- [x] Task 3: 添加卡片 hover 效果 (AC: #3)
  - [x] Framer Motion whileHover y: -8 上浮
  - [x] shadow-lg + hover:shadow-xl 阴影变化
- [x] Task 4: 优化移动端布局 (AC: #5)
  - [x] Tailwind 响应式已存在

## Dev Notes

### 删除搜索框

在 Blog 页面中找到搜索相关组件并移除：

```typescript
// 删除类似这样的代码
<SearchInput ... />
// 或
<input type="search" ... />
```

**理由**: 页面右上角已有全局搜索功能，Blog 页面内的搜索是冗余的。

### 卡片 hover 效果

```css
.blog-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.blog-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}
```

或使用 Framer Motion:

```typescript
<motion.article
  whileHover={{ 
    y: -4, 
    boxShadow: "0 12px 24px rgba(0,0,0,0.1)" 
  }}
  transition={{ duration: 0.2 }}
>
  {/* 卡片内容 */}
</motion.article>
```

### 卡片结构建议

```
┌─────────────────────────────────┐
│ [封面图 - 可选]                 │
├─────────────────────────────────┤
│ 文章标题                        │
│ 2026-01-07 · 5 min read        │
│                                 │
│ 文章摘要文字，限制在2-3行...    │
│                                 │
│ [Tag1] [Tag2] [Tag3]           │
└─────────────────────────────────┘
```

### 相关文件

- `pages/blog.tsx` 或 `pages/blog/index.tsx`
- `components/BlogCard.tsx` (如有)
- `components/BlogList.tsx` (如有)

### ⚠️ 注意事项

1. 删除搜索框后确保页面布局不会塌陷
2. 检查文章数据中是否有 tags 字段
3. 如果没有封面图数据，可以使用纯文字卡片
4. 保持与全站设计风格一致

### References

- [Source: Epic 1 回顾 - 行动项 #4]
- [Source: pages/blog.tsx]

---

## Dev Agent Record

### Implementation Plan
- 移除 SearchBox 组件导入和使用
- 移除 searchQuery state 和 handleSearch 函数
- 简化过滤逻辑（仅 tags 和 category）
- 类别按钮居中布局
- BlogCard 添加 Framer Motion hover 效果

### Completion Notes
- ✅ 删除 SearchBox 导入和 searchQuery state
- ✅ 简化 filteredPosts 过滤逻辑
- ✅ 类别按钮添加 motion.button + scale 动画
- ✅ BlogCard 改为 motion.article + whileHover y: -8
- ✅ 卡片添加 shadow-lg + hover:shadow-xl 阴影
- ✅ "Clear All Filters" 按钮添加动画
- ✅ 所有 46 个测试通过
- ✅ npm run build 成功

---

## File List

| 文件 | 操作 |
|------|------|
| `website/pages/blog.tsx` | 修改 - 移除 SearchBox, 简化过滤, 添加卡片入场动画 |
| `website/components/BlogCard.tsx` | 修改 - 添加 Framer Motion hover 效果 |
| `website/components/BlogCard.test.tsx` | 新建 - 9 个单元测试验证卡片组件 |

---

## Change Log

| 日期 | 变更 |
|------|------|
| 2026-01-07 | Story 实现完成 - 移除冗余搜索框, 优化卡片交互 |
| 2026-01-07 | Code Review 修复 - 添加卡片列表 stagger 入场动画, 添加 BlogCard.test.tsx |
