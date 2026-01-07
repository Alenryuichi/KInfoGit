---
stepsCompleted: [1]
workflow_name: worktree-manager
module: custom
approach: skill-adaptation
reference_source: compound-engineering-plugin
---

# Workflow Creation Plan: worktree-manager

## Initial Project Context

- **Module:** custom
- **Target Location:** `_bmad/custom/src/workflows/worktree-manager`
- **Created:** 2026-01-07
- **Approach:** 方案 C - Skill 适配方案

## 需求概述

### 解决的问题
提升并行开发效率，允许开发者同时处理多个分支/任务，避免 `git stash` 和频繁切换分支带来的上下文丢失。

### 使用者
开发者（个人及团队）

### 核心参考
- **来源**: Compound Engineering Plugin (`_bmad/external/compound-engineering-plugin`)
- **参考文件**: `plugins/compound-engineering/skills/git-worktree/`
  - `SKILL.md` - Skill 文档
  - `scripts/worktree-manager.sh` - 核心管理脚本

## 方案 C 详细设计

### 1. 核心组件

| 组件 | 位置 | 说明 |
|------|------|------|
| `worktree-manager.sh` | `scripts/worktree.sh` | 移植并适配的管理脚本 |
| `SKILL.md` | `_bmad/custom/src/skills/worktree-manager/SKILL.md` | Auggie 参考文档 |
| `justfile` 集成 | `justfile` | 命令行快捷入口 |

### 2. 功能清单

- [x] `create <branch-name>` - 创建新 worktree
- [x] `list` - 列出所有 worktree
- [x] `switch <name>` - 切换到指定 worktree
- [x] `cleanup` - 清理非活跃 worktree
- [x] `copy-env` - 复制环境文件到 worktree

### 3. 目录结构

```
.worktrees/                      # Worktree 存放目录
├── feature-xxx/
├── bugfix-yyy/
└── ...

scripts/
└── worktree.sh                  # 管理脚本

_bmad/custom/src/skills/
└── worktree-manager/
    └── SKILL.md                 # Skill 参考文档
```

### 4. Justfile 集成

```just
# Worktree 快捷命令
wt-create name:
    bash scripts/worktree.sh create {{name}}

wt-list:
    bash scripts/worktree.sh list

wt-switch name:
    bash scripts/worktree.sh switch {{name}}

wt-clean:
    bash scripts/worktree.sh cleanup
```

## 最终方案（Party Mode 审核通过）

**选择：方案 A - 完全放在 `_bmad/custom/skills/` 内（内聚性优先）**

### 最终目录结构
```
_bmad/custom/skills/worktree-manager/
├── SKILL.md                      # Skill 文档
└── scripts/
    └── worktree-manager.sh       # 管理脚本
```

### 调用方式
```bash
bash _bmad/custom/skills/worktree-manager/scripts/worktree-manager.sh <command>
```

## 下一步

- [ ] 创建 `_bmad/custom/skills/worktree-manager/` 目录
- [ ] 移植 `worktree-manager.sh` 脚本
- [ ] 创建 SKILL.md 文档
- [ ] 更新 .gitignore 添加 `.worktrees`
- [ ] 测试验证

