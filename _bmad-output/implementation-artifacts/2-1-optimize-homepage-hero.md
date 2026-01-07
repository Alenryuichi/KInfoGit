# Story 2.1: 优化首页 Hero 区域

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 访问者,
I want 首页顶部有清晰的个人定位和简介,
so that 我能在 10 秒内了解站主是谁、做什么。

## Acceptance Criteria

1. **Given** 访问者打开首页
   **When** 页面加载完成
   **Then** Hero 区域显示站主姓名和一句话定位

2. **And** 包含简短的个人介绍（2-3 句话）

3. **And** 布局在桌面和移动端均清晰可读

4. **And** 符合当前设计风格，支持明暗模式

## Tasks / Subtasks

- [x] Task 1: 优化 Hero 组件的内容结构 (AC: #1, #2)
  - [x] 更新姓名和一句话定位文案
  - [x] 优化个人介绍，使用更具冲击力的表达
  - [x] 确保信息层次清晰（姓名 > 定位 > 介绍）
- [x] Task 2: 验证响应式布局 (AC: #3)
  - [x] 检查桌面端 (>=1024px) 布局
  - [x] 检查平板端 (768-1024px) 布局
  - [x] 检查移动端 (<768px) 布局
- [x] Task 3: 验证主题支持 (AC: #4)
  - [x] 确认暗色模式样式正确
  - [x] 确认明色模式样式正确（如已实现）
- [x] Task 4: 验证和测试
  - [x] npm run build 通过
  - [x] 手动验证首页 Hero 效果

## Dev Notes

### 当前实现分析

**现有 Hero.tsx 结构：**
- ✅ 已有响应式布局（使用 Tailwind 断点）
- ✅ 已有动画效果（GSAP animateHeroEntrance）
- ✅ 已有 CTA 按钮（View My Work / Let's Connect）
- ✅ 已有社交链接（Email、GitHub、LinkedIn）
- ⚠️ 当前只有暗色模式（bg-black）
- ⚠️ 定位文案可优化（"I help founders turn ideas into..."）
- ⚠️ 个人介绍较长，可精简

**当前首页内容：**
- 姓名: "Kylin Miao"
- 定位: "I help founders turn ideas into seamless digital experiences"
- 角色: "Full Stack Developer"
- 介绍: "Senior Backend Engineer at Tencent..."

### 优化方向建议

**1. 内容优化：**
- 保持现有风格，微调文案使其更具吸引力
- 确保 10 秒内可理解：姓名 + 角色 + 核心专长
- 介绍精简到 2-3 句话

**2. 布局保持：**
- 现有响应式布局已良好，无需大改
- 保持 min-h-screen 全屏 Hero 效果
- 保持 CTA 按钮布局

**3. 主题支持：**
- 当前只有暗色模式实现
- Story 目标是"符合当前设计风格"，不强制实现明色模式
- 如需明色模式，需后续 Story 处理

### 关键架构约束

**文件位置：**
- 修改文件: `website/components/Hero.tsx`
- 可能涉及: `website/lib/config.ts`（如个人信息集中管理）

**命名约定（来自 Architecture）：**
- 组件: PascalCase.tsx
- 使用 `@/` 路径别名
- Tailwind 直接写 className

**响应式策略（来自 Architecture）：**
- 桌面优先
- 使用 `sm:`, `md:`, `lg:` 断点
- 现有代码已遵循此模式

### Project Structure Notes

**现有组件依赖：**
- `@/utils/animations` - animateHeroEntrance, addButtonHoverEffects
- `lucide-react` - 图标组件

**页面引用：**
- `website/pages/index.tsx` 导入并使用 Hero 组件

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/prd.md#User Journeys]
- [Source: website/components/Hero.tsx - 现有实现]


---

## 🔧 Technical Implementation Guide

### 内容优化建议

**建议的 Hero 文案结构：**

```
[开场定位] - 简短有力的一句话
  ↓
[姓名] - 清晰呈现
  ↓
[角色/专长] - 1-2 行
  ↓
[核心价值] - 2-3 句话介绍
  ↓
[CTA] - 行动按钮
```

**当前文案对比建议：**

| 区域 | 当前 | 可优化为 |
|------|------|---------|
| 开场 | "I help founders turn ideas into" | 保持或调整为更贴合实际背景 |
| 姓名 | "Kylin Miao" | 保持 |
| 角色 | "Full Stack Developer" | 可细化为核心专长领域 |
| 介绍 | 4 行长文 | 精简为 2-3 句 |

### 必须遵循的代码模式

**1. 响应式文字大小（现有模式）：**
```typescript
// 保持现有的响应式字号模式
<h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold">
  ...
</h1>
```

**2. 主题色彩（暗色模式）：**
```typescript
// 保持现有暗色主题
<section className="... bg-black text-white ...">
```

**3. 动画保持：**
```typescript
// 保持现有 GSAP 动画，不要删除
useEffect(() => {
  const timer = setTimeout(() => {
    animateHeroEntrance()
    addButtonHoverEffects()
  }, 100)
  return () => clearTimeout(timer)
}, [])
```

### 技术栈确认

- Next.js: ^14.2.0 (Pages Router)
- React: ^18.3.0
- Tailwind CSS: ^3.3.0
- Framer Motion: ^10.16.0
- GSAP: ^3.13.0
- Lucide React: ^0.294.0

### 验证命令

```bash
cd website
npm run build        # 构建验证
npm run dev          # 本地预览
```

### ⚠️ 常见 LLM 错误防范

1. **不要删除现有动画** - animateHeroEntrance 必须保留
2. **不要改变布局结构** - 保持 min-h-screen 全屏 Hero
3. **不要硬编码 basePath** - 链接使用相对路径
4. **不要引入新依赖** - 使用现有 Tailwind + Lucide
5. **保持 className 一致性** - 遵循现有 Tailwind 类命名模式
6. **不要移除响应式断点** - 保持 sm:, lg: 前缀

### 预期结果

- 首页加载后 10 秒内可清晰理解站主背景
- 内容层次分明：姓名 > 定位 > 介绍
- 桌面和移动端布局均良好
- 现有动画效果正常工作

---

## 前置 Story 经验总结

### 来自 Epic 1 的经验

**Story 1-1 (Project 类型定义):**
- 类型定义使用 JSDoc 注释
- 类型守卫函数用于运行时验证

**Story 1-2 (项目数据文件):**
- JSON 数据在 `profile-data/projects.json`
- 5 个项目，3 个 featured

**Story 1-3 (数据函数):**
- lib 函数使用缓存优化
- 返回数组副本保证不可变性
- 所有测试通过

### 现有代码模式参考

**Hero 组件结构：**
```
components/Hero.tsx
├── Background Effects (3 个模糊圆形)
├── Main Content Container
│   ├── Title Block (hero-title)
│   ├── Subtitle Block (hero-subtitle)
│   ├── Description Block (hero-description)
│   ├── CTA Buttons (hero-buttons)
│   └── Social Links (hero-social)
└── Scroll Indicator (hero-scroll)
```

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (Augment Agent)

### Debug Log References

- 2026-01-07: npm run build passed successfully (14 pages generated)

### Completion Notes List

- ✅ Updated Hero headline from generic "I help founders..." to specific "Building secure & intelligent systems"
- ✅ Changed main title to "Anti-fraud Tech Expert" - directly reflects actual expertise
- ✅ Updated role from "Full Stack Developer" to "Senior Backend Engineer @ Tencent"
- ✅ Condensed description from 4 sentences to 2 concise sentences
- ✅ Maintained all existing animations (GSAP animateHeroEntrance)
- ✅ Preserved responsive breakpoints (text-5xl sm:text-6xl lg:text-7xl)
- ✅ Kept dark mode styling (bg-black text-white)
- ✅ Build verification passed

### Change Log

- 2026-01-07: Story created by create-story workflow
- 2026-01-07: Implemented Hero content optimization - updated headline, title, role, and description
- 2026-01-07: Story completed by dev-story workflow
- 2026-01-07: Code review fixes - fixed HTML entity, indentation, broken link

### File List

- `website/components/Hero.tsx` (修改) - Hero 组件内容优化：更新标题、定位、角色描述和个人介绍；修复代码质量问题
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (修改) - 更新 Story 状态


