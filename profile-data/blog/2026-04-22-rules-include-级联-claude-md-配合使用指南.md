---
title: "Rules + @include + 级联 CLAUDE.md 配合使用指南"
date: "2026-04-22"
tags: ["Claude配置","AI助手优化","项目文档","开发规范","工具指南"]
category: "随笔"
categoryOrder: 4
readTime: "6 min read"
featured: false
excerpt: "本文深入浅出地介绍了如何高效组合使用Claude.md、rules和@include机制来优化AI助手在项目中的表现；核心在于各司其职，通过精简的全局入口、模块化规则和按需加载实现精准指导；文章提供了清晰的项目结构示例和实用要点，值得开发者关注。"
---

## 核心原则：各司其职
| 机制 | 用途 | 加载时机 | 最佳场景 |
| --- | --- | --- | --- |
| **CLAUDE.md** | 项目级全局上下文 | 启动时全量加载 | 架构概览、构建命令、关键约定 |
| **rules（无 paths）** | 模块化通用规范 | 启动时全量加载 | 代码风格、测试约定、安全要求 |
| **rules（有 paths）** | 文件级精准规范 | 仅匹配文件时加载 | API 规范、组件规范、数据库规则 |
| **@include** | 引用外部文档 | 随宿主文件一起加载 | 复用已有文档、跨项目共享 |
| **CLAUDE.local.md** | 个人私有覆盖 | 启动时加载，不入 Git | 本地路径、个人偏好 |

---

## 推荐项目结构
```plain
my-project/
├── CLAUDE.md                          ← 精简入口（<200行）
├── CLAUDE.local.md                    ← 个人覆盖（gitignore）
├── .claude/
│   ├── settings.json
│   └── rules/
│       ├── code-style.md              ← 无 paths，全局生效
│       ├── testing.md                 ← 无 paths，全局生效
│       ├── security.md                ← 无 paths，全局生效
│       ├── api.md                     ← 有 paths: src/api/**
│       ├── components.md              ← 有 paths: src/components/**
│       └── database.md               ← 有 paths: src/db/**
├── docs/
│   ├── architecture.md                ← 被 @include 引用
│   └── api-spec.md                    ← 被 @include 引用
└── src/
    ├── api/
    │   └── CLAUDE.md                  ← 子目录级联（按需加载）
    └── components/
        └── CLAUDE.md                  ← 子目录级联（按需加载）
```

---

## 一、CLAUDE.md：精简的全局入口
**核心原则：控制在 200 行以内**。过长会稀释有效信息，Claude 遵循度下降。

```markdown
# My Project

## 构建 & 测试
- `pnpm install` 安装依赖
- `pnpm test` 运行测试
- `pnpm build` 构建项目

## 架构概览
这是一个 Next.js + tRPC + Prisma 的全栈项目。
详细架构见 @docs/architecture.md

## 关键约定
- 使用 TypeScript strict mode
- 所有 PR 必须通过 CI
- commit message 遵循 conventional commits

## 容易踩的坑
- 数据库迁移前必须先 `pnpm db:generate`
- 环境变量在 `.env.example` 中有模板
```

**要点：**

+ 只放"必备命令 + 关键约定 + 易踩的坑"
+ 详细内容用 `@include` 引用或拆到 rules 中
+ 避免放长篇大论的 API 文档

---

## 二、Rules：模块化拆分
### 2.1 无条件规则（全局生效）
适合所有文件都需要遵守的通用规范：

```markdown



# 代码风格
- 使用 2 空格缩进
- 字符串用单引号
- 文件末尾留空行
- 函数不超过 50 行
```

```markdown


# 测试约定
- 测试文件与源文件同目录，命名 `*.test.ts`
- 使用 describe/it 结构
- mock 外部依赖，不 mock 内部模块
```

### 2.2 条件规则（按文件类型精准触发）
**这是 rules 系统最强大的能力**——只在处理匹配文件时才加载，减少噪音：

```markdown

---
paths:
  - "src/api/**/*.ts"
  - "src/routes/**/*.ts"
---

# API 开发规范
- 所有端点必须有输入校验（使用 zod）
- 统一错误响应格式 `{ error: string, code: number }`
- 必须写 OpenAPI 注释
- 使用 try-catch 包裹所有 handler
```

```markdown

---
paths:
  - "src/components/**/*.tsx"
  - "src/ui/**/*.tsx"
---

# React 组件规范
- 使用函数组件 + hooks
- Props 用 interface 定义，命名 XxxProps
- 导出命名组件，不用 default export
- 样式使用 Tailwind，不写内联 style
```

```markdown

---
paths:
  - "src/db/**/*.ts"
  - "prisma/**/*"
---

# 数据库规范
- 表名用 snake_case 复数形式
- 所有表必须有 created_at / updated_at
- 查询必须用参数化，禁止字符串拼接
- 迁移文件不可修改，只能新增
```

### 2.3 多模式匹配
```markdown
---
paths:
  - "**/*.{ts,tsx}"         # 所有 TypeScript 文件
  - "!**/*.test.ts"         # 但排除测试文件（ignore 库支持取反）
---
```

```markdown
---
paths:
  - "src/**/*"              # src 下所有文件
  - "lib/**/*"              # lib 下所有文件
---
```

---

## 三、@include：引用已有文档
### 3.1 基本用法
在 CLAUDE.md 或 rules 中引用外部文件：

```markdown

# My Project

项目架构详见 @docs/architecture.md
API 规范详见 @docs/api-spec.md
Git 工作流 @docs/git-workflow.md
```

**关键细节：**

+ 路径相对于当前文件所在目录（不是 CWD）
+ 支持 `@./相对路径`、`@~/home路径`、`@/绝对路径`
+ 最大递归深度 5 层
+ 代码块内的 `@path` 不会被解析

### 3.2 跨项目共享个人规范
```markdown

# 团队共享指令
...

# 个人偏好（不入 Git）
@~/.claude/my-preferences.md
```

个人偏好文件在你本地，不影响团队。

### 3.3 复用 AGENTS.md
如果项目已有其他 AI 工具用的 `AGENTS.md`：

```markdown

@AGENTS.md

## Claude 专属补充
- 使用 plan mode 处理 src/billing/ 下的修改
```

---

## 四、级联 CLAUDE.md：子目录专属上下文
CWD 以上的 CLAUDE.md 启动时全部加载。CWD 以下的子目录 CLAUDE.md **按需加载**——Claude 读到该目录的文件时才触发。

### 4.1 适用场景
Monorepo 或大项目中，不同目录有完全不同的技术栈/约定：

```markdown

# API 模块
这个目录是 Express + TypeORM 后端。
- 路由在 routes/ 下，每个文件对应一个资源
- 中间件在 middleware/ 下
- 本目录测试用 supertest
```

```markdown

# 前端模块
这个目录是 React + Vite 前端。
- 组件在 components/ 下
- 页面在 pages/ 下
- 本目录测试用 @testing-library/react
```

### 4.2 优先级
子目录的 CLAUDE.md 优先级 > 父目录：

```plain
/project/CLAUDE.md            → "使用 Jest 测试"
/project/src/legacy/CLAUDE.md → "使用 Mocha 测试"（覆盖父级）
```

---

## 五、配合策略速查
### 何时用什么
```plain
要写全局上下文？                          → CLAUDE.md
  └─ 内容超 200 行？                      → 拆到 @include 或 rules

要写通用规范？                            → .claude/rules/xxx.md（无 paths）
  └─ 只对特定文件类型生效？               → 加 paths frontmatter

子目录有独立技术栈/上下文？               → 子目录/CLAUDE.md
  └─ 有对该子目录的精细规则？             → 子目录/.claude/rules/

要引用已有文档（README、API spec）？      → @include
要跨项目共享规则？                        → symlink 或 @~ 引用
要覆盖团队配置做个人调整？                → CLAUDE.local.md
```

### 典型分层示例
```plain
CLAUDE.md（入口，<200 行）
  ├── @docs/architecture.md          # include 引入架构文档
  └── @docs/conventions.md           # include 引入约定文档

.claude/rules/
  ├── code-style.md                  # 无 paths → 全局代码风格
  ├── git.md                         # 无 paths → 全局 Git 规范
  ├── api.md                         # paths: src/api/** → API 专属
  ├── frontend.md                    # paths: src/ui/** → 前端专属
  └── testing.md                     # paths: **/*.test.ts → 测试专属

src/api/CLAUDE.md                    # 子目录上下文（按需加载）
src/frontend/CLAUDE.md               # 子目录上下文（按需加载）

CLAUDE.local.md                      # 个人覆盖（gitignore）
```

---

## 六、最佳实践清单
### 内容组织
1. **CLAUDE.md 不超过 200 行**——长了 Claude 遵循度下降
2. **一个 rule 文件一个主题**——`code-style.md`、`testing.md`、`security.md`
3. **单个 rule 文件不超过 500 行**
4. **能用条件规则就用条件规则**——减少无关上下文的噪音
5. **指令要具体可验证**——"用 2 空格缩进" 好过 "格式化好代码"

### 避免踩坑
6. **不要在 CLAUDE.md 和 rules 中写矛盾指令**——Claude 会随机选一个
7. **@include 不要超过 3 层嵌套**——虽然上限 5 层，但太深难以维护
8. **代码块里的 @path 不会被解析**——写示例时注意
9. **Monorepo 用 **`claudeMdExcludes`** 排除无关团队的 CLAUDE.md**
10. **定期用 **`/memory`** 检查**——确认你期望的文件都被加载了

### 团队协作
11. **CLAUDE.md + .claude/rules/ 提交 Git**——团队共享
12. **CLAUDE.local.md 加入 .gitignore**——个人私有
13. **用 symlink 跨项目共享公共规则**——`ln -s ~/shared-rules .claude/rules/shared`
14. **用 **`/init`** 自动生成起始 CLAUDE.md**——然后手动精简