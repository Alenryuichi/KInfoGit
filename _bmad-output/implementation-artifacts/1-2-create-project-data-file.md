# Story 1.2: 创建项目数据文件

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 开发者,
I want 一个 JSON 文件存储所有项目数据,
so that 项目信息集中维护，修改无需改动多处代码。

## Acceptance Criteria

1. **Given** Story 1.1 的 Project 接口已存在
   **When** 开发者查看 `profile-data/projects.json`
   **Then** 存在符合 Project 接口的 JSON 数组

2. **And** 至少包含 3-5 个示例项目数据

3. **And** 每个项目的 featured、order 字段已正确设置
   - 首页精选项目：featured=true, order 值按重要性排序（数字越小越靠前）
   - 普通项目：featured=false

4. **And** JSON 格式有效，可被正常解析

## Tasks / Subtasks

- [x] Task 1: 创建 `profile-data/projects.json` 文件 (AC: #1)
- [x] Task 2: 基于现有 `core-projects.json` 数据，转换为新 Project 接口格式 (AC: #2)
  - [x] 添加 slug 字段（基于 id 生成）
  - [x] 添加 description 字段（从 highlights 或 achievements 提取简短描述）
  - [x] 添加 featured 和 order 字段
  - [x] 将 tech_stack 映射为 tags
  - [x] 添加 hasDetailPage 字段
- [x] Task 3: 设置精选项目配置 (AC: #3)
  - [x] 选择 3-4 个代表性项目设置 featured=true
  - [x] 按重要性设置 order 值
- [x] Task 4: 验证 JSON 格式有效 (AC: #4)
  - [x] 使用 JSON 校验工具检查语法

## Dev Notes

### 依赖关系

**前置依赖：Story 1.1 的 Project 接口必须已完成**

Story 1.1 定义的 Project 接口结构：
```typescript
interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  featured: boolean;
  order: number;
  category: string;
  tags: string[];
  role: string;
  period: string;
  thumbnail?: string;
  links?: { demo?: string; github?: string; article?: string; };
  hasDetailPage: boolean;
}
```

### 现有数据分析

**⚠️ 重要：已存在 `profile-data/projects/core-projects.json`**

现有数据结构（5 个项目）：
- id、period、category 字段可直接复用
- title.zh 作为中文标题来源
- role.zh 作为角色来源  
- tech_stack 映射为 tags
- highlights.zh 或 achievements.zh[0] 可用于 description
- 需新增：slug, featured, order, hasDetailPage

**现有项目列表：**
1. `portrait-platform` - 画像中台系统 (2022-2024)
2. `anti-fraud-governance` - 反作弊治理系统 (2023-2024)
3. `anti-spam-graph` - 反垃圾图应用平台 (2021-2023)
4. `anti-spam-rollback` - 反垃圾快速回滚系统 (2023-2024)
5. `security-strategy-lifecycle` - 安全策略全生命周期管理系统 (2024-至今)

**推荐精选项目（featured=true）：**
- `portrait-platform` (order: 1) - 最具代表性的系统架构项目
- `anti-fraud-governance` (order: 2) - 显示直接业务收益
- `security-strategy-lifecycle` (order: 3) - 当前进行中的项目

### 关键架构约束

**文件位置（来自 Architecture）：**
- 数据文件：`profile-data/projects.json`（注意：不是 `projects/` 子目录）
- 数据文件命名：kebab-case.json

**数据规范：**
- slug 必须是 URL 友好的（小写、连字符分隔）
- description 控制在 50-100 字符
- order 数字越小越靠前
- hasDetailPage 精选项目设为 true，其他设为 false

### Project Structure Notes

**文件位置：**
- 新建：`profile-data/projects.json`
- 参考：`profile-data/projects/core-projects.json`（现有数据源）

**⚠️ 注意路径区别：**
- 架构要求：`profile-data/projects.json`（根目录下的单一文件）
- 现有结构：`profile-data/projects/core-projects.json`（子目录中）
- 建议：遵循架构要求，在根目录创建新文件

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2]
- [Source: _bmad-output/implementation-artifacts/1-1-create-project-type-definition.md]
- [Source: profile-data/projects/core-projects.json]

---

## 🔧 Technical Implementation Guide

### 目标 JSON 结构示例

```json
[
  {
    "id": "portrait-platform",
    "title": "画像中台系统",
    "slug": "portrait-platform",
    "description": "从 0 到 1 构建 10 亿级用户画像数据分析平台，支持 200+ 标签维度分析",
    "featured": true,
    "order": 1,
    "category": "system-architecture",
    "tags": ["Python", "Golang", "ClickHouse", "MySQL", "Vue.js", "Spark"],
    "role": "项目负责人",
    "period": "2022-2024",
    "thumbnail": "/images/projects/portrait-platform.webp",
    "links": {
      "article": "/blog/portrait-platform-architecture"
    },
    "hasDetailPage": true
  }
]
```

### 数据转换规则

从 `core-projects.json` 转换时：

| 源字段 | 目标字段 | 转换规则 |
|--------|----------|----------|
| id | id | 直接复制 |
| id | slug | 直接复制（已是 kebab-case） |
| title.zh | title | 取中文标题 |
| highlights.zh 或 achievements.zh[0] | description | 截取前 100 字符 |
| - | featured | 手动设置，推荐 3 个 |
| - | order | 手动设置，1-5 |
| category | category | 直接复制 |
| tech_stack | tags | 直接复制（过滤中文技术名） |
| role.zh | role | 取中文角色名 |
| period | period | 直接复制 |
| - | thumbnail | 可选，先留空 |
| - | links | 可选，先留空 |
| - | hasDetailPage | featured 项目设为 true |

### ⚠️ 常见 LLM 错误防范

1. **不要修改现有 `core-projects.json`** - 这是原始数据源，保持不变
2. **不要使用相对于 website 目录的路径** - 文件在项目根目录的 profile-data 下
3. **不要遗漏必需字段** - Project 接口所有非可选字段都必须存在
4. **不要使用无效的 slug** - 必须是小写、连字符分隔、URL 安全
5. **description 不要太长** - 控制在 100 字符以内，用于卡片展示

### 验证命令

```bash
# 验证 JSON 语法
cat profile-data/projects.json | python -m json.tool

# 或使用 jq
jq . profile-data/projects.json
```

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (Augment Agent)

### Debug Log References

- JSON validation passed: `python3 -m json.tool`
- TypeScript type-check passed
- All 27 unit tests passed (14 type guards + 13 data validation)

### Completion Notes List

- ✅ Created `profile-data/projects.json` with 5 projects converted from `core-projects.json`
- ✅ All projects conform to the Project interface from Story 1-1
- ✅ 3 featured projects selected: portrait-platform, anti-fraud-governance, security-strategy-lifecycle
- ✅ Featured projects have `hasDetailPage=true`, non-featured have `hasDetailPage=false`
- ✅ Order values set for ranking (1-5)
- ✅ All slugs are URL-friendly (lowercase, hyphen-separated)
- ✅ All descriptions under 100 characters
- ✅ Added comprehensive test suite validating all ACs

### Data Transformation Summary

| Project | Featured | Order | hasDetailPage |
|---------|----------|-------|---------------|
| portrait-platform | ✅ | 1 | ✅ |
| anti-fraud-governance | ✅ | 2 | ✅ |
| security-strategy-lifecycle | ✅ | 3 | ✅ |
| anti-spam-graph | ❌ | 4 | ❌ |
| anti-spam-rollback | ❌ | 5 | ❌ |

### Senior Developer Review (AI)

**Review Date:** 2026-01-07
**Reviewer:** Claude Opus 4.5 (Code Review Agent)
**Review Outcome:** Changes Requested → Auto-Fixed

**Action Items:**
- [x] [MED] Replace Chinese tags with English equivalents for i18n consistency
- [x] [MED] Remove extra blank lines from projects.json
- [x] [MED] Remove unused Project import from test file
- [x] [LOW] Remove extra blank lines from test file

**Fixes Applied:**
1. Replaced `数据分析` → `Data Analysis`
2. Replaced `图数据库` → `Graph Database`, `数据挖掘` → `Data Mining`
3. Replaced `分布式系统` → `Distributed Systems`, `微服务` → `Microservices`
4. Removed unused `Project` type import
5. Cleaned up trailing whitespace

### Change Log

- 2026-01-07: Initial creation of projects.json with 5 projects (Story 1-2)
- 2026-01-07: Code review fixes - replaced Chinese tags with English, cleanup

### File List

- `profile-data/projects.json` (NEW) - Project data file with 5 projects
- `website/types/projects-data.test.ts` (NEW) - Data validation tests (13 tests)
