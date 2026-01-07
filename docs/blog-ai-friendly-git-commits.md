---
title: "构建 AI 友好的 Git 工作流：从 git-smart-commit 看自动化与记忆机制"
date: 2026-01-07
author: alenryuichi
tags:
  - git
  - conventional-commits
  - ai
  - automation
  - workflow
---

# 构建 AI 友好的 Git 工作流：从 git-smart-commit 看自动化与记忆机制

> 在 AI 深度参与软件开发的时代，Commit Message 不再只是给人看的。它是 AI 理解代码变更意图的关键入口，也是自动化工具链的数据基础。

---

## 引言：为什么 Commit Message 在 AI 时代变得更重要？

Git 的 commit message 看似只是一行简单的文字，但在现代软件工程中，它承载着远超"记录变更"的使命：

1. **自动化 CHANGELOG 生成** - 工具如 semantic-release 直接从 commit 解析版本变更
2. **语义化版本推断** - `feat:` 触发 MINOR 版本，`fix:` 触发 PATCH，`BREAKING CHANGE:` 触发 MAJOR
3. **AI 代码审查** - GitHub Copilot、Cursor 等工具依赖 commit context 理解变更意图
4. **知识传承** - 未来的开发者（包括 AI 助手）通过历史 commit 理解"为什么"

一条随意的 `"fix bug"` 和一条结构化的 `"fix(auth): prevent token expiration during refresh"` 对 AI 的理解深度有天壤之别。

---

## 第一部分：Conventional Commits 规范速览

### 什么是 Conventional Commits？

Conventional Commits 是一个轻量级的 commit message 格式规范，旨在让 commit 历史**同时对人类和机器可读**。

其核心格式如下：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 核心元素解析

| 元素 | 说明 | 示例 |
|------|------|------|
| **type** | 变更类型，决定语义化版本 | `feat`, `fix`, `chore`, `docs`, `refactor` |
| **scope** | 影响范围（可选） | `auth`, `api`, `ui` |
| **description** | 简短描述，祈使句，≤50 字符 | `add user logout endpoint` |
| **body** | 详细说明"为什么"（可选） | 解释动机、影响、关键细节 |
| **footer** | 元数据（可选） | `BREAKING CHANGE:`, `Refs: #123` |

### type 与语义化版本的映射

```
feat:             → MINOR (新功能)
fix:              → PATCH (修复)
BREAKING CHANGE:  → MAJOR (破坏性变更)
其他 (docs/chore) → 不影响版本号
```

### 为什么这很重要？

> "The Conventional Commits specification is a lightweight convention on top of commit messages. It provides an easy set of rules for creating an explicit commit history; which makes it easier to write automated tools on top of."
> — conventionalcommits.org

关键词是 **"machine readable"**。当 commit 格式可预测时，自动化工具才能可靠运行。

---

## 第二部分：git-smart-commit 工作流原理

我在日常开发中使用一个名为 **git-smart-commit** 的自动化工作流。它的核心理念是：

> **让 AI 代理自动分析变更、拆分提交、生成规范 message，最终一键执行。**

### 2.1 微文件架构（Micro-file Design）

工作流采用**微文件架构**，将整个流程拆分为独立的步骤文件：

```
git-smart-commit/
├── workflow.md           # 入口与架构定义
└── steps/
    ├── step-01-init.md   # 验证 git 环境
    ├── step-02-analyze.md # 分析变更，构建分组
    ├── step-03-generate.md # 生成 commit message
    └── step-05-execute.md  # 执行提交
```

**为什么这样设计？**

1. **JIT 加载** - AI 只加载当前执行的步骤，避免上下文污染
2. **顺序强制** - 每个步骤必须完成后才能进入下一步
3. **可维护性** - 修改单个步骤不影响其他步骤
4. **调试友好** - 出错时可以精确定位到具体步骤

### 2.2 工作流执行步骤

```
┌─────────────────┐
│  Step 1: Init   │ ← 验证 git 仓库，检测未提交变更
└────────┬────────┘
         ▼
┌─────────────────┐
│ Step 2: Analyze │ ← 分类文件，构建 commit_groups
└────────┬────────┘
         ▼
┌─────────────────┐
│ Step 3: Generate│ ← 生成 subject + body，构建 commit_plan
└────────┬────────┘
         ▼
┌─────────────────┐
│ Step 5: Execute │ ← 逐组 git add + commit，更新 sidecar
└─────────────────┘
```

### 2.3 智能分组逻辑

工作流会根据文件路径自动分类：

| 路径模式 | scope 推断 |
|----------|------------|
| `.claude/**` | claude |
| `_bmad/**` | bmad |
| `_bmad-output/**` | bmad |
| `website/**` | website |
| `profile-data/**` | repo |
| 其他 | repo |

**分组原则：**
- 同一 scope 的变更合并为一个 commit
- 删除操作单独成组（cleanup）

## 第三部分：Sidecar 记忆机制

git-smart-commit 的一个独特设计是**Sidecar 记忆机制**——一个持久化的学习文件，记录用户的 commit 偏好。

### 3.1 什么是 Sidecar？

Sidecar（边车）是一个与工作流同目录的隐藏文件 `.sidecar-git-smart-commit.md`，存储：

```yaml
# Learned Preferences
preferred_types:
  - chore
  - feat
  - docs

preferred_scopes:
  - bmad
  - repo
  - website

language: en

# Usage Statistics
type_counts:
  chore: 11
  feat: 5
  docs: 7

# Recent Commits (rolling window, max 20)
recent_commits:
  - hash: ffb9cde
    message: "feat(bmad): add AI-friendly body generation"
    date: 2026-01-07
```

### 3.2 学习机制：从无限追加到滚动窗口

**早期设计的问题**

最初的 sidecar 采用 append-only 设计——每次 commit 都追加完整记录。结果：

- 文件无限增长（曾达到 1200+ 行）
- 加载变慢，上下文浪费
- 没有真正的"学习"，只是日志

**现代设计：滚动窗口 + 聚合统计**

| 方面 | 旧设计 | 新设计 |
|------|--------|--------|
| 存储方式 | Append-only 日志 | 滚动窗口 + 统计 |
| 文件大小 | 无限增长 | 固定上限 (~100 行) |
| 数据冗余 | 存完整文件列表 | 只存 hash + message + date |
| 偏好学习 | 未实现 | 自动更新频率排名 |

**滚动窗口规则：**

1. 最多保留 20 条 `recent_commits`
2. 新 commit 从头部插入
3. 超出限制时，从尾部删除最旧记录

### 3.3 偏好如何影响生成？

当生成新的 commit message 时，工作流会读取 sidecar：

1. **type 偏好** - 按历史频率排序，优先匹配高频类型
2. **scope 偏好** - 路径模糊匹配时，参考历史 scope
3. **语言偏好** - subject 使用指定语言（默认英文）

**示例：**

如果 sidecar 显示 `preferred_scopes: [bmad, repo, website]`，当遇到 `_bmad-output/workflows/` 路径时，系统会优先使用 `bmad` 作为 scope。

---

## 第四部分：什么是 AI 友好的 Commit Message？

在 AI 代码理解工具普及的今天，commit message 不再只服务于人类。让我们看看什么样的 message 对 AI 最友好。

### 4.1 结构化 vs 自由文本

**对 AI 不友好：**
```
fixed stuff
update code
wip
```

**对 AI 友好：**
```
fix(auth): prevent token refresh race condition

Introduce request ID tracking to ensure only the latest refresh
response is processed. Previously, concurrent refresh attempts could
overwrite valid tokens with stale ones.

- Add requestId to auth state
- Filter responses by requestId match
```

**关键差异：**

| 维度 | 不友好 | 友好 |
|------|--------|------|
| 可解析性 | 无规律 | type(scope): 格式 |
| 意图表达 | 模糊 | 明确动作 + 影响范围 |
| 上下文 | 无 | body 解释 why |
| 可追踪 | 无 | 引用 issue/PR |

### 4.2 Body 的重要性："Why" 而非 "What"

Subject line 告诉 AI **做了什么**，Body 告诉 AI **为什么**。

> "A good commit message should complement the code, providing context that isn't immediately obvious from git diff."

**Body 应该回答：**

1. 为什么需要这个变更？（动机）
2. 这个变更有什么影响？（效果）
3. 有什么需要注意的细节？（陷阱）

**git-smart-commit 的 body 生成规则：**

- 对于**复杂变更**（≥3 文件 或 refactor/feat 类型）自动生成 body
- 对于**简单变更**（单文件 docs/chore）跳过 body
- Body 限制在 2-5 行，每行 72 字符

### 4.3 Footer 的自动化价值

Footer 是给工具读的元数据：

```
fix(api): resolve timeout on large file uploads

Increase default timeout from 30s to 120s for uploads > 10MB.

Refs: #1234
BREAKING CHANGE: timeout config key renamed from `uploadTimeout` to `upload.timeout`
```

**常见 Footer：**

| Footer | 作用 |
|--------|------|
| `Refs: #123` | 关联 issue |
| `BREAKING CHANGE:` | 触发 MAJOR 版本 |
| `Reviewed-by:` | 代码审查追踪 |
| `Co-authored-by:` | 多人协作归属 |

---

## 第五部分：为什么要写 AI 友好的规范化 Commit Message？

### 5.1 自动化工具链的基石

现代 DevOps 工具链严重依赖规范化的 commit：

```
Commits → semantic-release → CHANGELOG + Version Bump → Release Notes
```

**semantic-release 的工作原理：**

1. 解析自上次发布以来的所有 commits
2. 根据 type 决定版本号变更
3. 生成 CHANGELOG.md
4. 创建 Git tag 和 GitHub Release

如果 commit message 不规范，整个链条断裂。

### 5.2 AI 代码审查与理解

GitHub Copilot 和其他 AI 代码审查工具会分析 commit context：

> "The point of a commit message is to capture intent, not to merely summarize the content of the commit. AI cannot infer intent. It can only describe what changed."
> — Reddit r/programming

**AI 需要 commit message 来：**

- 理解变更的业务动机
- 判断变更的风险级别
- 为代码审查提供上下文
- 生成准确的变更摘要

### 5.3 团队协作与知识传承

规范化的 commit 历史是团队的**活文档**：

- **新成员 Onboarding** - 通过 git log 了解项目演进
- **Bug 追踪** - git bisect 定位问题提交
- **代码考古** - git blame 理解设计决策
- **AI 助手上下文** - Copilot/Cursor 利用历史理解代码库

### 5.4 投资回报分析

| 投入 | 回报 |
|------|------|
| 写 commit 多花 30 秒 | 自动生成 CHANGELOG |
| 遵循格式规范 | 语义化版本自动推断 |
| 添加 body 说明 why | AI 审查准确度提升 |
| 引用 issue 编号 | 问题追踪自动关联 |

**长期来看，规范化 commit 是投入产出比最高的开发习惯之一。**

---

## 第六部分：git-smart-commit 的 Body 生成实践

让我们看一个实际案例，展示 git-smart-commit 如何生成 AI 友好的 commit。

### 输入：代码变更

```diff
# step-03-generate.md
+ ### 3) Generate optional body (AI-friendly context)
+ For **complex changes** (≥3 files OR refactor/feat type), generate a body...

# step-05-execute.md
- git commit -m "<message>"
+ git commit -m "<subject>" -m "<body>"
```

### 输出：生成的 Commit

```
feat(bmad): add AI-friendly body generation to git-smart-commit

Enable optional commit body generation for complex changes to explain
"why" not just "what", following AI-era best practices.

- Body generated for ≥3 files or refactor/feat types
- Supports git commit -m "subject" -m "body" format
```

**生成逻辑：**

1. **type 选择** - 新增功能 → `feat`
2. **scope 推断** - `_bmad-output/**` → `bmad`
3. **subject 构造** - 祈使句，描述变更，≤50 字符
4. **body 触发** - 2 文件 + feat 类型 → 生成 body
5. **body 内容** - 解释动机（why）+ 关键点（what matters）

---

## 结语：面向 AI 时代的 Git 实践

Commit message 正在从"给人看的备注"演变为"给机器处理的结构化数据"。

**关键 Takeaways：**

1. **采用 Conventional Commits** - 这是 AI 友好的基础格式
2. **为复杂变更写 Body** - 解释 why，不只是 what
3. **利用自动化工具** - semantic-release, commitlint, git-smart-commit
4. **建立团队规范** - 一致性比完美更重要
5. **拥抱 AI 协作** - 让 AI 帮你生成，但保留审核权

git-smart-commit 工作流展示了一种可能的未来：AI 代理分析你的代码变更，自动拆分提交，生成规范 message，甚至学习你的偏好。

**下一步是什么？**

- 将 commit message 与 PR description 联动
- 让 AI 生成更精准的 breaking change 描述
- 自动检测应该引用的 issue 编号

Commit message 的价值正在被重新发现。在 AI 时代，写好每一行 commit，就是在为未来的自己和 AI 助手留下礼物。

---

## 参考资料

- [Conventional Commits Specification v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)
- [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
- [Semantic Versioning 2.0.0](https://semver.org/)
- [semantic-release Documentation](https://semantic-release.gitbook.io/)
- [How to Write a Git Commit Message - Chris Beams](https://cbea.ms/git-commit/)
