---
stepsCompleted: [1, 2, 3, 4]
status: 'complete'
completedAt: '2026-01-07'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
workflowType: 'epics'
project_name: 'KInfoGit'
user_name: 'alenryuichi'
date: '2026-01-07'
epicCount: 5
storyCount: 14
frCoverage: '100%'
---

# KInfoGit - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for KInfoGit, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: 补全核心页面（首页、About、Work）及必要二级页面，使基于当前已有内容即可完整对外展示
FR2: 在首页直接呈现代表项目列表（3-4 个精选项目），并提供清晰的导航到项目详情页面
FR3: 为文章/观点提供稳定且清晰的入口，支撑后续逐步补充
FR4: 项目列表页（Work/Projects）需结构清晰，帮助 HR 和面试官快速扫描代表项目集合
FR5: 每个项目需有结构化的详情页，稳定呈现背景、目标、角色、关键决策与结果等信息
FR6: 整体导航简单直观，从任意入口点进来，在极少点击内即可完成浏览路径（首页→项目列表→项目详情）

### NonFunctional Requirements

NFR1: 性能 - 核心页面首屏体验良好，不出现明显卡顿或异常缓慢加载，控制资源体积
NFR2: 响应式 - 所有核心页面在桌面和移动端（桌面 + 手机竖屏）均具有良好的自适应布局
NFR3: SEO - 基础质量保证（每页 title + meta description，可被搜索引擎索引）
NFR4: 无障碍 - 基础 a11y 保证（语义化 HTML、alt 文本、键盘操作支持）
NFR5: 浏览器兼容 - 支持现代浏览器（Chrome、Safari、Firefox、Edge，iOS Safari，Android Chrome）
NFR6: 可维护性 - 新增/修改项目时所需改动可控，同一信息尽量只维护一份权威来源
NFR7: 稳定性 - 核心访问路径上无明显 404 或断链问题

### Additional Requirements

**技术实现要求（来自 Architecture）：**
- 保持 Pages Router 架构（ADR-001）
- 使用 Project 接口 + JSON 数据模型分离数据与展示（ADR-002）
- 首页采用 Hero + Featured + CTA 结构（ADR-003）
- 使用 JSON 数据源 + 自动部署（ADR-004）

**数据模型要求：**
- 创建 `types/project.ts` 定义 Project 接口
- 创建 `profile-data/projects.json` 作为项目数据源
- 创建 `lib/projects.ts` 封装数据获取逻辑

**组件/页面要求：**
- 精选项目（5-7 个）使用 MDX 详情页
- 其他项目使用 JSON 数据简化卡片展示
- 桌面优先响应式，项目卡片桌面网格→移动单列
- 导航：桌面完整→移动汉堡菜单

**图片处理要求：**
- 图片格式：WebP（主）+ PNG/JPG（兼容）
- 存储位置：`public/images/projects/`
- 尺寸规范：缩略图 400x300px，详情图最大宽度 1200px

**命名与模式要求：**
- React 组件：PascalCase.tsx
- 页面文件：kebab-case.tsx
- 工具函数：camelCase.ts
- 使用 `@/` 路径别名导入

### FR Coverage Map

| FR | Epic | 描述 |
|----|------|------|
| FR1 | Epic 2, 3, 4, 5 | 核心页面补全（首页、About、Work、博客） |
| FR2 | Epic 1, 2 | 首页代表项目展示 |
| FR3 | Epic 4 | 文章/观点入口 |
| FR4 | Epic 1, 3 | 项目列表页结构 |
| FR5 | Epic 1, 3 | 项目详情页结构 |
| FR6 | Epic 2, 3 | 导航简洁直观 |

## Epic List

### Epic 1: 项目数据基础设施
**目标**：建立项目信息的类型安全数据层，使项目数据可被所有页面统一消费和展示
**FRs covered:** 支撑 FR1, FR2, FR4, FR5（为后续 Epic 提供数据基础）
**用户价值**：开发者可以通过编辑单一 JSON 文件来管理所有项目信息，无需多处修改

### Epic 2: 首页完整体验
**目标**：访问者在 10-20 秒内即可了解站主定位、看到代表项目，并能一键进入项目详情
**FRs covered:** FR1（首页部分）, FR2, FR6
**用户价值**：HR/面试官快速获得第一印象，找到感兴趣的项目入口

### Epic 3: 项目展示系统
**目标**：完整的项目列表页和详情页，让访问者可以浏览所有项目并深入了解具体项目
**FRs covered:** FR1（Work 部分）, FR4, FR5, FR6
**用户价值**：访问者可以通过「首页→列表→详情」完整路径深入了解项目

### Epic 4: 内容与博客入口
**目标**：为文章/观点提供稳定入口，即使当前内容有限也能支撑后续扩展
**FRs covered:** FR1（博客部分）, FR3
**用户价值**：面试官可以找到关于思考方式和方法论的内容入口

### Epic 5: 关于页面
**目标**：完善 About 页面，清晰展示个人背景、技能和经历
**FRs covered:** FR1（About 部分）
**用户价值**：访问者快速了解站主是谁、做什么、有何特长


---

## Epic 1: 项目数据基础设施

建立项目信息的类型安全数据层，使项目数据可被所有页面统一消费和展示。

### Story 1.1: 创建 Project 类型定义

As a 开发者,
I want 一个统一的 Project TypeScript 接口定义,
So that 所有项目相关代码都有类型安全保障，数据结构一致。

**Acceptance Criteria:**

**Given** 项目需要统一的项目数据模型
**When** 开发者查看 `types/project.ts`
**Then** 存在完整的 Project 接口定义，包含以下字段：
- id: string（唯一标识符）
- title: string（项目名称）
- slug: string（URL 友好标识符）
- description: string（简短描述）
- featured: boolean（是否首页展示）
- order: number（排序权重）
- category: string（类别）
- tags: string[]（技术标签）
- role: string（担任角色）
- period: string（时间段）
- thumbnail?: string（缩略图路径，可选）
- links?: { demo?: string; github?: string; article?: string }（相关链接，可选）
- hasDetailPage: boolean（是否有详情页）
**And** TypeScript 编译通过，无类型错误

### Story 1.2: 创建项目数据文件

As a 开发者,
I want 一个 JSON 文件存储所有项目数据,
So that 项目信息集中维护，修改无需改动多处代码。

**Acceptance Criteria:**

**Given** Story 1.1 的 Project 接口已存在
**When** 开发者查看 `profile-data/projects.json`
**Then** 存在符合 Project 接口的 JSON 数组
**And** 至少包含 3-5 个示例项目数据
**And** 每个项目的 featured、order 字段已正确设置
**And** JSON 格式有效，可被正常解析

### Story 1.3: 创建项目数据获取函数

As a 开发者,
I want 封装好的数据获取函数,
So that 页面组件可以通过统一 API 获取项目数据，不直接操作 JSON 文件。

**Acceptance Criteria:**

**Given** Story 1.2 的 projects.json 已存在
**When** 开发者导入 `lib/projects.ts`
**Then** 可以调用 `getAllProjects(): Project[]` 获取所有项目
**And** 可以调用 `getFeaturedProjects(): Project[]` 获取 featured=true 且按 order 排序的项目
**And** 可以调用 `getProjectBySlug(slug: string): Project | undefined` 获取单个项目
**And** 所有函数返回类型正确，TypeScript 无报错

---

## Epic 2: 首页完整体验

访问者在 10-20 秒内即可了解站主定位、看到代表项目，并能一键进入项目详情。

### Story 2.1: 优化首页 Hero 区域

As a 访问者,
I want 首页顶部有清晰的个人定位和简介,
So that 我能在 10 秒内了解站主是谁、做什么。

**Acceptance Criteria:**

**Given** 访问者打开首页
**When** 页面加载完成
**Then** Hero 区域显示站主姓名和一句话定位
**And** 包含简短的个人介绍（2-3 句话）
**And** 布局在桌面和移动端均清晰可读
**And** 符合当前设计风格，支持明暗模式

### Story 2.2: 首页精选项目展示

As a HR/面试官,
I want 首页直接展示 3-4 个代表性项目,
So that 我无需额外点击即可看到候选人的核心作品。

**Acceptance Criteria:**

**Given** Story 1.3 的 getFeaturedProjects 函数可用
**When** 访问者查看首页
**Then** Hero 区域下方展示 3-4 个精选项目卡片
**And** 每个卡片显示项目标题、简短描述、主要标签
**And** 点击卡片可跳转到项目详情页
**And** 项目按 order 字段排序展示
**And** 桌面端网格布局，移动端单列布局

### Story 2.3: 首页行动召唤区域

As a 访问者,
I want 首页有明确的下一步引导,
So that 我知道如何深入了解更多内容。

**Acceptance Criteria:**

**Given** 访问者浏览完首页精选项目
**When** 向下滚动到页面底部
**Then** 显示清晰的 CTA 区域，包含：
- "查看全部项目" 链接到 /work
- "了解更多" 链接到 /about
**And** CTA 样式醒目但不突兀
**And** 链接功能正常，无 404 错误

---

## Epic 3: 项目展示系统

完整的项目列表页和详情页，让访问者可以浏览所有项目并深入了解具体项目。

### Story 3.1: 项目列表页基础结构

As a 访问者,
I want 一个展示所有项目的列表页面,
So that 我可以浏览全部项目并选择感兴趣的深入了解。

**Acceptance Criteria:**

**Given** Story 1.3 的 getAllProjects 函数可用
**When** 访问者访问 /work 页面
**Then** 页面显示所有项目的卡片列表
**And** 每个卡片包含：标题、描述、类别、主要标签
**And** 项目按 order 字段排序
**And** 页面有清晰的标题和简短说明
**And** 桌面端网格布局（2-3 列），移动端单列

### Story 3.2: ProjectCard 组件优化

As a 访问者,
I want 项目卡片信息层次清晰,
So that 我能快速扫描并判断哪个项目值得深入。

**Acceptance Criteria:**

**Given** ProjectCard 组件接收 Project 数据
**When** 渲染项目卡片
**Then** 显示项目缩略图（如有）或占位图
**And** 标题使用合适的字号和层级
**And** 描述文本适当截断，不超过 2-3 行
**And** 标签以紧凑的标签样式展示
**And** 悬停时有视觉反馈（如阴影或边框变化）
**And** 支持明暗模式切换

### Story 3.3: 项目详情页动态路由

As a 访问者,
I want 点击项目卡片进入该项目的详情页,
So that 我可以深入了解项目的背景、角色和成果。

**Acceptance Criteria:**

**Given** Story 1.3 的 getProjectBySlug 函数可用
**When** 访问者点击项目卡片或直接访问 /work/[slug]
**Then** 页面显示该项目的详细信息
**And** 页面使用 getStaticPaths 预生成所有项目路径
**And** 详情页包含：项目标题、完整描述、角色、时间段、技术标签
**And** 如有外部链接（demo、github），显示可点击按钮
**And** 页面底部有返回列表的链接

### Story 3.4: MDX 项目详情支持

As a 站主,
I want 精选项目能使用 MDX 格式撰写详细案例,
So that 可以用富文本和自定义组件展示更复杂的项目拆解。

**Acceptance Criteria:**

**Given** 项目的 hasDetailPage 为 true
**When** 访问者访问该项目详情页
**Then** 页面渲染 `content/projects/{slug}.mdx` 的内容
**And** MDX 内容正确解析和显示
**And** 支持标准 Markdown 语法（标题、列表、代码块、图片）
**And** 样式与全站保持一致

---

## Epic 4: 内容与博客入口

为文章/观点提供稳定入口，即使当前内容有限也能支撑后续扩展。

### Story 4.1: 博客列表页创建

As a 访问者,
I want 一个博客/文章列表入口页面,
So that 我可以查看站主的思考和观点。

**Acceptance Criteria:**

**Given** 站点需要展示文章/观点内容
**When** 访问者访问 /blog 页面
**Then** 页面显示文章列表（即使当前为空或只有示例）
**And** 每篇文章显示标题、日期、简短摘要
**And** 页面有清晰的标题说明这是博客/文章区域
**And** 如无内容，显示友好的"敬请期待"提示

### Story 4.2: 博客详情页支持

As a 访问者,
I want 点击文章标题进入详情阅读,
So that 我可以完整阅读站主的文章内容。

**Acceptance Criteria:**

**Given** 存在 MDX 格式的博客文章
**When** 访问者点击文章或访问 /blog/[slug]
**Then** 页面渲染该文章的 MDX 内容
**And** 显示文章标题、发布日期、阅读时间（可选）
**And** 文章底部有返回列表的链接
**And** 样式与全站保持一致，阅读体验良好

### Story 4.3: 导航添加博客入口

As a 访问者,
I want 从导航栏快速进入博客区域,
So that 无论在哪个页面都能找到文章入口。

**Acceptance Criteria:**

**Given** 博客列表页已存在
**When** 访问者查看任意页面的导航栏
**Then** 导航中包含 "Blog" 或 "文章" 入口
**And** 点击后正确跳转到 /blog 页面
**And** 当前页面高亮正确（在博客相关页面时高亮）

---

## Epic 5: 关于页面

完善 About 页面，清晰展示个人背景、技能和经历。

### Story 5.1: About 页面内容结构

As a 访问者,
I want About 页面清晰展示站主的背景和能力,
So that 我能快速了解这是什么样的人。

**Acceptance Criteria:**

**Given** 访问者想了解站主背景
**When** 访问 /about 页面
**Then** 页面包含以下内容区块：
- 个人简介（2-3 段话）
- 技能/专长列表
- 工作经历概述（可选，简化版）
**And** 内容层次分明，易于扫描
**And** 布局在桌面和移动端均良好呈现

### Story 5.2: About 页面联系方式

As a HR/招聘方,
I want 在 About 页面找到联系方式,
So that 如有兴趣可以直接联系站主。

**Acceptance Criteria:**

**Given** 访问者浏览完 About 页面内容
**When** 查看页面底部或侧边区域
**Then** 显示联系方式或社交链接（如 GitHub、LinkedIn、Email）
**And** 链接可正常点击跳转
**And** 不强制显示完整邮箱（可用按钮或图标代替）

### Story 5.3: About 页面导航整合

As a 访问者,
I want 从导航栏快速访问 About 页面,
So that 无论在哪个页面都能找到个人介绍入口。

**Acceptance Criteria:**

**Given** About 页面已存在
**When** 访问者查看任意页面的导航栏
**Then** 导航中包含 "About" 入口
**And** 点击后正确跳转到 /about 页面
**And** 当前页面高亮正确（在 About 页面时高亮）

