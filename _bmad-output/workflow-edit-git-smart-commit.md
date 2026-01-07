---
workflow: edit-workflow
target_workflow_name: git-smart-commit
target_workflow_path: /Users/kylinmiao/Documents/project/KInfoGit/_bmad-output/bmb-creations/workflows/git-smart-commit/
stepsCompleted: [1, 2, 3]
lastStep: step-03-improve
created: 2026-01-05
updated: 2026-01-07
---

# Workflow Edit Report: git-smart-commit

## User Request (Current)

- 目标：**优化 sidecar 文件设计**
- 问题：
  - 文件持续 append 导致无限膨胀 (1200+ 行)
  - 保留完整 commit 历史是冗余的（git log 已有）
  - 学习偏好机制定义了但未实现

---

## Workflow Analysis (2026-01-07)

### Target Workflow

- **Path**: `_bmad-output/bmb-creations/workflows/git-smart-commit/workflow.md`
- **Name**: `git-smart-commit`
- **Module**: `bmb-creations`
- **Format**: Standalone (workflow.md + steps/)

### Structure Analysis

- **Type**: action workflow (git operations)
- **Total Steps**: 5 (Step 04 retained but deprecated)
- **Step Flow**: init → analyze → generate → execute
- **Files**:
  - `workflow.md`
  - `steps/step-01-init.md`
  - `steps/step-02-analyze.md`
  - `steps/step-03-generate.md`
  - `steps/step-04-confirm.md` (deprecated)
  - `steps/step-05-execute.md`

### Initial Assessment

**Strengths**
- 结构清晰，按步骤分工
- 有 sidecar 设计可持续学习

**Issues / Gaps**
- 只支持单 commit（`git add .` + 1 次 commit）
- Step 04 强交互（选择/编辑/再生成），不符合 YOLO 自动化
- 没有“按最佳实践拆分提交”的分组/执行能力

---

## Improvement Goals

- 将流程从“生成建议 + 人工选择 + 单 commit”升级为：
  - 解析变更 → 分组 → 每组生成 1 条 Conventional Commit message → 多次提交
- 非交互：默认 YOLO，不再要求用户确认/选择
- 增加安全策略：避免提交明显本地/音频类产物

---

## Improvement Log (Summary)

- 更新 `workflow.md`：明确 Auto-Split + YOLO，调整步骤说明，跳过 Step 04
- 重写 `step-02-analyze.md`：输出 commit 分组计划（不生成 message）
- 重写 `step-03-generate.md`：为每组生成 1 条 Conventional Commit message，构建 `commit_plan`
- 重写 `step-05-execute.md`：按 `commit_plan` 逐组 `git add -- <paths>` / `git commit -m ...` 执行多次提交
- 同步更新 `.claude/commands/git-smart-commit.md` 与 `git-smart-commit.md` 文案

**User Approval**: YOLO (blanket approval requested)

---

## Validation Results

- 文件结构：通过（仍为 standalone step 架构）
- 变量一致性：通过（step 02→03→05 通过上下文变量 `commit_groups/commit_plan` 串联）
- 交互一致性：通过（移除选择/确认，符合 YOLO 诉求）

---

## Next Steps

- 建议在一次真实变更上跑通：确认分组是否符合预期
- 若需要更强拆分（例如按 `git add -p` 级别），再扩展为交互式/半自动模式

---

## Improvement Goals - Sidecar Optimization (2026-01-07)

### Motivation

- **Trigger**: Sidecar 文件已膨胀到 1200+ 行
- **User Feedback**: 无限 append 设计不合理
- **Success Issues**: 偏好学习机制从未实现

### Prioritized Improvements

#### 🔴 Critical (Must Fix)

1. **Sidecar 滚动窗口**: 只保留最近 20 条 commit 记录
2. **聚合偏好统计**: 自动更新 type/scope/language 频率
3. **精简日志格式**: 只存 message + hash + date，不存完整文件列表

#### 🟡 Important (Should Fix)

1. **清理 deprecated step-04**: 删除或确认不存在

### New Sidecar Structure Design

```yaml
---
created: 2026-01-07
workflow: git-smart-commit
last_updated: 2026-01-07
---

# Learned Preferences (auto-updated)
preferred_types: [chore, feat, docs]
preferred_scopes: [bmad, repo, claude]
language: en

# Type Statistics
type_counts:
  chore: 15
  feat: 8
  docs: 5

# Scope Statistics
scope_counts:
  bmad: 20
  repo: 5
  claude: 3

# Recent Commits (rolling window, max 20)
recent_commits:
  - hash: abc1234
    message: "feat(bmad): add feature"
    date: 2026-01-07
```

### Focus Areas for Next Step

- 修改 step-01-init.md: 新 sidecar 初始化结构
- 修改 step-03-generate.md: 读取聚合偏好
- 修改 step-05-execute.md: 滚动窗口更新逻辑

---

_Goals identified on 2026-01-07_

---

## Improvement Log (2026-01-07)

### Improvement 1: New Sidecar Initialization Structure

- **File**: `steps/step-01-init.md`
- **Change**: Replaced old append-only log template with structured YAML format
- **Key Features**:
  - `preferred_types` / `preferred_scopes` lists
  - `type_counts` / `scope_counts` statistics
  - `recent_commits` array (rolling window)
  - `max_recent_commits` config (default: 20)
- **User Approval**: YOLO

### Improvement 2: Rolling Window + Statistics Update Logic

- **File**: `steps/step-05-execute.md`
- **Change**: Replaced simple append with structured update:
  - Increment type/scope counters
  - Re-sort preferred lists by frequency
  - Prepend to recent_commits
  - Trim to max_recent_commits limit
- **User Approval**: YOLO

### Improvement 3: Read Structured Preferences

- **File**: `steps/step-03-generate.md`
- **Change**: Updated preference loading to extract structured fields:
  - `preferred_types`, `preferred_scopes`, `language`
  - `type_counts`, `scope_counts` for reference
- **User Approval**: YOLO

### Improvement 4: Reset Sidecar to New Format

- **File**: `.sidecar-git-smart-commit.md`
- **Change**: Migrated from 1206 lines to 98 lines
- **Data Preserved**: All 19 historical commits + computed statistics
- **User Approval**: YOLO

---

_Improvements completed on 2026-01-07_
