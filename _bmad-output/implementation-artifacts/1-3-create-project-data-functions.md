# Story 1.3: 创建项目数据获取函数

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 开发者,
I want 封装好的数据获取函数,
so that 页面组件可以通过统一 API 获取项目数据，不直接操作 JSON 文件。

## Acceptance Criteria

1. **Given** Story 1.2 的 projects.json 已存在
   **When** 开发者导入 `lib/projects.ts`
   **Then** 可以调用 `getAllProjects(): Project[]` 获取所有项目

2. **And** 可以调用 `getFeaturedProjects(): Project[]` 获取 featured=true 且按 order 排序的项目

3. **And** 可以调用 `getProjectBySlug(slug: string): Project | undefined` 获取单个项目

4. **And** 所有函数返回类型正确，TypeScript 无报错

## Tasks / Subtasks

- [ ] Task 1: 创建 `lib/projects.ts` 文件 (AC: #1-4)
  - [ ] 导入 Project 类型从 `@/types/project`
  - [ ] 导入 projects.json 数据
  - [ ] 实现 getAllProjects() 函数
  - [ ] 实现 getFeaturedProjects() 函数（过滤 + 排序）
  - [ ] 实现 getProjectBySlug() 函数
- [ ] Task 2: 添加单元测试 (AC: #4)
  - [ ] 测试 getAllProjects 返回所有项目
  - [ ] 测试 getFeaturedProjects 只返回 featured=true 且按 order 排序
  - [ ] 测试 getProjectBySlug 正确查找和返回 undefined
- [ ] Task 3: 验证 TypeScript 类型正确 (AC: #4)
  - [ ] npm run type-check 通过
  - [ ] npm run lint 通过

## Dev Notes

### 依赖关系

**前置依赖（已完成）：**
- ✅ Story 1.1: `website/types/project.ts` - Project 接口已定义
- ✅ Story 1.2: `profile-data/projects.json` - 项目数据已存在（5 个项目）

**当前数据状态：**
- 总项目数：5
- Featured 项目：3（portrait-platform, anti-fraud-governance, security-strategy-lifecycle）
- 按 order 排序：1-5

### 关键架构约束

**文件位置（来自 Architecture）：**
- 新建文件：`website/lib/projects.ts`
- 类型导入：`@/types/project`
- 数据文件：`profile-data/projects.json`（相对于项目根目录）

**命名约定：**
- 文件名：camelCase.ts（如 projects.ts）
- 函数名：camelCase（如 getAllProjects）
- 使用 `@/` 路径别名导入

**数据获取模式（来自 Architecture）：**
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

### Project Structure Notes

**文件位置：**
- 新建：`website/lib/projects.ts`
- 测试：`website/lib/projects.test.ts`

**现有相关文件：**
- `website/lib/data.ts` - 已有数据获取函数（getCoreProjects 等）
- `website/types/project.ts` - Project 接口定义
- `profile-data/projects.json` - 项目数据源

**⚠️ 注意：不要修改 lib/data.ts**
- lib/data.ts 使用旧版 Project 接口（多语言结构）
- 新函数应独立于 lib/projects.ts
- 两套接口可并存，后续逐步迁移

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Data Fetching Patterns]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3]
- [Source: _bmad-output/implementation-artifacts/1-1-create-project-type-definition.md]
- [Source: _bmad-output/implementation-artifacts/1-2-create-project-data-file.md]

---

## 🔧 Technical Implementation Guide

### 必须遵循的代码模式

**1. 数据导入方式：**
```typescript
// website/lib/projects.ts
import { Project } from '@/types/project';
import projectsData from '../../profile-data/projects.json';

// 类型断言确保类型安全
const projects: Project[] = projectsData as Project[];
```

**2. 函数实现模式：**
```typescript
/**
 * 获取所有项目
 */
export function getAllProjects(): Project[] {
  return projects;
}

/**
 * 获取精选项目（featured=true），按 order 升序排序
 */
export function getFeaturedProjects(): Project[] {
  return projects
    .filter(p => p.featured)
    .sort((a, b) => a.order - b.order);
}

/**
 * 根据 slug 获取单个项目
 */
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find(p => p.slug === slug);
}
```

**3. 测试模式：**
```typescript
// website/lib/projects.test.ts
import { describe, it, expect } from 'vitest';
import { getAllProjects, getFeaturedProjects, getProjectBySlug } from './projects';

describe('projects lib', () => {
  describe('getAllProjects', () => {
    it('should return all projects', () => {
      const result = getAllProjects();
      expect(result.length).toBe(5);
    });
  });

  describe('getFeaturedProjects', () => {
    it('should return only featured projects', () => {
      const result = getFeaturedProjects();
      expect(result.every(p => p.featured)).toBe(true);
    });

    it('should be sorted by order ascending', () => {
      const result = getFeaturedProjects();
      for (let i = 1; i < result.length; i++) {
        expect(result[i].order).toBeGreaterThan(result[i-1].order);
      }
    });
  });

  describe('getProjectBySlug', () => {
    it('should return project for valid slug', () => {
      const result = getProjectBySlug('portrait-platform');
      expect(result?.id).toBe('portrait-platform');
    });

    it('should return undefined for invalid slug', () => {
      const result = getProjectBySlug('non-existent');
      expect(result).toBeUndefined();
    });
  });
});
```

### 技术栈版本确认

- TypeScript: ^5.0.0 (strict mode)
- Next.js: ^14.2.0 (Pages Router)
- Vitest: 测试框架
- 路径别名: `@/*` → `website/*`

### 验证命令

```bash
cd website
npm run type-check   # TypeScript 类型检查
npm run lint         # ESLint 检查
npm test            # 运行测试
```

### ⚠️ 常见 LLM 错误防范

1. **不要修改 lib/data.ts** - 保持现有功能不变
2. **不要使用 fs 模块读取 JSON** - 直接 import JSON 文件
3. **不要遗漏类型断言** - projectsData as Project[] 确保类型安全
4. **不要使用 App Router 语法** - 项目使用 Pages Router
5. **不要创建异步函数** - 数据在构建时已加载，无需 async
6. **排序必须是升序** - order 越小越靠前（1, 2, 3...）

### 预期测试结果

```
✓ getAllProjects returns 5 projects
✓ getFeaturedProjects returns 3 featured projects
✓ getFeaturedProjects returns projects sorted by order (1, 2, 3)
✓ getProjectBySlug finds existing project
✓ getProjectBySlug returns undefined for non-existent slug
```

---

## 前置 Story 经验总结

### 来自 Story 1-1 的经验

- 类型定义放在 `website/types/` 目录
- 使用 JSDoc 注释帮助理解
- 类型守卫函数 `isProject()` 可用于运行时验证
- 所有 27 个测试通过

### 来自 Story 1-2 的经验

- JSON 数据文件在 `profile-data/projects.json`
- 5 个项目，3 个 featured（order 1-3）
- 中文 tags 已替换为英文（Data Analysis, Graph Database 等）
- 使用 `python3 -m json.tool` 验证 JSON 格式

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### Change Log

- 2026-01-07: Story created by create-story workflow

### File List

