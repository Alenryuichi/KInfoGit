---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: 'complete'
completedAt: '2026-01-07'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - docs/index.md
  - docs/project-overview.md
  - docs/architecture.md
  - docs/component-inventory.md
  - docs/development-guide.md
workflowType: 'architecture'
project_name: 'KInfoGit'
user_name: 'alenryuichi'
date: '2026-01-07'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
本次迭代聚焦于将 KInfoGit 推进到 1.0 版本：
- 补全核心页面（首页、About、Work）及必要二级页面
- 在首页直接呈现代表项目列表，提供清晰导航到详情页
- 为文章/观点提供稳定入口，支持后续内容扩展
- 保证基础稳定性：无 404/断链，良好加载体验

**Non-Functional Requirements:**
- 性能：核心页面首屏体验良好，控制资源体积
- 响应式：桌面 + 手机竖屏优化
- SEO：基础质量保证（title、meta description）
- 无障碍：基础 a11y 保证（语义化 HTML、alt 文本）
- 浏览器：现代浏览器（Chrome、Safari、Firefox、Edge）

**Scale & Complexity:**
- Primary domain: Web (Static Site Generation)
- Complexity level: Low-Medium
- Estimated architectural components: ~15 React 组件 + 6 页面

### Technical Constraints & Dependencies

**已确定的技术栈：**
- Framework: Next.js 14.2.0 (Pages Router) - **保持不变**
- UI: React 18.3.0 + TypeScript 5.0.0
- Styling: Tailwind CSS 3.3.0
- Content: MDX 3.0.0 + Gray Matter
- Animation: Framer Motion 10.16.0
- Deployment: GitHub Pages (静态托管)

**关键约束：**
- 静态导出 (`output: 'export'`)，无服务器运行时
- GitHub Pages 限制：无动态 API、图片需手动优化
- 生产环境 basePath: `/KInfoGit`

### Cross-Cutting Concerns Identified

1. **主题管理**: 明/暗模式切换，LocalStorage 持久化
2. **响应式布局**: 所有页面需适配桌面和移动端
3. **SEO 元数据**: 每页需 title + meta description
4. **性能**: 代码分割、按需加载、资源优化
5. **内容结构**: 统一的项目信息模型，支持筛选和分组

### Key Architecture Decisions (from ADR Session)

| ADR | 决策 | 理由 |
|-----|------|------|
| ADR-001 | 保持 Pages Router | SSG 场景无需 App Router，迁移成本高于收益 |
| ADR-002 | Project 接口 + JSON 数据 | 分离数据与展示，类型安全，便于维护 |
| ADR-003 | 首页 = Hero + Featured + CTA | 快速传达核心信息，引导深入浏览 |
| ADR-004 | JSON 数据源 + 自动部署 | 单一数据源，减少重复维护 |

### Cross-Functional Trade-off Analysis

**项目展示策略:**
- 首页展示 3-4 个精选项目
- 使用 `featured` + `order` 字段控制展示
- 数据驱动，无需改代码即可调整

**项目详情分层:**
- 精选项目 (5-7 个): MDX 详情页，完整 case study
- 其他项目: JSON 数据，简化卡片展示
- 渐进增强，MVP 先做好核心项目

**响应式策略:**
- 桌面优先，移动端确保可用
- 项目卡片: 桌面网格 → 移动单列
- 导航: 桌面完整 → 移动汉堡菜单

## Starter Template Evaluation

### Primary Technology Domain

**Web Application (Static Site Generation)** - 基于 Next.js 14 的静态个人网站

### Starter Template Assessment

**项目状态**: Brownfield（已有代码基础）

本项目不需要选择新的 Starter Template，因为：
- 技术栈已确定且代码已存在
- 项目结构完整，包含 15 个组件和 6 个页面
- 开发工作流已配置（Just + npm scripts）
- 部署流程已就绪（GitHub Actions → GitHub Pages）

### Current Technology Stack (Already Established)

**Core Framework:**
- Next.js 14.2.0 (Pages Router, SSG)
- React 18.3.0
- TypeScript 5.0.0

**Styling & UI:**
- Tailwind CSS 3.3.0
- Framer Motion 10.16.0
- Lucide React 0.294.0

**Content Management:**
- MDX 3.0.0 + @mdx-js/loader
- Gray Matter 4.0.3
- Remark 15.0.0

**Development Tools:**
- ESLint 8.0.0 + eslint-config-next
- PostCSS 8.4.0 + Autoprefixer 10.4.0
- Just command runner

**Deployment:**
- GitHub Pages (静态托管)
- GitHub Actions CI/CD
- basePath: `/KInfoGit`

### Architectural Decisions Already Made

| 决策领域 | 已选方案 | 状态 |
|---------|---------|------|
| 路由架构 | Pages Router | ✅ 保持 |
| 渲染模式 | SSG (Static Export) | ✅ 保持 |
| 状态管理 | React Context API | ✅ 保持 |
| 样式方案 | Tailwind CSS | ✅ 保持 |
| 内容格式 | MDX + Gray Matter | ✅ 保持 |
| 部署目标 | GitHub Pages | ✅ 保持 |

### Focus for This Iteration

本次迭代重点在 **补全和优化现有架构**，而非技术栈更换：
1. 补全核心页面内容（About、Work）
2. 建立项目数据模型（Project interface + JSON）
3. 优化首页信息架构
4. 确保响应式和性能达标

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
1. 项目数据模型定义 → 决定了数据层实现
2. 内容存储位置 → 决定了内容管理流程

**Important Decisions (Shape Architecture):**
3. 组件组织模式 → 影响代码可维护性
4. 图片处理策略 → 影响性能和工作流

**Deferred Decisions (Post-MVP):**
- 博客分类/标签系统 → 内容量增加后再考虑
- 搜索功能 → 页面足够多后再添加
- 评论系统 → 需要后端支持，暂缓

### Data Architecture

**项目数据模型 (Project Interface):**

```typescript
interface Project {
  id: string;           // 唯一标识符
  title: string;        // 项目名称
  slug: string;         // URL 友好的标识符
  description: string;  // 简短描述 (卡片用)
  featured: boolean;    // 是否在首页展示
  order: number;        // 排序权重
  category: string;     // 类别 (产品设计/工程/研究等)
  tags: string[];       // 技术标签
  role: string;         // 担任角色
  period: string;       // 时间段
  thumbnail?: string;   // 缩略图路径
  links?: {             // 相关链接
    demo?: string;
    github?: string;
    article?: string;
  };
  hasDetailPage: boolean; // 是否有详情页 (MDX)
}
```

**决策理由:** 类型安全，字段完整覆盖展示需求，支持筛选和排序

**内容存储位置:**
- 项目列表数据: `profile-data/projects.json` (单一文件)
- 项目详情内容: `content/projects/{slug}.mdx` (精选项目)

**决策理由:** 单一 JSON 便于管理 10-20 个项目，MDX 提供富文本详情

### Frontend Architecture

**组件组织模式:** 扁平结构

保持当前 `components/` 根目录组织：
- 项目规模适中 (15 个组件)
- 简单易维护
- 无需过度工程化

**决策理由:** 符合 KISS 原则，当前规模下分类收益不高

### Performance Optimization

**图片处理策略:** 手动优化 + 本地存储

- 图片格式: WebP (主) + PNG/JPG (兼容)
- 压缩工具: 手动使用 squoosh.app 或 tinypng
- 存储位置: `public/images/projects/`
- 尺寸规范:
  - 缩略图: 400x300px
  - 详情图: 最大宽度 1200px

**决策理由:** GitHub Pages 无服务端图片优化，手动方案最简单可控

### Decision Impact Analysis

**Implementation Sequence:**
1. 创建 `types/project.ts` 定义 Project 接口
2. 创建 `profile-data/projects.json` 填充项目数据
3. 更新组件使用新数据结构
4. 优化图片资源存放

**Cross-Component Dependencies:**
- ProjectCard 组件 → 依赖 Project 接口
- 首页 → 依赖 featured + order 筛选逻辑
- Work 页面 → 依赖完整项目列表
- 项目详情 → 依赖 MDX + Project 数据

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 6 个领域需要统一规则

### Naming Patterns

**文件命名约定:**
| 类别 | 规则 | 示例 |
|------|------|------|
| React 组件 | PascalCase.tsx | `ProjectCard.tsx` |
| 页面文件 | kebab-case.tsx | `about.tsx` |
| 工具函数 | camelCase.ts | `getProjects.ts` |
| 类型定义 | PascalCase.ts | `Project.ts` |
| 数据文件 | kebab-case.json | `projects.json` |

**代码命名约定:**
| 类别 | 规则 | 示例 |
|------|------|------|
| 接口 | PascalCase | `interface Project` |
| 变量/函数 | camelCase | `featuredProjects` |
| 常量 | UPPER_SNAKE_CASE | `MAX_FEATURED` |
| Props 接口 | ComponentNameProps | `ProjectCardProps` |

### Structure Patterns

**目录组织:**
```
components/     # React 组件 (扁平结构)
pages/          # Next.js 页面
lib/            # 工具函数和数据获取
types/          # TypeScript 类型定义
profile-data/   # 静态 JSON 数据
content/        # MDX 内容文件
public/images/  # 图片资源
```

### Import Patterns

**路径别名 (必须使用):**
```typescript
// ✅ 正确
import { Project } from '@/types/project';
import ProjectCard from '@/components/ProjectCard';

// ❌ 禁止相对路径超过一层
import { Project } from '../../types/project';
```

### Component Patterns

**标准组件结构:**
```typescript
interface ComponentNameProps {
  requiredProp: Type;
  optionalProp?: Type;
  className?: string;  // 支持样式覆盖
}

export default function ComponentName({
  requiredProp,
  optionalProp,
  className
}: ComponentNameProps) {
  return (
    <div className={cn('base-styles', className)}>
      {/* 内容 */}
    </div>
  );
}
```

### Data Fetching Patterns

**数据获取分层:**
```typescript
// lib/projects.ts - 数据处理逻辑
export function getAllProjects(): Project[] { ... }
export function getFeaturedProjects(): Project[] { ... }

// pages/index.tsx - 只调用 lib 函数
export async function getStaticProps() {
  const projects = getFeaturedProjects();
  return { props: { projects } };
}
```

### Styling Patterns

**Tailwind CSS 使用规则:**
- 优先直接在 className 写 Tailwind 类
- 复杂/重复样式提取为变量
- 使用 `cn()` 合并条件样式
- 禁止使用 CSS Modules 或 styled-components

**暗色模式:**
- 使用 `dark:` 前缀
- 确保所有组件支持暗色模式

### Enforcement Guidelines

**All AI Agents MUST:**
1. 遵循上述命名约定，不得自行创造
2. 使用 `@/` 路径别名导入
3. 组件必须包含 TypeScript Props 接口
4. 数据获取逻辑放在 `lib/`，不在页面组件内处理
5. 保持与现有代码风格一致

**Pattern Verification:**
- 新代码通过 ESLint 检查
- 组件遵循现有组件的模式
- 疑问时参考 `components/` 现有代码

## Project Structure & Boundaries

### Complete Project Directory Structure

```
KInfoGit/
├── README.md
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── .eslintrc.json
├── justfile
│
├── .github/workflows/deploy.yml
│
├── components/           # React 组件 (扁平)
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Layout.tsx
│   ├── Hero.tsx
│   ├── ProjectCard.tsx
│   ├── ProjectList.tsx
│   ├── ThemeToggle.tsx
│   ├── MDXComponents.tsx
│   └── SEO.tsx
│
├── pages/                # Next.js 页面
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.tsx
│   ├── about.tsx
│   ├── work/
│   │   ├── index.tsx
│   │   └── [slug].tsx
│   └── blog/
│       ├── index.tsx
│       └── [slug].tsx
│
├── lib/                  # 工具函数
│   ├── projects.ts
│   ├── posts.ts
│   └── mdx.ts
│
├── types/                # TypeScript 类型
│   ├── project.ts
│   └── post.ts
│
├── context/              # React Context
│   └── ThemeContext.tsx
│
├── profile-data/         # 静态数据
│   └── projects.json
│
├── content/              # MDX 内容
│   ├── projects/*.mdx
│   └── posts/*.mdx
│
├── public/images/        # 静态资源
│   ├── projects/
│   └── avatar/
│
└── styles/globals.css
```

### Architectural Boundaries

**组件层次:**
- `pages/` → 页面组件，调用 getStaticProps
- `components/` → 可复用 UI 组件
- `lib/` → 数据获取和处理逻辑
- `types/` → TypeScript 类型定义

**数据边界:**
- `profile-data/` → JSON 静态数据源
- `content/` → MDX 富文本内容
- `lib/` → 数据获取 API

**关注点分离:**
- 页面只负责组装组件和调用 lib
- 组件只负责渲染，不处理数据获取
- lib 封装所有数据处理逻辑

### Requirements to Structure Mapping

| 需求 | 主要文件 |
|------|---------|
| 首页展示 | `pages/index.tsx`, `components/Hero.tsx`, `components/ProjectList.tsx` |
| 项目数据 | `types/project.ts`, `profile-data/projects.json`, `lib/projects.ts` |
| 项目详情 | `pages/work/[slug].tsx`, `content/projects/*.mdx` |
| 关于页面 | `pages/about.tsx` |
| 主题切换 | `context/ThemeContext.tsx`, `components/ThemeToggle.tsx` |
| 响应式 | 各组件内 Tailwind 响应式类 |

### Data Flow

**构建时数据流:**
1. `profile-data/projects.json` → 原始数据
2. `lib/projects.ts` → 数据处理 (筛选、排序)
3. `pages/*.tsx` getStaticProps → 注入页面
4. React 组件 → 渲染静态 HTML

**无运行时数据获取** - 所有数据在构建时确定

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
所有技术决策兼容协调：
- Next.js 14 + React 18 + TypeScript 5 版本匹配
- Tailwind CSS 3 与 Next.js 完美集成
- MDX 3 内容系统与 Pages Router 兼容
- SSG + GitHub Pages 部署方案一致

**Pattern Consistency:**
实现模式与技术栈对齐：
- 命名约定清晰（PascalCase 组件、camelCase 函数）
- 导入模式统一（@/ 路径别名）
- 数据获取分层（lib → getStaticProps → 组件）

**Structure Alignment:**
项目结构支持所有架构决策：
- 扁平组件结构符合项目规模
- pages/components/lib/types 边界清晰
- 数据流向明确（JSON → lib → 页面 → 组件）

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
| 需求 | 架构支持 |
|------|---------|
| 首页展示 | ✅ Hero + ProjectList + lib/projects.ts |
| About 页面 | ✅ pages/about.tsx |
| Work 项目 | ✅ pages/work/ + ProjectCard |
| 项目详情 | ✅ [slug].tsx + MDX |
| 博客入口 | ✅ pages/blog/ + MDX 系统 |

**Non-Functional Requirements Coverage:**
| NFR | 架构支持 |
|-----|---------|
| 性能 | ✅ SSG + 手动图片优化 |
| 响应式 | ✅ Tailwind + 桌面优先 |
| SEO | ✅ SEO 组件 + meta |
| 无障碍 | ✅ 语义化 HTML |

### Implementation Readiness Validation ✅

**Decision Completeness:** 完整
- 所有技术选择有版本号
- 实现模式有代码示例
- 规则可执行、可验证

**Structure Completeness:** 完整
- 目录结构具体到文件
- 边界定义清晰
- 数据流向明确

**Pattern Completeness:** 完整
- 命名、导入、组件模式覆盖全面
- 有正例和反例

### Gap Analysis Results

**Critical Gaps:** 无

**Important Gaps:**
- 需创建 `types/project.ts` 定义 Project 接口（实现第一步）

**Nice-to-Have:**
- 添加 `cn()` 样式合并工具
- 完善错误边界组件

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] 项目上下文分析完成
- [x] 规模和复杂度评估
- [x] 技术约束识别
- [x] 跨领域关注点映射

**✅ Architectural Decisions**
- [x] 关键决策有版本记录
- [x] 技术栈完整指定
- [x] 集成模式定义
- [x] 性能考虑已处理

**✅ Implementation Patterns**
- [x] 命名约定建立
- [x] 结构模式定义
- [x] 通信模式指定
- [x] 流程模式记录

**✅ Project Structure**
- [x] 完整目录结构定义
- [x] 组件边界建立
- [x] 集成点映射
- [x] 需求到结构映射完成

### Architecture Readiness Assessment

**Overall Status:** ✅ READY FOR IMPLEMENTATION

**Confidence Level:** 高 - 基于验证结果

**Key Strengths:**
1. Brownfield 项目，技术栈已验证可行
2. 架构决策清晰，无歧义
3. 实现模式有具体示例
4. 项目规模适中，架构复杂度可控

**Areas for Future Enhancement:**
1. 博客系统可后续添加分类/标签
2. 搜索功能可在内容增多后添加
3. 性能监控可在上线后集成

### Implementation Handoff

**AI Agent Guidelines:**
1. 严格遵循命名约定（PascalCase 组件、camelCase 函数）
2. 使用 `@/` 路径别名导入
3. 数据获取逻辑放在 `lib/`，不在页面组件内
4. 组件必须有 TypeScript Props 接口
5. 疑问时参考现有代码风格

**First Implementation Priority:**
1. 创建 `types/project.ts` - Project 接口定义
2. 创建 `profile-data/projects.json` - 项目数据
3. 创建 `lib/projects.ts` - 数据获取函数
4. 更新首页使用新数据结构

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅
**Total Steps Completed:** 8
**Date Completed:** 2026-01-07
**Document Location:** _bmad-output/planning-artifacts/architecture.md

### Final Architecture Deliverables

**📋 Complete Architecture Document**
- 所有架构决策已记录具体版本
- 实现模式确保 AI Agent 一致性
- 完整项目结构包含所有文件和目录
- 需求到架构的映射
- 验证确认一致性和完整性

**🏗️ Implementation Ready Foundation**
- 4 个关键架构决策 (ADR)
- 6 个实现模式类别
- ~15 个架构组件
- 5 个功能需求 + 5 个非功能需求全覆盖

**📚 AI Agent Implementation Guide**
- 技术栈及验证版本
- 防止实现冲突的一致性规则
- 清晰边界的项目结构
- 集成模式和通信标准

### Quality Assurance Checklist

**✅ Architecture Coherence**
- [x] 所有决策无冲突协同工作
- [x] 技术选择版本兼容
- [x] 模式支持架构决策
- [x] 结构与所有选择对齐

**✅ Requirements Coverage**
- [x] 所有功能需求有支持
- [x] 所有非功能需求已处理
- [x] 跨领域关注点已解决
- [x] 集成点已定义

**✅ Implementation Readiness**
- [x] 决策具体可执行
- [x] 模式防止 Agent 冲突
- [x] 结构完整无歧义
- [x] 示例提供清晰指导

---

**Architecture Status:** ✅ READY FOR IMPLEMENTATION

**Next Phase:** 使用本文档的架构决策和模式开始实现

**Document Maintenance:** 实现过程中如有重大技术决策变更，请更新此架构文档

