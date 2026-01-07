# Story 2.3: 首页行动召唤区域

Status: done

## Story

As a 访问者,
I want 首页有明确的下一步引导,
so that 我知道如何深入了解更多内容。

## Acceptance Criteria

1. **Given** 访问者浏览完首页精选项目
   **When** 向下滚动到页面底部
   **Then** 显示清晰的 CTA 区域

2. **And** CTA 区域包含 "查看全部项目" 链接到 /work

3. **And** CTA 区域包含 "了解更多" 链接到 /about

4. **And** CTA 样式醒目但不突兀

5. **And** 链接功能正常，无 404 错误

## Tasks / Subtasks

- [x] Task 1: 创建 HomeCTA 组件 (AC: #1, #2, #3, #4)
  - [x] 创建 `website/components/HomeCTA.tsx`
  - [x] 添加 "查看全部项目" 按钮链接到 /work
  - [x] 添加 "了解更多" 按钮链接到 /about
  - [x] 实现醒目但不突兀的样式
- [x] Task 2: 集成到首页 (AC: #1)
  - [x] 修改 `website/pages/index.tsx`
  - [x] 在 FeaturedProjects 下方渲染 HomeCTA
- [x] Task 3: 验证和测试 (AC: #5)
  - [x] npm run build 通过
  - [x] 验证 /work 链接正常
  - [x] 验证 /about 链接正常

## Dev Notes

### 设计方向

**样式参考：**
- 保持暗色主题 (bg-black)
- 使用渐变背景增加视觉层次
- 主 CTA 使用白色填充按钮
- 次 CTA 使用边框按钮

**布局建议：**
- 居中布局
- 标题 + 副标题 + 按钮组
- 响应式：按钮在移动端垂直排列

### 现有组件参考

**FeaturedProjects.tsx 底部已有 CTA：**
- "View All Projects" 链接
- 可复用样式模式

**Hero.tsx CTA 按钮样式：**
- 主按钮: `bg-white text-black rounded-full`
- 次按钮: `border border-gray-600 text-gray-300 rounded-full`

### 技术约束

- 使用 Next.js Link 组件
- 保持与现有组件一致的动画效果
- 无需 getStaticProps（纯静态组件）

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.3]
- [Source: website/components/Hero.tsx - CTA 样式参考]
- [Source: website/components/FeaturedProjects.tsx - CTA 样式参考]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (Augment Agent)

### Debug Log References

- No issues encountered

### Completion Notes List

- ✅ Created HomeCTA.tsx component (76 lines)
- ✅ Includes gradient background for visual depth
- ✅ Primary CTA: "View All Projects" → /work (white filled button)
- ✅ Secondary CTA: "About Me" → /about (border button)
- ✅ Responsive: vertical stack on mobile, horizontal on desktop
- ✅ Uses animateOnScroll for scroll-triggered animation
- ✅ Build successful

### Change Log

- 2026-01-07: Story created by create-story workflow
- 2026-01-07: Implemented HomeCTA component and integrated to homepage
- 2026-01-07: Story completed

### File List

- `website/components/HomeCTA.tsx` (新建) - 首页 CTA 组件，包含两个导航按钮
- `website/pages/index.tsx` (修改) - 在 FeaturedProjects 下方集成 HomeCTA
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (修改) - 更新故事状态

