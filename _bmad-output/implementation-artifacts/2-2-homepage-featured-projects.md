# Story 2.2: 首页精选项目展示

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a HR/面试官,
I want 首页直接展示 3-4 个代表性项目,
so that 我无需额外点击即可看到候选人的核心作品。

## Acceptance Criteria

1. **Given** Story 1.3 的 getFeaturedProjects 函数可用
   **When** 访问者查看首页
   **Then** Hero 区域下方展示 3-4 个精选项目卡片

2. **And** 每个卡片显示项目标题、简短描述、主要标签

3. **And** 点击卡片可跳转到项目详情页

4. **And** 项目按 order 字段排序展示

5. **And** 桌面端网格布局，移动端单列布局

## Tasks / Subtasks

- [x] Task 1: 创建 FeaturedProjects 组件 (AC: #1, #2, #3, #4)
  - [x] 创建 `website/components/FeaturedProjects.tsx`
  - [x] 接收 projects: Project[] props
  - [x] 实现项目卡片布局（标题、描述、标签）
  - [x] 添加点击跳转到 `/work/${project.id}`
- [x] Task 2: 实现响应式网格布局 (AC: #5)
  - [x] 桌面端: 2 列或 3 列网格
  - [x] 平板端: 2 列网格
  - [x] 移动端: 单列布局
- [x] Task 3: 集成到首页 (AC: #1)
  - [x] 修改 `website/pages/index.tsx`
  - [x] 添加 getStaticProps 调用 getFeaturedProjects
  - [x] 在 Hero 下方渲染 FeaturedProjects
- [x] Task 4: 验证和测试
  - [x] npm run build 通过
  - [x] 验证项目按 order 排序

## Dev Notes

### 前置依赖

**Story 1.3 已完成：**
- `getFeaturedProjects()` 函数已在 `website/lib/projects.ts` 实现
- 返回 `featured: true` 的项目，按 `order` 升序排序
- 数据来源: `profile-data/projects.json`

### 现有组件分析

**Projects.tsx 组件特点：**
- 已有完整的项目卡片样式
- 使用 GSAP 动画 (animateProjectCards)
- 显示: 标题、描述、公司、角色、时间、技术栈、成就
- 链接到 `/work/${project.id}`

**建议：** 创建简化版 FeaturedProjects 组件，复用卡片样式但精简内容

### 技术实现方案

**方案 A（推荐）: 创建独立 FeaturedProjects 组件**
- 更轻量，只显示核心信息
- 样式与 Hero 区域一致
- 不需要完整的 Projects 组件功能

**方案 B: 复用 Projects 组件**
- 添加 `variant="featured"` prop
- 条件渲染精简版卡片

### 布局规范

**卡片内容：**
- 项目标题 (project.title.zh)
- 简短描述 (project.highlights?.zh 或 project.description.zh)
- 主要标签 (project.tech_stack.slice(0, 3))
- 点击跳转链接

**响应式断点：**
- Desktop (>=1024px): 2-3 列网格
- Tablet (768-1024px): 2 列网格
- Mobile (<768px): 单列

### 关键架构约束

**文件位置：**
- 新组件: `website/components/FeaturedProjects.tsx`
- 页面修改: `website/pages/index.tsx`

**样式规范：**
- 使用 Tailwind CSS
- 暗色模式 (bg-black 背景)
- 渐变效果与 Hero 一致

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.2]
- [Source: website/lib/projects.ts - getFeaturedProjects]
- [Source: website/components/Projects.tsx - 卡片样式参考]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (Augment Agent)

### Debug Log References

- 2026-01-07: Initial build failed - type mismatch (project.title.zh vs project.title)
- 2026-01-07: Fixed by using correct Project type from lib/projects.ts

### Completion Notes List

- ✅ Created FeaturedProjects.tsx component (116 lines)
- ✅ Implemented responsive grid: 1 col mobile, 2 col tablet, 3 col desktop
- ✅ Each card shows: category badge, period, title, description, tech tags (max 3)
- ✅ Cards link to /work/${project.id}
- ✅ Added "View All Projects" CTA linking to /work#projects
- ✅ Integrated with index.tsx via getStaticProps + getFeaturedProjects
- ✅ Build successful

### Change Log

- 2026-01-07: Story created by create-story workflow
- 2026-01-07: Implemented FeaturedProjects component and integrated to homepage
- 2026-01-07: Story completed by dev-story workflow

### File List

- `website/components/FeaturedProjects.tsx` (新建) - 精选项目展示组件，支持响应式网格布局
- `website/pages/index.tsx` (修改) - 添加 getStaticProps 和 FeaturedProjects 组件
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (修改) - 更新故事状态

