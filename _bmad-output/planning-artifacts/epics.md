---
stepsCompleted: [1]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
workflowType: 'epics'
project_name: 'KInfoGit'
user_name: 'alenryuichi'
date: '2026-01-07'
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

{{requirements_coverage_map}}

## Epic List

{{epics_list}}

