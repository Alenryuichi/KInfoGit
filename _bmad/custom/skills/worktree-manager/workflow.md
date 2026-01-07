---
name: worktree-manager
description: Git Worktree 管理工作流，用于隔离的并行开发。支持创建、列出、切换和清理 worktree。
source: compound-engineering-plugin
web_bundle: false
---

# Worktree Manager

**Goal:** 管理 Git Worktree 以实现隔离的并行开发，提升开发效率。

**Your Role:** In addition to your name, communication_style, and persona, you are also a Git Worktree management specialist collaborating with a developer. This is a partnership, not a client-vendor relationship. You bring expertise in parallel development workflows and worktree management, while the user brings their project context and development needs. Work together as equals.

---

## WORKFLOW ARCHITECTURE

This is a **single-step interactive workflow** - no step files needed. Users select actions from a menu, and the workflow executes corresponding script commands.

### Core Principles

- **Tool-Based Design**: This workflow wraps a shell script for worktree management
- **Interactive Menu**: Users select operations from a clear menu
- **Script Execution**: All operations delegate to `worktree-manager.sh`
- **Loop Until Exit**: Return to main menu after each operation until user quits

### Critical Rules (NO EXCEPTIONS)

- 🛑 **NEVER** call `git worktree` directly - always use the script
- 📖 **ALWAYS** show current worktree status before menu
- 🎯 **ALWAYS** confirm destructive operations (cleanup)
- ⏸️ **ALWAYS** halt at menu and wait for user input
- ✅ **ALWAYS** speak output in `{communication_language}`

### Script Path

```
{project-root}/_bmad/custom/skills/worktree-manager/scripts/worktree-manager.sh
```

---

## INITIALIZATION SEQUENCE

### 1. Configuration Loading

Load and read full config from `{project-root}/_bmad/bmb/config.yaml` and resolve:
- `user_name`, `communication_language`

### 2. Welcome and Status Check

Display welcome message and check current worktree status:

```bash
bash {project-root}/_bmad/custom/skills/worktree-manager/scripts/worktree-manager.sh list
```

---

## EXECUTION

### 主菜单

显示以下选项：

```
🌳 Worktree Manager

当前状态: [显示 list 命令输出]

请选择操作:
[C] Create  - 创建新的 worktree
[L] List    - 列出所有 worktree
[S] Switch  - 切换到指定 worktree
[E] Env     - 复制环境文件到 worktree
[X] Cleanup - 清理非活跃 worktree
[Q] Quit    - 退出
```

### 菜单处理逻辑

#### [C] Create - 创建新 worktree

1. 询问用户分支名称
2. 询问基础分支（默认 main）
3. 执行：
   ```bash
   bash {project-root}/_bmad/custom/skills/worktree-manager/scripts/worktree-manager.sh create <branch-name> [from-branch]
   ```
4. 显示结果并返回主菜单

#### [L] List - 列出所有 worktree

执行：
```bash
bash {project-root}/_bmad/custom/skills/worktree-manager/scripts/worktree-manager.sh list
```

返回主菜单。

#### [S] Switch - 切换 worktree

1. 显示可用 worktree 列表
2. 询问用户要切换到哪个
3. 执行：
   ```bash
   bash {project-root}/_bmad/custom/skills/worktree-manager/scripts/worktree-manager.sh switch <name>
   ```
4. 显示结果

#### [E] Env - 复制环境文件

1. 询问目标 worktree 名称（或留空使用当前）
2. 执行：
   ```bash
   bash {project-root}/_bmad/custom/skills/worktree-manager/scripts/worktree-manager.sh copy-env [name]
   ```
3. 显示结果并返回主菜单

#### [X] Cleanup - 清理非活跃 worktree

执行：
```bash
bash {project-root}/_bmad/custom/skills/worktree-manager/scripts/worktree-manager.sh cleanup
```

返回主菜单。

#### [Q] Quit - 退出

结束工作流。

---

## 快速命令模式

如果用户直接指定操作，跳过菜单直接执行：

- "创建 worktree feature-xxx" → 直接执行 create
- "列出 worktree" → 直接执行 list
- "清理 worktree" → 直接执行 cleanup

---

## 使用场景

### 场景 1：开始新功能开发

```
用户: 我要开始开发 feature-login
AI: 好的，让我为你创建一个新的 worktree...
    [执行 create feature-login]
    ✓ Worktree 创建成功！
    路径: .worktrees/feature-login
    
    你可以通过以下命令进入:
    cd .worktrees/feature-login
```

### 场景 2：并行处理多个任务

```
用户: 我需要同时处理 feature-a 和 bugfix-b
AI: 让我为你创建两个独立的 worktree...
    [执行 create feature-a]
    [执行 create bugfix-b]
    ✓ 两个 worktree 都已创建！
    
    使用 switch 命令在它们之间切换。
```

### 场景 3：清理完成的工作

```
用户: 清理已完成的 worktree
AI: 让我检查并清理非活跃的 worktree...
    [执行 cleanup]
```

---

## 触发方式

用户可以通过以下方式触发此工作流：

1. "执行 worktree-manager workflow"
2. "管理 git worktree"
3. "创建新的 worktree"
4. "我需要并行开发"

