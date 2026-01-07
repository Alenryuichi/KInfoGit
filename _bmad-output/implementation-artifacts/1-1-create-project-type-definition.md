# Story 1.1: 创建 Project 类型定义

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 开发者,
I want 一个统一的 Project TypeScript 接口定义,
so that 所有项目相关代码都有类型安全保障，数据结构一致。

## Acceptance Criteria

1. **Given** 项目需要统一的项目数据模型
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

2. **And** TypeScript 编译通过，无类型错误

## Tasks / Subtasks

- [ ] Task 1: 创建 `website/types/` 目录 (AC: #1)
- [ ] Task 2: 创建 `website/types/project.ts` 文件，定义 Project 接口 (AC: #1)
  - [ ] 定义所有必需字段和可选字段
  - [ ] 添加 JSDoc 注释说明每个字段用途
  - [ ] 导出 Project 接口和相关类型
- [ ] Task 3: 验证 TypeScript 编译通过 (AC: #2)
  - [ ] 运行 `npm run type-check` 确保无错误

## Dev Notes

### 关键架构约束

**类型定义规范（来自 Architecture）：**
- 类型文件放在 `types/` 目录
- 文件命名使用 PascalCase：`Project.ts` 或可放在 `project.ts`
- 接口使用 PascalCase：`interface Project {}`
- 使用 `| null` 而非 `| undefined` 表示可能缺失的数据（可选字段除外）

**代码风格要求：**
- 使用 named export: `export interface Project {}`
- Props 接口: ComponentName + Props (如 `ProjectCardProps`)
- 常量使用 UPPER_SNAKE_CASE

### 现有代码分析

**⚠️ 重要发现：`lib/data.ts` 中已存在 Project 接口（第 47-85 行）**

现有结构与架构要求存在差异：
```typescript
// 现有接口（lib/data.ts）
interface Project {
  id: string;
  title: { zh: string; en: string; };  // 多语言
  period: string;
  company: string;
  role: { zh: string; en: string; };   // 多语言
  tech_stack: string[];
  responsibilities: { zh: string[]; en: string[]; };
  achievements: { zh: string[]; en: string[]; };
  description?: { zh: string; en: string; };
  highlights?: { zh: string; en: string; };
  impact?: string;
  category?: string;
}
```

**建议实现策略：**
1. 创建新的 `types/project.ts`，定义架构要求的简化 Project 接口
2. 保留 `lib/data.ts` 中的接口作为 `ProjectData`（内部数据源类型）
3. 创建转换函数将 `ProjectData` 映射到 `Project`
4. 或者：扩展现有接口，添加缺失字段

**推荐方案（符合 NFR6 可维护性）：**
采用扩展方案，在新类型文件中定义统一接口，并确保向后兼容。

### Project Structure Notes

**文件位置：**
- 新建：`website/types/project.ts`
- 相关文件：`website/lib/data.ts`（现有 Project 接口）

**路径别名：**
- 创建后使用 `@/types/project` 导入
- tsconfig.json 已配置 `@/*` 别名

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/project-context.md#TypeScript Rules]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1]

---

## 🔧 Technical Implementation Guide

### 必须遵循的代码模式

**1. 接口定义模式：**
```typescript
// types/project.ts
/**
 * Project 项目数据模型
 * 用于展示层的统一项目数据结构
 */
export interface Project {
  /** 唯一标识符，用于路由和数据查询 */
  id: string;
  /** 项目标题 */
  title: string;
  /** URL 友好的标识符，用于 /work/[slug] 路由 */
  slug: string;
  /** 简短描述，用于卡片展示（建议 50-100 字） */
  description: string;
  /** 是否在首页精选区域展示 */
  featured: boolean;
  /** 排序权重，数字越小越靠前 */
  order: number;
  /** 项目类别（如 system-architecture, anti-fraud） */
  category: string;
  /** 技术标签数组 */
  tags: string[];
  /** 担任的角色 */
  role: string;
  /** 时间段（如 "2022-2024"） */
  period: string;
  /** 缩略图路径，相对于 public 目录 */
  thumbnail?: string;
  /** 相关链接 */
  links?: ProjectLinks;
  /** 是否有 MDX 详情页 */
  hasDetailPage: boolean;
}

export interface ProjectLinks {
  /** 演示/线上地址 */
  demo?: string;
  /** GitHub 仓库地址 */
  github?: string;
  /** 相关文章链接 */
  article?: string;
}
```

**2. 禁止的模式：**
```typescript
// ❌ 禁止使用 any
export interface Project {
  data: any;  // 不允许
}

// ❌ 禁止使用相对路径超过 2 层
import { Project } from '../../../types/project';

// ✅ 使用路径别名
import { Project } from '@/types/project';
```

### 技术栈版本确认

- TypeScript: ^5.0.0 (strict mode)
- Next.js: ^14.2.0 (Pages Router)
- 路径别名: `@/*` → `website/*`

### 验证命令

```bash
cd website
npm run type-check   # TypeScript 类型检查
npm run lint         # ESLint 检查
```

### ⚠️ 常见 LLM 错误防范

1. **不要直接修改 `lib/data.ts` 中的现有 Project 接口** - 这会破坏现有功能
2. **不要使用 App Router 语法** - 项目使用 Pages Router
3. **不要遗漏 JSDoc 注释** - 帮助其他开发者和 AI 理解字段用途
4. **不要硬编码中文字符串** - 保持接口的语言无关性
5. **不要创建循环依赖** - types 目录不应依赖其他模块

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

