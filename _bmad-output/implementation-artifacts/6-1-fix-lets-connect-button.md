# Story 6.1: 修复 Let's Connect 按钮

Status: review

## Story

As a 访问者,
I want 点击 "Let's Connect" 按钮能跳转到联系方式区域,
so that 我可以快速找到站主的联系方式和社交链接。

## Acceptance Criteria

1. **Given** 用户在首页
   **When** 用户点击 "Let's Connect" 按钮
   **Then** 页面跳转到 `/about#contact` 并平滑滚动到联系区域

2. **And** 滚动动画平滑自然，持续时间约 500-800ms

3. **And** 如果 About 页面没有 `#contact` 锚点，需要添加对应的 id

## Tasks / Subtasks

- [x] Task 1: 在 About 页面添加 contact 区域的 id="contact" (AC: #3)
- [x] Task 2: 修改 "Let's Connect" 按钮的 href 为 `/about#contact` (AC: #1)
- [x] Task 3: 添加平滑滚动行为 (AC: #2)
  - [x] 使用 CSS `scroll-behavior: smooth` 或 JS 实现 (已存在于 globals.css)
- [x] Task 4: 测试跳转和滚动效果

## Dev Notes

### 关键实现点

**按钮位置**: 首页 Hero 区域，可能在以下文件：
- `pages/index.tsx`
- `components/Hero.tsx` 或类似组件

**平滑滚动方案**:
```typescript
// 方案1: Next.js Link + CSS
<Link href="/about#contact" scroll={false}>
  Let's Connect
</Link>

// 在 globals.css 中添加
html {
  scroll-behavior: smooth;
}

// 方案2: 使用 onClick 处理
const handleClick = () => {
  router.push('/about').then(() => {
    document.getElementById('contact')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  });
};
```

### ⚠️ 注意事项

1. 确保 About 页面有联系信息区域可供跳转
2. 如果当前已在 About 页面，应直接滚动而非重新加载
3. 移动端也需要测试滚动效果

### References

- [Source: Epic 1 回顾 - 行动项 #1]
- [Source: pages/index.tsx]
- [Source: pages/about.tsx]

---

## Dev Agent Record

### Implementation Plan
- 使用简单的 HTML anchor 链接方案
- 在 About 组件的社交链接区域添加 `id="contact"`
- 修改 Hero 组件中 "Let's Connect" 按钮的 href
- 利用已存在的 CSS `scroll-behavior: smooth` 实现平滑滚动

### Debug Log
- 无问题，实现顺利

### Completion Notes
- ✅ 在 `About.tsx` 第 44 行添加了 `id="contact"`
- ✅ 修改 `Hero.tsx` 第 85 行，将 `href="mailto:miaojsi@outlook.com"` 改为 `href="/about#contact"`
- ✅ 确认 `globals.css` 已有 `scroll-behavior: smooth`
- ✅ 所有 40 个现有测试通过，无回归

---

## File List

| 文件 | 操作 |
|------|------|
| `website/components/About.tsx` | 修改 - 添加 id="contact" |
| `website/components/Hero.tsx` | 修改 - 更新 href 为 /about#contact |

---

## Change Log

| 日期 | 变更 |
|------|------|
| 2026-01-07 | Story 实现完成 - Let's Connect 按钮现在跳转到 About 页面的联系区域 |

