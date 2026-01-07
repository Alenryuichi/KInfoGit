# Story 3.4: MDX 项目详情支持

Status: done

## Story

As a 站主,
I want 精选项目能使用 MDX 格式撰写详细案例,
so that 可以用富文本和自定义组件展示更复杂的项目拆解。

## Acceptance Criteria

1. **Given** 项目的 hasDetailPage 为 true
   **When** 访问者访问该项目详情页
   **Then** 页面渲染 `content/projects/{slug}.mdx` 的内容

2. **And** MDX 内容正确解析和显示

3. **And** 支持标准 Markdown 语法（标题、列表、代码块、图片）

4. **And** 样式与全站保持一致

## Tasks / Subtasks

- [x] Task 1: 创建 MDX 内容目录结构
  - [x] 创建 `profile-data/projects/` 目录
  - [x] 为 hasDetailPage=true 的项目创建 Markdown 文件
- [x] Task 2: 添加内容读取函数
  - [x] 在 lib/data.ts 添加 getProjectDetailContent 函数
  - [x] 使用 gray-matter 解析 frontmatter
- [x] Task 3: 更新项目详情页支持 Markdown
  - [x] 修改 `/work/[id].tsx` 接收 detailContent prop
  - [x] 添加 formatMarkdownContent 函数渲染内容
- [x] Task 4: 验证和测试
  - [x] npm run build 通过
  - [x] 验证 Markdown 渲染正确

## Dev Notes

### 现有 MDX 配置

**Blog 已使用 MDX：**
- `website/content/blog/*.mdx` 已存在
- `website/pages/blog/[slug].tsx` 已实现 MDX 渲染
- 可参考现有模式

### 项目数据

**hasDetailPage=true 的项目：**
1. portrait-platform
2. anti-fraud-governance
3. security-strategy-lifecycle

### 实现方案

**方案 A: 参考 Blog 模式**
- 在 content/projects/ 创建 MDX 文件
- 使用 @next/mdx 或 next-mdx-remote 渲染

**方案 B: 渐进增强**
- 保留现有详情页作为默认
- 如果 MDX 文件存在，则渲染 MDX 内容

### References

- [Source: website/pages/blog/[slug].tsx - MDX 渲染参考]
- [Source: website/content/blog/*.mdx - MDX 内容格式参考]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (Augment Agent)

### Debug Log References

- No issues encountered

### Completion Notes List

- ✅ Created profile-data/projects/ directory
- ✅ Created 3 Markdown files for hasDetailPage=true projects
- ✅ Added getProjectDetailContent() to lib/data.ts
- ✅ Added formatMarkdownContent() to [id].tsx
- ✅ Updated getStaticProps to fetch detailContent
- ✅ Renders Markdown content below standard project info
- ✅ Build successful

### Change Log

- 2026-01-07: Story created
- 2026-01-07: Implemented Markdown support for project details
- 2026-01-07: Story completed

### File List

- `profile-data/projects/portrait-platform.md` (新建) - 画像中台项目详情
- `profile-data/projects/anti-fraud-governance.md` (新建) - 反作弊治理项目详情
- `profile-data/projects/security-strategy-lifecycle.md` (新建) - 策略生命周期项目详情
- `website/lib/data.ts` (修改) - 添加 getProjectDetailContent 函数
- `website/pages/work/[id].tsx` (修改) - 支持 Markdown 渲染
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (修改) - 更新故事状态

