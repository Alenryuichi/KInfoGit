---
name: worktree-manager
description: Git Worktree 管理工具，用于隔离的并行开发。支持创建、列出、切换和清理 worktree，遵循 KISS 原则。
source: compound-engineering-plugin
---

# Git Worktree Manager

此 Skill 提供统一的 Git Worktree 管理接口。无论是隔离审查 PR 还是并行开发多个功能，都能轻松处理。

## 功能概述

- **创建 worktree** - 从 main 分支创建新的工作树
- **列出 worktree** - 查看当前状态
- **切换 worktree** - 并行工作时切换
- **清理 worktree** - 自动清理已完成的工作树
- **自动复制 .env 文件** - 新建 worktree 时自动复制环境变量
- **自动管理 .gitignore** - 确保 .worktrees 目录被忽略

## 脚本路径

```bash
_bmad/custom/skills/worktree-manager/scripts/worktree-manager.sh
```

## 关键规则

**永远不要直接调用 `git worktree add`**，始终使用管理脚本：

```bash
# ✅ 正确 - 使用脚本
bash _bmad/custom/skills/worktree-manager/scripts/worktree-manager.sh create feature-name

# ❌ 错误 - 不要直接使用 git 命令
git worktree add .worktrees/feature-name -b feature-name main
```

脚本会自动处理：
1. 复制 `.env`, `.env.local`, `.env.test` 等文件
2. 确保 `.worktrees` 在 `.gitignore` 中
3. 创建一致的目录结构

## 命令参考

### create - 创建新 worktree

```bash
bash _bmad/custom/skills/worktree-manager/scripts/worktree-manager.sh create <branch-name> [from-branch]
```

- `branch-name` (必需): 新分支和 worktree 的名称
- `from-branch` (可选): 基础分支，默认为 `main`

**示例：**
```bash
# 从 main 创建
bash _bmad/custom/skills/worktree-manager/scripts/worktree-manager.sh create feature-login

# 从 develop 创建
bash _bmad/custom/skills/worktree-manager/scripts/worktree-manager.sh create feature-auth develop
```

### list - 列出所有 worktree

```bash
bash _bmad/custom/skills/worktree-manager/scripts/worktree-manager.sh list
```

### switch - 切换到指定 worktree

```bash
bash _bmad/custom/skills/worktree-manager/scripts/worktree-manager.sh switch <name>
```

### copy-env - 复制环境文件

```bash
# 复制到指定 worktree
bash _bmad/custom/skills/worktree-manager/scripts/worktree-manager.sh copy-env <name>

# 复制到当前 worktree（如果在 worktree 内）
bash _bmad/custom/skills/worktree-manager/scripts/worktree-manager.sh copy-env
```

### cleanup - 清理非活跃 worktree

```bash
bash _bmad/custom/skills/worktree-manager/scripts/worktree-manager.sh cleanup
```

## 使用场景

### 场景 1：代码审查

```bash
# 为 PR 创建隔离的审查环境
bash _bmad/custom/skills/worktree-manager/scripts/worktree-manager.sh create pr-123-feature

# 进入 worktree
cd .worktrees/pr-123-feature

# 审查完成后清理
cd ../..
bash _bmad/custom/skills/worktree-manager/scripts/worktree-manager.sh cleanup
```

### 场景 2：并行开发

```bash
# 开发功能 A
bash _bmad/custom/skills/worktree-manager/scripts/worktree-manager.sh create feature-a

# 同时开发功能 B
bash _bmad/custom/skills/worktree-manager/scripts/worktree-manager.sh create feature-b

# 查看所有 worktree
bash _bmad/custom/skills/worktree-manager/scripts/worktree-manager.sh list

# 在它们之间切换
bash _bmad/custom/skills/worktree-manager/scripts/worktree-manager.sh switch feature-a
```

## 目录结构

```
.worktrees/                    # Worktree 存放目录
├── feature-login/             # Worktree 1
│   ├── .git
│   ├── .env                   # 自动复制
│   └── ...
├── feature-notifications/     # Worktree 2
│   └── ...
└── ...

.gitignore                     # 自动添加 .worktrees
```

## 设计原则

### KISS (Keep It Simple, Stupid)

- **单一脚本** 处理所有 worktree 操作
- **简单命令** 带有合理默认值
- **交互确认** 防止误操作
- **清晰命名** 直接使用分支名

### 安全优先

- 创建前确认
- 清理前确认
- 不会删除当前 worktree
- 清晰的错误信息

## 故障排除

### "Worktree already exists"

脚本会询问是否切换到该 worktree。

### 无法删除当前 worktree

先切换到主仓库：
```bash
cd $(git rev-parse --show-toplevel)
bash _bmad/custom/skills/worktree-manager/scripts/worktree-manager.sh cleanup
```

### .env 文件缺失

手动复制：
```bash
bash _bmad/custom/skills/worktree-manager/scripts/worktree-manager.sh copy-env feature-name
```

